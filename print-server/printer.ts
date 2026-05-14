import { PrintJob } from "./types";
import {
  ThermalPrinter,
  PrinterTypes,
} from "node-thermal-printer";

function createPrinter() {
  return new ThermalPrinter({
    type: PrinterTypes.EPSON,

    // Para pruebas:
    // usb
    // tcp://192.168.x.x
    interface: process.env.PRINTER_INTERFACE || "usb",

    charset: "SLOVENIA",
    removeSpecialCharacters: false,

    options: {
      timeout: 5000,
    },
  } as any);
}

function formatCurrency(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function printHeader(
  printer: ThermalPrinter,
  title: string,
  job: PrintJob
) {
  printer.alignCenter();
  printer.bold(true);
  printer.println(title);
  printer.bold(false);

  printer.drawLine();

  printer.alignLeft();
  printer.println(`Mesa: ${job.payload.table}`);
  printer.println(`Ticket: #${job.payload.ticketId}`);

  const now = new Date();

  printer.println(
    `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
  );

  printer.drawLine();
}

function logJob(job: PrintJob) {
  console.log("\n");
  console.log("====================================");
  console.log(`PRINT JOB -> ${job.type}`);
  console.log("====================================");

  console.log({
    table: job.payload.table,
    ticketId: job.payload.ticketId,
    items: job.payload.items,
  });

  console.log("====================================");
  console.log("\n");
}

async function runPrinter(
  printer: ThermalPrinter,
  job: PrintJob
) {
  printer.drawLine();
  printer.cut();

  try {
    const isConnected = await printer.isPrinterConnected();

    if (!isConnected) {
      console.error("Printer not connected");
      return;
    }

    await printer.execute();

    console.log(
      `✅ Print success -> ${job.type}`
    );
  } catch (error) {
    console.error(
      `❌ Print failed -> ${job.type}`,
      error
    );
  }
}

export async function executePrint(job: PrintJob) {
  logJob(job);

  if (job.type === "PRINT_KITCHEN") {
    const printer = createPrinter();

    printHeader(printer, "TICKET COCINA", job);

    job.payload.items
      .filter(
        (item) =>
          item.station !== "BAR" &&
          item.quantity > 0
      )
      .forEach((item) => {
        printer.leftRight(
          item.displayName,
          `x${item.quantity}`
        );

        if (item.variantName) {
          printer.println(
            `Variante: ${item.variantName}`
          );
        }

        if (item.notes) {
          printer.println(
            `Nota: ${item.notes}`
          );
        }

        printer.println("");
      });

    return runPrinter(printer, job);
  }

  if (job.type === "PRINT_BAR") {
    const printer = createPrinter();

    printHeader(printer, "TICKET BAR", job);

    job.payload.items
      .filter(
        (item) =>
          item.station === "BAR" &&
          item.quantity > 0
      )
      .forEach((item) => {
        printer.leftRight(
          item.displayName,
          `x${item.quantity}`
        );

        if (item.variantName) {
          printer.println(
            `Variante: ${item.variantName}`
          );
        }

        if (item.notes) {
          printer.println(
            `Nota: ${item.notes}`
          );
        }

        printer.println("");
      });

    return runPrinter(printer, job);
  }

  if (job.type === "PRINT_RECEIPT") {
    const printer = createPrinter();

    printHeader(printer, "RECIBO", job);

    let total = 0;

    job.payload.items
      .filter((item) => item.quantity > 0)
      .forEach((item) => {
        const lineTotal =
          item.unitPrice * item.quantity;

        total += lineTotal;

        printer.leftRight(
          `${item.displayName} x${item.quantity}`,
          formatCurrency(lineTotal)
        );

        if (item.variantName) {
          printer.println(
            `  ${item.variantName}`
          );
        }
      });

    printer.drawLine();

    printer.bold(true);

    printer.leftRight(
      "TOTAL",
      formatCurrency(total)
    );

    printer.bold(false);

    printer.println("");
    printer.alignCenter();
    printer.println("Gracias por su visita");

    return runPrinter(printer, job);
  }

  console.warn(
    `Unknown print job type: ${job.type}`
  );
}