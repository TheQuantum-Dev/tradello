"use client";
import ImportCSV from "../components/ImportCSV";
import { useApp } from "../context/AppContext";
import { Trade } from "../lib/types";

export default function ImportPage() {
  const { trades, setTrades, setActivePage } = useApp();

  const handleImport = async (imported: Trade[]) => {
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trades: imported }),
    });

    if (res.ok) {
      // Reload fresh from database so everything is in sync
      const updated = await fetch("/api/trades");
      const data = await updated.json();
      if (Array.isArray(data)) {
        setTrades(
          data.map((t: Trade) => ({
            ...t,
            tags: typeof t.tags === "string" ? JSON.parse(t.tags) : t.tags || [],
            imageUrls: typeof t.imageUrls === "string" ? JSON.parse(t.imageUrls) : t.imageUrls || [],
          }))
        );
      }
      setActivePage("dashboard");
    }
  };

  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{
          fontSize: "26px", fontWeight: "700",
          color: "var(--text-primary)", letterSpacing: "-0.5px",
        }}>
          Import Trades
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Upload your Fidelity CSV export to automatically import your trades.
        </p>
      </div>
      <ImportCSV onImport={handleImport} />
    </>
  );
}