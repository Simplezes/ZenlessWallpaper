document.addEventListener('DOMContentLoaded', () => {
    let currentAgent = localStorage.getItem('selectedCharacter') || "Ellen Joe";
    let currentVariant = localStorage.getItem('selectedVariant') || "Default";
    let showAmbient = localStorage.getItem('showAmbient') !== 'false';
    let footerTheme = localStorage.getItem('footerTheme') || 'dark';
    let kineticSwayEnabled = localStorage.getItem('kineticSway') !== 'false';
    let patternEnabled = localStorage.getItem('bgPattern') === 'true';

    const ICONS = {
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
        plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`
    };

    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    document.body.appendChild(overlay);

    const menu = document.createElement('div');
    menu.className = 'settings-menu';
    menu.id = 'settings-container';

    const innerHTML = `
        <div class="radial-menu-inner">
            <div class="radial-menu-wrapper">
                <div id="radialDynamicLabel" class="radial-dynamic-label">SELECT</div>
                <div class="radial-ring">
                    <div class="radial-segments-container" id="segments-container"></div>
                    <div class="radial-items-overlay" id="items-overlay"></div>
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
                            <div class="hub-roulette-html" id="hub-roulette-text"></div>
                        </div>
                    </div>
                    <div class="radial-close-instruction">ESC TO CLOSE</div>
                </div>
            </div>
        </div>
        <div class="agent-list-radial" id="agent-list">
            <div class="agent-header">
                <h1 class="header-title">Edit Avatar</h1>
                <div class="header-close-btn" id="agent-list-close"></div>
            </div>

            <div class="agent-main-container">
                <div class="agent-inner-panel">
                    <div class="agent-avatar-grid" id="agent-grid">
                        <!-- Avatars -->
                    </div>
                </div>

                <div class="agent-use-btn-wrapper">
                    <button class="agent-use-btn" id="agent-use-btn">
                        <span class="btn-close-icon">✕</span>
                        <span class="use-text">Use</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    menu.innerHTML = innerHTML;
    document.body.appendChild(menu);

    const menuInner = menu.querySelector('.radial-menu-inner');
    const segmentsContainer = menu.querySelector('#segments-container');
    const itemsOverlay = menu.querySelector('#items-overlay');
    const agentList = menu.querySelector('#agent-list');
    const agentGrid = menu.querySelector('#agent-grid');
    const agentUseBtn = menu.querySelector('#agent-use-btn');
    const agentListClose = menu.querySelector('#agent-list-close');
    const hubRouletteText = menu.querySelector('#hub-roulette-text');
    const dynamicLabel = menu.querySelector('#radialDynamicLabel');

    const MENU_ITEMS = [
        { id: 'agents', label: 'AGENTS', img: 'assets/imgs/icons/Icon_Agents.webp', angle: 0 },
        { id: 'variant', label: 'VARIANT', img: 'assets/imgs/icons/Icon_Signal_Search.webp', angle: 45 },
        { id: 'footer', label: 'STYLE', img: 'assets/imgs/icons/Icon_Compendium.webp', angle: 90 },
        { id: 'kinetic', label: 'KINETIC', img: 'assets/imgs/icons/Icon_Feedback.webp', angle: 135 },
        { id: 'close', label: 'CLOSE', icon: ICONS.close, angle: 180 },
        { id: 'pattern', label: 'PATTERN', img: 'assets/imgs/icons/Icon_DMs.webp', angle: 225 },
        { id: 'ambient', label: 'AMBIENT', img: 'assets/imgs/icons/Icon_More.webp', angle: 270 },
        { id: 'plus', label: 'EMPTY', icon: ICONS.plus, angle: 315 },
    ];

    const radialRing = menu.querySelector('.radial-ring');
    const hubSelectionIndicator = menu.querySelector('#hub-selection-indicator');

    let ringRect = null;

    function updateIndicator(e) {
        if (!menu.style.display || menu.style.display === 'none') return;
        if (!ringRect) {
            ringRect = radialRing.getBoundingClientRect();
        }
        const cx = ringRect.left + ringRect.width / 2;
        const cy = ringRect.top + ringRect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
        hubSelectionIndicator.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
    }

    function initRadialMenu() {
        segmentsContainer.innerHTML = '';
        itemsOverlay.innerHTML = '';
        hubRouletteText.innerHTML = '';

        MENU_ITEMS.forEach((item, i) => {
            const segment = document.createElement('div');
            segment.className = 'segment-html';
            segment.style.setProperty('--seg-angle', `${item.angle}deg`);
            segment.setAttribute('data-id', item.id);
            segment.setAttribute('data-index', i);
            segmentsContainer.appendChild(segment);

            const overlayItem = document.createElement('div');
            overlayItem.className = 'radial-item';
            overlayItem.id = `radial-item-${item.id}`;
            overlayItem.style.setProperty('--angle', `${item.angle}deg`);
            overlayItem.setAttribute('data-id', item.id);

            const iconContent = item.img ?
                `<img src="${item.img}" class="radial-img-icon" alt="${item.label}">` :
                `<div class="radial-svg-icon">${item.icon}</div>`;

            overlayItem.innerHTML = iconContent;
            itemsOverlay.appendChild(overlayItem);
        });

        segmentsContainer.addEventListener('mouseover', (e) => {
            const segment = e.target.closest('.segment-html');
            if (!segment) return;

            const id = segment.getAttribute('data-id');
            const index = parseInt(segment.getAttribute('data-index'));
            const item = MENU_ITEMS[index];
            const overlayItem = document.getElementById(`radial-item-${id}`);

            segment.classList.add('active');
            if (overlayItem) overlayItem.classList.add('active');
            if (dynamicLabel) {
                dynamicLabel.innerText = item.label;
                dynamicLabel.classList.add('visible');
            }
        });

        segmentsContainer.addEventListener('mouseout', (e) => {
            const segment = e.target.closest('.segment-html');
            if (!segment) return;

            const id = segment.getAttribute('data-id');
            const overlayItem = document.getElementById(`radial-item-${id}`);

            segment.classList.remove('active');
            if (overlayItem) overlayItem.classList.remove('active');
            if (dynamicLabel) {
                dynamicLabel.classList.remove('visible');
                dynamicLabel.innerText = 'SELECT';
            }
        });

        segmentsContainer.addEventListener('click', (e) => {
            const segment = e.target.closest('.segment-html');
            if (!segment) return;
            e.stopPropagation();
            handleItemClick(segment.getAttribute('data-id'));
        });

        const textUnit = "• ROULETTE •";
        const groupCenters = [0, 120, 240];
        const charStep = 6;

        groupCenters.forEach(centerAngle => {
            const chars = textUnit.split('');
            const halfLen = (chars.length - 1) / 2;

            chars.forEach((char, i) => {
                const span = document.createElement('span');
                span.className = 'roulette-text-char';
                span.innerText = char;
                const charAngle = centerAngle + (i - halfLen) * charStep;
                span.style.transform = `translate(-50%, -100%) rotate(${charAngle}deg)`;
                hubRouletteText.appendChild(span);
            });
        });

        setupDragScroll();
    }

    function setupDragScroll() {
        const panel = menu.querySelector('.agent-inner-panel');
        let isDown = false;
        let startY;
        let scrollStart;
        let moved = false;

        if (!panel) return;

        panel.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDown = true;
            moved = false;
            panel.classList.add('grabbing');
            startY = e.pageY - panel.offsetTop;
            scrollStart = panel.scrollTop;
        }, { passive: false });

        window.addEventListener('mouseup', () => {
            isDown = false;
            panel.classList.remove('grabbing');
        });

        panel.addEventListener('mouseleave', () => {
            isDown = false;
            panel.classList.remove('grabbing');
        });

        panel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const y = e.pageY - panel.offsetTop;
            const walk = (y - startY) * 2;
            if (Math.abs(walk) > 3) moved = true;
            panel.scrollTop = scrollStart - walk;
        }, { passive: true });

        panel.addEventListener('click', (e) => {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    function handleItemClick(id) {
        switch (id) {
            case 'agents':
                toggleAgentList();
                break;
            case 'variant':
                cycleVariant();
                break;
            case 'ambient':
                toggleAmbient();
                break;
            case 'kinetic':
                toggleKinetic();
                break;
            case 'footer':
                toggleFooterTheme();
                break;
            case 'pattern':
                togglePattern();
                break;
            case 'close':
                closeMenu();
                break;
        }
    }

    function cycleVariant() {
        const variants = ['Default', 'Partial', 'Full'];
        let idx = variants.indexOf(currentVariant);
        currentVariant = variants[(idx + 1) % variants.length];
        localStorage.setItem('selectedVariant', currentVariant);
        applySettings();
    }

    function toggleAmbient() {
        showAmbient = !showAmbient;
        localStorage.setItem('showAmbient', showAmbient);
        applySettings(true);
    }

    function toggleKinetic() {
        kineticSwayEnabled = !kineticSwayEnabled;
        localStorage.setItem('kineticSway', kineticSwayEnabled);
        if (window.kineticSway) window.kineticSway.setEnabled(kineticSwayEnabled);
    }

    function toggleFooterTheme() {
        footerTheme = footerTheme === 'dark' ? 'white' : 'dark';
        localStorage.setItem('footerTheme', footerTheme);
        applyFooterTheme();
    }

    function togglePattern() {
        patternEnabled = !patternEnabled;
        localStorage.setItem('bgPattern', patternEnabled);
        if (window.PatternRenderer) window.PatternRenderer.setVisible(patternEnabled);
    }

    function toggleAgentList() {
        const isActive = agentList.classList.contains('active');
        if (isActive) {
            agentList.classList.remove('active');
        } else {
            populateAgents();
            agentList.classList.add('active');
        }
    }

    let selectedAvatarName = currentAgent;
    let agentsPopulated = false;

    function populateAgents() {
        if (agentsPopulated) {
            // Just update selection
            agentGrid.querySelectorAll('.agent-avatar-item').forEach(item => {
                const name = item.getAttribute('data-name');
                item.classList.toggle('active', name === currentAgent);
                item.classList.toggle('selected', name === selectedAvatarName);
            });
            return;
        }

        if (!window.characters || !window.characters.characters) {
            setTimeout(populateAgents, 100);
            return;
        }

        agentGrid.innerHTML = '';
        const factions = window.characters.characters;

        const fragment = document.createDocumentFragment();
        const allAgents = [];
        for (const faction in factions) {
            for (const name in factions[faction]) {
                const fileName = `Avatar_${name.replace(/\s+/g, '_')}.webp`;
                allAgents.push({ name, img: `assets/avatars/${fileName}` });
            }
        }

        allAgents.forEach(agent => {
            const item = document.createElement('div');
            item.className = 'agent-avatar-item';
            item.setAttribute('data-name', agent.name);
            if (agent.name === currentAgent) item.classList.add('active');
            if (agent.name === selectedAvatarName) item.classList.add('selected');

            item.innerHTML = `
                <img src="${agent.img}" class="avatar-img" alt="${agent.name}" loading="lazy">
            `;

            fragment.appendChild(item);
        });

        agentGrid.appendChild(fragment);

        // Click delegation for agent grid
        agentGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.agent-avatar-item');
            if (item) {
                selectedAvatarName = item.getAttribute('data-name');
                agentGrid.querySelectorAll('.agent-avatar-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
            }
        });

        agentsPopulated = true;
    }

    agentUseBtn.addEventListener('click', () => {
        currentAgent = selectedAvatarName;
        localStorage.setItem('selectedCharacter', currentAgent);
        closeMenu();
        applySettings();
        //closeMenu(() => {
        //    setTimeout(() => {
        //        applySettings();
        //    }, 0);
        //});
    });

    agentListClose.addEventListener('click', toggleAgentList);

    function applySettings(textOnly = false) {
        if (window.setWallpaper) {
            window.setWallpaper(currentAgent, currentVariant, textOnly);
        }
    }

    function applyFooterTheme() {
        const footer = document.querySelector('.footer');
        const logos = document.querySelectorAll('.zzz-logo-final img, .mini-logo');

        if (footerTheme === 'white') {
            footer.classList.add('footer-light');
            logos.forEach(logo => logo.src = 'assets/imgs/logo_dark.png');
        } else {
            footer.classList.remove('footer-light');
            logos.forEach(logo => logo.src = 'assets/imgs/logo_white.png');
        }
    }

    const openMenu = () => {
        overlay.classList.add('active');
        menu.style.display = 'flex';
        ringRect = null; // Forces recalculation on opening
        window.addEventListener('mousemove', updateIndicator, { passive: true });

        anime({
            targets: menuInner,
            scale: [0.8, 1],
            opacity: [0, 1],
            rotate: [-10, 0],
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });
    };

    const closeMenu = (onComplete) => {
        agentList.classList.remove('active');
        window.removeEventListener('mousemove', updateIndicator);

        anime({
            targets: menuInner,
            scale: 0.8,
            opacity: 0,
            rotate: 10,
            duration: 350,
            easing: 'easeInQuad',
            complete: () => {
                menu.style.display = 'none';
                overlay.classList.remove('active');
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }
        });
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    const settingsTriggers = document.querySelectorAll('.zzz-logo-final, .mobile-settings-trigger');
    settingsTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            openMenu();
        });
    });

    overlay.addEventListener('click', closeMenu);

    initRadialMenu();
    applyFooterTheme();
    if (window.PatternRenderer) window.PatternRenderer.setVisible(patternEnabled);
});
