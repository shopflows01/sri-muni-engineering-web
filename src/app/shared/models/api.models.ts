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
  quantity: number;
  rate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  asnNo?: string;
  ewbNo?: string;
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
  status: number;
  createdAt?: string;
}
