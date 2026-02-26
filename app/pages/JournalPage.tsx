"use client";

export default function JournalPage() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "60vh", flexDirection: "column", gap: "12px",
    }}>
      <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
        Journal
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        Coming next — daily journal with trade reviews and note-taking to help you reflect and learn from each trade 
      </p>
    </div>
  );
}