import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchMe, logout as logoutApi } from "./api/authApi";
import {
  getSelectedCharacterId,
  getStoredUser,
  getToken,
  setSelectedCharacterId as persistSelectedCharacterId,
  setStoredUser,
} from "./api/client";
import { routes, useRoute } from "./router";

import AccountSettingsPage from "./pages/AccountSettingsPage";
import CharacterCreatePage from "./pages/CharacterCreatePage";
import CharacterPage from "./pages/CharacterPage";
import CharacterListPage from "./pages/CharacterListPage";
import ConnectionCodePage from "./pages/ConnectionCodePage";
import ConnectionStatusPage from "./pages/ConnectionStatusPage";
import HelpPage from "./pages/HelpPage";
import IntroPage from "./pages/IntroPage";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import SplashPage from "./pages/SplashPage";
import VitalPage from "./pages/VitalPage";

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

function AuthGate({ user, navigate, children }) {
  useEffect(() => {
    if (!user) {
      navigate(routes.signin);
    }
  }, [user, navigate]);

  return user ? children : null;
}

export default function App() {
  const router = useRoute();
  const [user, setUser] = useState(() => getStoredUser());
  const [selectedCharacterId, setSelectedCharacterIdState] = useState(() =>
    getSelectedCharacterId()
  );
  const [isBooting, setIsBooting] = useState(Boolean(getToken()));

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      if (!getToken()) {
        setIsBooting(false);
        return;
      }

      try {
        const data = await fetchMe();
        if (!mounted) return;
        setUser(data.user);
        setStoredUser(data.user);
      } catch (err) {
        if (!mounted) return;
        logoutApi();
        setUser(null);
        setSelectedCharacterIdState(null);
        router.navigate(routes.signin);
      } finally {
        if (mounted) setIsBooting(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const setSelectedCharacterId = useCallback((characterId) => {
    persistSelectedCharacterId(characterId);
    setSelectedCharacterIdState(characterId ? String(characterId) : null);
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
    setSelectedCharacterIdState(null);
    router.navigate(routes.signin);
  }, [router.navigate]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      selectedCharacterId,
      setSelectedCharacterId,
      logout,
      navigate: router.navigate,
    }),
    [user, selectedCharacterId, setSelectedCharacterId, logout, router.navigate]
  );

  if (isBooting) {
    return (
      <div className="app-background">
        <main className="app-frame">
          <div className="app-content">
            <p className="page-title">VITACORE</p>
            <p className="subtitle">Restoring session...</p>
          </div>
        </main>
      </div>
    );
  }

  let page;

  switch (router.path) {
    case routes.signin:
      page = user ? <CharacterListPage /> : <SignInPage />;
      break;
    case routes.signup:
      page = user ? <CharacterListPage /> : <SignUpPage />;
      break;
    case routes.characters:
      page = (
        <AuthGate user={user} navigate={router.navigate}>
          <CharacterListPage />
        </AuthGate>
      );
      break;
    case routes.createCharacter:
      page = (
        <AuthGate user={user} navigate={router.navigate}>
          <CharacterCreatePage />
        </AuthGate>
      );
      break;
    case routes.characterReport:
      page = (
        <AuthGate user={user} navigate={router.navigate}>
          <CharacterPage />
        </AuthGate>
      );
      break;
    case routes.vitals:
      page = (
        <AuthGate user={user} navigate={router.navigate}>
          <VitalPage />
        </AuthGate>
      );
      break;
    case routes.connection:
      page = (
        <AuthGate user={user} navigate={router.navigate}>
          <ConnectionStatusPage />
        </AuthGate>
      );
      break;
    case routes.connectionCode:
      page = (
        <AuthGate user={user} navigate={router.navigate}>
          <ConnectionCodePage />
        </AuthGate>
      );
      break;
    case routes.help:
      page = (
        <AuthGate user={user} navigate={router.navigate}>
          <HelpPage />
        </AuthGate>
      );
      break;
    case routes.accountSettings:
      page = (
        <AuthGate user={user} navigate={router.navigate}>
          <AccountSettingsPage />
        </AuthGate>
      );
      break;
    case routes.future:
      page = <IntroPage />;
      break;
    case routes.splash:
      page = user ? <CharacterListPage /> : <SplashPage />;
      break;
    case routes.landing:
    default:
      page = <LandingPage />;
      break;
  }

  return <AppContext.Provider value={value}>{page}</AppContext.Provider>;
}
