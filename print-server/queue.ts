import { PrintJob } from "./types";
import { executePrint } from "./printer";

const queue: PrintJob[] = [];
let processing = false;

export function addJob(job: PrintJob) {
  queue.push(job);
  processQueue();
}

async function processQueue() {
  if (processing) return;

  processing = true;

  while (queue.length > 0) {
    const job = queue.shift()!;

    try {
      await executePrint(job);
    } catch (err) {
      console.error("❌ error imprimiendo:", err);
    }
  }

  processing = false;
}