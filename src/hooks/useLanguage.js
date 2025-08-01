import { useState, useEffect } from 'react';
import languageService from '@/utils/i18n.js';

// Hook for language management
export const useLanguage = () => {
    const [currentLanguage, setCurrentLanguage] = useState(languageService.getCurrentLanguage());

    useEffect(() => {
        // Listen for language changes
        const handleLanguageChange = (event) => {
            setCurrentLanguage(event.detail.language);
        };

        window.addEventListener('languageChanged', handleLanguageChange);

        return () => {
            window.removeEventListener('languageChanged', handleLanguageChange);
        };
    }, []);

    // Translation function
    const t = (key) => {
        return languageService.t(key);
    };

    // Set language function
    const setLanguage = (language) => {
        languageService.setLanguage(language);
    };

    return {
        currentLanguage,
        t,
        setLanguage,
        languageService
    };
}; 