require("dotenv").config();
console.log("ENV SIM =", process.env.PRINTER_SIMULATION);

const express = require("express");
const cors = require("cors");
const { getPrinterConfig, printTicket } = require("./printerClient");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4010);

function getCurrentPrinterConfig() {
  return getPrinterConfig();
}

/**
 * @param {number | string | null | undefined} v
 */
function numOrZero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Precio unitario congelado (solo OrderItem.unitPrice).
 */
function resolveItemPrice(i) {
  return numOrZero(i.unitPrice);
}

function trimStr(s) {
  if (s == null) return "";
  return String(s).trim();
}

/**
 * station: solo campo persistido en OrderItem.
 */
function resolveStation(i) {
  const st = trimStr(i.station);
  let s = (st || "KITCHEN").toUpperCase();
  if (s !== "KITCHEN" && s !== "BAR") {
    s = "KITCHEN";
  }
  return s;
}

function resolveIsCustom(i) {
  return (
    i.type === "CUSTOM" ||
    i.productId == null ||
    i.isCustom === true
  );
}

/**
 * Nombre imprimible: solo snapshot displayName.
 */
function resolveDisplayName(i) {
  const dn = trimStr(i.displayName);
  return dn || "Item";
}

/**
 * Clave estable checkout (sin catálogo).
 */
function resolveCheckoutKeyStem(i) {
  return [
    trimStr(i.displayName).toLowerCase(),
    numOrZero(i.unitPrice),
    trimStr(i.variantName),
    resolveStation(i),
  ].join("::");
}

/**
 * @returns {{
 *   id?: string,
 *   name: string,
 *   qty: number,
 *   price: number,
 *   station: "KITCHEN" | "BAR",
 *   notes?: string,
 *   isCustom?: boolean,
 *   variantName?: string,
 *   checkoutKeyStem: string
 * }[]}
 */
function normalizeItems(items) {
  return (items || [])
    .filter((i) => {
      const q = numOrZero(i.quantity);
      return q > 0;
    })
    .map((i) => {
      const isCustom = resolveIsCustom(i);
      const v = trimStr(i.variantName);
      const variantName = v ? v : undefined;

      const name = resolveDisplayName(i);

      const qty = numOrZero(i.quantity);

      const price = resolveItemPrice(i);

      const station = resolveStation(i);

      const notes =
        i.notes != null &&
        trimStr(i.notes)
          ? trimStr(i.notes)
          : undefined;

      const id =
        i.id != null ? String(i.id) : undefined;

      const checkoutKeyStem =
        resolveCheckoutKeyStem(i);

      return {
        ...(id ? { id } : {}),
        name,
        qty,
        price,
        station,
        ...(notes ? { notes } : {}),
        isCustom,
        ...(variantName
          ? { variantName }
          : {}),
        checkoutKeyStem,
      };
    });
}

/**
 * Checkout: agrupar por key estable (no solo name+price).
 * @returns {{ name: string, price: number, totalQty: number, subtotal: number }[]}
 */
function groupCheckoutLines(
  normalizedItems
) {
  const map = new Map();

  for (const ni of normalizedItems) {
    const key = `${ni.checkoutKeyStem}::${ni.isCustom ? "1" : "0"}`;

    if (!map.has(key)) {
      map.set(key, {
        name: ni.name,
        price: ni.price,
        totalQty: 0,
      });
    }

    const row = map.get(key);
    row.totalQty += ni.qty;
    row.subtotal =
      row.price * row.totalQty;
  }

  return [...map.values()];
}

/**
 * xQty name ........ $subtotal
 */
function formatCheckoutLine(
  row,
  width = 40
) {
  const left = `x${row.totalQty} ${row.name}`;
  const right = `$${row.subtotal.toFixed(2)}`;
  const gap =
    width -
    left.length -
    right.length;
  const dots = Math.max(
    2,
    gap
  );
  return (
    left +
    ".".repeat(dots) +
    right
  );
}

function renderKitchenBarTicket({
  stationLabel,
  table,
  ticketId,
  lines,
  notesLines,
}) {
  const separator = "==================";
  const divider = "------------------";

  const contentLines = [
    separator,
    "   SATO SAN",
    separator,
    "",
    stationLabel,
    `Mesa: ${table}`,
    `Ticket: #${ticketId}`,
    "",
    divider,
    ...lines.map(
      (l) => `x${l.qty} ${l.label}`
    ),
    divider,
    "",
  ];

  if (notesLines.length) {
    contentLines.push(
      "Notas:",
      ...notesLines,
      ""
    );
  }

  contentLines.push(
    separator,
    "",
    ""
  );

  return {
    previewText: contentLines.join("\n"),
    renderTicket: (printer) => {
      printer
        .align("CT")
        .style("B")
        .size(1, 1)
        .text(separator)
        .text("   SATO SAN")
        .text(separator)
        .feed(1)
        .align("LT")
        .style("NORMAL")
        .text(stationLabel)
        .text(`Mesa: ${table}`)
        .text(`Ticket: #${ticketId}`)
        .feed(1)
        .text(divider);

      lines.forEach((l) => {
        printer.text(`x${l.qty} ${l.label}`);
      });

      printer.text(divider).feed(1);

      if (notesLines.length) {
        printer.text("Notas:");
        notesLines.forEach((n) =>
          printer.text(n)
        );
        printer.feed(1);
      }

      printer
        .align("CT")
        .text(separator)
        .feed(2)
        .cut();
    },
  };
}

/** Tickets: solo snapshot */
function ticketDisplayLine(i) {
  const q = numOrZero(i.quantity);
  const displayName = resolveDisplayName(i);
  return `x${q} ${displayName}`;
}

