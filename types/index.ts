export interface Product {
  id: string;
  name: string;
  pricePerUnit: number;
  unit: 'kg' | 'lb' | 'litros' | 'unidad';
  standardQuantity?: number;
  lotQuantity: number;
  availableQuantity: number;
  investment: number;
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
  period: 'weekly' | 'monthly';
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