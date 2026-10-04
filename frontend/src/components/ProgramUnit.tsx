"use client";

import ProgramDrumCanvas from "./ProgramDrumCanvas";

interface ProgramUnitProps {
  colIdx: number;
  progControl: boolean;
  escapementKick: boolean;
}

export default function ProgramUnit({ colIdx, progControl, escapementKick }: ProgramUnitProps) {
  // Continuous loop of 1..80 numbers for the dial
  const DIAL_NUMBERS = [
    ...Array.from({ length: 80 }, (_, i) => i + 1),
    ...Array.from({ length: 80 }, (_, i) => i + 1),
    ...Array.from({ length: 80 }, (_, i) => i + 1),
  ];

  const getFieldInfo = () => {
    if (colIdx < 5) return { name: "STMT LABEL", code: "COLS 1-5" };
    if (colIdx === 5) return { name: "CONTINUATION", code: "COL 6" };
    if (colIdx < 72) return { name: "FORTRAN STMT", code: "COLS 7-72" };
    return { name: "SEQUENCE NO", code: "COLS 73-80" };
  };

  const activeField = getFieldInfo();
  
  // LIVE STARWHEEL LOGIC (Physical levers snap down into drum holes)
  const isCol = colIdx + 1;
  const isRow12Active = progControl && [1, 6, 7, 73].includes(isCol);
  const isRow11Active = progControl && ((isCol >= 2 && isCol <= 5) || (isCol >= 74 && isCol <= 80));

  return (
    <div
      className={`col-span-3 flex flex-col items-center justify-between h-[300px] bg-[#161a1e] border-2 border-[#101316] rounded-sm p-3 shadow-[inset_0_4px_16px_rgba(0,0,0,0.9)] relative transition-transform duration-75 ${
        escapementKick ? "translate-y-[0.5px]" : ""
      }`}
    >
      <div className="w-full flex justify-between items-center border-b border-[#2b343d] pb-2 z-20">
        <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-[#8fa0ad]">
          PROGRAM UNIT
        </span>
        <span className="text-[8px] font-mono text-[#61707d] uppercase tracking-wider font-semibold">
          DRUM 029
        </span>
      </div>

      {/* DYNAMIC MECHANICAL LEVERS (Instead of static dots) */}
      <div className="w-full flex justify-around px-4 border-b border-[#2b343d] pb-2 z-20 h-8 relative">
        <div className="flex flex-col items-center gap-1">
          <span className={`text-[7px] font-mono font-black ${isRow12Active ? "text-[#f5d996]" : "text-[#5b6873]"}`}>12</span>
          {/* Lever visually drops down when active */}
          <div className={`w-1.5 h-4 bg-gradient-to-b from-[#b89531] to-[#785b14] border border-[#634e15] rounded-b-full transition-transform duration-100 ${isRow12Active ? "translate-y-2" : "translate-y-0"}`} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className={`text-[7px] font-mono font-black ${isRow11Active ? "text-[#f5d996]" : "text-[#5b6873]"}`}>11</span>
          {/* Lever visually drops down when active */}
          <div className={`w-1.5 h-4 bg-gradient-to-b from-[#b89531] to-[#785b14] border border-[#634e15] rounded-b-full transition-transform duration-100 ${isRow11Active ? "translate-y-2" : "translate-y-0"}`} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[7px] font-mono font-black text-[#5b6873]">0</span>
          <div className="w-1.5 h-4 bg-gradient-to-b from-[#b89531] to-[#785b14] border border-[#634e15] rounded-b-full translate-y-0" />
        </div>
      </div>

      <div className="my-1 border border-[#2b353f] p-1 bg-[#0c0f12] rounded-[3px] shadow-inner">
        <ProgramDrumCanvas colIdx={colIdx} progControl={progControl} />
      </div>

      <div className="w-full bg-[#0d1012] border border-[#2b353f] px-2.5 py-1 rounded-[2px] flex justify-between items-center shadow-inner my-0.5">
        <span className="text-[7.5px] font-mono text-[#5b6a75] uppercase font-bold tracking-wider">FIELD:</span>
        <span className="text-[8.5px] font-mono font-black text-[#d6c79a] tracking-wider truncate">
          {activeField.name} <span className="text-[7px] text-[#786e55]">({activeField.code})</span>
        </span>
      </div>

      {/* Rotary Dial Window */}
      <div className="w-full flex flex-col items-center">
        <div className="relative w-full h-8 bg-[#0a0c0e] border border-[#3b4754] rounded-[2px] shadow-inner overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/60 pointer-events-none z-30" />
          <div className="absolute inset-0 shadow-[inset_8px_0_8px_rgba(0,0,0,0.9),inset_-8px_0_8px_rgba(0,0,0,0.9)] pointer-events-none z-20" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-red-600 shadow-[0_0_3px_#ef4444] z-30 pointer-events-none" />

          <div
            className="flex items-center absolute left-1/2 transition-transform duration-75 ease-out select-none will-change-transform"
            style={{ transform: `translateX(-${(80 + colIdx) * 28 + 14}px)` }}
          >
            {DIAL_NUMBERS.map((num, i) => {
              const isCurrent = i === 80 + colIdx;
              return (
                <div key={i} className="w-[28px] h-8 flex flex-col items-center justify-center shrink-0 border-r border-[#1c2227]">
                  <span className={`font-mono text-[12px] leading-none ${isCurrent ? "font-black text-[#faf8f5] drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]" : "font-semibold text-[#5a6773]"}`}>
                    {String(num).padStart(2, "0")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}