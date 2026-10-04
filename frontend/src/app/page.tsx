"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  initAudio,
  playPunchSound,
  playFeedSound,
  playReaderSound,
  playPrinterSound,
  playLockSound,
  playPaperEnterSound,
  playPaperDeckSound,
  playHoverSound,
  playButtonSound,
  preloadAudio,
  setAmbienceVolume,
  playCompileSound,
} from "../lib/audio";
import { HOLLERITH_MAP, ROWS } from "../lib/hollerith";
import PunchCard from "../components/PunchCard";

// Import newly separated components
import Sidebar from "../components/Sidebar";
import ProgramUnit from "../components/ProgramUnit";
import FeedHopper from "../components/FeedHopper";
import FlippyTutorial from "../components/FlippyTutorial";
import { LEVELS } from "../lib/levels";

const TUTORIAL_DECK = [
  "      WRITE(6, 10)",
  "10    FORMAT(11HHELLO WORLD)",
  "      STOP",
  "      END",
];

export default function Home() {
  const [currentCols, setCurrentCols] = useState<string[]>(Array(80).fill(" "));
  const [colIdx, setColIdx] = useState<number>(0);
  const [readCard, setReadCard] = useState<string[] | null>(null);
  const [stacker, setStacker] = useState<string[][]>([]);
  const [inspectingIdx, setInspectingIdx] = useState<number | null>(null);

  const progControl = true;
  
  // LIVE HOPPER STATE (Starts at 500 cards)
  const [hopperCount, setHopperCount] = useState<number>(500);
  const [escapementKick, setEscapementKick] = useState(false);

  const [printerOutput, setPrinterOutput] = useState<string[]>([
    "IBM SYSTEM/360 OPERATING SYSTEM - READY FOR BATCH JOB",
    "LOAD CARD DECK INTO HOPPER AND PRESS [FEED DECK TO RUNNER]"
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompiled, setHasCompiled] = useState(false);
  const [tutorialCardIndex, setTutorialCardIndex] = useState(0);
  const [lastReleaseCorrect, setLastReleaseCorrect] = useState<boolean | null>(null);
  const [releaseRevision, setReleaseRevision] = useState(0);
  const [scrapRevision, setScrapRevision] = useState(0);
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const [helloWorldComplete, setHelloWorldComplete] = useState(false);
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | null>(null);
  const [ambienceVolume, setAmbienceVolumeState] = useState(0.2);
  const [objectivePosition, setObjectivePosition] = useState<{ left: number; top: number } | null>(null);
  const objectiveDragRef = useRef<{ offsetX: number; offsetY: number; width: number; height: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const colIdxRef = useRef(colIdx);
  const currentColsRef = useRef(currentCols);
  const readCardRef = useRef(readCard);
  const progControlRef = useRef(progControl);
  const stackerLengthRef = useRef(stacker.length);
  const hopperCountRef = useRef(hopperCount);

  useEffect(() => {
    preloadAudio();
  }, []);

  useEffect(() => {
    colIdxRef.current = colIdx;
    currentColsRef.current = currentCols;
    readCardRef.current = readCard;
    progControlRef.current = progControl;
    stackerLengthRef.current = stacker.length;
    hopperCountRef.current = hopperCount;
  }, [colIdx, currentCols, readCard, progControl, stacker.length, hopperCount]);

  useEffect(() => {
    const handleButtonHover = (event: PointerEvent) => {
      const button = (event.target as HTMLElement).closest("button");
      if (button) playHoverSound(button);
    };
    const handleButtonClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest("button");
      if (button && !button.hasAttribute("data-paper-action")) {
        initAudio();
        playButtonSound();
      }
    };
    document.addEventListener("pointerover", handleButtonHover);
    document.addEventListener("click", handleButtonClick);
    return () => {
      document.removeEventListener("pointerover", handleButtonHover);
      document.removeEventListener("click", handleButtonClick);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!objectiveDragRef.current) return;
      const { offsetX, offsetY, width, height } = objectiveDragRef.current;
      setObjectivePosition({
        left: Math.min(Math.max(16, event.clientX - offsetX), window.innerWidth - width - 16),
        top: Math.min(Math.max(16, event.clientY - offsetY), window.innerHeight - height - 16),
      });
    };
    const handlePointerUp = () => {
      objectiveDragRef.current = null;
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const startObjectiveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const panel = event.currentTarget.parentElement;
    if (!panel) return;
    const bounds = panel.getBoundingClientRect();
    setObjectivePosition({ left: bounds.left, top: bounds.top });
    objectiveDragRef.current = {
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      width: bounds.width,
      height: bounds.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  
  const dupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerEscapementKick = useCallback(() => {
    setEscapementKick(true);
    setTimeout(() => setEscapementKick(false), 45);
  }, []);

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
  }, [triggerEscapementKick]);

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
    playPaperEnterSound();
    triggerEscapementKick();
    
    // Decrement Hopper
    setHopperCount((prev) => Math.max(0, prev - 1));

    const finalCard = [...currentColsRef.current];
    const challengeCards = activeLevel ? LEVELS[activeLevel - 1].cards : TUTORIAL_DECK;
    const expectedCard = challengeCards[tutorialCardIndex];
    const releaseIsCorrect = activeLevel
      ? Boolean(expectedCard)
      : expectedCard
        ? finalCard.slice(0, 72).join("").trimEnd() === expectedCard
        : null;
    setLastReleaseCorrect(releaseIsCorrect);
    setReleaseRevision((revision) => revision + 1);
    if (releaseIsCorrect) {
      setTutorialCardIndex((index) => Math.min(challengeCards.length, index + 1));
    }

    if (progControlRef.current) {
      const seqNumber = String((stackerLengthRef.current + 1) * 10).padStart(8, "0");
      for (let i = 0; i < 8; i++) {
        if (finalCard[72 + i] === " ") {
          finalCard[72 + i] = seqNumber[i];
        }
      }
    }

    if (releaseIsCorrect === false) {
      setStacker((prev) => [...prev, finalCard]);
      setReadCard(finalCard);
      setInspectingIdx(null);
      setCurrentCols(Array(80).fill(" "));
      setColIdx(0);
      return;
    }

    setStacker((prev) => [...prev, finalCard]);
    setReadCard(finalCard);
    setCurrentCols(Array(80).fill(" "));
    setColIdx(0);
  }, [activeLevel, tutorialCardIndex, triggerEscapementKick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent) => {
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
      if (cur < 6) {
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
  }, [colIdx, currentCols, inspectingIdx, releaseCard, startDup, triggerEscapementKick]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === containerRef.current) return;

      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select") &&
        e.key.length !== 1
      ) {
        return;
      }

      containerRef.current?.focus();
      handleKeyDown(e);
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleKeyDown]);

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Alt" || e.key === "Control") {
      e.preventDefault();
      stopDup();
    }
  };

  const handleScrapDeck = () => {
    playFeedSound();
    playLockSound();
    playPaperDeckSound();
    setStacker([]);
    setReadCard(null);
    setCurrentCols(Array(80).fill(" "));
    setColIdx(0);
    setInspectingIdx(null);
  };

  const handleExecuteDeck = async () => {
    playCompileSound();
    playReaderSound();
    setIsRunning(true);

    const fullDeck = [...stacker];
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
    const challengeCards = activeLevel ? LEVELS[activeLevel - 1].cards : TUTORIAL_DECK;
    const isChallengeDeck = activeLevel
      ? cardsPayload.length === challengeCards.length
      : cardsPayload.length === TUTORIAL_DECK.length &&
        cardsPayload.every((card, index) => card.slice(0, 72).trimEnd() === TUTORIAL_DECK[index]);

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
      setHasCompiled(true);

      const outputLines = (data.output || "").split("\n");
      const outputText = outputLines.join("\n");
      const outputMatchesChallenge = activeLevel
        ? LEVELS[activeLevel - 1].acceptedOutput.test(outputText)
        : outputText.toUpperCase().includes("HELLO WORLD");
      if (isChallengeDeck && outputMatchesChallenge) setHelloWorldComplete(true);

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
    <div className="h-dvh overflow-hidden bg-[#141618] text-[#c5cfd6] flex">
      {tutorialVisible && (
        <FlippyTutorial
          key={activeLevel ?? "tutorial"}
          completed={helloWorldComplete}
          tutorialCardIndex={tutorialCardIndex}
          lastReleaseCorrect={lastReleaseCorrect}
          releaseRevision={releaseRevision}
          scrapRevision={scrapRevision}
          hasCompiled={hasCompiled}
          hasOutput={printerOutput.includes("END OF BATCH OUTPUT")}
          activeLevel={activeLevel}
          challengeCards={activeLevel ? LEVELS[activeLevel - 1].cards : TUTORIAL_DECK}
          challengeTitle={activeLevel ? LEVELS[activeLevel - 1].title : "Hello World"}
          challengePrompt={activeLevel ? LEVELS[activeLevel - 1].prompt : null}
          onDismiss={() => setTutorialVisible(false)}
          onScrapCard={() => {
            playPaperEnterSound();
            setStacker((prev) => {
              const indexToRemove = inspectingIdx ?? prev.length - 1;
              if (indexToRemove < 0) return prev;
              return prev.filter((_, index) => index !== indexToRemove);
            });
            setInspectingIdx(null);
            setScrapRevision(releaseRevision);
          }}
        />
      )}
      <Sidebar 
        onScrapDeck={handleScrapDeck} 
        onEnterCodeEditor={() => setTutorialVisible(false)}
        ambienceVolume={ambienceVolume}
        onAmbienceVolumeChange={(volume) => {
          setAmbienceVolumeState(volume);
          setAmbienceVolume(volume);
        }}
        interactionDisabled={tutorialVisible}
        onSelectTutorial={() => {
          setActiveLevel(null);
          setTutorialCardIndex(0);
          setHelloWorldComplete(false);
          setTutorialVisible(true);
        }}
        onSelectLevel={(level) => {
          setActiveLevel(level);
          setTutorialCardIndex(0);
          setHelloWorldComplete(false);
          setLastReleaseCorrect(null);
          setReleaseRevision(0);
          setScrapRevision(0);
          setTutorialVisible(true);
          setStacker([]);
          setReadCard(null);
          setCurrentCols(Array(80).fill(" "));
          setColIdx(0);
        }}
      />

      {activeLevel && (
        <aside
          className="fixed z-[60] h-[120px] min-h-[96px] min-w-[240px] w-[min(360px,calc(100vw-6rem))] resize overflow-hidden border border-[#8d7546] bg-[#1b2126]/95 font-mono shadow-[0_8px_24px_rgba(0,0,0,0.55)] backdrop-blur-sm"
          style={objectivePosition ? { left: objectivePosition.left, top: objectivePosition.top } : { right: "1rem", bottom: "1rem" }}
          aria-label="Level objective"
        >
          <div
            className="cursor-move select-none border-b border-[#594d37] bg-[#242b31] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#e4c46d]"
            onPointerDown={startObjectiveDrag}
            title="Drag to move"
          >
            LEVEL {activeLevel} OBJECTIVE
          </div>
          <div className="p-3 text-[11px] leading-relaxed text-[#d1d8dc]">
            {LEVELS[activeLevel - 1].prompt}
          </div>
        </aside>
      )}

      <main
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={() => {
          initAudio();
          containerRef.current?.focus();
        }}
        className="flex-1 min-w-0 min-h-0 ml-16 p-3 lg:p-5 flex flex-col items-center gap-3 font-sans outline-none select-none relative z-10"
      >
        <div id="ibm-machine" className="workstation-content w-full max-w-6xl flex-none flex flex-col gap-3">
        <div className="no-scrollbar w-full flex-none overflow-hidden bg-[#37414b] border-[10px] border-[#252c33] rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.05)] flex flex-col relative">
          
          <div id="machine-header" className="bg-[#1e242a] border-b-2 border-[#15191d] px-6 py-3.5 flex justify-between items-center text-[#e1e4e6] shadow-[inset_0_-2px_10px_rgba(0,0,0,0.5)]">
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
            
            <div id="card-stacker" className="order-3 col-span-5 bg-[#1c2126] border-2 border-[#121518] rounded-sm shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex flex-col h-[300px]">
              <div className="bg-[#171b1f] px-4 py-2 border-b border-[#252c33] flex justify-between items-center shadow-md z-10">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#a0aab2] uppercase">
                  Card Stacker (Completed Deck)
                </span>
                <span className="text-[9px] font-mono font-bold text-[#718494] bg-[#0c0e10] px-2 py-0.5 rounded border border-[#232930]">
                  {stacker.length} CARDS
                </span>
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto p-4 bg-[#1e2329] relative">
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
                          className={`punch-card-entry punch-card-interactive relative w-full cursor-pointer ${
                            idx !== 0 ? "-mt-[112px]" : ""
                          } ${
                            isInspected 
                              ? "z-30 shadow-[0_12px_24px_rgba(0,0,0,0.8)]" 
                              : "hover:brightness-105 hover:z-20 hover:-translate-y-3 transition-transform shadow-[0_-1px_3px_rgba(0,0,0,0.5)]"
                          }`}
                          style={{ animationDelay: `${Math.min(idx, 8) * 45}ms`, transition: "transform 220ms ease, filter 220ms ease, z-index 0ms linear 0ms" }}
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
            />

          </div>

          {/* MIDDLE BED */}
          <div id="punch-bed" className="bg-[#242b32] p-5 border-b-4 border-[#181d22] flex flex-col gap-2 relative shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]">
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
                      data-paper-action="true"
                      onClick={() => {
                        playPaperEnterSound();
                        setStacker((prev) => prev.filter((_, i) => i !== inspectingIdx));
                        setInspectingIdx(null);
                        setScrapRevision(releaseRevision);
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
                  <span>PUNCH STATION (PUNCH DIES)</span>
                  <span>ACTIVE CARD • COLUMN {Math.min(colIdx + 1, 80)}</span>
                </div>

                <div className="px-2 py-1 bg-[#191f24] border border-[#2b353e] rounded-sm p-5 shadow-inner">
                  <PunchCard columns={currentCols} activeColIdx={colIdx} />
                </div>
              </>
            )}

            <div className="w-full h-2 bg-gradient-to-b from-stone-400 via-stone-100 to-stone-300 border-y border-stone-600 rounded-sm shadow-sm" />
          </div>

          <div className="bg-[#313942] px-8 py-4 flex flex-wrap justify-center items-center gap-4">
            <div id="key-help" className="flex flex-wrap justify-center items-center gap-2 text-[10px] font-mono text-[#a5b2bc] uppercase tracking-wider">
              <span className="bg-[#1c2228] px-2.5 py-1 border border-[#3b4752] shadow-inner"><kbd className="font-bold text-[#e0c482] mr-1.5">TAB</kbd> FIELD SKIP</span>
              <span className="bg-[#1c2228] px-2.5 py-1 border border-[#3b4752] shadow-inner"><kbd className="font-bold text-[#e0c482] mr-1.5">ALT/CTRL</kbd> DUPLICATE</span>
              <span className="bg-[#1c2228] px-2.5 py-1 border border-[#3b4752] shadow-inner"><kbd className="font-bold text-[#e0c482] mr-1.5">ENTER</kbd> RELEASE</span>
              <span className="bg-[#1c2228] px-2.5 py-1 border border-[#3b4752] shadow-inner"><kbd className="font-bold text-[#d66b6b] mr-1.5">ESC</kbd> CLEAR / RETURN</span>
            </div>

          </div>
        </div>

        <div id="line-printer" className="w-full flex-none h-[clamp(145px,22vh,220px)] shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded overflow-hidden border-4 border-[#252c33]">
          <div className="bg-[#1f252b] px-4 py-2 border-b border-[#2b333c] flex flex-wrap gap-2 justify-between items-center text-[10px] font-mono text-[#748494] tracking-wider uppercase">
            <span className="font-bold text-[#b5c1cc]">IBM 1403 LINE PRINTER • CONTINUOUS STATIONERY FORM</span>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">132 COLUMNS • 1100 LINES/MIN</span>
              <button
                id="compile-button"
                onClick={handleExecuteDeck}
                disabled={isRunning}
                className={`px-4 py-1.5 rounded-sm text-[10px] font-mono font-bold tracking-widest transition-all shadow-[0_2px_6px_rgba(0,0,0,0.6)] border ${
                  isRunning ? "bg-[#61451f] border-[#8a6531] text-[#c9a777] cursor-wait" : "bg-[#25b866] hover:bg-[#35d77b] active:translate-y-[1px] active:shadow-none border-[#69e99a] text-[#f0fff5]"
                }`}
              >
                {isRunning ? "READING..." : "COMPILE"}
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-42px)] flex bg-[#f0f5f0] text-[#1c2b1e]">
            <div className="w-7 border-r border-[#d4ded4] flex-shrink-0" style={{ backgroundImage: "radial-gradient(circle, #252c33 3.5px, transparent 4px)", backgroundSize: "28px 20px", backgroundPosition: "center 8px" }} />

            <div id="output-code" className="flex-1 p-5 font-mono text-xs overflow-auto">
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
        </div>
      </main>
    </div>
  );
}