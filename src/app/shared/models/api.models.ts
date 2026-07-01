export interface Customer {
  id: string;
  name: string;
  vendorCode: string;
  gstin: string;
  stateName: string;
  stateCode: string;
  billingAddress: string;
  shippingAddress: string;
  pincode: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  customerId: string;
  customerName?: string;
  partNo: string;
  partName: string;
  partDescription?: string;
  hsnSac: string;
  unit: string;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  dcLedgerId: string;
  customerId: string;
  customerName?: string;
  productId: string;
  partNo?: string;
  partName?: string;
  hsnSac?: string;
  quantity: number;
  rate: number;
  taxableValue: number;
  igstRate: number;
  igstAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  totalAmount: number;
  amountInWords?: string;
  deliveryNoteNo?: string;
  referenceNo?: string;
  buyersOrderNo?: string;
  dispatchDocNo?: string;
  destination?: string;
  termsOfDelivery?: string;
  asnNo?: string;
  ewbNo?: string;
  downloadUrl?: string;
  createdAt?: string;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  customerId: string;
  customerName?: string;
  productId: string;
  partNo?: string;
  partName?: string;
  model: string;
  numberOff: number;
  operations: any[];
  otherCosts: any;
  processCostTotal?: number;
  estimatedCostPerPart: number;
  gstRate: number;
  downloadUrl?: string;
  createdAt?: string;
}

export interface StockLedger {
  id: string;
  dcNo: string;
  dcDate: string;
  customerId: string;
  customerName?: string;
  productId: string;
  partNo?: string;
  partName?: string;
  inwardQty: number;
  outwardQty: number;
  rejectedQty: number;
  pendingQty: number;
  status: number;
  createdAt?: string;
}
