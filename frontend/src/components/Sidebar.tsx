"use client";

import { useState } from "react";
import { LEVELS, LevelId } from "../lib/levels";

interface SidebarProps {
  onScrapDeck: () => void;
  onEnterCodeEditor: () => void;
  onSelectTutorial: () => void;
  onSelectLevel: (level: LevelId) => void;
  ambienceVolume: number;
  onAmbienceVolumeChange: (volume: number) => void;
  interactionDisabled: boolean;
}

export default function Sidebar({ onScrapDeck, onEnterCodeEditor, onSelectTutorial, onSelectLevel, ambienceVolume, onAmbienceVolumeChange, interactionDisabled }: SidebarProps) {
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("TUTORIAL");

  const selectLevel = (level: string, action?: () => void) => {
    setSelectedLevel(level);
    setLevelsOpen(false);
    action?.();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 bg-[#1a1e22] border-r-2 border-[#101316] shadow-[4px_0_15px_rgba(0,0,0,0.6)] flex flex-col justify-between items-center py-6 z-50">
      <div className="flex flex-col items-center gap-6 w-full px-2">
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="group relative flex items-center justify-center w-full">
            <button
              disabled={interactionDisabled}
              onClick={onEnterCodeEditor}
              aria-label="Open code editor"
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#7fc8ff] hover:text-[#b8e7ff] hover:border-[#7fc8ff]/60 transition-colors"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h5M8 13h8M8 17h6" /></svg>
            </button>
            <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#7fc8ff] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
              CODE EDITOR
            </span>
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              disabled={interactionDisabled}
              onClick={() => setLevelsOpen((open) => !open)}
              aria-label="Open levels menu"
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#f5d996] hover:text-[#ffe7b1] hover:border-[#f5d996]/60 transition-colors"
            >
              <span className="font-mono text-[10px] font-black tracking-tight">LVL</span>
            </button>
            {!levelsOpen && (
              <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#f5d996] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                LEVELS
              </span>
            )}
            {levelsOpen && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06080a]/70 p-4" onClick={() => setLevelsOpen(false)}>
                <div className="flex max-h-[calc(100dvh-2rem)] w-[min(96vw,44rem)] flex-col overflow-hidden border-2 border-[#b99558] bg-[#151a1f] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.8)] sm:p-4" onClick={(event) => event.stopPropagation()}>
                  <div className="mb-3 flex items-center justify-between border-b border-[#35414b] pb-2">
                    <div className="font-mono text-xs font-black tracking-[0.18em] text-[#f5d996]">SELECT MODE</div>
                    <button type="button" aria-label="Close levels menu" onClick={() => setLevelsOpen(false)} className="px-2 text-lg text-[#8d9aa4] hover:text-[#f5d996]">×</button>
                  </div>
                  <button
                    disabled={interactionDisabled}
                    type="button"
                    onClick={() => selectLevel("TUTORIAL", onSelectTutorial)}
                    className={`block w-full border border-[#3b4752] px-3 py-2 text-left text-[11px] font-mono font-bold ${selectedLevel === "TUTORIAL" ? "bg-[#2b4754] text-[#b8e7ff]" : "text-[#c5cfd6] hover:bg-[#2b3640]"}`}
                  >
                    TUTORIAL
                  </button>
                  <div className="no-scrollbar mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    {(["EASY", "MEDIUM", "HARD"] as const).map((difficulty) => (
                      <section key={difficulty}>
                        <div className="space-y-1">
                          {LEVELS.filter((level) => level.difficulty === difficulty).map((level) => (
                            <button
                              key={level.id}
                              type="button"
                              onClick={() => selectLevel(`LEVEL ${level.id}: ${level.title}`, () => onSelectLevel(level.id))}
                              className={`flex w-full items-center gap-2 border border-[#3b4752] px-2 py-2 text-left text-[clamp(9px,1.1vw,11px)] font-mono font-bold sm:px-3 ${selectedLevel === `LEVEL ${level.id}: ${level.title}` ? "bg-[#2b4754] text-[#b8e7ff]" : "text-[#c5cfd6] hover:bg-[#2b3640]"}`}
                            >
                              <span className="min-w-0 flex-1">{level.id} - {level.title}</span>
                              <span className={`ml-auto shrink-0 whitespace-nowrap text-[9px] ${difficulty === "EASY" ? "text-green-400" : difficulty === "MEDIUM" ? "text-yellow-300" : "text-red-400"}`}>
                                {difficulty}
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                    {LEVELS.filter((level) => level.isImpossible).map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => selectLevel(`LEVEL ${level.id}: ${level.title}`, () => onSelectLevel(level.id))}
                        className={`flex w-full items-center gap-2 border border-purple-500/60 px-2 py-2 text-left text-[clamp(9px,1.1vw,11px)] font-mono font-bold sm:px-3 ${selectedLevel === `LEVEL ${level.id}: ${level.title}` ? "bg-purple-950/70 text-purple-200" : "text-[#c5cfd6] hover:bg-purple-950/40"}`}
                      >
                        <span className="min-w-0 flex-1">{level.id} - {level.title}</span>
                        <span className="ml-auto shrink-0 text-purple-400">?</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              disabled={interactionDisabled}
              onClick={onScrapDeck}
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#e67575] hover:text-[#ff9a9a] hover:border-[#e67575]/60 transition-colors"
            >
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
            </button>
            <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#e67575] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
              SCRAP DECK
            </span>
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              type="button"
              disabled={interactionDisabled}
              onClick={() => setSettingsOpen((open) => !open)}
              aria-label="Open settings"
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#b8c3cc] hover:text-[#edf3f7] hover:border-[#b8c3cc]/60 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>
            </button>
            {!settingsOpen && <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#c5cfd6] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">AMBIENCE</span>}
            {settingsOpen && !interactionDisabled && (
              <div className="absolute left-14 top-0 ml-2 w-56 border border-[#52606e] bg-[#151a1f] p-3 shadow-2xl">
                <div className="mb-2 text-[9px] font-mono font-bold tracking-widest text-[#73818b]">AUDIO SETTINGS</div>
                <label className="block text-[10px] font-mono font-bold text-[#c5cfd6]" htmlFor="ambience-volume">
                  AMBIENCE {Math.round(ambienceVolume * 100)}%
                </label>
                <input id="ambience-volume" type="range" min="0" max="1" step="0.01" value={ambienceVolume} onChange={(event) => onAmbienceVolumeChange(Number(event.target.value))} className="mt-2 w-full accent-[#e4c46d]" />
              </div>
            )}
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