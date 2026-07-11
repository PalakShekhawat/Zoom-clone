"use client";

import { Home, MessageSquare, Users, Phone, Grid3x3 } from "lucide-react";
import { useState } from "react";
import MoreMenu from "./MoreMenu";

const NAV_ITEMS = [
  { icon: Home, label: "Home", active: true },
  { icon: MessageSquare, label: "Chat", active: false },
  { icon: Phone, label: "Phone", active: false },
  { icon: Users, label: "Contacts", active: false },
];

/**
 * Mobile-only bottom tab bar. Mirrors the desktop Sidebar's nav items so
 * small screens (which hide the desktop sidebar) still have navigation.
 * Desktop layout/appearance is untouched — this only ever renders below
 * the `md` breakpoint.
 */
export default function MobileNav() {
  const [showMore, setShowMore] = useState(false);

  return (
    <nav className="md:hidden flex items-center justify-around border-t border-zoom-border bg-white shrink-0 relative">
      {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          className={`flex flex-col items-center gap-0.5 py-2 flex-1 text-[10px] transition-colors ${
            active ? "text-zoom-blue" : "text-zoom-text-muted"
          }`}
        >
          <Icon size={19} strokeWidth={2} />
          {label}
        </button>
      ))}
      <div className="flex-1">
        <button
          onClick={() => setShowMore((v) => !v)}
          className="w-full flex flex-col items-center gap-0.5 py-2 text-[10px] text-zoom-text-muted"
        >
          <Grid3x3 size={19} strokeWidth={2} />
          More
        </button>
        {showMore && <MoreMenu position="mobile" onClose={() => setShowMore(false)} />}
      </div>
    </nav>
  );
}
