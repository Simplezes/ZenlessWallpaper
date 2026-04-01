import Component from './Component.js';

export default class Background extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            character: 'Burnice White',
            faction: 'KOBEBW',
            nickname: 'BURNICE',
            baseColor: 'rgb(252, 91, 144)'
        };
    }

    render() {
        return `
            <canvas id="bg-pattern-canvas"></canvas>
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
