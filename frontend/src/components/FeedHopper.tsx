"use client";

interface FeedHopperProps {
  hopperCount: number;
  reloadHopper: () => void;
}

export default function FeedHopper({ hopperCount, reloadHopper }: FeedHopperProps) {
  // Convert 500 cards to a height percentage (0% to 100%)
  const stackHeight = (hopperCount / 500) * 100;

  return (
    <div className="col-span-4 bg-[#1c2126] border-2 border-[#121518] p-3 rounded-sm shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex flex-col justify-between h-[300px]">
      <div className="flex justify-between items-center border-b border-[#252c33] pb-2">
        <span className="text-[10px] font-mono font-bold tracking-wider text-[#a0aab2] uppercase">
          Feed Hopper
        </span>
        <span className="text-[9px] font-mono text-[#62717d] uppercase tracking-wider">
          {hopperCount} CARDS REMAINING
        </span>
      </div>

      <div 
        onClick={hopperCount === 0 ? reloadHopper : undefined}
        className={`relative h-[240px] bg-[#111417] border border-[#21272e] rounded-sm p-4 flex flex-col justify-end shadow-inner overflow-hidden ${
          hopperCount === 0 ? "cursor-pointer hover:bg-[#15191d] transition-colors" : ""
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

        {hopperCount > 0 ? (
          <div className="relative w-full h-[180px] flex items-end justify-center px-4">
            
            {/* The Dynamic 3D Paper Stack Container */}
            <div 
              className="w-full relative transition-all duration-100 ease-out flex flex-col justify-end"
              style={{ height: `${Math.max(5, stackHeight)}%` }}
            >
              {/* Heavy Metal Follower Bar (Rides directly on top of the cards) */}
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-b from-[#8f9ba3] to-[#5b6670] border border-[#303840] shadow-2xl -translate-y-full rounded-[2px] flex items-center justify-center z-20">
                <div className="w-12 h-1 bg-[#252c33] rounded-full shadow-inner" />
              </div>

              {/* The Paper Block Edge (Shows thickness) */}
              <div 
                className="w-full h-full border-t border-x border-[#c2b18a] shadow-lg"
                style={{
                  background: "repeating-linear-gradient(180deg, #d6c49a 0px, #e6d8b5 2px, #c2b18a 4px)"
                }}
              >
                {/* The Front Face of the 5081 Card */}
                <div className="w-full h-full bg-gradient-to-b from-[#e6d8b5] to-[#d6c49a] border-t border-[#f5ebd3] shadow-inner p-2 flex flex-col items-center justify-center text-center select-none overflow-hidden">
                  <span className="text-[10px] font-black text-[#524832] font-mono tracking-widest uppercase">IBM 5081</span>
                  {stackHeight > 30 && (
                    <span className="text-[7px] font-mono text-[#80704f] mt-1 font-bold tracking-widest uppercase">
                      General Purpose
                    </span>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#4d5a66] font-mono text-xs font-bold tracking-widest uppercase z-10 select-none">
            HOPPER EMPTY. CLICK TO RELOAD.
          </div>
        )}
      </div>
    </div>
  );
}