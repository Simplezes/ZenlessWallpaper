import Component from './Component.js';
import AgentList from './AgentList.js';

export default class Settings extends Component {
    constructor(props = {}) {
        super(props);
        const storage = window.safeStorage;
        this.state = {
            currentAgent: storage ? storage.get('selectedCharacter', "Burnice White") : (localStorage.getItem('selectedCharacter') || "Burnice White"),
            currentVariant: storage ? storage.get('selectedVariant', "Default") : (localStorage.getItem('selectedVariant') || "Default"),
            showAmbient: storage ? storage.getBool('showAmbient', true) : localStorage.getItem('showAmbient') !== 'false',
            footerTheme: storage ? storage.get('footerTheme', 'dark') : (localStorage.getItem('footerTheme') || 'dark'),
            kineticSwayEnabled: storage ? storage.getBool('kineticSway', true) : localStorage.getItem('kineticSway') !== 'false',
            patternEnabled: storage ? storage.getBool('bgPattern', true) : localStorage.getItem('bgPattern') !== 'false',
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
            </svg>`,
            layout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`
        };

        this.MENU_ITEMS = [
            { id: 'agents', label: 'AGENTS', img: 'assets/imgs/icons/Icon_Agents.webp', angle: 0, category: 'char' },
            { id: 'variant', label: 'MODE', img: 'assets/imgs/icons/Icon_Signal_Search.webp', angle: 36, category: 'char' },
            { id: 'footer', label: 'THEME', img: 'assets/imgs/icons/Icon_Compendium.webp', angle: 72, category: 'ui' },
            { id: 'kinetic', label: 'MOTION', img: 'assets/imgs/icons/Icon_Feedback.webp', angle: 108, category: 'fx' },
            { id: 'close', label: 'CLOSE', icon: this.ICONS.close, angle: 180, category: 'sys' },
            { id: 'layout', label: 'LAYOUT', icon: this.ICONS.layout, angle: 144, category: 'ui' },
            { id: 'pattern', label: 'PATTERN', img: 'assets/imgs/icons/Icon_DMs.webp', angle: 216, category: 'fx' },
            { id: 'ambient', label: 'EFFECTS', img: 'assets/imgs/icons/Icon_More.webp', angle: 252, category: 'fx' },
            { id: 'rotate', label: 'ROTATE', icon: this.ICONS.rotate, angle: 288, category: 'trans' },
            { id: 'flip', label: 'FLIP', icon: this.ICONS.flip, angle: 324, category: 'trans' },
        ];

        this._clickBound = false;
        this.ringRect = null;
        this._indicatorRotation = null;
        this._onMouseMove = this.handleMouseMove.bind(this);
        this._onKeyDown = (e) => {
            if (e.key === 'Escape') this.closeMenu();
        };
        this._onOpenSettings = () => this.openMenu();
        this._onWindowClick = (e) => {
            const trigger = e.target.closest('.zzz-logo-final, .mobile-settings-trigger');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                this.openMenu();
            }
        };

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
                <svg viewBox="0 0 480 480" class="segment-svg category-${item.category}" style="${rot}" data-id="${item.id}">
                    <path class="segment-path" d="M 177.6 22.6 A 226.5 226.5 0 0 1 302.4 22.6 L 268.4 141.1 A 103 103 0 0 0 211.6 141.1 Z" />
                </svg>
            `;

            const iconContent = item.img ?
                `<img src="${item.img}" class="radial-img-icon" alt="${item.label}">` :
                `<div class="radial-svg-icon">${item.icon}</div>`;

            const state = this.getItemActiveState(item.id);
            const stateClass = state === true ? 'state-on' : (state === false ? 'state-off' : '');

            itemsHTML += `
                <div class="radial-item ${stateClass}" id="radial-item-${item.id}" style="--angle: ${item.angle}deg;">
                    ${iconContent}
                    <div class="radial-item-label-container">
                        <span class="radial-item-name">${item.label}</span>
                    </div>
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

