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

function normalizePayload(body, forcedStation) {
  const station = forcedStation || body?.station;
  const table = body?.table;
  const items = Array.isArray(body?.items) ? body.items : [];

  if (
    !station ||
    (station !== "KITCHEN" && station !== "BAR")
  ) {
    return { error: "Invalid station" };
  }

  if (!table) {
    return { error: "Missing table" };
  }

  if (!items.length) {
    return { error: "Missing items" };
  }

  const normalizedItems = items.map((item) => ({
    name: String(item?.name || "Item"),
    qty: Number(item?.qty || 1),
    notes: item?.notes ? String(item.notes) : null,
  }));

  const ticketId =
    body?.ticketId ||
    body?.ticket ||
    String(Date.now()).slice(-6);

  return {
    station,
    table: String(table),
    ticketId: String(ticketId),
    items: normalizedItems,
  };
}

async function handlePrint(req, res, forcedStation) {
  const payload = normalizePayload(req.body, forcedStation);

  if (payload.error) {
    return res.status(400).json({
      ok: false,
      error: payload.error,
    });
  }

  try {
    const notes = payload.items
      .filter((i) => i.notes)
      .map((i) => `- ${i.notes}`);
    const separator = "==================";
    const divider = "------------------";
    const contentLines = [
      separator,
      "   SATO SAN",
      separator,
      "",
      `Mesa: ${payload.table}`,
      `Ticket: #${payload.ticketId}`,
      "",
      divider,
      ...payload.items.map((item) => `x${item.qty} ${item.name}`),
      divider,
      "",
    ];

    if (notes.length) {
      contentLines.push("Notas:", ...notes, "");
    }

    contentLines.push(separator, "", "");

    await printTicket({
      ticketId: payload.ticketId,
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
          .text(`Mesa: ${payload.table}`)
          .text(`Ticket: #${payload.ticketId}`)
          .feed(1)
          .text(divider);

        payload.items.forEach((item) => {
          printer.text(`x${item.qty} ${item.name}`);
        });

        printer.text(divider).feed(1);

        if (notes.length) {
          printer.text("Notas:");
          notes.forEach((line) => printer.text(line));
          printer.feed(1);
        }

        printer.align("CT").text(separator).feed(2).cut();
      },
    });
    return res.json({
      ok: true,
      station: payload.station,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Print failed",
    });
  }
}

app.post("/print/kitchen", (req, res) => {
  return handlePrint(req, res, "KITCHEN");
});

app.post("/print/bar", (req, res) => {
  return handlePrint(req, res, "BAR");
});

app.listen(PORT, () => {
  console.log(
    `[printer-service] listening on http://localhost:${PORT}`
  );
  console.log(
    `[printer-service] printer mode: ${getCurrentPrinterConfig().mode} (${getCurrentPrinterConfig().ip}:${getCurrentPrinterConfig().port})`
  );
  if (getCurrentPrinterConfig().simulation) {
    console.log("[printer-service] simulation mode enabled");
  }
});
