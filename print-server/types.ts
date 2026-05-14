export type PrintType =

  | "PRINT_KITCHEN"

  | "PRINT_BAR"

  | "PRINT_RECEIPT";



export type Station = "KITCHEN" | "BAR";



export type SnapshotPrintItem = {

  id?: number | string;

  displayName: string;

  quantity: number;

  unitPrice: number;

  station?: Station;

  variantName?: string | null;

  notes?: string | null;

  type?: string;

  productId?: number | null;

};



export type PrintPayload = {

  station: Station;

  table: string;

  ticketId: string;

  items: SnapshotPrintItem[];

  total?: number;

};



export type PrintJob = {

  type: PrintType;

  payload: PrintPayload;

};

