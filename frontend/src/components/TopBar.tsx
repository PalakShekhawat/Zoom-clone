"use client";

import { Search, ChevronLeft, ChevronRight, RotateCw, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="flex items-center h-12 px-3 bg-white border-b border-zoom-border shrink-0">
      {/* Left: minimal nav controls */}
      <div className="hidden sm:flex items-center gap-0.5 w-32 shrink-0">
        <button className="p-1.5 rounded-md text-zoom-text-muted hover:bg-zoom-hover transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button className="p-1.5 rounded-md text-zoom-text-muted hover:bg-zoom-hover transition-colors">
          <ChevronRight size={16} />
        </button>
        <button className="p-1.5 rounded-md text-zoom-text-muted hover:bg-zoom-hover transition-colors">
          <RotateCw size={13} />
        </button>
      </div>

      {/* Center: search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full" style={{ maxWidth: 500 }}>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zoom-text-muted"
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-8 pr-3 rounded-[10px] border border-transparent focus:border-zoom-blue outline-none transition-colors text-[13px]"
            style={{ height: 36, background: "var(--zoom-search-bg)" }}
          />
        </div>
      </div>

      {/* Right: upgrade + avatar */}
      <div className="flex items-center gap-2 w-32 justify-end shrink-0">
        <button className="text-[12px] font-semibold text-zoom-blue border border-zoom-border rounded-md px-2.5 py-1 hover:bg-zoom-hover transition-colors hidden lg:block">
          Upgrade
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full hover:bg-zoom-hover transition-colors p-0.5"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-zoom-blue text-white flex items-center justify-center text-[11px] font-bold">
                AM
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-zoom-green border-2 border-white" />
            </div>
            <ChevronDown size={12} className="text-zoom-text-muted" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-zoom-border py-2 z-20">
              <div className="px-4 py-2 border-b border-zoom-border">
                <p className="text-[13px] font-semibold">Alex Morgan</p>
                <p className="text-[11px] text-zoom-text-muted">alex@example.com</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-zoom-hover">
                Profile Settings
              </button>
              <button
                onClick={() => router.push("/login")}
                className="w-full text-left px-4 py-2 text-[13px] hover:bg-zoom-hover"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
