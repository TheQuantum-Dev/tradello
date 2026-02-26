"use client";
import Analytics from "../components/Analytics";
import { useApp } from "../context/AppContext";

export default function AnalyticsPage() {
  const { trades } = useApp();
  return <Analytics trades={trades} />;
}