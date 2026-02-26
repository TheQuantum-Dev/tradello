"use client";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import TradePanel from "./components/TradePanel";
import Dashboard from "./pages/Dashboard";
import ImportPage from "./pages/ImportPage";
import CalendarPage from "./pages/CalendarPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import JournalPage from "./pages/JournalPage";
import { useApp } from "./context/AppContext";

function AppShell() {
  const { activePage, selectedTrade, setSelectedTrade, setTrades, trades } = useApp();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />

      <main style={{
        flex: 1, overflow: "auto",
        background: "var(--bg-primary)", padding: "32px",
      }}>
        {activePage === "dashboard" && <Dashboard />}
        {activePage === "journal" && <JournalPage />}
        {activePage === "analytics" && <AnalyticsPage />}
        {activePage === "calendar" && <CalendarPage />}
        {activePage === "import" && <ImportPage />}

        <div style={{
          textAlign: "center", marginTop: "48px",
          color: "var(--text-muted)", fontSize: "12px",
        }}>
          Made with ❤️ by The Quantum Dev
        </div>
      </main>

      <TradePanel
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onSave={(updated) => {
          setTrades(trades.map((t) => t.id === updated.id ? updated : t));
          setSelectedTrade(updated);
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}