import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { addJob } from "./queue";
import { PrintJob, SnapshotPrintItem, Station } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔥 sockets solo para debug (opcional)
io.on("connection", (socket) => {
  console.log("🟢 cliente conectado:", socket.id);

  socket.on("PRINT_KITCHEN", (payload) => {
    enqueueFromEvent("PRINT_KITCHEN", payload);
  });

  socket.on("PRINT_BAR", (payload) => {
    enqueueFromEvent("PRINT_BAR", payload);
  });

  socket.on("PRINT_KITCHEN_AND_BAR", (payload) => {
    enqueueFromEvent("PRINT_KITCHEN_AND_BAR", payload);
  });

  socket.on("PRINT_RECEIPT", (payload) => {
    enqueueFromEvent("PRINT_RECEIPT", payload);
  });
});

function normalizeItem(raw: any): SnapshotPrintItem {
  return {
    id: raw?.id,
    displayName: String(raw?.displayName || "Item").trim() || "Item",
    quantity: Number(raw?.quantity || 0),
    unitPrice: Number(raw?.unitPrice || 0),
    station: raw?.station,
    variantName: raw?.variantName ?? null,
    notes: raw?.notes ?? null,
    type: raw?.type,
    productId: raw?.productId ?? null,
  };
}

function buildPayload(station: Station, raw: any): PrintJob["payload"] {
  const itemsRaw = Array.isArray(raw?.items) ? raw.items : [];
  const ticketId =
    raw?.ticketId || raw?.ticket || raw?.id || String(Date.now()).slice(-6);
  const table =
    raw?.table?.name !== undefined
      ? String(raw.table.name)
      : String(raw?.table || "N/A");

  return {
    station,
    table,
    ticketId: String(ticketId),
    items: itemsRaw
      .map(normalizeItem)
      .filter((item: SnapshotPrintItem) => item.quantity > 0),
    total:
      raw?.total === undefined
        ? undefined
        : Number(raw.total || 0),
  };
}

function enqueueFromEvent(event: string, payload: any) {
  try {
    if (event === "PRINT_KITCHEN") {
      addJob({
        type: "PRINT_KITCHEN",
        payload: buildPayload("KITCHEN", payload),
      });
      return;
    }

    if (event === "PRINT_BAR") {
      addJob({
        type: "PRINT_BAR",
        payload: buildPayload("BAR", payload),
      });
      return;
    }

    if (event === "PRINT_KITCHEN_AND_BAR") {
      addJob({
        type: "PRINT_KITCHEN",
        payload: buildPayload("KITCHEN", payload),
      });
      addJob({
        type: "PRINT_BAR",
        payload: buildPayload("BAR", payload),
      });
      return;
    }

    if (event === "PRINT_RECEIPT") {
      addJob({
        type: "PRINT_RECEIPT",
        payload: buildPayload("KITCHEN", payload),
      });
    }
  } catch (error) {
    console.error("❌ enqueue error:", error);
  }
}

// 🔥 entrada única desde Next.js
app.post("/emit", (req, res) => {
  const { events, payload } = req.body;

  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ ok: false });
  }

  events.forEach((event) => {
    enqueueFromEvent(event, payload);
    io.emit(event, payload);
  });

  return res.json({ ok: true });
});

server.listen(4000, () => {
  console.log("🚀 Print server en 4000");
});