// Types
export interface Variation {
  id: string;
  name: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  totalStock: number;
  stockLeft: number;
  variations: Variation[];
  createdAt: string;
}

export interface Sale {
  id: string;
  date: string;
  buyerName: string;
  productId: string;
  productName: string;
  variationId?: string;
  variationName?: string;
  basePrice: number;
  sellingPrice: number;
  quantity: number;
  subtotal: number;
  total: number;
  profit: number;
  isPaid: boolean;
  createdAt: string;
}

// Local Storage Keys
const PRODUCTS_KEY = 'cloud-essence-products';
const SALES_KEY = 'cloud-essence-sales';

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper: recalculate product stock from variations
const recalcStockFromVariations = (product: Product): Product => {
  if (product.variations && product.variations.length > 0) {
    const totalStock = product.variations.reduce((sum, v) => sum + v.stock, 0);
    // stockLeft for variation products = sum of variation stocks (they ARE the stock)
    return { ...product, totalStock, stockLeft: totalStock };
  }
  return product;
};

// Products CRUD
export const getProducts = (): Product[] => {
  const data = localStorage.getItem(PRODUCTS_KEY);
  const products: Product[] = data ? JSON.parse(data) : [];
  // Backward compat: ensure variations array exists
  return products.map(p => ({ ...p, variations: p.variations || [] }));
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const addProduct = (product: Omit<Product, 'id' | 'stockLeft' | 'createdAt'>): Product => {
  const products = getProducts();
  let newProduct: Product = {
    ...product,
    id: generateId(),
    variations: product.variations || [],
    stockLeft: product.totalStock,
    createdAt: new Date().toISOString(),
  };
  newProduct = recalcStockFromVariations(newProduct);
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  products[index] = recalcStockFromVariations(products[index]);
  saveProducts(products);
  return products[index];
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
};

// Sales CRUD
export const getSales = (): Sale[] => {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSales = (sales: Sale[]): void => {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
};

export const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>): Sale => {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  sales.push(newSale);
  saveSales(sales);
  
  // Deduct stock
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === sale.productId);
  if (productIndex !== -1) {
    const product = products[productIndex];
    if (sale.variationId && product.variations?.length > 0) {
      // Deduct from specific variation
      const varIndex = product.variations.findIndex(v => v.id === sale.variationId);
      if (varIndex !== -1) {
        product.variations[varIndex].stock -= sale.quantity;
      }
      // Recalc parent totals
      products[productIndex] = recalcStockFromVariations(product);
    } else {
      products[productIndex].stockLeft -= sale.quantity;
    }
    saveProducts(products);
  }
  
  return newSale;
};

export const updateSale = (id: string, updates: Partial<Sale>): Sale | null => {
  const sales = getSales();
  const index = sales.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  sales[index] = { ...sales[index], ...updates };
  saveSales(sales);
  return sales[index];
};

export const deleteSale = (id: string): boolean => {
  const sales = getSales();
  const sale = sales.find(s => s.id === id);
  if (!sale) return false;
  
  // Restore stock
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === sale.productId);
  if (productIndex !== -1) {
    const product = products[productIndex];
    if (sale.variationId && product.variations?.length > 0) {
      const varIndex = product.variations.findIndex(v => v.id === sale.variationId);
      if (varIndex !== -1) {
        product.variations[varIndex].stock += sale.quantity;
      }
      products[productIndex] = recalcStockFromVariations(product);
    } else {
      products[productIndex].stockLeft += sale.quantity;
    }
    saveProducts(products);
  }
  
  const filtered = sales.filter(s => s.id !== id);
  saveSales(filtered);
  return true;
};

// Analytics
export const getDashboardStats = () => {
  const sales = getSales();
  const products = getProducts();
  
  const totalSales = sales.length;
  const totalBasePrice = sales.reduce((sum, s) => sum + (s.basePrice || s.sellingPrice || 0) * s.quantity, 0);
  const totalSellingPrice = sales.reduce((sum, s) => sum + s.total, 0);
  const totalProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const totalIncome = sales.filter(s => s.isPaid).reduce((sum, s) => sum + s.total, 0);
  const totalProductsSold = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalRemainingStock = products.reduce((sum, p) => sum + p.stockLeft, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date === today);
  const dailySalesTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const dailySalesCount = todaySales.length;
  const dailyProfit = todaySales.reduce((sum, s) => sum + (s.profit || 0), 0);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthSales = sales.filter(s => s.date.startsWith(currentMonth));
  const monthlySalesTotal = monthSales.reduce((sum, s) => sum + s.total, 0);
  const monthlySalesCount = monthSales.length;
  const monthlyProfit = monthSales.reduce((sum, s) => sum + (s.profit || 0), 0);
  
  const unpaidSales = sales.filter(s => !s.isPaid);
  const unpaidTotal = unpaidSales.reduce((sum, s) => sum + s.total, 0);
  
  return {
    totalSales,
    totalBasePrice,
    totalSellingPrice,
    totalProfit,
    totalIncome,
    totalProductsSold,
    totalRemainingStock,
    dailySalesTotal,
    dailySalesCount,
    dailyProfit,
    monthlySalesTotal,
    monthlySalesCount,
    monthlyProfit,
    unpaidCount: unpaidSales.length,
    unpaidTotal,
  };
};

export const getSalesByDateRange = (startDate: string, endDate: string): Sale[] => {
  const sales = getSales();
  return sales.filter(s => s.date >= startDate && s.date <= endDate);
};

export const getSalesByMonth = (month: string): Sale[] => {
  const sales = getSales();
  return sales.filter(s => s.date.startsWith(month));
};

export const getUnpaidSales = (): Sale[] => {
  return getSales().filter(s => !s.isPaid);
};

export const getAllProducts = (): Product[] => {
  return getProducts();
};

export const getAllSales = (): Sale[] => {
  return getSales();
};

// Format currency (Philippine Peso)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Initialize with sample data if empty
export const initializeSampleData = () => {
  const products = getProducts();
  if (products.length === 0) {
    const sampleProducts: Omit<Product, 'id' | 'stockLeft' | 'createdAt'>[] = [
      { name: 'RELX Infinity Pod', price: 350, totalStock: 50, variations: [] },
      { name: 'RELX Essential Device', price: 699, totalStock: 20, variations: [] },
      { name: 'Caliburn G2 Pod', price: 280, totalStock: 40, variations: [] },
      { name: 'Vaporesso XROS 3', price: 1200, totalStock: 15, variations: [] },
      { name: 'Lost Vape Orion', price: 1500, totalStock: 10, variations: [] },
      { name: 'Salt Nic 30ml - Mango', price: 300, totalStock: 30, variations: [] },
      { name: 'Salt Nic 30ml - Lychee', price: 300, totalStock: 25, variations: [] },
      { name: 'Freebase 60ml - Grape', price: 400, totalStock: 20, variations: [] },
    ];
    
    sampleProducts.forEach(addProduct);
  }
};
