import Component from './Component.js';

export default class Background extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            character: 'Burnice White',
            faction: 'KOBEBW',
            nickname: 'BURNICE',
            baseColor: '#FC5B90'
        };
    }

    render() {
        return `
            <div class="viewport-bg">
                <div class="paper-surface"></div>
            </div>
            <canvas id="bg-pattern-canvas"></canvas>
            <div class="paper-scuffs"></div>
            
            <!-- Shared SVG Filters for CMYK/Paper effects -->
            <svg width="0" height="0" style="position: absolute;">
                <defs>
                    <filter id="rough-paper">
                        <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="3" result="noise" />
                        <feDiffuseLighting in="noise" lighting-color="#fff" surfaceScale="0.8" result="light">
                            <feDistantLight azimuth="45" elevation="65" />
                        </feDiffuseLighting>
                        <feBlend in="light" in2="SourceGraphic" mode="multiply" />
                    </filter>
                    <filter id="ink-print">
                        <feGaussianBlur stdDeviation="0.25" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -6" result="bleed" />
                        <feComposite in="bleed" in2="SourceGraphic" operator="atop" />
                    </filter>
                    <filter id="paper-scuffs-filter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.002 0.5" numOctaves="2" seed="123" result="long-lines" />
                        <feColorMatrix in="long-lines" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 1 1 0 -2.5" result="raw-scratches" />
                        <feMorphology in="raw-scratches" operator="dilate" radius="0.3" result="thick-scratches" />
                        <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="4" seed="456" result="scuffs" />
                        <feColorMatrix in="scuffs" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 1 1 0 -1.9" result="raw-blotches" />
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="789" result="dust" />
                        <feColorMatrix in="dust" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 1 1 0 -1.98" result="raw-dust" />
                        <feMerge>
                            <feMergeNode in="thick-scratches" />
                            <feMergeNode in="raw-blotches" />
                            <feMergeNode in="raw-dust" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            <div class="paper-overlay"></div>
            <div id="backdrop" class="bg-layer active" style="opacity: 0;"></div>
            <div id="transition-backdrop" class="bg-layer" style="opacity: 0;"></div>
            <div id="faction-text" class="ambient-text faction"></div>
            <div id="image-container">
                <img id="main-image" class="char-image active" />
                <img id="transition-image" class="char-image" />
            </div>
            <div id="nickname-text" class="ambient-text nickname"></div>
            <!-- Single global CMYK halftone overlay — replaces per-element injection.
                 4 dot-screens total instead of 4× per decorated element (~40). -->
            <div id="halftone-global" class="halftone-global">
                <div class="dot-screen screen-y"></div>
                <div class="dot-screen screen-c"></div>
                <div class="dot-screen screen-m"></div>
                <div class="dot-screen screen-k"></div>
            </div>
        `;
    }

    onMounted() {
        if (window.PatternRenderer && window.PatternRenderer.init) {
            window.PatternRenderer.init();
            const patternPref = localStorage.getItem('bgPattern') !== 'false';
            if (patternPref) {
                window.PatternRenderer.setVisible(true);
            }
        }

        if (window.kineticSway) {
            window.kineticSway.init();
            window.kineticSway.setEnabled(localStorage.getItem('kineticSway') !== 'false');
        }

        window.dispatchEvent(new CustomEvent('background-ready'));
        this.applyCMYK();
    }

    onUpdated() { }

    applyCMYK() { }
}
