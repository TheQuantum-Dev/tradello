"use client";
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  ReferenceLine, AreaChart, Area,
} from "recharts";
import { useApp } from "../context/AppContext";
import {
  TrendingUp, TrendingDown, Target, Zap, Award, Clock,
  BarChart2, Activity, AlertTriangle, Calendar,
} from "lucide-react";
import { Trade } from "../lib/types";

// ─── Math Utilities ──────────────────────────────────────────────────────────

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function normalizeDate(raw: string): string {
  if (raw.includes("/")) {
    const [mm, dd, yyyy] = raw.split("/");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return raw;
}

function getDailyPnl(trades: Trade[]): { date: string; pnl: number }[] {
  const map: Record<string, number> = {};
  for (const t of trades) {
    const d = normalizeDate(t.date);
    map[d] = (map[d] || 0) + t.pnl;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({ date, pnl }));
}

// Sharpe: (mean daily PnL / std dev daily PnL) * sqrt(252)
// Risk-free rate omitted — meaningless for retail traders at this scale
function sharpeRatio(dailyPnl: number[]): number {
  if (dailyPnl.length < 5) return 0;
  const mean = dailyPnl.reduce((s, v) => s + v, 0) / dailyPnl.length;
  const sd = stdDev(dailyPnl);
  if (sd === 0) return 0;
  return (mean / sd) * Math.sqrt(252);
}

// Sortino: same but denominator uses only downside deviation
function sortinoRatio(dailyPnl: number[]): number {
  if (dailyPnl.length < 5) return 0;
  const mean = dailyPnl.reduce((s, v) => s + v, 0) / dailyPnl.length;
  const negatives = dailyPnl.filter((v) => v < 0);
  if (negatives.length === 0) return mean > 0 ? 99 : 0;
  const downsideSd = stdDev(negatives);
  if (downsideSd === 0) return 0;
  return (mean / downsideSd) * Math.sqrt(252);
}

// Expectancy: (winRate * avgWin) - (lossRate * avgLoss)
// Result = expected $ per trade
function expectancy(wins: Trade[], losses: Trade[]): number {
  if (wins.length + losses.length === 0) return 0;
  const total = wins.length + losses.length;
  const wr = wins.length / total;
  const lr = losses.length / total;
  const avgW = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgL = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
  return wr * avgW - lr * avgL;
}

// Max drawdown: largest peak → trough drop in equity curve
// Returns { maxDd, maxDdPct, longestDdDays, currentDdDays }
function drawdownStats(sortedTrades: Trade[], initialBalance: number) {
  let equity = initialBalance;
  let peak = equity;
  let maxDd = 0;
  let maxDdPct = 0;
  let currentDdStart: string | null = null;
  let longestDdDays = 0;
  let inDrawdown = false;

  const ddCurve: { date: string; dd: number; equity: number }[] = [];

  for (const t of sortedTrades) {
    equity += t.pnl;
    if (equity > peak) {
      peak = equity;
      if (inDrawdown && currentDdStart) {
        const startMs = new Date(normalizeDate(currentDdStart)).getTime();
        const endMs = new Date(normalizeDate(t.date)).getTime();
        const days = Math.round((endMs - startMs) / 86400000);
        if (days > longestDdDays) longestDdDays = days;
      }
      inDrawdown = false;
      currentDdStart = null;
    } else {
      if (!inDrawdown) {
        inDrawdown = true;
        currentDdStart = t.date;
      }
    }
    const dd = peak > 0 ? ((equity - peak) / peak) * 100 : 0;
    const ddAbs = equity - peak;
    if (ddAbs < maxDd) {
      maxDd = ddAbs;
      maxDdPct = dd;
    }
    ddCurve.push({ date: normalizeDate(t.date), dd: parseFloat(dd.toFixed(2)), equity: parseFloat(equity.toFixed(2)) });
  }

  // Current open drawdown duration
  let currentDdDays = 0;
  if (inDrawdown && currentDdStart) {
    const startMs = new Date(normalizeDate(currentDdStart)).getTime();
    currentDdDays = Math.round((Date.now() - startMs) / 86400000);
  }

  return { maxDd, maxDdPct, longestDdDays, currentDdDays, ddCurve };
}

// Calmar: annualized return / |max drawdown %|
function calmarRatio(totalPnl: number, initialBalance: number, tradingDays: number, maxDdPct: number): number {
  if (initialBalance === 0 || tradingDays === 0 || maxDdPct === 0) return 0;
  const annualizedReturn = (totalPnl / initialBalance) * (252 / tradingDays) * 100;
  return annualizedReturn / Math.abs(maxDdPct);
}

// R-Multiples: PnL / (avg loss amount)
// Using avg loss as 1R proxy since most retail traders don't log explicit stop
function rMultiples(trades: Trade[], avgLoss: number): { r: number; win: boolean }[] {
  if (avgLoss === 0) return [];
  return trades.map((t) => ({
    r: parseFloat((t.pnl / avgLoss).toFixed(2)),
    win: t.status === "win",
  }));
}

// Rolling win rate over N trades
function rollingWinRate(trades: Trade[], window: number = 20): { trade: number; wr: number }[] {
  return trades
    .slice(window - 1)
    .map((_, i) => {
      const slice = trades.slice(i, i + window);
      const wins = slice.filter((t) => t.status === "win").length;
      return { trade: i + window, wr: Math.round((wins / window) * 100) };
    });
}

// Day of week performance
function byDayOfWeek(trades: Trade[]): { day: string; pnl: number; count: number; wr: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map: Record<number, { pnl: number; count: number; wins: number }> = {};
  for (const t of trades) {
    const d = new Date(normalizeDate(t.date) + "T12:00:00").getDay();
    if (!map[d]) map[d] = { pnl: 0, count: 0, wins: 0 };
    map[d].pnl += t.pnl;
    map[d].count += 1;
    if (t.status === "win") map[d].wins += 1;
  }
  return [1, 2, 3, 4, 5].map((d) => ({
    day: days[d],
    pnl: parseFloat((map[d]?.pnl || 0).toFixed(2)),
    count: map[d]?.count || 0,
    wr: map[d]?.count ? Math.round((map[d].wins / map[d].count) * 100) : 0,
  }));
}

// Consecutive win/loss streaks
function streaks(trades: Trade[]): { maxWinStreak: number; maxLossStreak: number; currentStreak: number; currentType: "win" | "loss" | null } {
  let maxW = 0, maxL = 0, cur = 0;
  let curType: "win" | "loss" | null = null;
  const sorted = [...trades].sort((a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date)));
  for (const t of sorted) {
    const isWin = t.status === "win";
    if (curType === null || (isWin && curType === "win") || (!isWin && curType === "loss")) {
      cur++;
      curType = isWin ? "win" : "loss";
    } else {
      if (curType === "win") maxW = Math.max(maxW, cur);
      else maxL = Math.max(maxL, cur);
      cur = 1;
      curType = isWin ? "win" : "loss";
    }
  }
  if (curType === "win") maxW = Math.max(maxW, cur);
  else if (curType === "loss") maxL = Math.max(maxL, cur);
  return { maxWinStreak: maxW, maxLossStreak: maxL, currentStreak: cur, currentType: curType };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const tooltipStyle = {
  background: "#16161f", border: "1px solid #2a2a3a",
  borderRadius: "8px", color: "#f0f0ff", fontSize: "12px",
};
const axisStyle = { fontSize: 10, fill: "#8888aa" };

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "2px" }}>{title}</h3>
        {subtitle && <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function MetricCard({
  label, value, sub, positive, neutral, icon: Icon,
}: {
  label: string; value: string; sub?: string;
  positive?: boolean; neutral?: boolean; icon: any;
}) {
  const color = neutral ? "var(--text-muted)" : positive ? "#00e57a" : "#ff4d6a";
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </span>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--accent-green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={13} color="var(--accent-green)" />
        </div>
      </div>
      <div style={{ fontSize: "22px", fontWeight: "800", color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "5px" }}>{sub}</div>}
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer",
        background: active ? "var(--accent-green-dim)" : "transparent",
        color: active ? "var(--accent-green)" : "var(--text-muted)",
        fontSize: "13px", fontWeight: active ? "700" : "400",
        fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { trades, activeAccount } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "risk" | "time" | "rmultiples">("overview");

  const stats = useMemo(() => {
    if (trades.length === 0) return null;

    const sorted = [...trades].sort((a, b) =>
      normalizeDate(a.date).localeCompare(normalizeDate(b.date))
    );

    const wins = trades.filter((t) => t.status === "win");
    const losses = trades.filter((t) => t.status === "loss");
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 99 : 0;

    // Equity curve with initial balance
    const initBal = activeAccount?.initialBalance ?? 0;
    let running = initBal;
    const equityCurve = sorted.map((t) => {
      running += t.pnl;
      return { date: normalizeDate(t.date), equity: parseFloat(running.toFixed(2)), pnl: t.pnl };
    });

    // Daily aggregation
    const daily = getDailyPnl(trades);
    const dailyPnlValues = daily.map((d) => d.pnl);
    const tradingDays = daily.length;

    // Risk ratios
    const sharpe = sharpeRatio(dailyPnlValues);
    const sortino = sortinoRatio(dailyPnlValues);
    const exp = expectancy(wins, losses);

    // Drawdown
    const { maxDd, maxDdPct, longestDdDays, currentDdDays, ddCurve } =
      drawdownStats(sorted, initBal);
    const calmar = calmarRatio(totalPnl, initBal, tradingDays, maxDdPct);

    // R-multiples histogram
    const rMs = rMultiples(trades, avgLoss);
    const rBuckets: Record<string, number> = {};
    for (const { r } of rMs) {
      const bucket = r <= -3 ? "≤-3R" : r >= 3 ? "≥3R" :
        r < 0 ? `${Math.floor(r)}R` : `+${Math.floor(r)}R`;
      rBuckets[bucket] = (rBuckets[bucket] || 0) + 1;
    }
    const rBucketOrder = ["≤-3R", "-3R", "-2R", "-1R", "+0R", "+1R", "+2R", "≥3R"];
    const rHistogram = rBucketOrder
      .filter((b) => rBuckets[b])
      .map((b) => ({ bucket: b, count: rBuckets[b], positive: b.startsWith("+") && b !== "+0R" }));

    const avgR = rMs.length > 0 ? rMs.reduce((s, r) => s + r.r, 0) / rMs.length : 0;

    // Rolling win rate
    const rolling = trades.length >= 20 ? rollingWinRate(sorted, 20) : [];

    // Day of week
    const dowData = byDayOfWeek(trades);

    // Streaks
    const streak = streaks(trades);

    // Best/Worst
    const bestTrade = trades.reduce((b, t) => t.pnl > b.pnl ? t : b, trades[0]);
    const worstTrade = trades.reduce((w, t) => t.pnl < w.pnl ? t : w, trades[0]);

    // Symbol breakdown
    const bySymbol: Record<string, { pnl: number; count: number; wins: number }> = {};
    for (const t of trades) {
      if (!bySymbol[t.underlying]) bySymbol[t.underlying] = { pnl: 0, count: 0, wins: 0 };
      bySymbol[t.underlying].pnl += t.pnl;
      bySymbol[t.underlying].count += 1;
      if (t.status === "win") bySymbol[t.underlying].wins += 1;
    }
    const symbolData = Object.entries(bySymbol)
      .map(([s, d]) => ({ symbol: s, pnl: parseFloat(d.pnl.toFixed(2)), count: d.count, wr: Math.round((d.wins / d.count) * 100) }))
      .sort((a, b) => b.pnl - a.pnl);

    // Tag breakdown
    const byTag: Record<string, { pnl: number; count: number; wins: number }> = {};
    for (const t of trades) {
      const tags = Array.isArray(t.tags) ? t.tags : [];
      for (const tag of tags as string[]) {
        if (!byTag[tag]) byTag[tag] = { pnl: 0, count: 0, wins: 0 };
        byTag[tag].pnl += t.pnl;
        byTag[tag].count += 1;
        if (t.status === "win") byTag[tag].wins += 1;
      }
    }
    const tagData = Object.entries(byTag)
      .map(([tag, d]) => ({ tag, pnl: parseFloat(d.pnl.toFixed(2)), count: d.count, wr: Math.round((d.wins / d.count) * 100) }))
      .sort((a, b) => b.pnl - a.pnl);

    return {
      wins, losses, totalPnl, winRate, avgWin, avgLoss, profitFactor,
      equityCurve, daily, sharpe, sortino, calmar, exp,
      maxDd, maxDdPct, longestDdDays, currentDdDays, ddCurve,
      rHistogram, avgR, rolling, dowData, streak,
      bestTrade, worstTrade, symbolData, tagData, tradingDays,
    };
  }, [trades, activeAccount]);

  if (trades.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--accent-green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart2 size={28} color="var(--accent-green)" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>No trades yet</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Import trades to unlock analytics</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "4px" }}>
          Analytics
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          {trades.length} trades · {stats.tradingDays} trading days
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-card)", borderRadius: "10px", padding: "4px", border: "1px solid var(--border)", width: "fit-content" }}>
        <Tab label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
        <Tab label="Risk Metrics" active={activeTab === "risk"} onClick={() => setActiveTab("risk")} />
        <Tab label="Time Analysis" active={activeTab === "time"} onClick={() => setActiveTab("time")} />
        <Tab label="R-Multiples" active={activeTab === "rmultiples"} onClick={() => setActiveTab("rmultiples")} />
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === "overview" && (
        <>
          {/* Top stat strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <MetricCard label="Total P&L" value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(2)}`} positive={stats.totalPnl >= 0} icon={TrendingUp} />
            <MetricCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} positive={stats.winRate >= 50} icon={Target} sub={`${stats.wins.length}W · ${stats.losses.length}L`} />
            <MetricCard label="Profit Factor" value={stats.profitFactor.toFixed(2)} positive={stats.profitFactor >= 1} icon={Zap} sub="Avg W / Avg L" />
            <MetricCard label="Expectancy" value={`${stats.exp >= 0 ? "+" : ""}$${stats.exp.toFixed(2)}`} positive={stats.exp >= 0} icon={Activity} sub="Per trade" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <MetricCard label="Avg Win" value={`+$${stats.avgWin.toFixed(2)}`} positive icon={Award} />
            <MetricCard label="Avg Loss" value={`-$${stats.avgLoss.toFixed(2)}`} positive={false} icon={TrendingDown} />
            <MetricCard label="Best Trade" value={`+$${stats.bestTrade.pnl.toFixed(2)}`} positive icon={Award} sub={stats.bestTrade.underlying} />
            <MetricCard label="Worst Trade" value={`$${stats.worstTrade.pnl.toFixed(2)}`} positive={false} icon={AlertTriangle} sub={stats.worstTrade.underlying} />
          </div>

          {/* Equity Curve */}
          <SectionCard title="Equity Curve" subtitle="Cumulative P&L including initial balance">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.equityCurve}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e57a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00e57a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v.toFixed(2)}`, "Equity"]} />
                <Area type="monotone" dataKey="equity" stroke="#00e57a" strokeWidth={2} fill="url(#equityGrad)" dot={false} activeDot={{ r: 4, fill: "#00e57a" }} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Symbol + Tag breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "0" }}>
            <SectionCard title="P&L by Symbol">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.symbolData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="symbol" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v.toFixed(2)}`, "P&L"]} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {stats.symbolData.map((e) => <Cell key={e.symbol} fill={e.pnl >= 0 ? "#00e57a" : "#ff4d6a"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            {stats.tagData.length > 0 ? (
              <SectionCard title="P&L by Tag">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.tagData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                    <XAxis dataKey="tag" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v.toFixed(2)}`, "P&L"]} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {stats.tagData.map((e) => <Cell key={e.tag} fill={e.pnl >= 0 ? "#00e57a" : "#ff4d6a"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            ) : (
              <SectionCard title="Win / Loss Breakdown">
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={[{ name: "Wins", value: stats.wins.length }, { name: "Losses", value: stats.losses.length }]}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        <Cell fill="#00e57a" />
                        <Cell fill="#ff4d6a" />
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#8888aa", marginBottom: "4px" }}>Wins</div>
                      <div style={{ fontSize: "26px", fontWeight: "800", color: "#00e57a" }}>{stats.wins.length}</div>
                      <div style={{ fontSize: "11px", color: "#8888aa" }}>Avg +${stats.avgWin.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#8888aa", marginBottom: "4px" }}>Losses</div>
                      <div style={{ fontSize: "26px", fontWeight: "800", color: "#ff4d6a" }}>{stats.losses.length}</div>
                      <div style={{ fontSize: "11px", color: "#8888aa" }}>Avg -${stats.avgLoss.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Streak cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "20px" }}>
            <MetricCard label="Max Win Streak" value={`${stats.streak.maxWinStreak}`} positive neutral={stats.streak.maxWinStreak === 0} icon={TrendingUp} sub="Consecutive wins" />
            <MetricCard label="Max Loss Streak" value={`${stats.streak.maxLossStreak}`} positive={stats.streak.maxLossStreak <= 2} icon={TrendingDown} sub="Consecutive losses" />
            <MetricCard
              label="Current Streak"
              value={`${stats.streak.currentStreak}${stats.streak.currentType === "win" ? "W" : stats.streak.currentType === "loss" ? "L" : ""}`}
              positive={stats.streak.currentType === "win"}
              neutral={stats.streak.currentType === null}
              icon={Activity}
              sub={stats.streak.currentType === "win" ? "Winning" : stats.streak.currentType === "loss" ? "Losing" : "—"}
            />
            <MetricCard label="Trades / Day" value={(trades.length / Math.max(stats.tradingDays, 1)).toFixed(1)} neutral icon={Clock} sub="Avg per trading day" />
          </div>
        </>
      )}

      {/* ── TAB: RISK METRICS ── */}
      {activeTab === "risk" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <MetricCard
              label="Sharpe Ratio"
              value={stats.sharpe.toFixed(2)}
              positive={stats.sharpe > 1}
              neutral={stats.sharpe === 0}
              icon={Activity}
              sub={stats.sharpe > 2 ? "Excellent" : stats.sharpe > 1 ? "Good" : stats.sharpe > 0 ? "Below avg" : "N/A (<5 days)"}
            />
            <MetricCard
              label="Sortino Ratio"
              value={stats.sortino.toFixed(2)}
              positive={stats.sortino > 1}
              neutral={stats.sortino === 0}
              icon={TrendingUp}
              sub={stats.sortino > 2 ? "Strong downside protection" : stats.sortino > 1 ? "Acceptable" : "Review loss management"}
            />
            <MetricCard
              label="Calmar Ratio"
              value={stats.calmar === 0 ? "N/A" : stats.calmar.toFixed(2)}
              positive={stats.calmar > 1}
              neutral={stats.calmar === 0}
              icon={Zap}
              sub="Annualized return / Max DD"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <MetricCard
              label="Max Drawdown"
              value={`$${Math.abs(stats.maxDd).toFixed(2)}`}
              positive={false}
              neutral={stats.maxDd === 0}
              icon={TrendingDown}
              sub={stats.maxDdPct !== 0 ? `${stats.maxDdPct.toFixed(2)}% from peak` : "No drawdown"}
            />
            <MetricCard
              label="Max DD Duration"
              value={stats.longestDdDays === 0 ? "0 days" : `${stats.longestDdDays}d`}
              positive={stats.longestDdDays < 7}
              neutral={stats.longestDdDays === 0}
              icon={Calendar}
              sub="Longest peak → recovery"
            />
            <MetricCard
              label="Current DD Duration"
              value={stats.currentDdDays === 0 ? "None" : `${stats.currentDdDays}d`}
              positive={stats.currentDdDays === 0}
              icon={AlertTriangle}
              sub={stats.currentDdDays > 0 ? "Still in drawdown" : "At or above high water mark"}
            />
          </div>

          {/* Drawdown curve */}
          <SectionCard
            title="Drawdown Over Time"
            subtitle="% deviation from the rolling equity high-water mark. Zero = new all-time high."
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.ddCurve}>
                <defs>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d6a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff4d6a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v.toFixed(2)}%`, "Drawdown"]} />
                <ReferenceLine y={0} stroke="#00e57a" strokeDasharray="4 4" strokeWidth={1} />
                <Area type="monotone" dataKey="dd" stroke="#ff4d6a" strokeWidth={2} fill="url(#ddGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Rolling 20-trade win rate */}
          {stats.rolling.length > 0 && (
            <SectionCard
              title="Rolling 20-Trade Win Rate"
              subtitle="Win rate computed over a sliding window of the last 20 trades. Reveals consistency trends."
            >
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.rolling}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="trade" tick={axisStyle} axisLine={false} tickLine={false} label={{ value: "Trade #", position: "insideBottom", offset: -2, fill: "#8888aa", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Win Rate"]} />
                  <ReferenceLine y={50} stroke="#8888aa" strokeDasharray="4 4" strokeWidth={1} />
                  <Line type="monotone" dataKey="wr" stroke="#4d9fff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
          )}

          {/* Metric glossary */}
          <SectionCard title="Metric Definitions">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { name: "Sharpe Ratio", formula: "(Mean Daily P&L / Std Dev Daily P&L) × √252", what: "Risk-adjusted return per unit of total volatility. >1 = good, >2 = excellent." },
                { name: "Sortino Ratio", formula: "(Mean Daily P&L / Downside Std Dev) × √252", what: "Like Sharpe but only penalizes downside volatility. More relevant for traders." },
                { name: "Calmar Ratio", formula: "Annualized Return % / |Max Drawdown %|", what: "How much return you earn per unit of max drawdown risk. >1 = acceptable." },
                { name: "Expectancy", formula: "(Win% × Avg Win) − (Loss% × Avg Loss)", what: "Expected dollar profit per trade. The single most important metric to be positive." },
              ].map(({ name, formula, what }) => (
                <div key={name} style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>{name}</div>
                  <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#4d9fff", background: "rgba(77,159,255,0.08)", padding: "4px 8px", borderRadius: "4px", marginBottom: "8px" }}>{formula}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{what}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

      {/* ── TAB: TIME ANALYSIS ── */}
      {activeTab === "time" && (
        <>
          <SectionCard
            title="P&L by Day of Week"
            subtitle="Which days are most profitable — useful for detecting session-specific patterns."
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
              {stats.dowData.map(({ day, pnl, count, wr }) => (
                <div key={day} style={{
                  background: "var(--bg-secondary)", borderRadius: "12px", padding: "16px",
                  borderTop: `3px solid ${pnl >= 0 ? "#00e57a" : "#ff4d6a"}`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>{day}</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: pnl >= 0 ? "#00e57a" : "#ff4d6a", marginBottom: "4px" }}>
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{count} trades · {wr}% WR</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.dowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v.toFixed(2)}`, "Total P&L"]} />
                <ReferenceLine y={0} stroke="#8888aa" strokeWidth={1} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {stats.dowData.map((e) => <Cell key={e.day} fill={e.pnl >= 0 ? "#00e57a" : "#ff4d6a"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Daily P&L Distribution" subtitle="Each bar = one trading day. Reveals consistency vs spike dependency.">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v.toFixed(2)}`, "Daily P&L"]} />
                <ReferenceLine y={0} stroke="#8888aa" strokeWidth={1} />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {stats.daily.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? "#00e57a" : "#ff4d6a"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {stats.tagData.length > 0 && (
            <SectionCard title="Win Rate by Tag" subtitle="Which setups convert at the highest rate.">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {stats.tagData.map(({ tag, wr, count, pnl }) => (
                  <div key={tag} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "80px", fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", flexShrink: 0 }}>{tag}</div>
                    <div style={{ flex: 1, background: "var(--bg-secondary)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${wr}%`, height: "100%", background: wr >= 60 ? "#00e57a" : wr >= 40 ? "#4d9fff" : "#ff4d6a", borderRadius: "4px", transition: "width 0.3s ease" }} />
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: wr >= 50 ? "#00e57a" : "#ff4d6a", width: "36px", textAlign: "right" }}>{wr}%</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", width: "70px", textAlign: "right" }}>{count} trades</div>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: pnl >= 0 ? "#00e57a" : "#ff4d6a", width: "70px", textAlign: "right" }}>
                      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {/* ── TAB: R-MULTIPLES ── */}
      {activeTab === "rmultiples" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <MetricCard
              label="Avg R-Multiple"
              value={stats.avgR >= 0 ? `+${stats.avgR.toFixed(2)}R` : `${stats.avgR.toFixed(2)}R`}
              positive={stats.avgR > 0}
              icon={Activity}
              sub="Mean outcome in R-units"
            />
            <MetricCard
              label="1R = Avg Loss"
              value={`$${stats.avgLoss.toFixed(2)}`}
              neutral
              icon={Target}
              sub="Risk proxy (avg loss amount)"
            />
            <MetricCard
              label="Expectancy"
              value={`${stats.exp >= 0 ? "+" : ""}${(stats.avgLoss > 0 ? stats.exp / stats.avgLoss : 0).toFixed(2)}R`}
              positive={stats.exp >= 0}
              icon={Zap}
              sub="Expected R per trade"
            />
          </div>

          {stats.rHistogram.length > 0 ? (
            <SectionCard
              title="R-Multiple Distribution"
              subtitle="Distribution of trade outcomes in R-units. 1R = your average loss. Positive skew = good system."
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.rHistogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="bucket" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} label={{ value: "# Trades", angle: -90, position: "insideLeft", fill: "#8888aa", fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v, "Trades"]} />
                  <ReferenceLine x="+0R" stroke="#8888aa" strokeDasharray="4 4" />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.rHistogram.map((e) => <Cell key={e.bucket} fill={e.positive ? "#00e57a" : "#ff4d6a"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ marginTop: "20px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "10px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                  <strong style={{ color: "var(--text-primary)" }}>How to read this:</strong> Each bucket represents trade outcomes in multiples of your average loss (1R).
                  A positive expectancy system needs more weight in +R buckets than -R buckets, OR fewer but larger winners than losers.
                  The ideal shape: tall bars at +1R/+2R, short bars at -1R.
                  If your biggest bar is -1R, you have a sizing or stop management problem.
                </p>
              </div>
            </SectionCard>
          ) : (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
              R-multiple distribution requires at least one losing trade to compute 1R.
            </div>
          )}

          {/* Symbol R-multiple breakdown */}
          {stats.symbolData.length > 0 && (
            <SectionCard title="Symbol Breakdown" subtitle="P&L, trade count, and win rate per underlying.">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {stats.symbolData.map(({ symbol, pnl, count, wr }) => (
                  <div key={symbol} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", background: "var(--bg-secondary)",
                    borderRadius: "10px", border: "1px solid var(--border)",
                  }}>
                    <div style={{ width: "60px", fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>{symbol}</div>
                    <div style={{ flex: 1, background: "var(--bg-card)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                      <div style={{ width: `${wr}%`, height: "100%", background: wr >= 50 ? "#00e57a" : "#ff4d6a", borderRadius: "4px" }} />
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", width: "60px", textAlign: "center" }}>{count} trades</div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: wr >= 50 ? "#00e57a" : "#ff4d6a", width: "44px", textAlign: "center" }}>{wr}% WR</div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: pnl >= 0 ? "#00e57a" : "#ff4d6a", width: "80px", textAlign: "right" }}>
                      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}