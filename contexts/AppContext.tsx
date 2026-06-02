import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Sale, Note } from '@/types';

interface AppState {
  products: Product[];
  sales: Sale[];
  notes: Note[];
}

type AppAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_SALES'; payload: Sale[] }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'DELETE_SALE'; payload: string }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string };

const initialState: AppState = {
  products: [],
  sales: [],
  notes: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        sales: state.sales.filter(s => s.productId !== action.payload), // Remove related sales
      };
    case 'SET_SALES':
      return { ...state, sales: action.payload };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter(s => s.id !== action.payload),
      };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.payload.id ? action.payload : n
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload),
      };
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  deleteSale: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteNote: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadData();
  }, []);

  // Save data to AsyncStorage whenever state changes
  useEffect(() => {
    saveData();
  }, [state]);

  const loadData = async () => {
    try {
      const [productsData, salesData, notesData] = await Promise.all([
        AsyncStorage.getItem('products'),
        AsyncStorage.getItem('sales'),
        AsyncStorage.getItem('notes'),
      ]);

      if (productsData) {
        const products = JSON.parse(productsData).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
        dispatch({ type: 'SET_PRODUCTS', payload: products });
      }

      if (salesData) {
        const sales = JSON.parse(salesData).map((s: any) => ({
          ...s,
          date: new Date(s.date),
        }));
        dispatch({ type: 'SET_SALES', payload: sales });
      }

      if (notesData) {
        const notes = JSON.parse(notesData).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
        }));
        dispatch({ type: 'SET_NOTES', payload: notes });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('products', JSON.stringify(state.products)),
        AsyncStorage.setItem('sales', JSON.stringify(state.sales)),
        AsyncStorage.setItem('notes', JSON.stringify(state.notes)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const product: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      availableQuantity: productData.lotQuantity,
    };
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  };

  const deleteProduct = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'date'>) => {
  const sale: Sale = {
    ...saleData,
    id: Date.now().toString(),
    date: new Date(),
  };

  // Update product quantity
  const product = state.products.find(p => p.id === sale.productId);
  if (product) {
    const updatedProduct = {
      ...product,
      availableQuantity: (
        (parseFloat(product.availableQuantity) || 0) - (sale.quantity || 0)
      ).toString(),
    };
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
  }

  dispatch({ type: 'ADD_SALE', payload: sale });
};

const deleteSale = (id: string) => {
  // Find the sale to restore product quantity
  const sale = state.sales.find(s => s.id === id);
  if (sale) {
    const product = state.products.find(p => p.id === sale.productId);
    if (product) {
      const updatedProduct = {
        ...product,
        availableQuantity: (
          (parseFloat(product.availableQuantity) || 0) + (sale.quantity || 0)
        ).toString(),
      };
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
    }
  }

  dispatch({ type: 'DELETE_SALE', payload: id });
};

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_NOTE', payload: note });
  };

  const updateNote = (id: string, noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const existingNote = state.notes.find(n => n.id === id);
    if (existingNote) {
      const note: Note = {
        ...noteData,
        id,
        createdAt: existingNote.createdAt,
        updatedAt: new Date(),
      };
      dispatch({ type: 'UPDATE_NOTE', payload: note });
    }
  };

  const deleteNote = (id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        deleteSale,
        addNote,
        updateNote,
        deleteNote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};