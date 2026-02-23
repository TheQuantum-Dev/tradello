export interface Trade {
  id: string;
  date: string;
  symbol: string;
  underlying: string;
  type: "stock" | "option" | "future";
  direction: "long" | "short";
  optionType?: "call" | "put";
  strike?: number;
  expiry?: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  commission: number;
  fees: number;
  pnl: number;
  status: "win" | "loss" | "breakeven";
  // User fills these in after import
  entryTime?: string;
  exitTime?: string;
  rr?: string;
  tags?: string[];
  journalEntry?: string;
  link?: string;
}

interface RawRow {
  date: string;
  action: string;
  symbol: string;
  description: string;
  price: number;
  quantity: number;
  commission: number;
  fees: number;
  amount: number;
}

function parseRawRows(csvText: string): RawRow[] {
  const lines = csvText.split("\n").map((l) => l.trim());
  const headerIndex = lines.findIndex((l) =>
    l.startsWith("Run Date,Action,Symbol")
  );
  if (headerIndex === -1) throw new Error("Invalid Fidelity CSV format");

  const rows: RawRow[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith('"The data')) break;

    // Parse CSV line respecting quoted fields
    const cols: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '"') {
        inQuotes = !inQuotes;
      } else if (line[c] === "," && !inQuotes) {
        cols.push(current.trim());
        current = "";
      } else {
        current += line[c];
      }
    }
    cols.push(current.trim());

    if (cols.length < 11) continue;

    const action = cols[1];
    // Only process buy/sell trade actions
    if (!action.includes("YOU BOUGHT") && !action.includes("YOU SOLD")) continue;

    rows.push({
      date: cols[0],
      action: cols[1],
      symbol: cols[2].trim(),
      description: cols[3],
      price: parseFloat(cols[5]) || 0,
      quantity: Math.abs(parseFloat(cols[6]) || 0),
      commission: Math.abs(parseFloat(cols[7]) || 0),
      fees: Math.abs(parseFloat(cols[8]) || 0),
      amount: parseFloat(cols[10]) || 0,
    });
  }

  return rows;
}

function detectType(symbol: string): "stock" | "option" | "future" {
  if (symbol.startsWith("-")) return "option";
  if (symbol.startsWith("/")) return "future";
  return "stock";
}

function parseOptionDetails(symbol: string, description: string) {
  // e.g. -SPXW260220C6955
  const match = symbol.match(/([A-Z]+)(\d{6})([CP])(\d+(\.\d+)?)/);
  if (!match) return {};

  const optionType = match[3] === "C" ? "call" : "put";
  const strike = parseFloat(match[4]);
  const dateStr = match[2]; // YYMMDD
  const expiry = `20${dateStr.slice(0, 2)}-${dateStr.slice(2, 4)}-${dateStr.slice(4, 6)}`;
  const underlying = match[1].replace(/^-/, "");

  return { optionType, strike, expiry, underlying };
}

export function parseFidelityCSV(csvText: string): Trade[] {
  const rows = parseRawRows(csvText);
  const trades: Trade[] = [];

  // Group by symbol to match opens and closes
  const grouped: Record<string, RawRow[]> = {};
  for (const row of rows) {
    if (!grouped[row.symbol]) grouped[row.symbol] = [];
    grouped[row.symbol].push(row);
  }

  for (const symbol in grouped) {
    const group = grouped[symbol];
    const buys = group.filter((r) => r.action.includes("YOU BOUGHT"));
    const sells = group.filter((r) => r.action.includes("YOU SOLD"));

    // Match buys and sells as pairs
    const pairs = Math.min(buys.length, sells.length);
    for (let i = 0; i < pairs; i++) {
      const buy = buys[i];
      const sell = sells[i];

      const type = detectType(symbol);
      const multiplier = type === "option" ? 100 : 1;

      const entryPrice = buy.price;
      const exitPrice = sell.price;
      const qty = buy.quantity;
      const totalCommission = buy.commission + sell.commission;
      const totalFees = buy.fees + sell.fees;

      const grossPnl = (exitPrice - entryPrice) * qty * multiplier;
      const pnl = parseFloat((grossPnl - totalCommission - totalFees).toFixed(2));

      const optionDetails = type === "option"
        ? parseOptionDetails(symbol, buy.description)
        : {};

      const underlying =
        type === "option"
          ? (optionDetails.underlying || symbol.replace(/^-/, ""))
          : symbol;

      const trade: Trade = {
        id: `${symbol}-${buy.date}-${i}`,
        date: buy.date,
        symbol: symbol.replace(/^-/, ""),
        underlying,
        type,
        direction: "long",
        quantity: qty,
        entryPrice,
        exitPrice,
        commission: totalCommission,
        fees: totalFees,
        pnl,
        status: pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven",
        ...(type === "option" && {
          optionType: optionDetails.optionType as "call" | "put",
          strike: optionDetails.strike,
          expiry: optionDetails.expiry,
        }),
      };

      trades.push(trade);
    }
  }

  // Sort by date newest first
  return trades.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}