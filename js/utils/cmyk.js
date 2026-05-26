const CMYKManager = {
    scale: 0.28,
    selectors: new Set(),
    currentColor: 'rgb(0, 0, 0)',

    _lastC: -1, _lastM: -1, _lastY: -1, _lastK: -1,
    _lastBgColor: '',
    _bgColorTs: 0,
    _BG_THROTTLE_MS: 80,

    anyToCmyk(color) {
        if (!color) return { c: 0, m: 0, y: 0, k: 0 };

        let r, g, b;
        const match = String(color).trim().match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (!match) return { c: 0, m: 0, y: 0, k: 0 };

        r = parseInt(match[1], 10) / 255;
        g = parseInt(match[2], 10) / 255;
        b = parseInt(match[3], 10) / 255;

        const k = 1 - Math.max(r, g, b);
        const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
        const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
        const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    },

    updateVariables(color) {
        if (!color) return;
        this.currentColor = color;

        const cmyk = this.anyToCmyk(color);
        const root = document.documentElement;

        const sc = Math.min(48, cmyk.c * this.scale);
        const sm = Math.min(48, cmyk.m * this.scale);
        const sy = Math.min(48, cmyk.y * this.scale);
        const sk = Math.min(48, cmyk.k * this.scale);

        if (sc !== this._lastC) { root.style.setProperty('--r-c', sc + '%'); this._lastC = sc; }
        if (sm !== this._lastM) { root.style.setProperty('--r-m', sm + '%'); this._lastM = sm; }
        if (sy !== this._lastY) { root.style.setProperty('--r-y', sy + '%'); this._lastY = sy; }
        if (sk !== this._lastK) { root.style.setProperty('--r-k', sk + '%'); this._lastK = sk; }

        const now = performance.now();
        if (color !== this._lastBgColor && (now - this._bgColorTs) > this._BG_THROTTLE_MS) {
            root.style.setProperty('--bg-color', `color-mix(in srgb, ${color}, black 25%)`);
            this._lastBgColor = color;
            this._bgColorTs = now;
        }
    },

    setScale(newScale) {
        this.scale = newScale;
        this._lastC = this._lastM = this._lastY = this._lastK = -1;
        this.updateVariables(this.currentColor);
    },

    apply(selector) {
        this.remove(selector);
    },

    remove(selector) {
        if (!selector) return;
        const els = (typeof selector === 'string') ? document.querySelectorAll(selector) : [selector];
        els.forEach(el => {
            const h = el.querySelector('.halftone-local');
            if (h) h.remove();
        });
    }
};

window.CMYKManager = CMYKManager;
window.cmykApply = (s) => CMYKManager.apply(s);
window.cmykRemove = (s) => CMYKManager.remove(s);
