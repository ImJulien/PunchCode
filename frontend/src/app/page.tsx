"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  initAudio,
  playPunchSound,
  playFeedSound,
  playReaderSound,
  playPrinterSound,
  playLockSound,
} from "../lib/audio";
import { HOLLERITH_MAP, ROWS } from "../lib/hollerith";
import PunchCard from "../components/PunchCard";

// Import newly separated components
import Sidebar from "../components/Sidebar";
import ProgramUnit from "../components/ProgramUnit";
import FeedHopper from "../components/FeedHopper";

export default function Home() {
  const [currentCols, setCurrentCols] = useState<string[]>(Array(80).fill(" "));
  const [colIdx, setColIdx] = useState<number>(0);
  const [readCard, setReadCard] = useState<string[] | null>(null);
  const [stacker, setStacker] = useState<string[][]>([]);
  const [inspectingIdx, setInspectingIdx] = useState<number | null>(null);

  const [autoFeed, setAutoFeed] = useState(true);
  const [printRibbon, setPrintRibbon] = useState(true);
  const [progControl, setProgControl] = useState(true);
  
  // LIVE HOPPER STATE (Starts at 500 cards)
  const [hopperCount, setHopperCount] = useState<number>(500);
  const [escapementKick, setEscapementKick] = useState(false);

  const [printerOutput, setPrinterOutput] = useState<string[]>([
    "IBM SYSTEM/360 OPERATING SYSTEM - READY FOR BATCH JOB",
    "LOAD CARD DECK INTO HOPPER AND PRESS [FEED DECK TO RUNNER]"
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const colIdxRef = useRef(colIdx);
  colIdxRef.current = colIdx;
  const currentColsRef = useRef(currentCols);
  currentColsRef.current = currentCols;
  const readCardRef = useRef(readCard);
  readCardRef.current = readCard;
  const progControlRef = useRef(progControl);
  progControlRef.current = progControl;
  const stackerLengthRef = useRef(stacker.length);
  stackerLengthRef.current = stacker.length;
  const hopperCountRef = useRef(hopperCount);
  hopperCountRef.current = hopperCount;
  
  const dupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerEscapementKick = () => {
    setEscapementKick(true);
    setTimeout(() => setEscapementKick(false), 45);
  };

  const stepDup = useCallback(() => {
    const col = colIdxRef.current;
    const rCard = readCardRef.current;

    if (!rCard || col >= 80) {
      if (dupIntervalRef.current) {
        clearInterval(dupIntervalRef.current);
        dupIntervalRef.current = null;
      }
      if (col >= 80) playLockSound();
      return;
    }

    playPunchSound();
    triggerEscapementKick();
    const charToCopy = rCard[col] || " ";
    setCurrentCols((prev) => {
      const next = [...prev];
      next[col] = charToCopy;
      return next;
    });
    setColIdx((prev) => Math.min(80, prev + 1));
  }, []);

  const startDup = useCallback(() => {
    if (dupIntervalRef.current) return;
    if (!readCardRef.current) {
      playLockSound();
      return;
    }
    stepDup();
    dupIntervalRef.current = setInterval(stepDup, 55);
  }, [stepDup]);

  const stopDup = useCallback(() => {
    if (dupIntervalRef.current) {
      clearInterval(dupIntervalRef.current);
      dupIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    containerRef.current?.focus();
    const handleWindowBlur = () => stopDup();
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      stopDup();
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [stopDup]);

  // LIVE HOPPER LOGIC
  const releaseCard = useCallback(() => {
    if (hopperCountRef.current <= 0) {
      playLockSound();
      return; // Cannot feed if hopper is empty
    }

    playFeedSound();
    triggerEscapementKick();
    
    // Decrement Hopper
    setHopperCount((prev) => Math.max(0, prev - 1));

    const finalCard = [...currentColsRef.current];

    if (progControlRef.current) {
      const seqNumber = String((stackerLengthRef.current + 1) * 10).padStart(8, "0");
      for (let i = 0; i < 8; i++) {
        if (finalCard[72 + i] === " ") {
          finalCard[72 + i] = seqNumber[i];
        }
      }
    }

    if (readCardRef.current) {
      setStacker((prev) => [...prev, readCardRef.current!]);
    }
    setReadCard(finalCard);
    setCurrentCols(Array(80).fill(" "));
    setColIdx(0);
  }, []);

  const reloadHopper = () => {
    playFeedSound();
    setHopperCount(500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Alt" || e.key === "Control") {
      e.preventDefault();
      startDup();
      return;
    }

    if (e.repeat) return;
    initAudio();

    if (inspectingIdx !== null) {
      if (e.key === "Escape") {
        e.preventDefault();
        setInspectingIdx(null);
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      releaseCard();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      playFeedSound();
      setCurrentCols(Array(80).fill(" "));
      setColIdx(0);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      playPunchSound();
      triggerEscapementKick();
      const cur = colIdx;
      if (cur < 5) {
        setColIdx(5);
      } else if (cur === 5) {
        setColIdx(6);
      } else if (cur < 72) {
        setColIdx(72);
      } else {
        setColIdx(79);
      }
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      playLockSound();
      return;
    }

    if (colIdx >= 80) {
      playLockSound();
      return;
    }

    const char = e.key.toUpperCase();
    if (char.length === 1 && colIdx < 80) {
      if (char in HOLLERITH_MAP) {
        playPunchSound();
        triggerEscapementKick();
        const next = [...currentCols];
        next[colIdx] = char;
        setCurrentCols(next);

        if (progControlRef.current && colIdx === 71) {
          setColIdx(72);
        } else {
          setColIdx((prev) => Math.min(80, prev + 1));
        }
      } else {
        playLockSound();
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Alt" || e.key === "Control") {
      e.preventDefault();
      stopDup();
    }
  };

  const handleLoadSample = () => {
    if (hopperCount < 5) {
      playLockSound();
      return;
    }
    
    playFeedSound();
    setHopperCount((prev) => Math.max(0, prev - 5));

    const makeCard = (str: string, seq: number) => {
      const arr = Array(80).fill(" ");
      for (let i = 0; i < str.length && i < 72; i++) {
        arr[i] = str[i].toUpperCase();
      }
      const seqStr = String(seq).padStart(8, "0");
      for (let i = 0; i < 8; i++) {
        arr[72 + i] = seqStr[i];
      }
      return arr;
    };

    const sample = [
      makeCard("      PROGRAM FACTORIAL", 10),
      makeCard("      INTEGER N, F, I", 20),
      makeCard("      N = 6; F = 1; DO I = 1, N; F = F * I; END DO", 30),
      makeCard("      PRINT *, '6 FACTORIAL IS = ', F", 40),
      makeCard("      END PROGRAM", 50)
    ];

    setStacker(sample);
    setReadCard(null);
    setCurrentCols(Array(80).fill(" "));
    setColIdx(0);
    setInspectingIdx(null);
  };

  const handleScrapDeck = () => {
    playFeedSound();
    playLockSound();
    setStacker([]);
    setReadCard(null);
    setCurrentCols(Array(80).fill(" "));
    setColIdx(0);
    setInspectingIdx(null);
  };

  const handleTearPaper = () => {
    playPrinterSound();
    setPrinterOutput([
      "IBM SYSTEM/360 OPERATING SYSTEM - READY FOR BATCH JOB",
      "LOAD CARD DECK INTO HOPPER AND PRESS [FEED DECK TO RUNNER]"
    ]);
  };

  const handleExecuteDeck = async () => {
    playReaderSound();
    setIsRunning(true);

    const fullDeck = [...stacker];
    if (readCard) fullDeck.push(readCard);
    const activeText = currentCols.join("").trim();
    if (activeText.length > 0) fullDeck.push(currentCols);

    if (fullDeck.length === 0) {
      playLockSound();
      setPrinterOutput([
        "*** JOB REJECTED ***",
        "CARD HOPPER & STACKER EMPTY. NO SOURCE DECK TO READ."
      ]);
      setIsRunning(false);
      return;
    }

    const cardsPayload = fullDeck.map((c) => c.join(""));

    setPrinterOutput([
      `IBM 2501 CARD READER: INGESTED ${fullDeck.length} CARDS`,
      "TRANSMITTING DECK TO FORTRAN COMPILER RUNNER (PORT 8000)...",
      "--------------------------------------------------"
    ]);

    try {
      const res = await fetch("http://localhost:8000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: cardsPayload, stdin: "" })
      });

      const data = await res.json();
      playPrinterSound();

      const outputLines = (data.output || "").split("\n");

      setPrinterOutput([
        `BATCH JOB EXECUTION REPORT • ${fullDeck.length} CARDS PROCESSED`,
        data.is_error
          ? "STATUS: COMPILATION / EXECUTION ERROR"
          : "STATUS: EXECUTION SUCCESSFUL (RC=0000)",
        "==================================================",
        ...outputLines,
        "==================================================",
        "END OF BATCH OUTPUT"
      ]);
    } catch {
      playLockSound();
      setPrinterOutput([
        "*** HARDWARE / LINK FAULT ***",
        "UNABLE TO CONTACT PYTHON RUNNER AT HTTP://LOCALHOST:8000.",
        "Ensure your FastAPI backend is running via: uvicorn main:app --port 8000"
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141618] text-[#c5cfd6] flex">
      
      {/* ─────────────────────────────────────────────────────────────
          EXTERNAL COMPONENT: SIDEBAR
         ───────────────────────────────────────────────────────────── */}
      <Sidebar 
        onLoadSample={handleLoadSample} 
        onScrapDeck={handleScrapDeck} 
        onTearPaper={handleTearPaper} 
      />

      <main
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={() => initAudio()}
        className="flex-1 ml-16 min-h-screen p-4 lg:p-8 flex flex-col items-center justify-start gap-6 font-sans outline-none select-none relative z-10"
      >
        <div className="w-full max-w-6xl bg-[#37414b] border-[10px] border-[#252c33] rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.05)] flex flex-col relative">
          
          <div className="bg-[#1e242a] border-b-2 border-[#15191d] px-6 py-3.5 flex justify-between items-center text-[#e1e4e6] shadow-[inset_0_-2px_10px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4">
              <div className="bg-[#111418] border border-[#3b4752] px-3 py-1 font-serif font-black tracking-widest text-[#d1d5d8] text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                IBM
              </div>
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-[#c2c8cc]">
                  029 CARD PUNCH
                </div>
                <div className="text-[9px] text-[#6b7985] tracking-widest uppercase">
                  DATA PROCESSING DIVISION • 80-COLUMN HOLLERITH
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[9px] text-[#718290]">
              <span className="bg-[#14181c] px-2.5 py-1 border border-[#2b353f] rounded-[2px] shadow-inner font-semibold">
                SYSTEM/360 WORKSTATION
              </span>
              <span className="bg-[#14181c] px-2.5 py-1 border border-[#2b353f] rounded-[2px] shadow-inner font-semibold">
                115V AC • 60 HZ
              </span>
            </div>
          </div>

          <div className="bg-[#3c4652] p-4 lg:p-6 border-b-4 border-[#21272e] grid grid-cols-12 gap-6 items-end shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
            
            <div className="col-span-5 bg-[#1c2126] border-2 border-[#121518] rounded-sm shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex flex-col h-[300px]">
              <div className="bg-[#171b1f] px-4 py-2 border-b border-[#252c33] flex justify-between items-center shadow-md z-10">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#a0aab2] uppercase">
                  Card Stacker Tray (Deck)
                </span>
                <span className="text-[9px] font-mono font-bold text-[#718494] bg-[#0c0e10] px-2 py-0.5 rounded border border-[#232930]">
                  {stacker.length} CARDS
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-[#1e2329] relative">
                {stacker.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#4d5a66] text-[11px] font-mono italic">
                    Deck empty. Press ENTER to release punched cards.
                  </div>
                ) : (
                  <div className="flex flex-col pb-4">
                    {stacker.map((card, idx) => {
                      const isLast = idx === stacker.length - 1;
                      const isInspected = inspectingIdx === idx;
                      const textPreview = card.join("").trimEnd();

                      return (
                        <div
                          key={idx}
                          onClick={() => setInspectingIdx(isInspected ? null : idx)}
                          className={`relative w-full cursor-pointer transition-all duration-75 ${
                            idx !== 0 ? "-mt-[120px]" : ""
                          } ${
                            isInspected 
                              ? "z-30 shadow-[0_12px_24px_rgba(0,0,0,0.8)]" 
                              : "hover:brightness-105 hover:z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.5)]"
                          }`}
                        >
                          <div
                            className={`w-full h-[142px] border p-2 text-[#24211a] select-none ${
                              isInspected 
                                ? "bg-gradient-to-b from-[#f5ebd3] to-[#e6d9b8] border-[#8a7a58] ring-1 ring-[#8a7a58]" 
                                : "bg-gradient-to-b from-[#e3d5b3] to-[#d4c39c] border-[#a39471]"
                            }`}
                            style={{
                              clipPath: "polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12px)",
                            }}
                          >
                            <div className="flex items-center justify-between border-b border-[#b3a37d] pb-1 h-[20px]">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <span className="text-[9px] font-mono font-black text-[#695c41] shrink-0">
                                  {String(idx + 1).padStart(3, "0")}
                                </span>
                                <span className={`text-[11px] font-mono font-bold tracking-wider truncate ${isInspected ? "text-blue-900" : "text-[#1d2733]"}`}>
                                  {textPreview || <span className="text-stone-500/50 italic">BLANK CARD</span>}
                                </span>
                              </div>
                              {isLast && !isInspected && (
                                <span className="text-[8px] font-mono font-bold text-[#80704f] shrink-0 ml-2">
                                  END OF DECK
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col gap-[2px] mt-1.5 opacity-80">
                              {ROWS.map((row) => (
                                <div key={row} className="flex items-center">
                                  {card.map((char, cIdx) => {
                                    const isHole = (HOLLERITH_MAP[char] || []).includes(row);
                                    return (
                                      <div key={cIdx} className="w-[1.25%] h-[8px] flex items-center justify-center shrink-0">
                                        {isHole ? (
                                          <span className="w-[65%] h-[6px] bg-[#1a1f24] rounded-[0.5px] block shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                                        ) : (
                                          <span className="text-[5.5px] text-[#9c8e71] font-mono">
                                            {row === 12 || row === 11 ? "" : row}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                            <div className="flex text-[6px] font-mono text-[#8a7b5d] border-t border-[#b8a984] mt-1.5 pt-0.5 font-bold">
                              <div className="w-[6.25%] text-center border-r border-[#b8a984]">1-5</div>
                              <div className="w-[1.25%] text-center border-r border-[#b8a984]">6</div>
                              <div className="w-[82.5%] text-left pl-2 border-r border-[#b8a984]">7-72 FORTRAN STATEMENT</div>
                              <div className="w-[10%] text-center">73-80</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                EXTERNAL COMPONENT: PROGRAM UNIT (Now contains dynamic levers)
               ───────────────────────────────────────────────────────────── */}
            <ProgramUnit 
              colIdx={colIdx} 
              progControl={progControl} 
              escapementKick={escapementKick} 
            />

            {/* ─────────────────────────────────────────────────────────────
                EXTERNAL COMPONENT: FEED HOPPER (Now physically shrinks)
               ───────────────────────────────────────────────────────────── */}
            <FeedHopper 
              hopperCount={hopperCount} 
              reloadHopper={reloadHopper} 
            />

          </div>

          {/* MIDDLE BED */}
          <div className="bg-[#242b32] p-5 border-b-4 border-[#181d22] flex flex-col gap-2 relative shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]">
            <div className="w-full h-2 bg-gradient-to-b from-stone-300 via-stone-100 to-stone-400 border-y border-stone-600 rounded-sm shadow-sm" />

            {inspectingIdx !== null ? (
              <div className="flex flex-col gap-3 py-2">
                <div className="flex justify-between items-center bg-[#1d2329] p-3 border-y border-[#3b4752] shadow-inner">
                  <div className="flex items-center gap-4">
                    <span className="bg-[#c29c61] text-[#1c1913] font-mono font-black text-xs px-2 py-0.5 shadow-sm">
                      INSPECTION BED
                    </span>
                    <span className="text-xs font-mono font-bold text-[#a4afb8]">
                      EXAMINING CARD #{inspectingIdx + 1} OF {stacker.length}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setStacker((prev) => prev.filter((_, i) => i !== inspectingIdx));
                        setInspectingIdx(null);
                      }}
                      className="bg-gradient-to-b from-[#8a3329] to-[#66231a] border border-[#a13c30] text-[#f0cfcb] text-[10px] uppercase tracking-wider px-4 py-1.5 font-mono font-bold rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.6)] active:translate-y-[1px] active:shadow-none"
                    >
                      Scrap Card
                    </button>
                    <button
                      onClick={() => setInspectingIdx(null)}
                      className="bg-gradient-to-b from-[#4e5a66] to-[#3a444d] border border-[#5d6a78] text-[#d1d7dc] text-[10px] uppercase tracking-wider px-4 py-1.5 font-mono font-bold rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.6)] active:translate-y-[1px] active:shadow-none"
                    >
                      Return to Deck [ESC]
                    </button>
                  </div>
                </div>

                <div className="px-12 py-2">
                  <PunchCard columns={stacker[inspectingIdx]} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-[9.5px] font-mono font-bold tracking-widest text-[#73828f] uppercase px-2 py-1">
                  <span>◄ READ STATION (SENSING BRUSHES)</span>
                  <span>PUNCH STATION (PUNCH DIES) ◄</span>
                </div>

                <div className="grid grid-cols-2 gap-6 items-start px-2 py-1 bg-[#191f24] border border-[#2b353e] rounded-sm p-3 shadow-inner">
                  <div>
                    {readCard ? (
                      <PunchCard columns={readCard} faded={true} />
                    ) : (
                      <div className="h-[156px] border-2 border-dashed border-[#2f3842] bg-[#14181c] shadow-inner flex flex-col items-center justify-center text-[#4e5b66] text-xs font-mono italic">
                        Read Station Empty
                      </div>
                    )}
                  </div>

                  <div>
                    <PunchCard columns={currentCols} activeColIdx={colIdx} />
                  </div>
                </div>
              </>
            )}

            <div className="w-full h-2 bg-gradient-to-b from-stone-400 via-stone-100 to-stone-300 border-y border-stone-600 rounded-sm shadow-sm" />
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="bg-[#313942] px-8 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setAutoFeed(!autoFeed)}
                className="flex items-center gap-3 bg-gradient-to-b from-[#21272e] to-[#1a1f24] px-4 py-2 border border-[#404c59] rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.5)] active:translate-y-[1px]"
              >
                <div className={`w-3 h-5 border border-[#111418] transition-all ${autoFeed ? "bg-gradient-to-b from-[#e1e6eb] to-[#929ea8] shadow-[0_1px_3px_rgba(0,0,0,0.8)]" : "bg-[#0b0d10]"}`} />
                <span className="text-[11px] font-mono font-bold text-[#c2cbd1] tracking-wider">AUTO FEED</span>
              </button>

              <button
                onClick={() => setPrintRibbon(!printRibbon)}
                className="flex items-center gap-3 bg-gradient-to-b from-[#21272e] to-[#1a1f24] px-4 py-2 border border-[#404c59] rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.5)] active:translate-y-[1px]"
              >
                <div className={`w-3 h-5 border border-[#111418] transition-all ${printRibbon ? "bg-gradient-to-b from-[#e1e6eb] to-[#929ea8] shadow-[0_1px_3px_rgba(0,0,0,0.8)]" : "bg-[#0b0d10]"}`} />
                <span className="text-[11px] font-mono font-bold text-[#c2cbd1] tracking-wider">PRINT INK</span>
              </button>

              <button
                onClick={() => setProgControl(!progControl)}
                className="flex items-center gap-3 bg-gradient-to-b from-[#21272e] to-[#1a1f24] px-4 py-2 border border-[#404c59] rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.5)] active:translate-y-[1px]"
              >
                <div className={`w-3 h-5 border border-[#111418] transition-all ${progControl ? "bg-gradient-to-b from-[#e1e6eb] to-[#929ea8] shadow-[0_1px_3px_rgba(0,0,0,0.8)]" : "bg-[#0b0d10]"}`} />
                <span className="text-[11px] font-mono font-bold text-[#c2cbd1] tracking-wider">STARWHEEL CONTROL</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-[#a5b2bc] uppercase tracking-wider">
              <span className="bg-[#1c2228] px-2.5 py-1 border border-[#3b4752] shadow-inner"><kbd className="font-bold text-[#e0c482] mr-1.5">TAB</kbd> FIELD SKIP</span>
              <span className="bg-[#1c2228] px-2.5 py-1 border border-[#3b4752] shadow-inner"><kbd className="font-bold text-[#e0c482] mr-1.5">HOLD ALT/CTRL</kbd> DUP</span>
              <span className="bg-[#1c2228] px-2.5 py-1 border border-[#3b4752] shadow-inner"><kbd className="font-bold text-[#e0c482] mr-1.5">ENTER</kbd> REL</span>
              <span className="bg-[#1c2228] px-2.5 py-1 border border-[#3b4752] shadow-inner"><kbd className="font-bold text-[#d66b6b] mr-1.5">ESC</kbd> SCRAP</span>
            </div>

            <button
              onClick={handleExecuteDeck}
              disabled={isRunning}
              className={`px-6 py-2.5 rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase transition-all shadow-[0_4px_12px_rgba(0,0,0,0.6)] border ${
                isRunning ? "bg-[#61451f] border-[#8a6531] text-[#c9a777] cursor-wait" : "bg-gradient-to-b from-[#216b4a] to-[#154731] hover:from-[#29825b] hover:to-[#19573c] active:translate-y-[2px] active:shadow-none border-[#32966a] text-[#e3f7ec]"
              }`}
            >
              {isRunning ? "READING CARDS..." : "FEED DECK TO RUNNER ➔"}
            </button>
          </div>
        </div>

        {/* IBM 1403 LINE PRINTER */}
        <div className="w-full max-w-6xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded overflow-hidden border-4 border-[#252c33]">
          <div className="bg-[#1f252b] px-4 py-2 border-b border-[#2b333c] flex justify-between items-center text-[10px] font-mono text-[#748494] tracking-wider uppercase">
            <span className="font-bold text-[#b5c1cc]">IBM 1403 LINE PRINTER • CONTINUOUS STATIONERY FORM</span>
            <span>132 COLUMNS • 1100 LINES/MIN</span>
          </div>

          <div className="flex bg-[#f0f5f0] text-[#1c2b1e]">
            <div className="w-7 border-r border-[#d4ded4] flex-shrink-0" style={{ backgroundImage: "radial-gradient(circle, #252c33 3.5px, transparent 4px)", backgroundSize: "28px 20px", backgroundPosition: "center 8px" }} />

            <div className="flex-1 p-5 font-mono text-xs overflow-x-auto min-h-[150px]">
              {printerOutput.map((line, idx) => {
                const isGreenBand = Math.floor(idx / 3) % 2 === 1;
                return (
                  <div key={idx} className={`py-0.5 px-3 whitespace-pre leading-relaxed tracking-wider font-semibold ${isGreenBand ? "bg-[#e1ebe1]" : "bg-[#f9fbf9]"}`}>
                    {line}
                  </div>
                );
              })}
            </div>

            <div className="w-7 border-l border-[#d4ded4] flex-shrink-0" style={{ backgroundImage: "radial-gradient(circle, #252c33 3.5px, transparent 4px)", backgroundSize: "28px 20px", backgroundPosition: "center 8px" }} />
          </div>
        </div>
      </main>
    </div>
  );
}