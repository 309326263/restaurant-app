import ThermalPrinter from "node-thermal-printer";
import { PrintJob } from "./types";

async function createPrinter() {
  const printer = new ThermalPrinter({
    type: "epson",
    interface: "usb",
  });

  await printer.init();
  return printer;
}

export async function executePrint(job: PrintJob) {
  if (job.type === "PRINT_KITCHEN") {
    return printKitchen(job.payload);
  }

  if (job.type === "PRINT_BAR") {
    return printBar(job.payload);
  }

  if (job.type === "PRINT_RECEIPT") {
    return printReceipt(job.payload);
  }
}

// -----------------------

async function printKitchen(order: any) {
  const printer = await createPrinter();

  printer.alignCenter();
  printer.println("COCINA");
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Mesa: ${order.table.name}`);

  order.items.forEach((i: any) => {
    printer.println(`${i.product?.name || i.customName} x${i.quantity}`);
  });

  printer.cut();
  await printer.execute();
}

async function printBar(order: any) {
  const printer = await createPrinter();

  printer.alignCenter();
  printer.println("BAR");
  printer.drawLine();

  order.items.forEach((i: any) => {
    printer.println(`${i.product?.name || i.customName} x${i.quantity}`);
  });

  printer.cut();
  await printer.execute();
}

async function printReceipt(order: any) {
  const printer = await createPrinter();

  let total = 0;

  printer.alignCenter();
  printer.println("RESTAURANTE");
  printer.drawLine();

  printer.alignLeft();
  printer.println(`Mesa: ${order.table.name}`);

  order.items.forEach((i: any) => {
    const line = i.product?.price ?? i.customPrice ?? 0 * i.quantity;
    total += line;

    printer.leftRight(
      `${i.product?.name || i.customName} x${i.quantity}`,
      line.toFixed(2)
    );
  });

  printer.drawLine();
  printer.leftRight("TOTAL", total.toFixed(2));

  printer.cut();
  await printer.execute();
}