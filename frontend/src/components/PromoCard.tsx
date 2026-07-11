"use client";

import { Sparkles } from "lucide-react";

export default function PromoCard() {
  return (
    <div
      className="bg-white rounded-xl border border-zoom-border overflow-hidden flex flex-col items-center text-center w-full"
      style={{ maxWidth: 420 }}
    >
      <div className="w-full h-28 bg-gradient-to-br from-blue-50 to-zoom-hover flex items-center justify-center">
        <Sparkles size={28} className="text-zoom-blue" />
      </div>
      <div className="px-5 py-4 flex flex-col items-center gap-1">
        <p className="text-[14px] font-semibold">Try Smart Recordings</p>
        <p className="text-[12px] text-zoom-text-muted leading-snug">
          Get AI-generated summaries and highlights after every meeting.
        </p>
        <button className="mt-2 text-[12px] font-semibold text-white bg-zoom-blue hover:bg-zoom-blue-dark rounded-md px-4 py-1.5 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}
