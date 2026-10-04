"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Image from "next/image";

interface TutorialStep {
  title: string;
  message: string;
  hint: string;
  target: string;
}

const TOUR_STEPS: TutorialStep[] = [
  {
    title: "Welcome to the 029",
    message: "Follow the highlights. I will show each control before you use it.",
    hint: "Press NEXT.",
    target: "#machine-header",
  },
  {
    title: "The feed hopper",
    message: "Blank cards start here. The hopper is display-only.",
    hint: "Cards feed after you release a punched card.",
    target: "#feed-hopper",
  },
  {
    title: "The program drum",
    message: "The drum tracks the active column and field.",
    hint: "Use TAB to skip to the next field.",
    target: "#program-unit",
  },
  {
    title: "The punch station",
    message: "This larger card is your active punch station.",
    hint: "Type here. The column marker follows your keystrokes.",
    target: "#punch-bed",
  },
  {
    title: "Release key",
    message: "ENTER releases the punched card.",
    hint: "The card enters the stacker. The next blank card feeds in.",
    target: "#key-help",
  },
  {
    title: "The completed-card stacker",
    message: "Released cards collect here immediately.",
    hint: "Click any card to inspect it, then SCRAP CARD to discard it.",
    target: "#card-stacker",
  },
  {
    title: "Compile the deck",
    message: "COMPILE sends the completed deck to the runner.",
    hint: "The printer shows the result.",
    target: "#compile-button",
  },
  {
    title: "Read the output",
    message: "The 1403 printer displays the job output.",
    hint: "Look for HELLO WORLD.",
    target: "#line-printer",
  },
];

const CARD_INSTRUCTIONS = [
  {
    title: "Card 1",
    message: "Press TAB for Columns 1–6. Type WRITE(6, 10).",
    hint: "TAB skips the fixed field; ENTER releases the card.",
  },
  {
    title: "Card 2",
    message: "Type 10, press TAB, then FORMAT(11HHELLO WORLD).",
    hint: "Use one space between HELLO and WORLD. Press ENTER.",
  },
  {
    title: "Card 3",
    message: "Press TAB, then type STOP.",
    hint: "ENTER releases the card.",
  },
  {
    title: "Card 4",
    message: "Press TAB, then type END.",
    hint: "ENTER releases the final card.",
  },
];

interface FlippyTutorialProps {
  completed: boolean;
  tutorialCardIndex: number;
  lastReleaseCorrect: boolean | null;
  releaseRevision: number;
  scrapRevision: number;
  hasCompiled: boolean;
  hasOutput: boolean;
  onDismiss: () => void;
  onScrapCard: () => void;
  activeLevel: 1 | 2 | 3 | null;
  challengeCards: string[];
  challengeTitle: string;
  challengePrompt: string | null;
}

type TutorialMode = "tour" | "cards" | "scrap" | "compile" | "output" | "done";

