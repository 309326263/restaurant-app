import { io } from "socket.io-client";
import ThermalPrinter from "node-thermal-printer";

// 🔥 CONECTA A TU BACKEND (Next.js o API Node)
const socket = io("http://TU_BACKEND_IP:3000");

socket.on("connect", () => {
  console.log("🟢 Print server conectado");
});

// 🧾 TICKET COCINA
socket.on("PRINT_KITCHEN", async (order) => {
  console.log("🍳 Cocina:", order.id);

  const printer = new ThermalPrinter({
    type: "epson",
    interface: "usb", // o tcp://IP_IMPRESORA
  });

  try {
    await printer.init();

    printer.alignCenter();
    printer.println("TICKET COCINA");
    printer.drawLine();

    printer.println(`Mesa: ${order.table.name}`);
    printer.println(`Orden #${order.id}`);
    printer.drawLine();

    order.items.forEach((item) => {
      printer.leftRight(
        item.product?.name || item.customName,
        `x${item.quantity}`
      );
    });

    printer.drawLine();
    printer.cut();

    await printer.execute();

    console.log("✔ Cocina impresa");
  } catch (err) {
    console.error("❌ Error cocina:", err);
  }
});

// 🧾 TICKET BAR (bebidas)
socket.on("PRINT_BAR", async (order) => {
  console.log("🍹 Bar:", order.id);

  const printer = new ThermalPrinter({
    type: "epson",
    interface: "usb",
  });

  try {
    await printer.init();

    printer.alignCenter();
    printer.println("TICKET BAR");
    printer.drawLine();

    printer.println(`Mesa: ${order.table.name}`);
    printer.println(`Orden #${order.id}`);
    printer.drawLine();

    order.items.forEach((item) => {
      printer.leftRight(
        item.product?.name || item.customName,
        `x${item.quantity}`
      );
    });

    printer.drawLine();
    printer.cut();

    await printer.execute();

    console.log("✔ Bar impreso");
  } catch (err) {
    console.error("❌ Error bar:", err);
  }
});

// 🧾 TICKET FINAL CLIENTE (cobro)
socket.on("PRINT_BILL", async (order) => {
  console.log("💰 Cuenta:", order.id);

  const printer = new ThermalPrinter({
    type: "epson",
    interface: "usb",
  });

  try {
    await printer.init();

    printer.alignCenter();
    printer.println("RESTAURANTE");
    printer.drawLine();

    printer.println(`Mesa: ${order.table.name}`);
    printer.println(`Orden #${order.id}`);
    printer.drawLine();

    let total = 0;

    order.items.forEach((item) => {
      const lineTotal = item.product.price * item.quantity;
      total += lineTotal;

      printer.leftRight(
        `${item.product?.name || item.customName} x${item.quantity}`,
        `$${lineTotal}`
      );
    });

    printer.drawLine();
    printer.leftRight("TOTAL", `$${total}`);
    printer.drawLine();

    printer.cut();

    await printer.execute();

    console.log("✔ Ticket cliente impreso");
  } catch (err) {
    console.error("❌ Error ticket:", err);
  }
});