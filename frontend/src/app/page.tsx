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
  playPaperScrapSound,
  playPaperDeckSound,
  playHoverSound,
  playButtonSound,
  preloadAudio,
  setAmbienceVolume,
  playCompileSound,
  playErrorSound,
} from "../lib/audio";
import { HOLLERITH_MAP, ROWS } from "../lib/hollerith";
import PunchCard from "../components/PunchCard";

import Sidebar from "../components/Sidebar";
import ProgramUnit from "../components/ProgramUnit";
import FeedHopper from "../components/FeedHopper";
import FlippyTutorial from "../components/FlippyTutorial";
import { getLevel, LevelId } from "../lib/levels";

const TUTORIAL_DECK = [
  "      WRITE(6, 10)",
  "10    FORMAT(11HHELLO WORLD)",
  "      STOP",
  "      END",
];

const CHEAT_SHEET = {
  Python: [
    ["Variables", "x = 4"],
    ["Output", "print(x)"],
    ["Loop", "for i in range(1, 6):"],
    ["Condition", "if x == 4:"],
    ["Stop", "return / exit()"],
  ],
  JavaScript: [
    ["Variables", "let x = 4;"],
    ["Output", "console.log(x);"],
    ["Loop", "for (let i = 1; i <= 5; i++)"],
    ["Condition", "if (x === 4)"],
    ["Stop", "return;"],
  ],
  FORTRAN: [
    ["Variables", "X = 4"],
    ["Output", "WRITE(6, 10) X"],
    ["Loop", "DO 10 I = 1, 5"],
    ["Condition", "IF (X - 4) 20, 10, 20"],
    ["Stop", "STOP  /  END"],
  ],
} as const;
type CheatSheetLanguage = keyof typeof CHEAT_SHEET;

