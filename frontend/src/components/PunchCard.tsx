import { memo } from "react";
import { HOLLERITH_MAP, ROWS } from "../lib/hollerith";

interface PunchCardProps {
  columns: string[];
  activeColIdx?: number;
  faded?: boolean;
}

function PunchCard({ columns, activeColIdx, faded = false }: PunchCardProps) {
  return (
    <div
      className={`relative bg-[#ede2c8] text-[#24211a] p-3 shadow-md border border-[#c2b493] overflow-hidden select-none transition-opacity ${
        faded ? "opacity-60" : "opacity-100"
      }`}
      style={{
        clipPath: "polygon(14px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 14px)",
      }}
    >
      {/* Mechanical Punch Die Position Wire */}
      {activeColIdx !== undefined && activeColIdx < 80 && (
        <div
          className="absolute top-0 bottom-0 bg-blue-900/15 border-x border-blue-900/50 pointer-events-none z-10"
          style={{
            left: `calc(12px + ${activeColIdx} * 1.25%)`,
            width: "1.25%",
          }}
        />
      )}

      {/* Top Ink Ribbon Printout */}
      <div className={`flex font-mono leading-none mb-1.5 border-b border-[#b8a984] pb-1 ${
        activeColIdx !== undefined ? "text-[13px]" : "text-[9px]"
      }`}>
        {columns.map((char, i) => (
          <span
            key={i}
            className={`w-[1.25%] text-center shrink-0 font-bold ${
              activeColIdx === i ? "text-blue-900 underline font-black" : "text-[#1a2e40]"
            }`}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      {/* 12-Row Punch Grid */}
      <div className="flex flex-col gap-[2px]">
        {ROWS.map((row) => (
          <div key={row} className="flex items-center">
            {columns.map((char, i) => {
              const punchedRows = HOLLERITH_MAP[char] || [];
              const isHole = punchedRows.includes(row);

              return (
                <div key={i} className="w-[1.25%] h-[10px] flex items-center justify-center shrink-0">
                  {isHole ? (
                    <span className="w-[65%] h-[8px] bg-[#3a3732] rounded-[0.5px] block shadow-inner" />
                  ) : (
                    <span className="text-[6.5px] text-[#8c8065] font-mono select-none">
                      {row === 12 || row === 11 ? "" : row}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Authentic Fortran Column Dividers */}
      <div className="flex text-[7px] font-mono text-[#786c52] border-t border-[#b8a984] mt-2 pt-0.5 select-none font-semibold">
        <div className="w-[6.25%] text-center border-r border-[#b8a984]">1-5</div>
        <div className="w-[1.25%] text-center border-r border-[#b8a984]">6</div>
        <div className="w-[82.5%] text-left pl-2 border-r border-[#b8a984]">7-72 FORTRAN STATEMENT FIELD</div>
        <div className="w-[10%] text-center">73-80</div>
      </div>
    </div>
  );
}

export default memo(PunchCard);