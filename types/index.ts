export interface Product {
  id: string;
  name: string;
  pricePerUnit: string; // o number, pero debe ser consistente
  costPerUnit: string;  // <-- agrega este campo como string
  unit: string;
  standardQuantity?: string;
  lotQuantity: string;
  availableQuantity: string;
  investment: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  specialPrice?: number;
  totalPrice: number;
  date: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistryFilter {
  type: 'best-selling' | 'worst-selling' | 'most-profitable' | 'least-profitable';
  period: 'daily' | 'weekly' | 'monthly' | 'generally';
}

export interface ProductStats {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  remainingQuantity: number;
  profit: number;
  investment: number;
}