    getLabelForId(id) {
        const storage = window.safeStorage;
        const item = this.MENU_ITEMS.find(m => m.id === id);
        if (!item) return '';

        switch (id) {
            case 'variant': return `MODE: ${this.state.currentVariant}`;
            case 'footer': return `THEME: ${this.state.footerTheme.toUpperCase()}`;
            case 'kinetic': return `MOTION: ${this.state.kineticSwayEnabled ? 'ON' : 'OFF'}`;
            case 'layout': return `LAYOUT: ${((storage ? storage.get('wallpaperLayout', 'calendar') : (localStorage.getItem('wallpaperLayout') || 'calendar'))).toUpperCase()}`;
            case 'pattern': return `PATTERN: ${this.state.patternEnabled ? 'ON' : 'OFF'}`;
            case 'ambient': return `EFFECTS: ${this.state.showAmbient ? 'ON' : 'OFF'}`;
            case 'rotate': {
                const key = `charRotate_${this.getOrientKey()}`;
                const val = storage ? storage.get(key, '0') : (localStorage.getItem(key) || '0');
                return `ROTATE: ${val}°`;
            }
            case 'flip': {
                const key = `charFlip_${this.getOrientKey()}`;
                const val = (storage ? storage.get(key, 'false') : localStorage.getItem(key)) === 'true';
                return `FLIP: ${val ? 'YES' : 'NO'}`;
            }
            default: return item.label;
        }
    }

    getItemActiveState(id) {
        const storage = window.safeStorage;
        switch (id) {
            case 'kinetic': return this.state.kineticSwayEnabled;
            case 'pattern': return this.state.patternEnabled;
            case 'ambient': return this.state.showAmbient;
            case 'flip': return (storage ? storage.get(`charFlip_${this.getOrientKey()}`, 'false') : localStorage.getItem(`charFlip_${this.getOrientKey()}`)) === 'true';
            case 'footer': return this.state.footerTheme === 'dark';
            case 'layout': return (storage ? storage.get('wallpaperLayout', 'calendar') : (localStorage.getItem('wallpaperLayout') || 'calendar')) === 'calendar';
            case 'variant': return true;
            case 'rotate': return parseInt(storage ? storage.get(`charRotate_${this.getOrientKey()}`, '0') : (localStorage.getItem(`charRotate_${this.getOrientKey()}`) || '0')) !== 0;
            default: return null;
        }
    }

    onMounted() {
        this.attachListeners();
        this.reMountAgentList();

        window.addEventListener('mousemove', this._onMouseMove, { passive: true });
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('open-settings', this._onOpenSettings);
    }

    onUpdated() {
        this.attachListeners();
        this.reMountAgentList();
    }

