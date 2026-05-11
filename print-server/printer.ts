import { PrintJob } from "./types";

const PRINTER_SERVICE_URL =
  process.env.PRINTER_SERVICE_URL || "http://localhost:4010";

export async function executePrint(job: PrintJob) {
  if (job.type === "PRINT_KITCHEN") {
    return printStation("kitchen", job.payload);
  }

  if (job.type === "PRINT_BAR") {
    return printStation("bar", job.payload);
  }

  if (job.type === "PRINT_RECEIPT") {
    console.warn("PRINT_RECEIPT no-op in current flow");
    return;
  }
}

async function printStation(
  endpoint: "kitchen" | "bar",
  payload: PrintJob["payload"]
) {
  const response = await fetch(
    `${PRINTER_SERVICE_URL}/print/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `printer-service /print/${endpoint} failed (${response.status}): ${body}`
    );
  }
}