app.post("/print", async (req, res) => {
  const {
    type,
    table,
    items,
    tickets,
    ticketId,
  } = req.body;

  const normalizedItems =
    type === "tickets"
      ? []
      : normalizeItems(items);

  try {
    switch (type) {
      case "kitchen":
      case "bar": {
        const want =
          type === "bar" ? "BAR" : "KITCHEN";

        const filtered =
          normalizedItems.filter(
            (ni) => ni.station === want
          );

        if (
          !table ||
          !String(table).trim()
        ) {
          return res.status(400).json({
            ok: false,
            error: "Missing table",
          });
        }

        if (!filtered.length) {
          return res.json({
            ok: true,
            skipped: true,
            reason: "no items for station",
          });
        }

        const tid =
          ticketId ??
          req.body?.ticket ??
          String(Date.now()).slice(-6);

        const lines = filtered.map(
          (ni) => ({
            qty: ni.qty,
            label: ni.name,
          })
        );

        const notesLines = filtered
          .filter((ni) => ni.notes)
          .map(
            (ni) =>
              `- ${ni.name}: ${ni.notes}`
          );

        const stationLabel =
          want === "BAR"
            ? "BAR / BEBIDAS"
            : "COCINA";

        const ticket =
          renderKitchenBarTicket({
            stationLabel,
            table: String(table),
            ticketId: String(tid),
            lines,
            notesLines,
          });

        await printTicket({
          ticketId: tid,
          previewText:
            ticket.previewText,
          renderTicket:
            ticket.renderTicket,
        });

        return res.json({
          ok: true,
          type,
        });
      }

      case "checkout": {
        if (
          !table ||
          !String(table).trim()
        ) {
          return res.status(400).json({
            ok: false,
            error: "Invalid data",
          });
        }

        if (!normalizedItems.length) {
          return res.status(400).json({
            ok: false,
            error: "Invalid data",
          });
        }

        const grouped =
          groupCheckoutLines(
            normalizedItems
          );

        const computedTotal =
          grouped.reduce(
            (sum, row) =>
              sum + row.subtotal,
            0
          );

        const tid =
          ticketId ??
          req.body?.id ??
          "—";

        const separator =
          "==================";
        const divider =
          "------------------";

        const lineStrs = grouped.map(
          (row) =>
            formatCheckoutLine(row)
        );

        const contentLines = [
          separator,
          "   SATO SAN",
          separator,
          "",
          `Mesa: ${table}`,
          `Orden: #${tid}`,
          "",
          divider,
          ...lineStrs,
          divider,
          "",
          `TOTAL.........$${computedTotal.toFixed(2)}`,
          "",
          separator,
        ];

        await printTicket({
          ticketId: tid,
          previewText:
            contentLines.join("\n"),
          renderTicket: (
            printer
          ) => {
            printer
              .align("CT")
              .text(separator)
              .text("SATO SAN")
              .text(separator)
              .feed(1)
              .align("LT");

            printer.text(
              `Mesa: ${table}`
            );
            printer.text(
              `Orden: #${tid}`
            );
            printer.feed(1);
            printer.text(divider);

            grouped.forEach((row) => {
              printer.text(
                formatCheckoutLine(row)
              );
            });

            printer.text(divider);
            printer.text(
              `TOTAL.........$${computedTotal.toFixed(2)}`
            );
            printer.feed(2).cut();
          },
        });

        return res.json({
          ok: true,
          type: "checkout",
          total: computedTotal,
        });
      }

      case "tickets": {
        const list = Array.isArray(tickets)
          ? [...tickets]
          : [];

        if (!list.length) {
          return res.status(400).json({
            ok: false,
            error: "Missing tickets",
          });
        }

        const separator =
          "==================";
        const divider =
          "------------------";

        const previewText = [
          separator,
          "   SATO SAN",
          separator,
          "",
          ...(table
            ? [`Mesa: ${table}`, ""]
            : []),
          ...list.flatMap(
            (t) => {
              const rawItems =
                Array.isArray(t.items)
                  ? t.items
                  : [];
              return [
                `Ticket #${t.id}`,
                ...rawItems.map(
                  ticketDisplayLine
                ),
                "",
              ];
            }
          ),
          divider,
          separator,
        ].join("\n");

        const tid =
          ticketId ??
          list[list.length - 1]?.id ??
          "tickets";

        await printTicket({
          ticketId: tid,
          previewText,
          renderTicket: (
            printer
          ) => {
            printer
              .align("CT")
              .text(separator)
              .text("SATO SAN")
              .text(separator)
              .feed(1)
              .align("LT");

            if (table) {
              printer.text(
                `Mesa: ${table}`
              );
              printer.feed(1);
            }

            for (const t of list) {
              const rawItems =
                Array.isArray(t.items)
                  ? t.items
                  : [];

              printer
                .style("B")
                .text(
                  `Ticket #${t.id}`
                )
                .style("NORMAL");

              rawItems.forEach(
                (i) => {
                  printer.text(
                    ticketDisplayLine(i)
                  );
                }
              );

              printer.feed(1);
            }

            printer.text(divider);
            printer
              .align("CT")
              .text(separator)
              .feed(2)
              .cut();
          },
        });

        return res.json({
          ok: true,
          type: "tickets",
        });
      }

      default:
        return res.status(400).json({
          ok: false,
          error: "Invalid type",
        });
    }
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Print failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `[printer-service] listening on http://localhost:${PORT}`
  );
  console.log(
    `[printer-service] printer mode: ${getCurrentPrinterConfig().mode} (${getCurrentPrinterConfig().ip}:${getCurrentPrinterConfig().port})`
  );
  if (
    getCurrentPrinterConfig()
      .simulation
  ) {
    console.log(
      "[printer-service] simulation mode enabled"
    );
  }
});
