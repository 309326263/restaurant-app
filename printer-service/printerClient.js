const net = require("net");
const path = require("path");
const fs = require("fs/promises");
const escpos = require("escpos");

escpos.USB = require("escpos-usb");

const EPSON_VENDOR_ID = 0x04b8;
const DEFAULT_LAN_TIMEOUT_MS = 3000;

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function getRuntimeConfig() {
  return {
    connection: String(process.env.PRINTER_CONNECTION || "LAN")
      .trim()
      .toUpperCase(),
    ip: String(process.env.PRINTER_IP || "192.168.1.50").trim(),
    port: Number(process.env.PRINTER_PORT || 9100),
    lanTimeoutMs: Number(
      process.env.PRINTER_LAN_TIMEOUT_MS || DEFAULT_LAN_TIMEOUT_MS
    ),
    usbVendorId:
      process.env.PRINTER_USB_VENDOR_ID !== undefined
        ? Number(process.env.PRINTER_USB_VENDOR_ID)
        : undefined,
    usbProductId:
      process.env.PRINTER_USB_PRODUCT_ID !== undefined
        ? Number(process.env.PRINTER_USB_PRODUCT_ID)
        : undefined,
    usbFallback: parseBoolean(process.env.ENABLE_USB_FALLBACK, true),
    simulation: parseBoolean(process.env.PRINTER_SIMULATION, false),
  };
}

class LanDevice {
  constructor(host, port, timeoutMs) {
    this.host = host;
    this.port = port;
    this.timeoutMs = timeoutMs;
    this.socket = null;
  }

  open(callback) {
    const socket = net.createConnection({
      host: this.host,
      port: this.port,
    });

    this.socket = socket;

    let done = false;
    const complete = (error) => {
      if (done) {
        return;
      }
      done = true;
      callback(error || null);
    };

    socket.setTimeout(this.timeoutMs, () => {
      socket.destroy(new Error("LAN printer timeout"));
    });

    socket.once("connect", () => complete(null));
    socket.once("error", (error) => complete(error));
    socket.once("timeout", () => complete(new Error("LAN printer timeout")));
  }

  write(data, callback) {
    if (!this.socket) {
      callback(new Error("LAN printer socket not open"));
      return this;
    }

    this.socket.write(data, callback);
    return this;
  }

  close(callback) {
    if (!this.socket) {
      if (callback) callback(null);
      return this;
    }

    const socket = this.socket;
    this.socket = null;

    socket.end(() => {
      if (callback) callback(null);
    });
    socket.destroy();
    return this;
  }
}

function buildUsbDevice(config) {
  try {
    if (
      typeof config.usbVendorId === "number" &&
      typeof config.usbProductId === "number"
    ) {
      return new escpos.USB(config.usbVendorId, config.usbProductId);
    }

    const usbDevices = escpos.USB.findPrinter();

    if (!usbDevices || !usbDevices.length) {
      console.warn("[printer-service] USB printer not found");
      return null;
    }

    const epsonDevice = usbDevices.find(
      (device) =>
        Number(device?.deviceDescriptor?.idVendor) === EPSON_VENDOR_ID
    );

    if (!epsonDevice) {
      console.warn("[printer-service] USB printer not found");
      return null;
    }

    return new escpos.USB(epsonDevice);
  } catch (error) {
    console.warn(
      `[printer-service] USB printer not found: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
}

function buildLanDevice() {
  const config = getRuntimeConfig();
  return new LanDevice(config.ip, config.port, config.lanTimeoutMs);
}

function printWithDevice(device, renderTicket) {
  return new Promise((resolve, reject) => {
    if (!device) {
      reject(new Error("Printer device not available"));
      return;
    }

    const printer = new escpos.Printer(device, {
      encoding: "CP437",
    });

    device.open((openError) => {
      if (openError) {
        reject(openError);
        return;
      }

      try {
        renderTicket(printer);
        printer.close(() => resolve());
      } catch (error) {
        reject(error);
      }
    });
  });
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function saveSimulationPreview(previewText, ticketId) {
  const previewsDir = path.join(__dirname, "previews");
  await fs.mkdir(previewsDir, { recursive: true });

  const safeId = String(ticketId || Date.now()).replaceAll(/[^\w.-]/g, "_");
  const txtPath = path.join(previewsDir, `ticket-${safeId}.txt`);
  const htmlPath = path.join(previewsDir, `ticket-${safeId}.html`);

  await fs.writeFile(txtPath, previewText, "utf8");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ticket Preview ${safeId}</title>
  </head>
  <body>
    <pre>${escapeHtml(previewText)}</pre>
  </body>
</html>
`;

  await fs.writeFile(htmlPath, html, "utf8");

  console.log(`[printer-service] simulation preview saved: ${txtPath}`);
  console.log(`[printer-service] simulation preview saved: ${htmlPath}`);
}

async function printTicket({ renderTicket, previewText, ticketId }) {
  const config = getRuntimeConfig();

  if (config.simulation) {
    console.log("[printer-service] PRINTER_SIMULATION=true");
    console.log(previewText);
    await saveSimulationPreview(previewText, ticketId);
    return;
  }

  if (config.connection === "USB") {
    return printWithDevice(buildUsbDevice(config), renderTicket);
  }

  try {
    await printWithDevice(buildLanDevice(), renderTicket);
  } catch (lanError) {
    if (!config.usbFallback) {
      throw lanError;
    }

    console.warn(
      `[printer-service] LAN print failed, trying USB fallback: ${
        lanError instanceof Error ? lanError.message : String(lanError)
      }`
    );

    return printWithDevice(buildUsbDevice(config), renderTicket);
  }
}

function getPrinterConfig() {
  const config = getRuntimeConfig();
  return {
    mode: config.connection,
    ip: config.ip,
    port: config.port,
    usbFallback: config.usbFallback,
    simulation: config.simulation,
  };
}

module.exports = {
  getPrinterConfig,
  printTicket,
};
