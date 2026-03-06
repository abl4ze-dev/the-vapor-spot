import { useState, useEffect, useCallback } from 'react';
import {
  Product,
  Sale,
  getProducts,
  getSales,
  addProduct,
  updateProduct,
  deleteProduct,
  addSale,
  updateSale,
  deleteSale,
  getDashboardStats,
  initializeSampleData,
} from '@/lib/store';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setProducts(getProducts());
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeSampleData();
    refresh();
  }, [refresh]);

  const add = useCallback((product: Omit<Product, 'id' | 'stockLeft' | 'createdAt'>) => {
    const newProduct = addProduct(product);
    refresh();
    return newProduct;
  }, [refresh]);

  const update = useCallback((id: string, updates: Partial<Product>) => {
    const updated = updateProduct(id, updates);
    refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const result = deleteProduct(id);
    refresh();
    return result;
  }, [refresh]);

  return { products, loading, refresh, add, update, remove };
};

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setSales(getSales());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback((sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale = addSale(sale);
    refresh();
    return newSale;
  }, [refresh]);

  const update = useCallback((id: string, updates: Partial<Sale>) => {
    const updated = updateSale(id, updates);
    refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const result = deleteSale(id);
    refresh();
    return result;
  }, [refresh]);

  return { sales, loading, refresh, add, update, remove };
};

export const useDashboard = () => {
  const [stats, setStats] = useState(getDashboardStats());

  const refresh = useCallback(() => {
    setStats(getDashboardStats());
  }, []);

  useEffect(() => {
    refresh();
    // Set up interval for real-time updates
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { stats, refresh };
};
