"use client";
import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, X } from "lucide-react";
import { parseFidelityCSV, Trade } from "../lib/parseFidelityCSV";

interface Props {
  onImport: (trades: Trade[]) => void;
}

export default function ImportCSV({ onImport }: Props) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<Trade[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setStatus("error");
      setMessage("Please upload a CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const trades = parseFidelityCSV(text);
        if (trades.length === 0) {
          setStatus("error");
          setMessage("No trades found in this CSV. Make sure it's a Fidelity trade history export.");
          return;
        }
        setPreview(trades);
        setStatus("success");
        setMessage(`Found ${trades.length} trade${trades.length > 1 ? "s" : ""}. Ready to import!`);
      } catch (err) {
        setStatus("error");
        setMessage("Could not parse this file. Make sure it's a Fidelity CSV export.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirmImport = () => {
    onImport(preview);
    setStatus("idle");
    setPreview([]);
    setMessage("");
  };

  return (
    <div>
      {/* Drop Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--accent-green)" : "var(--border)"}`,
          borderRadius: "16px",
          padding: "48px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "var(--accent-green-dim)" : "var(--bg-card)",
          transition: "all 0.2s ease",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Upload size={32} color="var(--accent-green)" style={{ margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>
          Drop your Fidelity CSV here
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          or click to browse your files
        </p>
      </div>

      {/* Status Message */}
      {status !== "idle" && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: status === "success" ? "var(--accent-green-dim)" : "var(--accent-red-dim)",
            border: `1px solid ${status === "success" ? "var(--accent-green)" : "var(--accent-red)"}`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: status === "success" ? "var(--accent-green)" : "var(--accent-red)",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          {status === "success"
            ? <CheckCircle size={16} />
            : <AlertCircle size={16} />}
          {message}
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              Preview
            </h3>
            <button
              onClick={handleConfirmImport}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "var(--accent-green)",
                color: "#000",
                fontSize: "13px",
                fontWeight: "700",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              Confirm Import
            </button>
          </div>

          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                  {["Date", "Symbol", "Type", "Qty", "Entry", "Exit", "P&L"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "var(--text-muted)", fontWeight: "600", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((trade) => (
                  <tr key={trade.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>{trade.date}</td>
                    <td style={{ padding: "10px 16px", color: "var(--text-primary)", fontWeight: "600" }}>{trade.underlying}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: trade.optionType === "call" ? "rgba(77,159,255,0.15)" : "rgba(255,77,106,0.15)",
                        color: trade.optionType === "call" ? "var(--accent-blue)" : "var(--accent-red)",
                      }}>
                        {trade.optionType ? `${trade.optionType.toUpperCase()} $${trade.strike}` : trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>{trade.quantity}</td>
                    <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>${trade.entryPrice}</td>
                    <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>${trade.exitPrice}</td>
                    <td style={{ padding: "10px 16px", fontWeight: "700", color: trade.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}