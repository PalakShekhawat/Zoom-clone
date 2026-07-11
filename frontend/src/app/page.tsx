"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import ActionTiles from "@/components/ActionTiles";
import MeetingCard from "@/components/MeetingCard";
import PromoCard from "@/components/PromoCard";
import InfoBanner from "@/components/InfoBanner";
import { api, type MeetingOut } from "@/lib/api";

export default function DashboardPage() {
  const [upcoming, setUpcoming] = useState<MeetingOut[]>([]);
  const [recent, setRecent] = useState<MeetingOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "recent">("upcoming");
  const [now, setNow] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([api.getUpcoming(), api.getRecent()]);
      setUpcoming(u);
      setRecent(r);
    } catch {
      // Backend may not be running yet — fail quietly on the dashboard
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live clock, like Zoom Desktop's Home screen
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="flex flex-col items-center py-10 px-4 w-full">
            {/* Time + date */}
            <p
              style={{ fontWeight: 600 }}
              className="leading-none tabular-nums text-[36px] sm:text-[48px]"
            >
              {now
                ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
                : "--:--"}
            </p>
            <p className="text-zoom-text-muted text-[14px]" style={{ marginTop: 8 }}>
              {now
                ? now.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>

            {/* Circular action buttons */}
            <div style={{ marginTop: 32 }} className="w-full flex justify-center">
              <ActionTiles onScheduled={loadData} />
            </div>

            {/* Promo card */}
            <div style={{ marginTop: 32 }} className="w-full max-w-[420px]">
              <PromoCard />
            </div>

            {/* Upcoming / Recent meetings (required on homepage per spec) */}
            <div style={{ marginTop: 32 }} className="w-full max-w-[420px]">
              <div className="flex items-center gap-4 border-b border-zoom-border mb-3">
                {(["upcoming", "recent"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`pb-2 text-[13px] font-semibold capitalize border-b-2 transition-colors ${
                      tab === t
                        ? "border-zoom-blue text-zoom-blue"
                        : "border-transparent text-zoom-text-muted hover:text-zoom-text"
                    }`}
                  >
                    {t} Meetings
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="text-[12px] text-zoom-text-muted">Loading meetings...</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {tab === "upcoming" &&
                    (upcoming.length === 0 ? (
                      <EmptyState label="No upcoming meetings scheduled." />
                    ) : (
                      upcoming.map((m) => (
                        <MeetingCard key={m.id} meeting={m} variant="upcoming" />
                      ))
                    ))}
                  {tab === "recent" &&
                    (recent.length === 0 ? (
                      <EmptyState label="No recent meetings yet." />
                    ) : (
                      recent.map((m) => (
                        <MeetingCard key={m.id} meeting={m} variant="recent" />
                      ))
                    ))}
                </div>
              )}
            </div>

            {/* Info banner */}
            <div style={{ marginTop: 24, marginBottom: 16 }} className="w-full max-w-[420px]">
              <InfoBanner />
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-6 text-[12px] text-zoom-text-muted border border-dashed border-zoom-border rounded-lg">
      {label}
    </div>
  );
}