    onUnmounted() {
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('open-settings', this._onOpenSettings);
        window.removeEventListener('click', this._onWindowClick);
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

                const label = this.getLabelForId(id);
                dynamicLabel.innerText = label;
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
                setTimeout(() => {
                    if (seg.classList.contains('active')) {
                        dynamicLabel.innerText = this.getLabelForId(id);
                    }
                }, 50);
            };
        });

        if (!this._clickBound) {
            window.addEventListener('click', this._onWindowClick);
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
        this._indicatorRotation = null;

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
        const targetRotation = angle + 90;

        if (this._indicatorRotation === null) {
            this._indicatorRotation = targetRotation;
        }

        let delta = targetRotation - this._indicatorRotation;
        delta = ((delta + 540) % 360) - 180;
        this._indicatorRotation += delta;

        indicator.style.transform = `translate(-50%, -50%) rotate(${this._indicatorRotation}deg)`;
    }

    handleItemClick(id) {
        switch (id) {
            case 'agents': this.setState({ isAgentListOpen: true }); break;
            case 'variant': this.cycleVariant(); break;
            case 'footer': this.toggleFooterTheme(); break;
            case 'kinetic': this.toggleKinetic(); break;
            case 'layout': this.toggleLayout(); break;
            case 'pattern': this.togglePattern(); break;
            case 'ambient': this.toggleAmbient(); break;
            case 'rotate': this.cycleRotate(); break;
            case 'flip': this.toggleFlip(); break;
            case 'close': this.closeMenu(); break;
        }
    }

    _patchItemState(id, active) {
        if (!this.container) return;
        const el = this.container.querySelector(`#radial-item-${id}`);
        if (!el) return;
        el.classList.toggle('state-on', active === true);
        el.classList.toggle('state-off', active === false);
    }

    toggleLayout() {
        const current = (window.safeStorage && window.safeStorage.get('wallpaperLayout', 'calendar')) || (localStorage.getItem('wallpaperLayout') || 'calendar');
        const next = current === 'calendar' ? 'default' : 'calendar';
        if (window.safeStorage) window.safeStorage.set('wallpaperLayout', next);
        else localStorage.setItem('wallpaperLayout', next);
        if (window.store) window.store.setState({ layout: next });
        window.dispatchEvent(new CustomEvent('layout-changed', { detail: { layout: next } }));
    }

    cycleVariant() {
        const charData = window.getCharacterData && window.getCharacterData(this.state.currentAgent);
        const variants = (charData && charData.variants) || ['Default', 'Partial', 'Full'];
        let idx = variants.indexOf(this.state.currentVariant);
        if (idx === -1) idx = 0;
        const next = variants[(idx + 1) % variants.length];
        this.setState({ currentVariant: next });
        if (window.safeStorage) window.safeStorage.set('selectedVariant', next);
        else localStorage.setItem('selectedVariant', next);
        if (window.store) window.store.setState({ currentVariant: next });
        this.applySettings(false, { currentVariant: next });
    }

    toggleFooterTheme() {
        const next = this.state.footerTheme === 'dark' ? 'white' : 'dark';
        this._state.footerTheme = next;
        this._patchItemState('footer', next === 'dark');
        if (window.store) window.store.setFooterTheme(next);
        this.applySettings(true);
    }

    toggleKinetic() {
        const next = !this.state.kineticSwayEnabled;
        this._state.kineticSwayEnabled = next;
        this._patchItemState('kinetic', next);
        if (window.safeStorage) window.safeStorage.set('kineticSway', next);
        else localStorage.setItem('kineticSway', next);
        if (window.kineticSway) window.kineticSway.setEnabled(next);
        if (window.PatternRenderer) window.PatternRenderer.setMotion(next);
        if (window.store) window.store.setState({ kineticEnabled: next });
    }

    togglePattern() {
        const next = !this.state.patternEnabled;
        this._state.patternEnabled = next;
        this._patchItemState('pattern', next);
        if (window.safeStorage) window.safeStorage.set('bgPattern', next);
        else localStorage.setItem('bgPattern', next);
        if (window.PatternRenderer) window.PatternRenderer.setVisible(next);
        if (window.store) window.store.setState({ patternEnabled: next });
    }

    toggleAmbient() {
        const next = !this.state.showAmbient;
        this._state.showAmbient = next;
        this._patchItemState('ambient', next);
        if (window.safeStorage) window.safeStorage.set('showAmbient', next);
        else localStorage.setItem('showAmbient', next);
        if (window.store) window.store.setState({ showAmbient: next });
        this.applySettings(true);
    }

    notifySettingsChanged(detail = {}) {
        window.dispatchEvent(new CustomEvent('wallpaper:settingsChanged', { detail }));
    }

    cycleRotate() {
        const storage = window.safeStorage;
        const key = `charRotate_${this.getOrientKey()}`;
        const current = parseInt(storage ? storage.get(key, '0') : (localStorage.getItem(key) || '0'));
        const next = (current + 90) % 360;
        if (window.safeStorage) window.safeStorage.set(key, next);
        else localStorage.setItem(key, next);
        this.notifySettingsChanged({ key, value: next });
        if (window.kineticSway) window.kineticSway.resetElements();
    }

    toggleFlip() {
        const storage = window.safeStorage;
        const key = `charFlip_${this.getOrientKey()}`;
        const current = (storage ? storage.get(key, 'false') : localStorage.getItem(key)) === 'true';
        const next = !current;
        if (window.safeStorage) window.safeStorage.set(key, next);
        else localStorage.setItem(key, next);
        this.notifySettingsChanged({ key, value: next });
        if (window.kineticSway) window.kineticSway.resetElements();
    }

    applySettings(textOnly = false, overrides = {}) {
        if (window.setWallpaper) {
            const storage = window.safeStorage;
            const currentAgent = overrides.currentAgent
                || this.state.currentAgent
                || (storage ? storage.get('selectedCharacter', "Burnice White") : (localStorage.getItem('selectedCharacter') || "Burnice White"));
            const currentVariant = overrides.currentVariant
                || this.state.currentVariant
                || (storage ? storage.get('selectedVariant', "Default") : (localStorage.getItem('selectedVariant') || "Default"));

            window.setWallpaper(currentAgent, currentVariant, textOnly);
        }
    }

    confirmAgent(name) {
        if (window.safeStorage) window.safeStorage.set('selectedCharacter', name);
        else localStorage.setItem('selectedCharacter', name);

        const charData = window.getCharacterData && window.getCharacterData(name);
        const validVariants = (charData && charData.variants) || ['Default', 'Partial', 'Full'];
        let variant = this.state.currentVariant;
        if (!validVariants.includes(variant)) {
            variant = validVariants[0];
            if (window.safeStorage) window.safeStorage.set('selectedVariant', variant);
            else localStorage.setItem('selectedVariant', variant);
        }

        this.setState({ currentAgent: name, currentVariant: variant, isOpen: false, isAgentListOpen: false });
        if (window.store) window.store.setState({ currentAgent: name, currentVariant: variant });
        this.applySettings(false, { currentAgent: name, currentVariant: variant });
    }
}
