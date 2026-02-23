"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    // Get system preference
    const getSystemTheme = (): "light" | "dark" => {
        if (typeof window === "undefined") return "light";
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    // Initial mount: read from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) {
            setTheme(stored);
        }
        setMounted(true);
    }, []);

    // Apply theme changes
    useEffect(() => {
        if (!mounted) return;

        const resolved = theme === "system" ? getSystemTheme() : theme;
        setResolvedTheme(resolved);

        // Update DOM
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolved);

        // Save to localStorage
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    // Listen for system theme changes
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                const resolved = getSystemTheme();
                setResolvedTheme(resolved);
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(resolved);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, mounted]);

    // Prevent flash during SSR
    if (!mounted) {
        return (
            <div suppressHydrationWarning>
                {children}
            </div>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        // Return default values when used outside provider (e.g., during SSR/prerender)
        return {
            theme: "system" as Theme,
            resolvedTheme: "light" as "light" | "dark",
            setTheme: () => { },
        };
    }
    return context;
}
