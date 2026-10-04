"use client";

interface SidebarProps {
  onLoadSample: () => void;
  onScrapDeck: () => void;
  onTearPaper: () => void;
}

export default function Sidebar({ onLoadSample, onScrapDeck, onTearPaper }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 bg-[#1a1e22] border-r-2 border-[#101316] shadow-[4px_0_15px_rgba(0,0,0,0.6)] flex flex-col justify-between items-center py-6 z-50">
      <div className="flex flex-col items-center gap-6 w-full px-2">
        <div className="flex flex-col items-center gap-1">
          <div className="w-11 h-8 bg-[#101316] border border-[#2d3740] rounded-[2px] shadow-inner flex items-center justify-center font-serif font-black text-[#d1d5d8] text-xs tracking-wider select-none">
            IBM
          </div>
          <span className="text-[7.5px] font-mono text-[#58646e] tracking-widest uppercase">029</span>
        </div>

        <div className="w-8 h-[1px] bg-[#28313a]" />

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="group relative flex items-center justify-center w-full">
            <button
              onClick={onLoadSample}
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#c5cfd6] hover:text-[#f5d996] hover:border-[#f5d996]/60 transition-colors"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect x="2" y="7" width="16" height="13" rx="1" /><path d="M6 4h14a1 1 0 0 1 1 1v12" /></svg>
            </button>
            <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#f5d996] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
              LOAD SAMPLE DECK
            </span>
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              onClick={onScrapDeck}
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#c5cfd6] hover:text-[#e67575] hover:border-[#e67575]/60 transition-colors"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
            </button>
            <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#e67575] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
              SCRAP DECK
            </span>
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              onClick={onTearPaper}
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#c5cfd6] hover:text-[#85e3b3] hover:border-[#85e3b3]/60 transition-colors"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" strokeDasharray="2 2" /></svg>
            </button>
            <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#85e3b3] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
              TEAR PRINTER FORM
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-[#101316] border border-[#37414b] shadow-inner flex items-center justify-center">
          <div className="w-2 h-[1px] bg-stone-500 rotate-45" />
        </div>
      </div>
    </aside>
  );
}