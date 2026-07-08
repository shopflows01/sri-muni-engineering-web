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
  customers?: { customerId: string; customerName: string }[];
  partNo: string;
  partName: string;
  partDescription?: string;
  ratePerItem: number;
  gstPercent: number;
  hsnSac: string;
  unit: string;
  createdAt?: string;
}

export interface InvoiceItem {
  id?: string;
  productId: string;
  productName?: string;
  productPartNo?: string;
  partNo?: string;
  partName?: string;
  hsnCode?: string;
  description?: string;
  quantity: number;
  rate: number;
  discount: number;
  gstPercent: number;
  gstAmount?: number;
  amount?: number;
}


export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceSequence?: number;
  financialYear?: string;
  date: string;
  invoiceDate?: string;
  dcLedgerId?: string;
  customerId: string;
  customerName?: string;
  subTotal?: number;
  gstAmount?: number;
  grandTotal?: number;
  totalAmount?: number; // fallback
  amountInWords?: string;
  remarks?: string;
  items: InvoiceItem[];
  deliveryNoteNo?: string;
  dcDate?: string;
  referenceNo?: string;
  buyersOrderNo?: string;
  dispatchDocNo?: string;
  destination?: string;
  termsOfDelivery?: string;
  asnNo?: string;
  ewbNo?: string;
  downloadUrl?: string;
  status?: string;
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

export interface ProductAnalysisResponse {
  productInfo: {
    id: string;
    partNo: string;
    partName: string;
    currentStock: number;
    unit: string;
    sellingPrice: number;
    hsnSac: string;
  };
  productionSummary: {
    totalProductionQuantity: number;
    totalRejectedQuantity: number;
    productionDaysCount: number;
    averageProductionPerDay: number;
    lastProductionDate: string;
  };
  salesSummary: {
    totalQuantitySold: number;
    totalRevenueGenerated: number;
    numberOfInvoices: number;
    averageSellingPrice: number;
    lastSoldDate: string;
  };
  stockSummary: {
    currentStock: number;
    totalInward: number;
    totalOutward: number;
  };
  recentProductionHistory: any[];
  recentInvoiceHistory: any[];
  recentStockMovements: any[];
}
