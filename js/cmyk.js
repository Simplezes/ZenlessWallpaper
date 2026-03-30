const CMYKManager = {
    scale: 0.4,
    selectors: new Set(),
    currentColor: '#000000',

    hexToCmyk(hex) {
        hex = hex.replace('#', '');

        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        let r = parseInt(hex.substring(0, 2), 16) / 255;
        let g = parseInt(hex.substring(2, 4), 16) / 255;
        let b = parseInt(hex.substring(4, 6), 16) / 255;

        let k = 1 - Math.max(r, g, b);
        let c = (1 - r - k) / (1 - k) || 0;
        let m = (1 - g - k) / (1 - k) || 0;
        let y = (1 - b - k) / (1 - k) || 0;

        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    },

    updateVariables(hex) {
        if (!hex) return;
        this.currentColor = hex;

        const cmyk = this.hexToCmyk(hex);
        const root = document.documentElement;

        root.style.setProperty('--r-c', (cmyk.c * this.scale) + '%');
        root.style.setProperty('--r-m', (cmyk.m * this.scale) + '%');
        root.style.setProperty('--r-y', (cmyk.y * this.scale) + '%');
        root.style.setProperty('--r-k', (cmyk.k * this.scale) + '%');

        document.body.style.backgroundColor = `color-mix(in srgb, ${hex}, black 40%)`;
    },

    setScale(newScale) {
        this.scale = newScale;
        this.updateVariables(this.currentColor);
    },

    createHalftoneStack() {
        const stack = document.createElement('div');
        stack.className = 'halftone-local';

        ['screen-y', 'screen-c', 'screen-m', 'screen-k'].forEach(cls => {
            const dot = document.createElement('div');
            dot.className = `dot-screen ${cls}`;
            stack.appendChild(dot);
        });

        return stack;
    },

    apply(selector) {
        const els = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];

        els.forEach(el => {
            if (el.querySelector('.halftone-local')) return;

            const nonHalftoneChildren = Array.from(el.children).filter(c => !c.classList.contains('halftone-local'));
            if (el.textContent.trim() !== '' && nonHalftoneChildren.length === 0) {
                el.classList.add('halftone-text-masked');
            } else if (el.classList.contains('ambient-text')) {
                el.classList.add('halftone-text-masked');
            }

            const pos = getComputedStyle(el).position;
            if (pos === 'static') el.style.position = 'relative';

            el.appendChild(this.createHalftoneStack());
        });

        if (typeof selector === 'string') this.selectors.add(selector);
    },

    remove(selector) {
        const els = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];

        els.forEach(el => {
            const existing = el.querySelector('.halftone-local');
            if (existing) existing.remove();
            el.classList.remove('halftone-text-masked');
        });

        if (typeof selector === 'string') this.selectors.delete(selector);
    },

    refresh() {
        this.selectors.forEach(selector => this.apply(selector));
    }
};

window.CMYKManager = CMYKManager;
window.cmykApply = (s) => CMYKManager.apply(s);
window.cmykRemove = (s) => CMYKManager.remove(s);
