export type PrintType =
  | "PRINT_KITCHEN"
  | "PRINT_BAR"
  | "PRINT_RECEIPT";

export type TicketItem = {
  name: string;
  qty: number;
  notes?: string | null;
};

export type Station = "KITCHEN" | "BAR";

export type PrinterServicePayload = {
  station: Station;
  table: string;
  ticketId: string;
  items: TicketItem[];
};

export type PrintJob = {
  type: PrintType;
  payload: PrinterServicePayload;
};