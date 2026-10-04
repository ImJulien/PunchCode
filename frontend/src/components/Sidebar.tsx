"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { LEVELS, LevelId } from "../lib/levels";

interface SidebarProps {
  onScrapDeck: () => void;
  onEnterCodeEditor: () => void;
  onSelectTutorial: () => void;
  onSelectLevel: (level: LevelId) => void;
  musicVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  soundEffectsVolume: number;
  onSoundEffectsVolumeChange: (volume: number) => void;
  masterVolume: number;
  onMasterVolumeChange: (volume: number) => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  interactionDisabled: boolean;
  openLevelsRequest: number;
  onOpenCheatSheet: () => void;
  onCloseCheatSheet: () => void;
}

export type ThemeId = "console" | "amber" | "ocean" | "paper";

const THEMES: { id: ThemeId; label: string; description: string; swatch: string }[] = [
  { id: "console", label: "CONSOLE", description: "Classic graphite", swatch: "bg-[#3d4752]" },
  { id: "amber", label: "AMBER", description: "Warm terminal", swatch: "bg-[#73512c]" },
  { id: "ocean", label: "OCEAN", description: "Cool phosphor", swatch: "bg-[#285467]" },
  { id: "paper", label: "PAPER", description: "Soft archive", swatch: "bg-[#75694d]" },
];

