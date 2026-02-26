"use client";
import { TrendingUp, TrendingDown, Target, Zap, Upload } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Trade } from "../lib/types";

function StatCard({
  label, value, sub, positive, icon: Icon,
}: {
  label: string; value: string; sub: string;
  positive: boolean; icon: any;
}) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "12px", padding: "20px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "12px",
      }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
          {label}
        </span>
        <Icon size={16} color={positive ? "#00e57a" : "#ff4d6a"} />
      </div>
      <div style={{
        fontSize: "24px", fontWeight: "700",
        fontFamily: "'Syne', sans-serif",
        color: positive ? "#00e57a" : "#ff4d6a",
        marginBottom: "4px",
      }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const { trades, setActivePage, setSelectedTrade } = useApp();

  // Calculate stats
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = trades.filter((t) => t.status === "win");
  const losses = trades.filter((t) => t.status === "loss");
  const winRate = trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "—";

  const stats = [
    {
      label: "Net P&L",
      value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`,
      sub: `${trades.length} total trades`,
      positive: totalPnl >= 0,
      icon: TrendingUp,
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      sub: `${wins.length} wins / ${losses.length} losses`,
      positive: winRate >= 50,
      icon: Target,
    },
    {
      label: "Profit Factor",
      value: String(profitFactor),
      sub: "Avg win / avg loss",
      positive: Number(profitFactor) >= 1,
      icon: Zap,
    },
    {
      label: "Avg Loss",
      value: `$${avgLoss.toFixed(2)}`,
      sub: "Per losing trade",
      positive: false,
      icon: TrendingDown,
    },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{
          fontSize: "26px", fontWeight: "700",
          color: "var(--text-primary)", letterSpacing: "-0.5px",
        }}>
          Dashboard
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Welcome back. Here's how you're performing.
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px", marginBottom: "32px",
      }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Empty State */}
      {trades.length === 0 ? (
        <div style={{
          background: "var(--bg-card)", border: "1px dashed var(--border)",
          borderRadius: "16px", padding: "60px", textAlign: "center",
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "var(--accent-green-dim)", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <Upload size={20} color="#00e57a" />
          </div>
          <h3 style={{
            fontSize: "18px", fontWeight: "700",
            marginBottom: "8px", color: "var(--text-primary)",
          }}>
            No trades yet
          </h3>
          <p style={{
            color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px",
          }}>
            Import your Fidelity CSV or add a trade manually to get started.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => setActivePage("import")}
              style={{
                padding: "10px 20px", borderRadius: "8px", border: "none",
                background: "#00e57a", color: "#000", fontSize: "13px",
                fontWeight: "600", fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              }}
            >
              Import CSV
            </button>
            <button
              style={{
                padding: "10px 20px", borderRadius: "8px",
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-primary)", fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              }}
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        /* Trade History Table */
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "16px", overflow: "hidden",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              Trade History
            </h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{
                  borderBottom: "1px solid var(--border)",
                  background: "var(--bg-secondary)",
                }}>
                  {["Date", "Symbol", "Type", "Strike", "Expiry", "Qty", "Entry", "Exit", "P&L", "Status"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left",
                      color: "var(--text-muted)", fontWeight: "600", whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((trade: Trade) => (
                  <tr
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{trade.date}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700" }}>{trade.underlying}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600",
                        background: trade.optionType === "call" ? "rgba(77,159,255,0.15)" : "rgba(255,77,106,0.15)",
                        color: trade.optionType === "call" ? "#4d9fff" : "#ff4d6a",
                      }}>
                        {trade.optionType ? trade.optionType.toUpperCase() : trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                      {trade.strike ? `$${trade.strike}` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                      {trade.expiry || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{trade.quantity}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>${trade.entryPrice}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>${trade.exitPrice}</td>
                    <td style={{
                      padding: "12px 16px", fontWeight: "700",
                      color: trade.pnl >= 0 ? "#00e57a" : "#ff4d6a",
                    }}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600",
                        background: trade.status === "win" ? "var(--accent-green-dim)" : "var(--accent-red-dim)",
                        color: trade.status === "win" ? "#00e57a" : "#ff4d6a",
                      }}>
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}