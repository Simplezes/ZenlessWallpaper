(function () {
    'use strict';

    const storage = {
        get(key, fallback = null) {
            try {
                const value = window.localStorage.getItem(key);
                return value === null ? fallback : value;
            } catch (error) {
                console.warn('[safeStorage] get failed for key:', key, error);
                return fallback;
            }
        },

        set(key, value) {
            try {
                window.localStorage.setItem(key, String(value));
                return true;
            } catch (error) {
                console.warn('[safeStorage] set failed for key:', key, error);
                return false;
            }
        },

        getBool(key, fallback = false) {
            const value = storage.get(key, null);
            if (value === null) return fallback;
            return value !== 'false';
        }
    };

    window.safeStorage = storage;
})();
