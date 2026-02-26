"use client";
import PnLCalendar from "../components/PnLCalendar";
import { useApp } from "../context/AppContext";

export default function CalendarPage() {
  const { trades, setSelectedTrade } = useApp();

  return (
    <PnLCalendar
      trades={trades}
      onSelectTrade={(trade) => setSelectedTrade(trade)}
    />
  );
}