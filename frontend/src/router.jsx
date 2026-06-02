import { useCallback, useEffect, useState } from "react";

export const routes = {
  splash: "/",
  landing: "/landing",
  signin: "/signin",
  signup: "/signup",
  characters: "/characters",
  createCharacter: "/characters/new",
  characterReport: "/character",
  vitals: "/vitals",
  connection: "/connection",
  connectionCode: "/connection-code",
  help: "/help",
  accountSettings: "/account",
  future: "/future",
};

export function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useRoute() {
  const [path, setPath] = useState(window.location.pathname || routes.landing);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname || routes.landing);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const go = useCallback((nextPath) => {
    navigate(nextPath);
  }, []);

  return { path, navigate: go };
}
