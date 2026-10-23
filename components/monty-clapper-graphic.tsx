'use client';

import React from 'react';

export function MontyClapperEmblem({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-[#1C1917] text-[#FBF9F5] border border-[#292524] shadow-sm select-none ${className}`}
      aria-label="Monty the Clapper — OpenMontage Mascot"
    >
      <div className="flex flex-col items-center justify-center w-full h-full p-1.5">
        {/* Clapper top sticks with diagonal stripes */}
        <div className="w-full h-2.5 rounded-t-sm overflow-hidden flex border-b border-[#FBF9F5]/20 bg-[#292524] -rotate-3 origin-bottom-left transition-transform group-hover:rotate-0">
          <div className="w-1/4 h-full bg-[#9A3412] skew-x-[-24deg]" />
          <div className="w-1/4 h-full bg-[#FBF9F5] skew-x-[-24deg]" />
          <div className="w-1/4 h-full bg-[#9A3412] skew-x-[-24deg]" />
          <div className="w-1/4 h-full bg-[#FBF9F5] skew-x-[-24deg]" />
        </div>
        {/* Clapper Slate Body */}
        <div className="w-full flex-1 bg-[#1C1917] flex flex-col items-center justify-center pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBF9F5]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBF9F5]" />
          </div>
          <span className="font-mono text-[8px] tracking-widest text-[#D6CEBE] mt-0.5">
            MONTY
          </span>
        </div>
      </div>
    </div>
  );
}

export function FilmSlateArtwork({
  catalogId,
  title,
  subtitle,
  motif,
  gradientClass,
}: {
  catalogId: string;
  title: string;
  subtitle: string;
  motif: string;
  gradientClass: string;
}) {
  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br ${gradientClass} text-[#FBF9F5] p-6 flex flex-col justify-between overflow-hidden`}
    >
      <div className="flex items-center justify-between text-xs font-mono text-[#D6CEBE]/80 border-b border-white/10 pb-3">
        <span>{catalogId}</span>
        <span>{motif}</span>
      </div>
      <div className="my-auto py-4">
        <p className="text-xs font-mono tracking-widest uppercase text-[#D6CEBE]/75 mb-1">
          {subtitle}
        </p>
        <h4 className="text-2xl font-editorial font-semibold tracking-tight text-white">
          {title}
        </h4>
      </div>
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-[11px] font-mono text-[#D6CEBE]/80">
        <div>
          <span className="block text-[9px] text-white/50">FPS</span>
          24.00
        </div>
        <div>
          <span className="block text-[9px] text-white/50">AUDIO</span>
          -14 LUFS
        </div>
        <div>
          <span className="block text-[9px] text-white/50">GATE</span>
          PASSED
        </div>
        <div className="text-right">
          <span className="block text-[9px] text-white/50">LICENSE</span>
          AGPLv3
        </div>
      </div>
    </div>
  );
}
