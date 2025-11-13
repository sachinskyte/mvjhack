import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "identity-wallet-theme";

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const persistedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (persistedTheme === "dark" || persistedTheme === "light") {
    return persistedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === "dark" || event.newValue === "light")) {
        setTheme(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return {
    theme: context.theme,
    setTheme: context.setTheme,
    toggleTheme: context.toggleTheme,
  };
};
