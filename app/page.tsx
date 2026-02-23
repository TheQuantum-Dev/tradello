"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Calendar,
  Upload,
  PlusCircle,
  Settings,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: BookOpen, label: "Journal", id: "journal" },
  { icon: BarChart2, label: "Analytics", id: "analytics" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: Upload, label: "Import Trades", id: "import" },
];

const stats = [
  {
    label: "Net P&L",
    value: "+$0.00",
    sub: "All time",
    positive: true,
    icon: TrendingUp,
  },
  {
    label: "Win Rate",
    value: "0%",
    sub: "0 trades",
    positive: true,
    icon: Target,
  },
  {
    label: "Profit Factor",
    value: "0.00",
    sub: "Avg win / avg loss",
    positive: true,
    icon: Zap,
  },
  {
    label: "Avg Loss",
    value: "$0.00",
    sub: "Per losing trade",
    positive: false,
    icon: TrendingDown,
  },
];

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          minWidth: "220px",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "0 24px 32px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #00e57a, #4d9fff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            Tradello
          </h1>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            Trading Journal
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {navItems.map(({ icon: Icon, label, id }) => {
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
              transition: "all 0.15s ease",
            }}
          >
            <PlusCircle size={15} />
            Add Trade
          </button>
        </div>

        {/* Settings */}
        <div
          style={{
            padding: "16px 24px 0",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
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

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          background: "var(--bg-primary)",
          padding: "32px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            Dashboard
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Welcome back. Here's how you're performing.
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {stats.map(({ label, value, sub, positive, icon: Icon }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
                  {label}
                </span>
                <Icon
                  size={16}
                  color={positive ? "var(--accent-green)" : "var(--accent-red)"}
                />
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  fontFamily: "'Syne', sans-serif",
                  color: positive ? "var(--accent-green)" : "var(--accent-red)",
                  marginBottom: "4px",
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--border)",
            borderRadius: "16px",
            padding: "60px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--accent-green-dim)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Upload size={20} color="var(--accent-green)" />
          </div>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "700",
              marginBottom: "8px",
              color: "var(--text-primary)",
            }}
          >
            No trades yet
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            Import your Fidelity CSV or add a trade manually to get started.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: "var(--accent-green)",
                color: "#000",
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              Import CSV
            </button>
            <button
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              Add Manually
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "48px",
            color: "var(--text-muted)",
            fontSize: "12px",
          }}
        >
          Made with ❤️ by The Quantum Dev
        </div>
      </main>
    </div>
  );
}