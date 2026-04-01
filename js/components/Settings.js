import Component from './Component.js';
import AgentList from './AgentList.js';

export default class Settings extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            currentAgent: localStorage.getItem('selectedCharacter') || "Burnice White",
            currentVariant: localStorage.getItem('selectedVariant') || "Default",
            showAmbient: localStorage.getItem('showAmbient') !== 'false',
            footerTheme: localStorage.getItem('footerTheme') || 'dark',
            kineticSwayEnabled: localStorage.getItem('kineticSway') !== 'false',
            patternEnabled: localStorage.getItem('bgPattern') !== 'false',
            isOpen: false,
            isAgentListOpen: false
        };

        this.ICONS = {
            close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
            plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
            rotate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
            flip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
                <path d="M3 12L8 7L8 17L3 12Z" fill="currentColor" />
                <path d="M21 12L16 7L16 17L21 12Z" />
                <path d="M12 2V22" stroke-width="2" stroke-dasharray="4 4" opacity="0.6" />
            </svg>`
        };

        this.MENU_ITEMS = [
            { id: 'agents', label: 'AGENTS', img: 'assets/imgs/icons/Icon_Agents.webp', angle: 0 },
            { id: 'variant', label: 'MODE', img: 'assets/imgs/icons/Icon_Signal_Search.webp', angle: 40 },
            { id: 'footer', label: 'THEME', img: 'assets/imgs/icons/Icon_Compendium.webp', angle: 80 },
            { id: 'kinetic', label: 'MOTION', img: 'assets/imgs/icons/Icon_Feedback.webp', angle: 120 },
            { id: 'close', label: 'CLOSE', icon: this.ICONS.close, angle: 160 },
            { id: 'pattern', label: 'PATTERN', img: 'assets/imgs/icons/Icon_DMs.webp', angle: 200 },
            { id: 'ambient', label: 'EFFECTS', img: 'assets/imgs/icons/Icon_More.webp', angle: 240 },
            { id: 'rotate', label: 'ROTATE', icon: this.ICONS.rotate, angle: 280 },
            { id: 'flip', label: 'FLIP', icon: this.ICONS.flip, angle: 320 },
        ];

        this._clickBound = false;
        this.ringRect = null;
        
        this.agentList = new AgentList({
            currentAgent: this.state.currentAgent,
            onClose: () => this.setState({ isAgentListOpen: false }),
            onSelect: (name) => this.confirmAgent(name)
        });
    }

    render() {
        let segmentsHTML = '';
        let itemsHTML = '';
        
        this.MENU_ITEMS.forEach(item => {
            const rot = `transform: rotate(${item.angle}deg);`;
            segmentsHTML += `
                <svg viewBox="0 0 480 480" class="segment-svg" style="${rot}" data-id="${item.id}">
                    <path class="segment-path" d="M 165.3 26.2 A 226.5 226.5 0 0 1 314.7 26.2 L 273.9 142.8 A 103 103 0 0 0 206.1 142.8 Z" />
                </svg>
            `;

            const iconContent = item.img ?
                `<img src="${item.img}" class="radial-img-icon" alt="${item.label}">` :
                `<div class="radial-svg-icon">${item.icon}</div>`;
            
            itemsHTML += `
                <div class="radial-item" id="radial-item-${item.id}" style="--angle: ${item.angle}deg;">
                    ${iconContent}
                </div>
            `;
        });

        let rouletteHTML = '';
        const textUnit = "• ROULETTE •";
        const groupCenters = [0, 120, 240];
        const charStep = 6;
        groupCenters.forEach(centerAngle => {
            const chars = textUnit.split('');
            const halfLen = (chars.length - 1) / 2;
            chars.forEach((char, i) => {
                const charAngle = centerAngle + (i - halfLen) * charStep;
                rouletteHTML += `<span class="roulette-text-char" style="transform: translate(-50%, -100%) rotate(${charAngle}deg)">${char}</span>`;
            });
        });

        return `
        <div class="settings-overlay ${this.state.isOpen ? 'active' : ''}"></div>
        <div class="settings-menu" style="display: ${this.state.isOpen ? 'flex' : 'none'}; opacity: ${this.state.isOpen ? 1 : 0}; transition: opacity 0.3s ease;">
            <div class="radial-menu-inner" style="transform: scale(${this.state.isOpen ? 1 : 0.8});">
                <div class="radial-menu-wrapper">
                    <div id="radialDynamicLabel" class="radial-dynamic-label">SELECT</div>
                    <div class="radial-ring">
                        <div class="radial-segments-container" id="segments-container">
                            <svg style="position: absolute; width: 0; height: 0;"><defs><filter id="feather-filter" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" /></filter></defs></svg>
                            ${segmentsHTML}
                        </div>
                        <div class="radial-items-overlay" id="items-overlay">${itemsHTML}</div>
                        <div class="hub-selection-indicator" id="hub-selection-indicator"></div>
                        <div class="radial-hub">
                            <div class="hub-ring-bg"></div>
                            <div class="hub-bulges">
                                <div class="hub-bulge b-2"></div>
                                <div class="hub-bulge b-6"></div>
                                <div class="hub-bulge b-10"></div>
                            </div>
                            <div class="hub-notches">
                                <div class="hub-notch n-2"></div>
                                <div class="hub-notch n-6"></div>
                                <div class="hub-notch n-10"></div>
                            </div>
                            <div class="hub-inner-texture"></div>
                            <div class="hub-center-ui">
                                <div class="hub-roulette-html" id="hub-roulette-text">${rouletteHTML}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="agent-list-container"></div>
        </div>
        `;
    }

    onMounted() {
        this.attachListeners();
        this.reMountAgentList();

        window.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });

        window.addEventListener('open-settings', () => this.openMenu());
    }

    onUpdated() {
        this.attachListeners();
        this.reMountAgentList();
    }

    reMountAgentList() {
        if (this.agentList) {
            this.agentList.setState({ 
                isOpen: this.state.isAgentListOpen,
                currentAgent: this.state.currentAgent
            });
            this.agentList.mount('#agent-list-container');
        }
    }

    attachListeners() {
        const segments = this.container.querySelectorAll('.segment-svg');
        const dynamicLabel = this.container.querySelector('#radialDynamicLabel');

        segments.forEach(seg => {
            const id = seg.getAttribute('data-id');
            const item = this.MENU_ITEMS.find(m => m.id === id);
            const overlayItem = this.container.querySelector(`#radial-item-${id}`);

            seg.onmouseover = () => {
                seg.classList.add('active');
                if (overlayItem) overlayItem.classList.add('active');
                dynamicLabel.innerText = item.label;
                dynamicLabel.classList.add('visible');
            };

            seg.onmouseout = () => {
                seg.classList.remove('active');
                if (overlayItem) overlayItem.classList.remove('active');
                dynamicLabel.classList.remove('visible');
                dynamicLabel.innerText = 'SELECT';
            };

            seg.onclick = (e) => {
                e.stopPropagation();
                this.handleItemClick(id);
            };
        });

        if (!this._clickBound) {
            window.addEventListener('click', (e) => {
                const trigger = e.target.closest('.zzz-logo-final, .mobile-settings-trigger');
                if (trigger) {
                    e.preventDefault(); e.stopPropagation();
                    this.openMenu();
                }
            });
            this._clickBound = true;
        }

        const overlay = this.container.querySelector('.settings-overlay');
        if (overlay) overlay.onclick = () => this.closeMenu();
    }

    getOrientKey() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    openMenu() {
        if (this.state.isOpen) return;
        this.setState({ isOpen: true });
        this.ringRect = null;

        const menuInner = this.container.querySelector('.radial-menu-inner');
        anime({
            targets: menuInner,
            scale: [0.8, 1],
            opacity: [0, 1],
            rotate: [-10, 0],
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    closeMenu() {
        if (!this.state.isOpen) return;
        const menuInner = this.container.querySelector('.radial-menu-inner');

        anime({
            targets: menuInner,
            scale: 0.8, opacity: 0, rotate: 10,
            duration: 350, easing: 'easeInQuad',
            complete: () => {
                this.setState({ isOpen: false, isAgentListOpen: false });
            }
        });
    }

    handleMouseMove(e) {
        if (!this.state.isOpen) return;
        const radialRing = this.container.querySelector('.radial-ring');
        const indicator = this.container.querySelector('#hub-selection-indicator');
        if (!radialRing || !indicator) return;

        if (!this.ringRect) {
            this.ringRect = radialRing.getBoundingClientRect();
        }
        const cx = this.ringRect.left + this.ringRect.width / 2;
        const cy = this.ringRect.top + this.ringRect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
        indicator.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
    }

    handleItemClick(id) {
        switch (id) {
            case 'agents': this.setState({ isAgentListOpen: true }); break;
            case 'variant': this.cycleVariant(); break;
            case 'footer': this.toggleFooterTheme(); break;
            case 'kinetic': this.toggleKinetic(); break;
            case 'pattern': this.togglePattern(); break;
            case 'ambient': this.toggleAmbient(); break;
            case 'rotate': this.cycleRotate(); break;
            case 'flip': this.toggleFlip(); break;
            case 'close': this.closeMenu(); break;
        }
    }

    cycleVariant() {
        const variants = ['Default', 'Partial', 'Full'];
        let idx = variants.indexOf(this.state.currentVariant);
        const next = variants[(idx + 1) % variants.length];
        this.setState({ currentVariant: next });
        localStorage.setItem('selectedVariant', next);
        if (window.store) window.store.setState({ currentVariant: next });
        this.applySettings();
    }

    toggleFooterTheme() {
        const next = this.state.footerTheme === 'dark' ? 'white' : 'dark';
        this.setState({ footerTheme: next });
        if (window.store) window.store.setFooterTheme(next);
    }

    toggleKinetic() {
        const next = !this.state.kineticSwayEnabled;
        this.setState({ kineticSwayEnabled: next });
        localStorage.setItem('kineticSway', next);
        if (window.kineticSway) window.kineticSway.setEnabled(next);
        if (window.store) window.store.setState({ kineticEnabled: next });
    }

    togglePattern() {
        const next = !this.state.patternEnabled;
        this.setState({ patternEnabled: next });
        localStorage.setItem('bgPattern', next);
        if (window.PatternRenderer) window.PatternRenderer.setVisible(next);
        if (window.store) window.store.setState({ patternEnabled: next });
    }

    toggleAmbient() {
        const next = !this.state.showAmbient;
        this.setState({ showAmbient: next });
        localStorage.setItem('showAmbient', next);
        if (window.store) window.store.setState({ showAmbient: next });
        this.applySettings(true);
    }

    notifySettingsChanged(detail = {}) {
        window.dispatchEvent(new CustomEvent('wallpaper:settingsChanged', { detail }));
    }

    cycleRotate() {
        const key = `charRotate_${this.getOrientKey()}`;
        const current = parseInt(localStorage.getItem(key) || '0');
        const next = (current + 90) % 360;
        localStorage.setItem(key, next);
        this.notifySettingsChanged({ key, value: next });
        if (window.kineticSway) window.kineticSway.resetElements();
    }

    toggleFlip() {
        const key = `charFlip_${this.getOrientKey()}`;
        const current = localStorage.getItem(key) === 'true';
        const next = !current;
        localStorage.setItem(key, next);
        this.notifySettingsChanged({ key, value: next });
        if (window.kineticSway) window.kineticSway.resetElements();
    }

    applySettings(textOnly = false) {
        if (window.setWallpaper) {
            window.setWallpaper(this.state.currentAgent, this.state.currentVariant, textOnly);
        }
    }

    confirmAgent(name) {
        localStorage.setItem('selectedCharacter', name);
        this.setState({ currentAgent: name, isOpen: false, isAgentListOpen: false });
        if (window.store) window.store.setState({ currentAgent: name });
        this.applySettings();
    }
}
