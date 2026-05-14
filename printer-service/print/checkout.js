app.post("/print/checkout", async (req, res) => {
  const { table, items, total, ticketId } = req.body;

  if (!table || !items?.length) {
    return res.status(400).json({ ok: false, error: "Invalid data" });
  }

  try {
    const separator = "==================";
    const divider = "------------------";

    const lines = [
      separator,
      "   SATO SAN",
      separator,
      "",
      `Mesa: ${table}`,
      `Ticket: #${ticketId}`,
      "",
      divider,
      ...items.map(
        (i) => `x${i.qty} ${i.name}  $${i.price ?? 0}`
      ),
      divider,
      "",
      `TOTAL: $${total}`,
      "",
      separator,
      "",
    ];

    await printTicket({
      ticketId,
      previewText: lines.join("\n"),
      renderTicket: (printer) => {
        printer
          .align("CT")
          .text(separator)
          .text("SATO SAN")
          .text(separator)
          .feed(1)
          .align("LT");

        items.forEach((i) => {
          printer.text(`x${i.qty} ${i.name}  $${i.price ?? 0}`);
        });

        printer.text(divider);
        printer.text(`TOTAL: $${total}`);
        printer.feed(2).cut();
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});