export default function Home() {
  const [currentCols, setCurrentCols] = useState<string[]>(Array(80).fill(" "));
  const [colIdx, setColIdx] = useState<number>(0);
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
  const [compilerFullscreen, setCompilerFullscreen] = useState(false);
  const [compilerErrorShake, setCompilerErrorShake] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState(false);
  const [hasCompiled, setHasCompiled] = useState(false);
  const [tutorialCardIndex, setTutorialCardIndex] = useState(0);
  const [lastReleaseCorrect, setLastReleaseCorrect] = useState<boolean | null>(null);
  const [pendingScrap, setPendingScrap] = useState(false);
  const [releaseRevision, setReleaseRevision] = useState(0);
  const [scrapRevision, setScrapRevision] = useState(0);
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const [helloWorldComplete, setHelloWorldComplete] = useState(false);
  const [openLevelsRequest, setOpenLevelsRequest] = useState(0);
  const [guideSession, setGuideSession] = useState(0);
  const [activeLevel, setActiveLevel] = useState<LevelId | null>(null);
  const [ambienceVolume, setAmbienceVolumeState] = useState(0.2);
  const [objectivePosition, setObjectivePosition] = useState<{ left: number; top: number } | null>(null);
  const [objectiveHidden, setObjectiveHidden] = useState(false);
  const [showLevelHint, setShowLevelHint] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [cheatSheetLanguage, setCheatSheetLanguage] = useState<CheatSheetLanguage>("FORTRAN");
  const objectiveDragRef = useRef<{ offsetX: number; offsetY: number; width: number; height: number } | null>(null);
  const stackerScrollRef = useRef<HTMLDivElement>(null);
  const newestCardRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const colIdxRef = useRef(colIdx);
  const currentColsRef = useRef(currentCols);
  const readCardRef = useRef<string[] | null>(null);
  const progControlRef = useRef(progControl);
  const stackerLengthRef = useRef(stacker.length);
  const hopperCountRef = useRef(hopperCount);
  const compilerErrorShakeTimerRef = useRef<number | null>(null);
  const successFeedbackTimerRef = useRef<number | null>(null);

  const triggerCompilerError = useCallback(() => {
    playErrorSound();
    setCompilerErrorShake(false);
    if (compilerErrorShakeTimerRef.current !== null) {
      window.clearTimeout(compilerErrorShakeTimerRef.current);
    }
    window.requestAnimationFrame(() => setCompilerErrorShake(true));
    compilerErrorShakeTimerRef.current = window.setTimeout(() => {
      setCompilerErrorShake(false);
      compilerErrorShakeTimerRef.current = null;
    }, 360);
  }, []);

  const triggerSuccessFeedback = useCallback(() => {
    setSuccessFeedback(false);
    if (successFeedbackTimerRef.current !== null) {
      window.clearTimeout(successFeedbackTimerRef.current);
    }
    window.requestAnimationFrame(() => setSuccessFeedback(true));
    successFeedbackTimerRef.current = window.setTimeout(() => {
      setSuccessFeedback(false);
      successFeedbackTimerRef.current = null;
    }, 480);
  }, []);

  const resetDeck = useCallback(() => {
    setStacker([]);
    readCardRef.current = null;
    setInspectingIdx(null);
    setCurrentCols(Array(80).fill(" "));
    setColIdx(0);
    setLastReleaseCorrect(null);
    setPendingScrap(false);
    setReleaseRevision(0);
    setScrapRevision(0);
    setHasCompiled(false);
    setPrinterOutput([
      "IBM SYSTEM/360 OPERATING SYSTEM - READY FOR BATCH JOB",
      "LOAD CARD DECK INTO HOPPER AND PRESS [FEED DECK TO RUNNER]",
    ]);
  }, []);

  useEffect(() => {
    preloadAudio();
  }, []);

  useEffect(() => {
    colIdxRef.current = colIdx;
    currentColsRef.current = currentCols;
    progControlRef.current = progControl;
    stackerLengthRef.current = stacker.length;
    hopperCountRef.current = hopperCount;
  }, [colIdx, currentCols, progControl, stacker.length, hopperCount]);

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
      currentColsRef.current = next;
      return next;
    });
    const nextCol = Math.min(80, col + 1);
    colIdxRef.current = nextCol;
    setColIdx(nextCol);
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
    const handleFullscreenKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCompilerFullscreen(false);
    };
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("keydown", handleFullscreenKey);
    return () => {
      stopDup();
      if (compilerErrorShakeTimerRef.current !== null) {
        window.clearTimeout(compilerErrorShakeTimerRef.current);
      }
      if (successFeedbackTimerRef.current !== null) {
        window.clearTimeout(successFeedbackTimerRef.current);
      }
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleFullscreenKey);
    };
  }, [stopDup]);

  useEffect(() => {
    if (stacker.length === 0) return;
    window.requestAnimationFrame(() => {
      const stackerElement = stackerScrollRef.current;
      if (stackerElement) {
        stackerElement.scrollTo({ top: stackerElement.scrollHeight, behavior: "smooth" });
      }
      newestCardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, [stacker.length]);

  // LIVE HOPPER LOGIC
  const releaseCard = useCallback(() => {
    if (hopperCountRef.current <= 0) {
      playLockSound();
      return; // Cannot feed if hopper is empty
    }

    const challengeCards = activeLevel ? getLevel(activeLevel).cards : TUTORIAL_DECK;
    const hasPunchedContent = currentColsRef.current.join("").trim().length > 0;
    // The guide requires an incorrect card to be scrapped before retrying.
    // Once the guide is dismissed, operators should still be able to punch
    // and release cards without being trapped by that tutorial-only guard.
    if (
      !hasPunchedContent ||
      (tutorialVisible && (tutorialCardIndex >= challengeCards.length || pendingScrap))
    ) {
      playLockSound();
      return;
    }

    playFeedSound();
    playPaperEnterSound();
    triggerEscapementKick();
    
    // Decrement Hopper
    setHopperCount((prev) => Math.max(0, prev - 1));

    const finalCard = [...currentColsRef.current];
    const expectedCard = challengeCards[tutorialCardIndex];
    const releaseIsCorrect = expectedCard
      ? finalCard.slice(0, 72).join("").trimEnd() === expectedCard
      : null;
    setLastReleaseCorrect(releaseIsCorrect);
    setPendingScrap(releaseIsCorrect === false);
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
      readCardRef.current = finalCard;
      setInspectingIdx(null);
      const emptyCard = Array(80).fill(" ");
      currentColsRef.current = emptyCard;
      colIdxRef.current = 0;
      setCurrentCols(emptyCard);
      setColIdx(0);
      return;
    }

    setStacker((prev) => [...prev, finalCard]);
    readCardRef.current = finalCard;
    const emptyCard = Array(80).fill(" ");
    currentColsRef.current = emptyCard;
    colIdxRef.current = 0;
    setCurrentCols(emptyCard);
    setColIdx(0);
  }, [activeLevel, pendingScrap, tutorialCardIndex, tutorialVisible, triggerEscapementKick]);

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
      const cur = colIdxRef.current;
      if (cur < 6) {
        colIdxRef.current = 6;
        setColIdx(6);
      } else if (cur < 72) {
        colIdxRef.current = 72;
        setColIdx(72);
      } else if (cur < 79) {
        colIdxRef.current = 79;
        setColIdx(79);
      } else {
        playLockSound();
      }
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      playLockSound();
      return;
    }

    const currentCol = colIdxRef.current;
    if (currentCol >= 80) {
      playLockSound();
      return;
    }

    const char = e.key.toUpperCase();
    if (char.length === 1 && currentCol < 80) {
      if (char in HOLLERITH_MAP) {
        playPunchSound();
        triggerEscapementKick();
        const next = [...currentColsRef.current];
        next[currentCol] = char;
        currentColsRef.current = next;
        setCurrentCols(next);

        const nextCol = progControlRef.current && currentCol === 71
          ? 72
          : Math.min(80, currentCol + 1);
        colIdxRef.current = nextCol;
        if (progControlRef.current && currentCol === 71) {
          setColIdx(72);
        } else {
          setColIdx(nextCol);
        }
      } else {
        playLockSound();
      }
    }
  }, [inspectingIdx, releaseCard, startDup, triggerEscapementKick]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isControl = target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select");
      if (e.key === "Enter" && !isControl) {
        e.preventDefault();
        e.stopPropagation();
        containerRef.current?.focus();
        releaseCard();
        return;
      }

      if (document.activeElement === containerRef.current) return;

      if (
        isControl &&
        e.key.length !== 1
      ) {
        return;
      }

      containerRef.current?.focus();
      handleKeyDown(e);
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, true);

  }, [handleKeyDown, releaseCard]);

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
    readCardRef.current = null;
    setCurrentCols(Array(80).fill(" "));
    setColIdx(0);
    setInspectingIdx(null);
  };

  const openCodeEditor = () => {
    const cards = [...stacker];
    const activeText = currentCols.join("").trimEnd();
    if (activeText.length > 0) cards.push(currentCols);
    const source = cards.map((card) => card.join("").padEnd(80, " ").slice(0, 80)).join("\n");
    if (!source) {
      playLockSound();
      return;
    }
    const file = new Blob([`${source}\n`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "punchcode-deck.f";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDeck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const cards = reader.result
        .replace(/\r\n/g, "\n")
        .split("\n")
        .filter((line, index, lines) => line.length > 0 || index < lines.length - 1)
        .map((line) => line.slice(0, 80).padEnd(80, " ").split(""));
      if (cards.length === 0) {
        setPrinterOutput(["*** FILE REJECTED ***", "The selected FORTRAN file contains no cards."]);
        return;
      }
      setStacker(cards);
      readCardRef.current = cards[cards.length - 1] ?? null;
      setCurrentCols(Array(80).fill(" "));
      setColIdx(0);
      setInspectingIdx(null);
      setPendingScrap(false);
      setLastReleaseCorrect(null);
      setPrinterOutput([`IMPORTED ${cards.length} CARDS FROM ${file.name}`, "DECK LOADED INTO CARD STACKER."]);
    };
    reader.onerror = () => setPrinterOutput(["*** FILE READ ERROR ***", "Unable to read the selected FORTRAN deck."]);
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleExecuteDeck = async () => {
    playReaderSound();
    setIsRunning(true);

    const fullDeck = [...stacker];
    const activeText = currentCols.join("").trim();
    if (activeText.length > 0) fullDeck.push(currentCols);

    if (fullDeck.length === 0) {
      playLockSound();
      triggerCompilerError();
      setPrinterOutput([
        "*** JOB REJECTED ***",
        "CARD HOPPER & STACKER EMPTY. NO SOURCE DECK TO READ."
      ]);
      setIsRunning(false);
      return;
    }

    const cardsPayload = fullDeck.map((c) => c.join(""));
    const isTutorialDeck = !activeLevel &&
      cardsPayload.length === TUTORIAL_DECK.length &&
      cardsPayload.every((card, index) => card.slice(0, 72).trimEnd() === TUTORIAL_DECK[index]);

    setPrinterOutput([
      `IBM 2501 CARD READER: INGESTED ${fullDeck.length} CARDS`,
      "TRANSMITTING DECK TO FORTRAN COMPILER RUNNER (PORT 8000)...",
      "--------------------------------------------------"
    ]);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: cardsPayload, stdin: "" })
      });

      const data = await res.json();
      playPrinterSound();
      setHasCompiled(true);
      if (data.is_error) {
        triggerCompilerError();
      } else {
        playCompileSound();
      }

      const outputLines = (data.output || "").split("\n");
      const outputText = outputLines.map((line: string) => line.trimEnd()).join("\n").trim();
      const outputMatchesChallenge = activeLevel
        ? getLevel(activeLevel).acceptedOutput.test(outputText)
        : outputText.toUpperCase().includes("HELLO WORLD");
      const outputIsSuccessful = !data.is_error && outputMatchesChallenge;
      const levelAccepted = Boolean(activeLevel && outputIsSuccessful);
      const tutorialAccepted = Boolean(!activeLevel && isTutorialDeck && outputIsSuccessful);
      if (levelAccepted || tutorialAccepted) {
        triggerSuccessFeedback();
        setHelloWorldComplete(true);
      }

      setPrinterOutput([
        `BATCH JOB EXECUTION REPORT • ${fullDeck.length} CARDS PROCESSED`,
        levelAccepted
          ? "STATUS: LEVEL OUTPUT ACCEPTED"
          : data.is_error
          ? "STATUS: COMPILATION / EXECUTION ERROR"
          : "STATUS: EXECUTION SUCCESSFUL (RC=0000)",
        "==================================================",
        ...outputLines,
        "==================================================",
        "END OF BATCH OUTPUT"
      ]);
    } catch {
      playLockSound();
      triggerCompilerError();
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
    <div className="min-h-dvh overflow-x-hidden overflow-y-auto bg-[#141618] text-[#c5cfd6] flex">
      {tutorialVisible && (
        <FlippyTutorial
          key={`${activeLevel ?? "tutorial"}-${guideSession}`}
          completed={helloWorldComplete}
          tutorialCardIndex={tutorialCardIndex}
          lastReleaseCorrect={lastReleaseCorrect}
          releaseRevision={releaseRevision}
          scrapRevision={scrapRevision}
          hasCompiled={hasCompiled}
          hasOutput={printerOutput.includes("END OF BATCH OUTPUT")}
          activeLevel={activeLevel}
          challengeCards={activeLevel ? getLevel(activeLevel).cards : TUTORIAL_DECK}
          challengeTitle={activeLevel ? getLevel(activeLevel).title : "Hello World"}
          challengePrompt={activeLevel ? getLevel(activeLevel).prompt : ""}
          onLevelComplete={() => {
            setHelloWorldComplete(false);
            setTutorialVisible(false);
            setOpenLevelsRequest((request) => request + 1);
          }}
          onDismiss={() => setTutorialVisible(false)}
          onScrapCard={() => {
            playPaperScrapSound();
            setStacker((prev) => {
              const indexToRemove = inspectingIdx ?? prev.length - 1;
              if (indexToRemove < 0) return prev;
              return prev.filter((_, index) => index !== indexToRemove);
            });
            setInspectingIdx(null);
            setScrapRevision(releaseRevision);
            setLastReleaseCorrect(null);
            setPendingScrap(false);
          }}
        />
      )}
      {activeLevel && helloWorldComplete && !tutorialVisible && (
        <div className="pointer-events-auto fixed inset-0 z-[70] flex items-center justify-center bg-[#07100b]/75 p-6 backdrop-blur-[2px]">
          <div className="success-burst w-[min(420px,calc(100vw-2rem))] border-2 border-[#9be2b0] bg-[#14251a] p-6 text-center font-mono shadow-[0_0_0_1px_rgba(155,226,176,0.25),0_0_35px_rgba(80,220,120,0.35)]">
            <div className="text-xl font-black tracking-[0.16em] text-[#d9ffe3]">{getLevel(activeLevel).title} accepted</div>
            <button
              type="button"
              onClick={() => setHelloWorldComplete(false)}
              className="mt-5 border border-[#9be2b0] bg-[#28543a] px-4 py-2 text-[10px] font-bold tracking-wider text-[#d9ffe3] hover:bg-[#34704d]"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
      <Sidebar 
        onScrapDeck={handleScrapDeck} 
        onEnterCodeEditor={openCodeEditor}
        ambienceVolume={ambienceVolume}
        onAmbienceVolumeChange={(volume) => {
          setAmbienceVolumeState(volume);
          setAmbienceVolume(volume);
        }}
        interactionDisabled={tutorialVisible}
        openLevelsRequest={openLevelsRequest}
        onOpenCheatSheet={() => setCheatSheetOpen((open) => !open)}
        onCloseCheatSheet={() => setCheatSheetOpen(false)}
        onSelectTutorial={() => {
          setActiveLevel(null);
          setObjectiveHidden(false);
          setShowLevelHint(false);
          setTutorialCardIndex(0);
          setHelloWorldComplete(false);
          resetDeck();
          setGuideSession((session) => session + 1);
          setTutorialVisible(true);
        }}
        onSelectLevel={(level) => {
          setActiveLevel(level);
          setObjectiveHidden(false);
          setShowLevelHint(false);
          setTutorialCardIndex(0);
          setHelloWorldComplete(false);
          resetDeck();
          setGuideSession((session) => session + 1);
          setTutorialVisible(true);
        }}
      />
      <input
        id="deck-file-input"
        type="file"
        accept=".f,text/plain"
        onChange={importDeck}
        className="hidden"
        aria-label="Import FORTRAN deck file"
      />

      {cheatSheetOpen && (
        <aside
          className="fixed left-1/2 top-1/2 z-[75] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 border-2 border-[#7fc8ff]/60 bg-[#151a1f]/98 p-[clamp(0.75rem,2vw,1.25rem)] font-mono text-[#d9e0e4] shadow-[0_18px_50px_rgba(0,0,0,0.8)]"
          aria-label="Programming cheat sheet"
        >
          <div className="mb-3 flex items-center justify-between border-b border-[#35414b] pb-2">
            <div className="flex items-center gap-2 text-xs font-black tracking-[0.18em] text-[#b8e7ff]">
              <span aria-hidden="true">BOOK</span> NOTES
            </div>
            <button type="button" aria-label="Close code cheat sheet" onClick={() => setCheatSheetOpen(false)} className="px-2 text-lg text-[#8d9aa4] hover:text-[#b8e7ff]">×</button>
          </div>
          <p className="mb-3 text-[10px] leading-relaxed text-[#9eabb4]">
            Common commands translated between three languages. Select a tab to compare syntax.
          </p>
          <div className="mb-3 flex border-b border-[#35414b]">
            {(Object.keys(CHEAT_SHEET) as CheatSheetLanguage[]).map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => setCheatSheetLanguage(language)}
                className={`flex-1 border-b-2 px-2 py-2 text-[10px] font-bold uppercase tracking-wider ${
                  cheatSheetLanguage === language
                    ? "border-[#f5d996] text-[#f5d996]"
                    : "border-transparent text-[#82909b] hover:text-[#d9e0e4]"
                }`}
              >
                {language}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 text-[clamp(9px,1.2vw,11px)] sm:grid-cols-2">
            {CHEAT_SHEET[cheatSheetLanguage].map(([command, syntax]) => (
              <div key={command} className="flex items-center justify-between gap-3 border border-[#35414b] bg-[#1d252b] p-2">
                <span className="text-[#8f9da6]">{command}</span>
                <code className="text-right text-[#f5d996]">{syntax}</code>
              </div>
            ))}
          </div>
        </aside>
      )}

      {activeLevel && !objectiveHidden && (
        <aside
          className="fixed z-[60] flex min-h-[96px] min-w-[240px] w-[min(360px,calc(100vw-6rem))] resize flex-col overflow-visible border border-[#8d7546] bg-[#1b2126]/95 font-mono shadow-[0_8px_24px_rgba(0,0,0,0.55)] backdrop-blur-sm"
          style={objectivePosition ? { left: objectivePosition.left, top: objectivePosition.top } : { right: "1rem", bottom: "1rem" }}
          aria-label="Level objective"
        >
          <div
            className="shrink-0 cursor-move select-none overflow-hidden text-ellipsis whitespace-nowrap border-b border-[#594d37] bg-[#242b31] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#e4c46d]"
            onPointerDown={startObjectiveDrag}
            title="Drag to move"
          >
            LEVEL {activeLevel}: {getLevel(activeLevel).title}
            <button
              type="button"
              aria-label="Hide level objective"
              onClick={() => setObjectiveHidden(true)}
              onPointerDown={(event) => event.stopPropagation()}
              className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center border border-[#6f603f] p-0 text-[10px] leading-none text-[#cdb56f] hover:border-[#e4c46d] hover:text-[#f5d996]"
            >
              ×
            </button>
          </div>
          <div className="p-3 text-[11px] leading-relaxed text-[#d1d8dc] break-words">
            <p>{getLevel(activeLevel).prompt}</p>
            {showLevelHint && (
              <p className="mt-2 border-t border-[#594d37] pt-2 text-[#e4c46d]">
                HINT: {getLevel(activeLevel).hint}
              </p>
            )}
          </div>
          <div className="shrink-0 border-t border-[#594d37] bg-[#242b31] px-3 py-2">
            <button
              type="button"
              onClick={() => setShowLevelHint((visible) => !visible)}
              onPointerDown={(event) => event.stopPropagation()}
              className="border border-[#8d7546] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#e4c46d] hover:bg-[#343b40]"
            >
              {showLevelHint ? "Hide hint" : "Hint"}
            </button>
          </div>
        </aside>
      )}
      {activeLevel && objectiveHidden && (
        <button
          type="button"
          onClick={() => setObjectiveHidden(false)}
          className="fixed bottom-4 right-4 z-[60] border border-[#8d7546] bg-[#1b2126]/95 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#e4c46d] shadow-[0_8px_24px_rgba(0,0,0,0.55)] hover:bg-[#343b40]"
        >
          Show objective
        </button>
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
        className={`flex-1 min-w-0 min-h-0 ml-16 p-3 lg:p-5 flex flex-col items-center gap-3 font-sans outline-none select-none relative z-10 ${compilerErrorShake ? "compiler-error-shake" : successFeedback ? "compiler-success-feedback" : ""}`}
      >
        <div id="ibm-machine" className={`workstation-content w-full max-w-6xl flex-none flex flex-col gap-3 ${compilerFullscreen ? "compiler-fullscreen" : ""}`}>
        <div className={`no-scrollbar w-full flex-none overflow-hidden bg-[#37414b] border-[10px] border-[#252c33] rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.05)] flex flex-col relative ${compilerFullscreen ? "hidden" : ""}`}>
          
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
                  Card Stacker
                </span>
                <span className="text-[9px] font-mono font-bold text-[#718494] bg-[#0c0e10] px-2 py-0.5 rounded border border-[#232930]">
                  {stacker.length} CARDS
                </span>
              </div>

              <div ref={stackerScrollRef} className="no-scrollbar flex-1 overflow-y-auto p-4 bg-[#1e2329] relative">
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
                          ref={isLast ? newestCardRef : undefined}
                          onClick={() => {
                            const isGuidedLevel = tutorialVisible && activeLevel !== null;
                            const isRejectedCard = idx === stacker.length - 1 && pendingScrap;
                            if (isGuidedLevel && !isRejectedCard) return;
                            setInspectingIdx(isInspected ? null : idx);
                          }}
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
                        playPaperScrapSound();
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
                  <span>IBM 029 CARD PUNCH</span>
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

        <div id="line-printer" className={`w-full flex-none h-[clamp(145px,22vh,220px)] shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded overflow-hidden border-4 border-[#252c33] ${compilerFullscreen ? "compiler-printer-fullscreen" : ""}`}>
          <div className="bg-[#1f252b] px-4 py-2 border-b border-[#2b333c] flex flex-wrap gap-2 justify-between items-center text-[10px] font-mono text-[#748494] tracking-wider uppercase">
            <span className="font-bold text-[#b5c1cc]">IBM 1403 LINE PRINTER</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCompilerFullscreen((fullscreen) => !fullscreen)}
                className="header-action-button border border-[#718290] px-3 text-[10px] font-bold tracking-widest text-[#b5c1cc] hover:border-[#d1d5d8] hover:text-white"
              >
                {compilerFullscreen ? "MINIMIZE" : "FULLSCREEN"}
              </button>
              <button
                id="compile-button"
                onClick={handleExecuteDeck}
                disabled={isRunning}
                className={`header-action-button compile-button px-5 rounded-sm text-[11px] font-mono font-bold tracking-widest transition-all border ${
                  isRunning ? "compile-button-running cursor-wait" : ""
                }`}
              >
                {isRunning ? "READING..." : "COMPILE"}
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-42px)] flex bg-[#f0f5f0] text-[#1c2b1e]">
            <div className="w-7 border-r border-[#d4ded4] flex-shrink-0" style={{ backgroundImage: "radial-gradient(circle, #252c33 3.5px, transparent 4px)", backgroundSize: "28px 20px", backgroundPosition: "center 8px" }} />

            <div id="output-code" className="no-scrollbar min-w-0 flex-1 overflow-auto p-5 font-mono text-xs">
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