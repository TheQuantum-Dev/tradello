"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trade, Account, PageId } from "../lib/types";

interface AppContextType {
  // Navigation
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Trades
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  selectedTrade: Trade | null;
  setSelectedTrade: (trade: Trade | null) => void;
  loading: boolean;

  // Accounts
  accounts: Account[];
  activeAccount: Account | null;
  setActiveAccount: (account: Account) => void;
  addAccount: (account: Account) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [trades, setTradesState] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  // Load trades from database on mount
  useEffect(() => {
    const loadTrades = async () => {
      try {
        const res = await fetch("/api/trades");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTradesState(
            data.map((t: Trade) => ({
              ...t,
              tags: typeof t.tags === "string" ? JSON.parse(t.tags) : t.tags || [],
              imageUrls: typeof t.imageUrls === "string" ? JSON.parse(t.imageUrls) : t.imageUrls || [],
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load trades:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTrades();
  }, []);

  // Load accounts from database on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAccounts(data);
          setActiveAccount(data[0]);
        }
      } catch (err) {
        console.error("Failed to load accounts:", err);
      }
    };
    loadAccounts();
  }, []);

  const setTrades = (newTrades: Trade[]) => {
    setTradesState(newTrades);
  };

  const addAccount = (account: Account) => {
    setAccounts((prev) => [...prev, account]);
    if (!activeAccount) setActiveAccount(account);
  };

  return (
    <AppContext.Provider value={{
      activePage, setActivePage,
      trades, setTrades,
      selectedTrade, setSelectedTrade,
      loading,
      accounts, activeAccount, setActiveAccount, addAccount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook — components use this to access the context
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}