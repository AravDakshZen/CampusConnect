/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react';

/**
 * Single light design system enforcement
 * Dark mode has been completely removed per requirements.
 */
const ThemeContext = createContext({ isDark: false });

export const ThemeProvider = ({ children }) => {
    useEffect(() => {
        // Enforce consistent light interface
        document.documentElement.classList.remove('dark');
        try {
            localStorage.removeItem('theme');
        } catch {
            // ignore in restricted env
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ isDark: false }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return useContext(ThemeContext) || { isDark: false };
};

export default ThemeContext;
