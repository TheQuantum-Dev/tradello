"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, X } from "lucide-react";
import { Trade } from "../lib/parseFidelityCSV";

interface Props {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PnLCalendar({ trades, onSelectTrade }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Group trades by date
  const tradesByDate: Record<string, Trade[]> = {};
  for (const trade of trades) {
    const date = trade.date;
    if (!tradesByDate[date]) tradesByDate[date] = [];
    tradesByDate[date].push(trade);
  }

  // Daily P&L by date
  const pnlByDate: Record<string, number> = {};
  for (const date in tradesByDate) {
    pnlByDate[date] = tradesByDate[date].reduce((sum, t) => sum + t.pnl, 0);
  }

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const formatDate = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${mm}/${dd}/${currentYear}`;
  };

  // Monthly stats
  const monthTrades = trades.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthPnl = monthTrades.reduce((sum, t) => sum + t.pnl, 0);
  const monthWins = monthTrades.filter((t) => t.status === "win").length;
  const monthLosses = monthTrades.filter((t) => t.status === "loss").length;

  const selectedTrades = selectedDay ? (tradesByDate[selectedDay] || []) : [];

  return (
    <div>
      {/* Month Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            Calendar
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Your trading performance at a glance
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Monthly Stats */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "10px", padding: "10px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Month P&L</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: monthPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                {monthPnl >= 0 ? "+" : ""}${monthPnl.toFixed(2)}
              </div>
            </div>
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "10px", padding: "10px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Days</div>
              <div style={{ fontSize: "14px", fontWeight: "700" }}>
                <span style={{ color: "var(--accent-green)" }}>{monthWins}W</span>
                <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>/</span>
                <span style={{ color: "var(--accent-red)" }}>{monthLosses}L</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={prevMonth} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "8px", padding: "8px", cursor: "pointer", color: "var(--text-primary)",
              display: "flex", alignItems: "center",
            }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", minWidth: "160px", textAlign: "center" }}>
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button onClick={nextMonth} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "8px", padding: "8px", cursor: "pointer", color: "var(--text-primary)",
              display: "flex", alignItems: "center",
            }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "16px", overflow: "hidden",
      }}>
        {/* Day Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
          {DAYS.map((day) => (
            <div key={day} style={{
              padding: "12px", textAlign: "center",
              fontSize: "11px", fontWeight: "600", color: "var(--text-muted)",
              letterSpacing: "0.5px",
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {/* Empty cells for first week */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              minHeight: "90px", borderRight: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-primary)",
            }} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(day);
            const dayTrades = tradesByDate[dateStr] || [];
            const dayPnl = pnlByDate[dateStr];
            const hasTrades = dayTrades.length > 0;
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const isSelected = selectedDay === dateStr;
            const isWin = dayPnl > 0;
            const isLoss = dayPnl < 0;

            return (
              <div
                key={day}
                onClick={() => hasTrades && setSelectedDay(isSelected ? null : dateStr)}
                style={{
                  minHeight: "90px",
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  padding: "10px",
                  cursor: hasTrades ? "pointer" : "default",
                  background: isSelected
                    ? "var(--bg-hover)"
                    : hasTrades
                      ? isWin ? "rgba(0,229,122,0.05)" : "rgba(255,77,106,0.05)"
                      : "transparent",
                  transition: "background 0.15s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (hasTrades && !isSelected)
                    e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  if (hasTrades && !isSelected)
                    e.currentTarget.style.background = isWin
                      ? "rgba(0,229,122,0.05)"
                      : "rgba(255,77,106,0.05)";
                }}
              >
                {/* Day number */}
                <div style={{
                  fontSize: "13px", fontWeight: isToday ? "800" : "500",
                  color: isToday ? "var(--accent-green)" : "var(--text-secondary)",
                  marginBottom: "6px",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  {isToday && (
                    <span style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: "var(--accent-green)", color: "#000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "800",
                    }}>
                      {day}
                    </span>
                  )}
                  {!isToday && day}
                </div>

                {/* P&L */}
                {hasTrades && (
                  <div>
                    <div style={{
                      fontSize: "14px", fontWeight: "700",
                      color: isWin ? "var(--accent-green)" : "var(--accent-red)",
                      marginBottom: "4px",
                    }}>
                      {isWin ? "+" : ""}${dayPnl.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {dayTrades.length} trade{dayTrades.length > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Panel */}
      {selectedDay && selectedTrades.length > 0 && (
        <>
          <div
            onClick={() => setSelectedDay(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
          />
          <div style={{
            position: "fixed", top: 0, right: 0, width: "480px", height: "100vh",
            background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)",
            zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {/* Panel Header */}
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)" }}>
                  {new Date(selectedDay).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {selectedTrades.length} trade{selectedTrades.length > 1 ? "s" : ""}
                  </span>
                  <span style={{
                    fontSize: "13px", fontWeight: "700",
                    color: selectedTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                  }}>
                    {selectedTrades.reduce((s, t) => s + t.pnl, 0) >= 0 ? "+" : ""}
                    ${selectedTrades.reduce((s, t) => s + t.pnl, 0).toFixed(2)} day P&L
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Trades List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {selectedTrades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={() => { setSelectedDay(null); onSelectTrade(trade); }}
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "12px", padding: "16px", marginBottom: "12px",
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent-green)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  {/* Trade Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>
                        {trade.underlying}
                      </span>
                      <span style={{
                        padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "600",
                        background: trade.optionType === "call" ? "rgba(77,159,255,0.15)" : "rgba(255,77,106,0.15)",
                        color: trade.optionType === "call" ? "var(--accent-blue)" : "var(--accent-red)",
                      }}>
                        {trade.optionType ? `${trade.optionType.toUpperCase()} $${trade.strike}` : trade.type.toUpperCase()}
                      </span>
                    </div>
                    <span style={{
                      fontSize: "15px", fontWeight: "700",
                      color: trade.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                    }}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                    </span>
                  </div>

                  {/* Trade Details */}
                  <div style={{ display: "flex", gap: "16px", marginBottom: trade.journalEntry ? "10px" : "0" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Entry: ${trade.entryPrice}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Exit: ${trade.exitPrice}</span>
                    {trade.rr && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>R:R {trade.rr}</span>}
                    {trade.entryTime && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{trade.entryTime}</span>}
                  </div>

                  {/* Tags */}
                  {trade.tags && trade.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                      {trade.tags.map((tag) => (
                        <span key={tag} style={{
                          padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "600",
                          background: "var(--accent-green-dim)", color: "var(--accent-green)",
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Journal Preview */}
                  {trade.journalEntry && (
                    <p style={{
                      fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5",
                      borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "8px",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {trade.journalEntry}
                    </p>
                  )}

                  {/* Images Preview */}
                  {trade.imageUrls && (typeof trade.imageUrls === "string" ? JSON.parse(trade.imageUrls) : trade.imageUrls).length > 0 && (
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                      {(typeof trade.imageUrls === "string" ? JSON.parse(trade.imageUrls) : trade.imageUrls).slice(0, 3).map((url: string) => (
                        <img key={url} src={url} style={{ width: "60px", height: "45px", borderRadius: "4px", objectFit: "cover" }} />
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                    Click to open full journal →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}