export default function Sidebar({ onScrapDeck, onEnterCodeEditor, onSelectTutorial, onSelectLevel, musicVolume, onMusicVolumeChange, soundEffectsVolume, onSoundEffectsVolumeChange, masterVolume, onMasterVolumeChange, theme, onThemeChange, interactionDisabled, openLevelsRequest, onOpenCheatSheet, onCloseCheatSheet }: SidebarProps) {
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("TUTORIAL");
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const gameplayDisabled = hydrated && interactionDisabled;

  useEffect(() => {
    if (openLevelsRequest > 0) {
      const timer = window.setTimeout(() => setLevelsOpen(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [openLevelsRequest]);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [settingsOpen]);

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
              disabled={gameplayDisabled}
              onClick={onEnterCodeEditor}
              aria-label="Open code editor"
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#7fc8ff] hover:text-[#b8e7ff] hover:border-[#7fc8ff]/60 transition-colors"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 20h14" />
                <path d="M12 16V4M8 8l4-4 4 4" />
              </svg>
            </button>
            <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#7fc8ff] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
              EXPORT
            </span>
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              disabled={gameplayDisabled}
              onClick={() => document.getElementById("deck-file-input")?.click()}
              aria-label="Import FORTRAN deck"
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#f5d996] hover:text-[#ffe7b1] hover:border-[#f5d996]/60 transition-colors"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 20h14" />
                <path d="M12 4v12M8 12l4 4 4-4" />
              </svg>
            </button>
            <span className="pointer-events-none absolute left-14 ml-2 rounded-[2px] border border-[#3a444d] bg-[#101316] px-2.5 py-1 text-[10px] font-mono font-bold text-[#f5d996] shadow-xl opacity-0 transition-opacity group-hover:opacity-100 z-50">
              IMPORT
            </span>
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              type="button"
              disabled={gameplayDisabled}
              onClick={onOpenCheatSheet}
              aria-label="Open FORTRAN cheat sheet"
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#b8e7ff] hover:text-[#e1f5ff] hover:border-[#7fc8ff]/60 transition-colors"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22z" />
                <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22z" />
              </svg>
            </button>
            <span className="pointer-events-none absolute left-14 ml-2 rounded-[2px] border border-[#3a444d] bg-[#101316] px-2.5 py-1 text-[10px] font-mono font-bold text-[#b8e7ff] shadow-xl opacity-0 transition-opacity group-hover:opacity-100 z-50">
              NOTES
            </span>
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              disabled={gameplayDisabled}
              onClick={() => {
                onCloseCheatSheet();
                setLevelsOpen((open) => !open);
              }}
              aria-label="Open levels menu"
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#f5d996] hover:text-[#ffe7b1] hover:border-[#f5d996]/60 transition-colors"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 21V4" />
                <path d="M7 5h11l-3 4 3 4H7" />
              </svg>
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
                    disabled={gameplayDisabled}
                    type="button"
                    onClick={() => selectLevel("TUTORIAL", onSelectTutorial)}
                    className={`block w-full border border-[#3b4752] px-3 py-2 text-left text-[11px] font-mono font-bold transition-colors ${selectedLevel === "TUTORIAL" ? "bg-[#2b4754] text-[#b8e7ff] hover:bg-[#3a6172] hover:text-white" : "text-[#c5cfd6] hover:bg-[#2b3640]"}`}
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
                              className={`flex w-full items-center gap-2 border border-[#3b4752] px-2 py-2 text-left text-[clamp(9px,1.1vw,11px)] font-mono font-bold transition-colors sm:px-3 ${selectedLevel === `LEVEL ${level.id}: ${level.title}` ? "bg-[#2b4754] text-[#b8e7ff] hover:bg-[#3a6172] hover:text-white" : "text-[#c5cfd6] hover:bg-[#2b3640]"}`}
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
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              disabled={gameplayDisabled}
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
              onClick={() => {
                onCloseCheatSheet();
                setLevelsOpen(false);
                setSettingsOpen((open) => !open);
              }}
              aria-label="Open settings"
              className="w-11 h-11 bg-gradient-to-b from-[#3d4752] to-[#262c33] border border-[#52606e] rounded-[3px] shadow-[0_4px_0_#14171a,0_5px_8px_rgba(0,0,0,0.6)] active:translate-y-[3px] active:shadow-[0_1px_0_#14171a] flex items-center justify-center text-[#b8c3cc] hover:text-[#edf3f7] hover:border-[#b8c3cc]/60 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h6M14 6h6M4 12h3M11 12h9M4 18h8M16 18h4" />
                <circle cx="12" cy="6" r="2" />
                <circle cx="9" cy="12" r="2" />
                <circle cx="14" cy="18" r="2" />
              </svg>
            </button>
            {!settingsOpen && <span className="pointer-events-none absolute left-14 ml-2 px-2.5 py-1 bg-[#101316] border border-[#3a444d] shadow-xl text-[#c5cfd6] text-[10px] font-mono font-bold whitespace-nowrap rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-50">SETTINGS</span>}
            {settingsOpen && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06080a]/70 p-4" onClick={() => setSettingsOpen(false)}>
                <section className="max-h-[calc(100dvh-2rem)] w-[min(92vw,30rem)] overflow-y-auto border-2 border-[#7f8b95] bg-[#151a1f] p-4 font-mono shadow-[0_18px_50px_rgba(0,0,0,0.8)] sm:p-5" onClick={(event) => event.stopPropagation()} aria-label="Settings">
                  <div className="mb-4 flex items-center justify-between border-b border-[#35414b] pb-2">
                    <div>
                      <div className="text-xs font-black tracking-[0.18em] text-[#f5d996]">OPERATOR SETTINGS</div>
                      <div className="mt-1 text-[9px] tracking-wider text-[#73818b]">AUDIO / DISPLAY</div>
                    </div>
                    <button type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)} className="px-2 text-lg text-[#8d9aa4] hover:text-[#f5d996]">×</button>
                  </div>
                  <div className="space-y-3">
                    {[
                      ["master-volume", "MASTER", masterVolume, onMasterVolumeChange],
                      ["music-volume", "BACKGROUND MUSIC", musicVolume, onMusicVolumeChange],
                      ["sfx-volume", "SOUND FX", soundEffectsVolume, onSoundEffectsVolumeChange],
                    ].map(([id, label, value, onChange]) => (
                      <label key={id as string} className="block border border-[#35414b] bg-[#1d252b] p-3 text-[10px] font-bold text-[#c5cfd6]" htmlFor={id as string}>
                        <span className="flex items-center justify-between"><span>{label as string}</span><span className="text-[#f5d996]">{Math.round((value as number) * 100)}%</span></span>
                        <input id={id as string} type="range" min="0" max="1" step="0.01" value={value as number} onChange={(event) => (onChange as (volume: number) => void)(Number(event.target.value))} className="mt-2 w-full accent-[#e4c46d]" />
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-[#35414b] pt-4">
                    <div className="mb-2 text-[10px] font-bold tracking-widest text-[#c5cfd6]">WORKSTATION THEME</div>
                    <div className="grid grid-cols-2 gap-2">
                      {THEMES.map((option) => (
                        <button key={option.id} type="button" aria-pressed={theme === option.id} onClick={() => onThemeChange(option.id)} className={`border p-2 text-left transition-colors ${theme === option.id ? "border-[#f5d996] bg-[#2b3640]" : "border-[#35414b] bg-[#1d252b] hover:border-[#7f8b95]"}`}>
                          <span className={`mb-2 block h-5 border border-white/20 ${option.swatch}`} />
                          <span className="block text-[9px] font-black tracking-wider text-[#d9e0e4]">{option.label}</span>
                          <span className="mt-1 block text-[8px] text-[#82909b]">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => { onMasterVolumeChange(1); onMusicVolumeChange(0.2); onSoundEffectsVolumeChange(1); onThemeChange("console"); }} className="mt-4 border border-[#52606e] px-3 py-2 text-[9px] font-bold tracking-wider text-[#aeb9c2] hover:border-[#f5d996] hover:text-[#f5d996]">RESET DEFAULTS</button>
                </section>
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