export default function FlippyTutorial({
  completed,
  tutorialCardIndex,
  lastReleaseCorrect,
  releaseRevision,
  scrapRevision,
  hasCompiled,
  hasOutput,
  onDismiss,
  onScrapCard,
  activeLevel,
  challengeCards,
  challengeTitle,
  challengePrompt,
}: FlippyTutorialProps) {
  const [mode, setMode] = useState<TutorialMode>(activeLevel ? "cards" : "tour");
  const [tourStep, setTourStep] = useState(0);
  const [frame, setFrame] = useState(0);
  const [spotlight, setSpotlight] = useState<DOMRect | null>(null);
  const wrongCardNeedsScrap = mode === "cards" && lastReleaseCorrect === false && scrapRevision < releaseRevision;
  const cardInstructions = activeLevel
    ? challengeCards.map((card, index) => {
        const statement = card.slice(6).trimEnd();
        const label = card.slice(0, 5).trim();
        return {
          title: challengeTitle,
          message: label
            ? `${challengePrompt} Card ${index + 1}: type ${label}, press TAB, then type ${statement}.`
            : `${challengePrompt} Card ${index + 1}: press TAB, then type ${statement}.`,
          hint: "Press ENTER to release the card.",
        };
      })
    : CARD_INSTRUCTIONS;
  const cardStep = Math.min(tutorialCardIndex, cardInstructions.length - 1);
  const effectiveMode: TutorialMode = wrongCardNeedsScrap ? "scrap" : mode;
  const displayMode: TutorialMode =
    effectiveMode === "cards" && tutorialCardIndex >= cardInstructions.length ? "compile" :
    effectiveMode === "compile" && hasCompiled ? "output" : effectiveMode;
  const current = useMemo<TutorialStep>(() => {
    if (displayMode === "tour") return TOUR_STEPS[tourStep];
    if (displayMode === "cards") {
      return {
        ...cardInstructions[cardStep],
        target: "#punch-bed",
      };
    }
    if (displayMode === "scrap") {
      return {
        title: "That card is not correct",
        message: "The card is wrong. Press SCRAP CARD to remove it and retry.",
        hint: "This is the same reject action an operator uses for a bad card.",
        target: "#card-stacker",
      };
    }
    if (displayMode === "compile") {
      return {
        title: "Compile the deck",
        message: `All ${cardInstructions.length} cards are released. Click COMPILE in the printer header.`,
        hint: "The card reader will send your deck to the runner.",
        target: "#compile-button",
      };
    }
    if (displayMode === "output") {
      return {
        title: "Read the compiled output",
        message: activeLevel
          ? `The ${challengeTitle} program produced the correct result in this output block.`
          : "The compiled program printed HELLO WORLD in this output block.",
        hint: "Inspect the highlighted result, then continue.",
        target: "#output-code",
      };
    }
    return {
      title: "You’re an operator now",
      message: "You punched, released, compiled, and verified your first program on the IBM 029.",
      hint: "You can keep experimenting with the machine after closing this guide.",
      target: "#line-printer",
    };
  }, [activeLevel, cardInstructions, cardStep, challengeTitle, displayMode, tourStep]);

  useEffect(() => {
    const timer = window.setInterval(() => setFrame((value) => (value + 1) % 2), 450);
    return () => window.clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    const target = document.querySelector(current.target);
    target?.classList.add("tutorial-focus-target");
    const updateSpotlight = () => {
      setSpotlight(target?.getBoundingClientRect() ?? null);
    };
    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);
    return () => {
      target?.classList.remove("tutorial-focus-target");
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [current.target]);

  const guideStyle = spotlight
    ? (() => {
        const width = Math.min(430, window.innerWidth - 32);
        const height = 280;
        const gap = 18;
        const clampX = (value: number) => Math.min(Math.max(16, value), window.innerWidth - width - 16);
        const clampY = (value: number) => Math.min(Math.max(16, value), window.innerHeight - height - 16);
        const candidates = [
          { side: "below", left: spotlight.left + spotlight.width / 2 - width / 2, top: spotlight.bottom + gap },
          { side: "above", left: spotlight.left + spotlight.width / 2 - width / 2, top: spotlight.top - height - gap },
          { side: "right", left: spotlight.right + gap, top: spotlight.top + spotlight.height / 2 - height / 2 },
          { side: "left", left: spotlight.left - width - gap, top: spotlight.top + spotlight.height / 2 - height / 2 },
        ].map(({ side, left, top }) => {
          const fitsVertically = top >= 16 && top + height <= window.innerHeight - 16;
          const fitsHorizontally = left >= 16 && left + width <= window.innerWidth - 16;
          return {
            side,
            left: clampX(left),
            top: clampY(top),
            fitsVertically,
            fitsHorizontally,
          };
        });
        const overlaps = (candidate: { left: number; top: number }) =>
          candidate.left < spotlight.right + 8 &&
          candidate.left + width > spotlight.left - 8 &&
          candidate.top < spotlight.bottom + 8 &&
          candidate.top + height > spotlight.top - 8;
        const verticalPlacement = candidates.find(
          (candidate) =>
            (candidate.side === "below" || candidate.side === "above") &&
            candidate.fitsVertically &&
            !overlaps(candidate),
        );
        const horizontalPlacement = candidates.find(
          (candidate) =>
            (candidate.side === "right" || candidate.side === "left") &&
            candidate.fitsHorizontally &&
            !overlaps(candidate),
        );
        const placement = verticalPlacement ?? horizontalPlacement ?? candidates[0];
        return { left: `${placement.left}px`, top: `${placement.top}px` };
      })()
    : undefined;

  const progress = displayMode === "tour"
    ? `${tourStep + 1}/${TOUR_STEPS.length}`
    : displayMode === "cards"
      ? `CARD ${cardStep + 1}/${cardInstructions.length}`
      : "";

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {spotlight && (
        <div
          className="tutorial-spotlight"
          style={{
            left: `${spotlight.left - 1}px`,
            top: `${spotlight.top - 1}px`,
            width: `${spotlight.width + 2}px`,
            height: `${spotlight.height + 2}px`,
          }}
        />
      )}
      <div
        className="flippy-guide pointer-events-auto fixed w-[min(430px,calc(100vw-2rem))] border-2 border-[#b99558] bg-[#15191d]/95 p-4 text-[#d9e0e4] shadow-[0_12px_30px_rgba(0,0,0,0.75)] backdrop-blur-sm"
        style={guideStyle}
      >
        <div className="flex items-center gap-3">
          <div className="flippy-avatar shrink-0 self-center" aria-hidden="true">
            <Image src={`/flippy/flippy-${frame + 1}.png`} alt="" width={180} height={180} unoptimized />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flippy-chatbox relative border border-[#46535e] bg-[#20282f] p-3 font-mono">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h2 className="text-sm font-black tracking-wide text-[#f0d69c]">{current.title}</h2>
                <span className="font-mono text-[9px] text-[#73818b]">{progress}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#c8d0d5]">{current.message}</p>
              <p className="mt-2 text-[10px] italic text-[#8f9da6]">{current.hint}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span />
          <div className="flex gap-2">
            {displayMode !== "done" && (
              <button type="button" onClick={onDismiss} className="border border-[#3d4851] px-3 py-2 font-mono text-[10px] font-bold text-[#aeb9c0] hover:bg-[#263039]">
                {displayMode === "tour" ? "SKIP TOUR" : "CLOSE GUIDE"}
              </button>
            )}
            {displayMode === "tour" && (
              <button
                type="button"
                onClick={() =>
                  tourStep < TOUR_STEPS.length - 1
                    ? setTourStep((value) => value + 1)
                    : setMode("cards")
                }
                className="border border-[#c29c61] bg-[#2e3b45] px-3 py-2 font-mono text-[10px] font-bold text-[#f5d996] hover:bg-[#3b4c59]"
              >
                NEXT
              </button>
            )}
            {displayMode === "scrap" && (
              <button
                type="button"
                data-paper-action="true"
                onClick={onScrapCard}
                className="border border-[#d66b6b] bg-[#66231a] px-3 py-2 font-mono text-[10px] font-bold text-[#f0cfcb] hover:bg-[#813127]"
              >
                SCRAP CARD
              </button>
            )}
            {displayMode === "output" && hasOutput && (
              <button type="button" onClick={() => setMode("done")} className="border border-[#c29c61] bg-[#604a27] px-3 py-2 font-mono text-[10px] font-bold text-[#ffe7b1] hover:bg-[#755a30]">
                CONTINUE
              </button>
            )}
            {displayMode === "done" && (
              <button type="button" onClick={onDismiss} className="border border-[#9be2b0] bg-[#28543a] px-4 py-2 font-mono text-[10px] font-bold text-[#d9ffe3] hover:bg-[#34704d]">
                DONE
              </button>
            )}
          </div>
        </div>
        {completed && <div className="mt-3 border-t border-[#4b694f] pt-2 font-mono text-[10px] font-bold tracking-wider text-[#9be2b0]">✓ BATCH ACCEPTED — HELLO WORLD OUTPUT VERIFIED</div>}
      </div>
    </div>
  );
}
