export type PrintType =
  | "PRINT_KITCHEN"
  | "PRINT_BAR"
  | "PRINT_RECEIPT";

export type PrintJob = {
  type: PrintType;
  payload: any;
};