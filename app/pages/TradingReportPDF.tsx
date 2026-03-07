"use client";
import {
  Document, Page, Text, View, StyleSheet,
  Svg, Rect, Polyline, Circle, Defs,
  LinearGradient, Stop,
} from "@react-pdf/renderer";
import { Trade, Account } from "../lib/types";

// ─── Logo built entirely from react-pdf SVG primitives ───────────────────────
// Mirrors tradello-logo-light.svg exactly: light bg, dark T, green→blue line
function TradelloLogoPDF() {
  return (
    <Svg width="135" height="33" viewBox="0 0 180 44">
      <Defs>
        <LinearGradient id="line-grad" x1="7" y1="34" x2="37" y2="11">
          <Stop offset="0%" stopColor="#00c464" />
          <Stop offset="100%" stopColor="#2563eb" />
        </LinearGradient>
      </Defs>

      {/* Icon box — light background */}
      <Rect x="0" y="0" width="44" height="44" rx="10" fill="#e8e8f8" />

      {/* Chart line — behind the T */}
      <Polyline
        points="7,34 15,27 23,30 37,11"
        fill="none"
        stroke="url(#line-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="37" cy="11" r="2.8" fill="#2563eb" />

      {/* T crossbar — on top */}
      <Rect x="9" y="13" width="26" height="4.5" rx="2.25" fill="#0a0a1a" />
      {/* T stem — on top */}
      <Rect x="19.5" y="13" width="5" height="20" rx="2.5" fill="#0a0a1a" />
    </Svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a2e",
    backgroundColor: "#ffffff",
    padding: 48,
  },

  // Cover
  coverHeader: {
    marginBottom: 48,
    borderBottom: "2px solid #00c464",
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coverBrand: {
    flexDirection: "column",
    gap: 4,
  },
  brandWordmark: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a1a",
    letterSpacing: -1,
  },
  brandSub: {
    fontSize: 11,
    color: "#666688",
  },
  coverMeta: {
    marginTop: 32,
  },
  coverMetaRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  coverMetaLabel: {
    fontSize: 10,
    color: "#888",
    width: 120,
  },
  coverMetaValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
  },

  // Section headings
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 12,
    marginTop: 24,
    paddingBottom: 6,
    borderBottom: "1px solid #e0e0f0",
  },

  // Stat cards
  statRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    border: "1px solid #e0e0f0",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#f8f8fd",
  },
  statLabel: {
    fontSize: 8,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValueGreen: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#00b85e",
    marginBottom: 2,
  },
  statValueRed: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#cc3355",
    marginBottom: 2,
  },
  statSub: {
    fontSize: 8,
    color: "#aaa",
  },

  // Daily breakdown
  dayRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottom: "1px solid #f0f0f8",
    alignItems: "center",
  },
  dayDate: {
    width: 90,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
  },
  dayTrades: {
    flex: 1,
    fontSize: 9,
    color: "#888",
  },
  dayPnl: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    width: 80,
  },

  // Trade history table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f8",
    padding: "8 6",
    borderRadius: 4,
    marginBottom: 2,
  },
  colHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    padding: "7 6",
    borderBottom: "1px solid #f4f4fc",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "7 6",
    backgroundColor: "#fafaff",
    borderBottom: "1px solid #f4f4fc",
  },
  colDate:   { width: 62, fontSize: 8, color: "#555" },
  colSymbol: { width: 48, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1a1a2e" },
  colType:   { width: 36, fontSize: 8, color: "#555" },
  colStrike: { width: 42, fontSize: 8, color: "#555" },
  colExpiry: { width: 52, fontSize: 8, color: "#555" },
  colQty:    { width: 28, fontSize: 8, color: "#555" },
  colEntry:  { width: 40, fontSize: 8, color: "#555" },
  colExit:   { width: 40, fontSize: 8, color: "#555" },
  colPnl:    { flex: 1,   fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "right" },
  colStatus: { width: 36, fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "right" },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #e0e0f0",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#aaa",
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `${n >= 0 ? "+" : ""}$${Math.abs(n).toFixed(2)}`;
}

interface Props {
  trades: Trade[];
  account: Account | null;
  dateRange?: { from: string; to: string };
}

