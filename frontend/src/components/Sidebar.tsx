"use client";

import { Home, MessageSquare, Users, Grid3x3, Phone, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MoreMenu from "./MoreMenu";

const NAV_ITEMS = [
  { icon: Home, label: "Home", active: true },
  { icon: MessageSquare, label: "Chat", active: false },
  { icon: Phone, label: "Phone", active: false },
  { icon: Users, label: "Contacts", active: false },
];

export default function Sidebar() {
  const [showMore, setShowMore] = useState(false);

  return (
    <aside className="hidden md:flex flex-col items-center w-16 bg-white border-r border-zoom-border py-3 shrink-0">
      <Link href="/" className="mb-3">
        <div className="w-8 h-8 rounded-md bg-zoom-blue flex items-center justify-center text-white font-bold text-sm">
          Z
        </div>
      </Link>

      <nav className="flex flex-col items-center" style={{ gap: 18 }}>
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex flex-col items-center gap-1 w-12 py-1.5 rounded-xl text-[11px] transition-colors ${
              active
                ? "bg-white text-zoom-blue shadow-[0_1px_4px_rgba(0,0,0,0.12)] border border-zoom-border"
                : "text-zoom-text-muted hover:bg-zoom-hover"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </button>
        ))}

        <div className="relative">
          <button
            onClick={() => setShowMore((v) => !v)}
            className="flex flex-col items-center gap-1 w-12 py-1.5 rounded-xl text-[11px] text-zoom-text-muted hover:bg-zoom-hover transition-colors"
          >
            <Grid3x3 size={18} strokeWidth={2} />
            More
          </button>
          {showMore && <MoreMenu onClose={() => setShowMore(false)} />}
        </div>
      </nav>

      <div className="mt-auto">
        <button className="flex flex-col items-center gap-1 w-12 py-1.5 rounded-xl text-[11px] text-zoom-text-muted hover:bg-zoom-hover transition-colors">
          <Settings size={18} strokeWidth={2} />
          Settings
        </button>
      </div>
    </aside>
  );
}
