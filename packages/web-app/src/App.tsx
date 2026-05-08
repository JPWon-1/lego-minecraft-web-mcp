import React from "react";
import type { Track } from "@blockgame/shared";
import { Landing } from "./landing/Landing.js";
import { ModeSelect } from "./screens/ModeSelect.js";
import { GameScreen } from "./screens/GameScreen.js";

type View =
  | { kind: "landing" }
  | { kind: "mode-select" }
  | { kind: "game"; track: Track };

const DARK_KEY = "blockgame.dark";

function useDarkMode(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [dark, setDark] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage?.getItem(DARK_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
    return false;
  });
  React.useEffect(() => {
    try {
      window.localStorage?.setItem(DARK_KEY, dark ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [dark]);
  return [dark, setDark];
}

export function App() {
  const [view, setView] = React.useState<View>({ kind: "landing" });
  const [dark, setDark] = useDarkMode();

  if (view.kind === "landing") {
    return (
      <Landing
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        onEnterApp={() => setView({ kind: "mode-select" })}
      />
    );
  }

  if (view.kind === "mode-select") {
    return (
      <ModeSelect
        dark={dark}
        onBack={() => setView({ kind: "landing" })}
        onSelect={(track) => setView({ kind: "game", track })}
      />
    );
  }

  return (
    <GameScreen
      key={view.track}
      track={view.track}
      onExit={() => setView({ kind: "landing" })}
    />
  );
}