// ─── Document ─────────────────────────────────────────────────────────────────
export default function TradingReportPDF({ trades, account, dateRange }: Props) {
  const wins   = trades.filter((t) => t.status === "win");
  const losses = trades.filter((t) => t.status === "loss");
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate  = trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0;
  const avgWin   = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss  = losses.length > 0
    ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "—";

  const byDay: Record<string, Trade[]> = {};
  for (const t of trades) {
    if (!byDay[t.date]) byDay[t.date] = [];
    byDay[t.date].push(t);
  }
  const days = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const fromLabel = dateRange?.from || (trades.length > 0
    ? [...trades].sort((a, b) => a.date.localeCompare(b.date))[0].date : "—");
  const toLabel = dateRange?.to || (trades.length > 0
    ? [...trades].sort((a, b) => b.date.localeCompare(a.date))[0].date : "—");

  return (
    <Document>
      {/* ── Page 1: Summary ── */}
      <Page size="A4" style={styles.page}>

        {/* Header with logo */}
        <View style={styles.coverHeader}>
          <View style={styles.coverBrand}>
            <TradelloLogoPDF />
            <Text style={styles.brandSub}>Trading Performance Report</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.coverMeta}>
          {account && (
            <>
              <View style={styles.coverMetaRow}>
                <Text style={styles.coverMetaLabel}>Account</Text>
                <Text style={styles.coverMetaValue}>{account.name}</Text>
              </View>
              <View style={styles.coverMetaRow}>
                <Text style={styles.coverMetaLabel}>Broker</Text>
                <Text style={styles.coverMetaValue}>{account.broker}</Text>
              </View>
            </>
          )}
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>Period</Text>
            <Text style={styles.coverMetaValue}>{fromLabel} — {toLabel}</Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>Generated</Text>
            <Text style={styles.coverMetaValue}>{generatedDate}</Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>Total Trades</Text>
            <Text style={styles.coverMetaValue}>{trades.length}</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Performance Summary</Text>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Net P&L</Text>
            <Text style={totalPnl >= 0 ? styles.statValueGreen : styles.statValueRed}>
              {fmt(totalPnl)}
            </Text>
            <Text style={styles.statSub}>{trades.length} trades</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Win Rate</Text>
            <Text style={winRate >= 50 ? styles.statValueGreen : styles.statValueRed}>
              {winRate}%
            </Text>
            <Text style={styles.statSub}>{wins.length}W / {losses.length}L</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Profit Factor</Text>
            <Text style={Number(profitFactor) >= 1 ? styles.statValueGreen : styles.statValueRed}>
              {profitFactor}
            </Text>
            <Text style={styles.statSub}>Avg win / avg loss</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Win</Text>
            <Text style={styles.statValueGreen}>${avgWin.toFixed(2)}</Text>
            <Text style={styles.statSub}>Per winning trade</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Loss</Text>
            <Text style={styles.statValueRed}>${avgLoss.toFixed(2)}</Text>
            <Text style={styles.statSub}>Per losing trade</Text>
          </View>
        </View>

        {/* Daily Breakdown */}
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        {days.map(([date, dayTrades]) => {
          const dayPnl  = dayTrades.reduce((s, t) => s + t.pnl, 0);
          const dayWins = dayTrades.filter((t) => t.status === "win").length;
          return (
            <View key={date} style={styles.dayRow}>
              <Text style={styles.dayDate}>{date}</Text>
              <Text style={styles.dayTrades}>
                {dayTrades.length} trade{dayTrades.length !== 1 ? "s" : ""} · {dayWins}W / {dayTrades.length - dayWins}L
              </Text>
              <Text style={[styles.dayPnl, { color: dayPnl >= 0 ? "#00b85e" : "#cc3355" }]}>
                {fmt(dayPnl)}
              </Text>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Tradello — Trading Performance Report</Text>
          <Text style={styles.footerText}>{generatedDate}</Text>
        </View>
      </Page>

      {/* ── Page 2+: Trade History ── */}
      <Page size="A4" style={{ ...styles.page, paddingTop: 36 }}>
        <Text style={styles.sectionTitle}>Trade History</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.colDate,   styles.colHeaderText]}>Date</Text>
          <Text style={[styles.colSymbol, styles.colHeaderText]}>Symbol</Text>
          <Text style={[styles.colType,   styles.colHeaderText]}>Type</Text>
          <Text style={[styles.colStrike, styles.colHeaderText]}>Strike</Text>
          <Text style={[styles.colExpiry, styles.colHeaderText]}>Expiry</Text>
          <Text style={[styles.colQty,    styles.colHeaderText]}>Qty</Text>
          <Text style={[styles.colEntry,  styles.colHeaderText]}>Entry</Text>
          <Text style={[styles.colExit,   styles.colHeaderText]}>Exit</Text>
          <Text style={[styles.colPnl,    styles.colHeaderText]}>P&L</Text>
          <Text style={[styles.colStatus, styles.colHeaderText]}>Result</Text>
        </View>

        {trades.map((t, i) => (
          <View
            key={t.id}
            style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            wrap={false}
          >
            <Text style={styles.colDate}>{t.date}</Text>
            <Text style={styles.colSymbol}>{t.underlying}</Text>
            <Text style={styles.colType}>
              {t.optionType ? t.optionType.toUpperCase() : t.type.toUpperCase()}
            </Text>
            <Text style={styles.colStrike}>{t.strike ? `$${t.strike}` : "—"}</Text>
            <Text style={styles.colExpiry}>{t.expiry || "—"}</Text>
            <Text style={styles.colQty}>{t.quantity}</Text>
            <Text style={styles.colEntry}>${t.entryPrice}</Text>
            <Text style={styles.colExit}>${t.exitPrice}</Text>
            <Text style={[styles.colPnl, { color: t.pnl >= 0 ? "#00b85e" : "#cc3355" }]}>
              {fmt(t.pnl)}
            </Text>
            <Text style={[styles.colStatus, { color: t.status === "win" ? "#00b85e" : "#cc3355" }]}>
              {t.status.toUpperCase()}
            </Text>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Tradello — Trading Performance Report</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </View>
      </Page>
    </Document>
  );
}
