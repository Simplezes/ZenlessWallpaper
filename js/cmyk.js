const CMYKManager = {
    scale: 0.4,
    selectors: new Set(),
    currentColor: 'rgb(0, 0, 0)',

    _lastC: -1, _lastM: -1, _lastY: -1, _lastK: -1,
    _lastBgColor: '',
    _bgColorTs: 0,
    _BG_THROTTLE_MS: 80,

    anyToCmyk(color) {
        let r, g, b;

        const matches = color.match(/\d+/g);
        r = parseInt(matches[0]) / 255;
        g = parseInt(matches[1]) / 255;
        b = parseInt(matches[2]) / 255;

        const k = 1 - Math.max(r, g, b);
        const c = (1 - r - k) / (1 - k) || 0;
        const m = (1 - g - k) / (1 - k) || 0;
        const y = (1 - b - k) / (1 - k) || 0;

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

        const sc = cmyk.c * this.scale;
        const sm = cmyk.m * this.scale;
        const sy = cmyk.y * this.scale;
        const sk = cmyk.k * this.scale;

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

    apply() {},
    remove() {},
    refresh() {}
};

window.CMYKManager = CMYKManager;
window.cmykApply = (s) => CMYKManager.apply(s);
window.cmykRemove = (s) => CMYKManager.remove(s);
