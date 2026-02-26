"use client";
import {
  LayoutDashboard, BookOpen, BarChart2, Calendar,
  Upload, PlusCircle, Settings, Wallet,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageId } from "../lib/types";

const NAV_ITEMS: { icon: any; label: string; id: PageId }[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: BookOpen, label: "Journal", id: "journal" },
  { icon: BarChart2, label: "Analytics", id: "analytics" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: Wallet, label: "Accounts", id: "accounts" },
  { icon: Upload, label: "Import Trades", id: "import" },
];

export default function Sidebar() {
  const { activePage, setActivePage } = useApp();

  return (
    <aside style={{
      width: "220px",
      minWidth: "220px",
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 24px 32px" }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "800",
          background: "linear-gradient(135deg, #00e57a, #4d9fff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.5px",
        }}>
          Tradello
        </h1>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
          Trading Journal
        </p>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "0 12px" }}>
        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                marginBottom: "2px",
                background: active ? "var(--accent-green-dim)" : "transparent",
                color: active ? "var(--accent-green)" : "var(--text-secondary)",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: active ? "600" : "400",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Add Trade Button */}
      <div style={{ padding: "0 12px 16px" }}>
        <button
          onClick={() => setActivePage("import")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid var(--accent-green)",
            background: "var(--accent-green-dim)",
            color: "var(--accent-green)",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <PlusCircle size={15} />
          Add Trade
        </button>
      </div>

      {/* Settings */}
      <div style={{ padding: "16px 24px 0", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => {}}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            padding: "8px 0",
          }}
        >
          <Settings size={15} />
          Settings
        </button>
      </div>
    </aside>
  );
}