'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Sun, Moon } from "lucide-react";

export const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Button
            isIconOnly
            variant="ghost"
            aria-label="Toggle theme"
            onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-foreground/60 hover:text-foreground transition-colors"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
    );
};
