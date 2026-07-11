"use client";

import {
  LayoutGrid, CalendarClock, MonitorSmartphone, PenTool,
  Presentation, Scissors, ListChecks, StickyNote,
} from "lucide-react";

const APPS = [
  { icon: LayoutGrid, label: "Apps" },
  { icon: CalendarClock, label: "Scheduler" },
  { icon: MonitorSmartphone, label: "Hub" },
  { icon: PenTool, label: "Canvas" },
  { icon: Presentation, label: "Whiteboards" },
  { icon: Scissors, label: "Clips" },
  { icon: ListChecks, label: "Tasks" },
  { icon: StickyNote, label: "Notes" },
];

export default function MoreMenu({
  onClose,
  position = "sidebar",
}: {
  onClose: () => void;
  /** "sidebar" = original desktop placement, "mobile" = centered above a bottom tab bar */
  position?: "sidebar" | "mobile";
}) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className={
          position === "mobile"
            ? "fixed left-1/2 -translate-x-1/2 bottom-16 z-40 w-[290px] max-w-[90vw] bg-white rounded-xl shadow-lg border border-zoom-border p-4"
            : "absolute left-16 bottom-0 z-40 w-[290px] bg-white rounded-xl shadow-lg border border-zoom-border p-4"
        }
      >
        <div className="grid grid-cols-3 gap-1">
          {APPS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1.5 py-3 rounded-lg hover:bg-zoom-hover transition-colors"
            >
              <Icon size={19} className="text-zoom-text-muted" />
              <span className="text-[11px] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-zoom-border mt-3 pt-3 flex items-center justify-between">
          <p className="text-[11px] text-zoom-text-muted">Drag to pin or remove from toolbar</p>
          <button className="text-[11px] font-medium text-zoom-blue shrink-0 ml-2">Reset</button>
        </div>
      </div>
    </>
  );
}
