"use client";

import { Info } from "lucide-react";

export default function InfoBanner() {
  return (
    <div
      className="flex items-center gap-2 px-4 rounded-lg border border-zoom-border bg-blue-50/40 w-full"
      style={{ height: 50, maxWidth: 420 }}
    >
      <Info size={16} className="text-zoom-blue shrink-0" />
      <p className="text-[12px] text-zoom-text">
        Connect your calendar to see your schedule here.{" "}
        <button className="text-zoom-blue font-semibold hover:underline">Connect</button>
      </p>
    </div>
  );
}
