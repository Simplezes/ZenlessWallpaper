document.addEventListener('DOMContentLoaded', () => {
    let currentAgent = localStorage.getItem('selectedCharacter') || "Burnice White";
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
                <div class="z-scrollbar" id="agent-scrollbar">
                    <div class="z-scrollbar__wrap agent-inner-panel">
                        <div class="z-scrollbar__view">
                            <div class="agent-avatar-grid" id="agent-grid">
                                <!-- Avatars -->
                            </div>
                        </div>
                    </div>
                    <div class="z-scrollbar__bar z-scrollbar__vertical">
                        <div class="z-icon">
                            <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" fill="currentColor"/></svg>
                        </div>
                        <div class="z-scrollbar__thumb">
                            <div class="z-scrollbar__track"></div>
                        </div>
                        <div class="z-icon">
                            <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>
                        </div>
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
        { id: 'variant', label: 'MODE', img: 'assets/imgs/icons/Icon_Signal_Search.webp', angle: 45 },
        { id: 'footer', label: 'THEME', img: 'assets/imgs/icons/Icon_Compendium.webp', angle: 90 },
        { id: 'kinetic', label: 'MOTION', img: 'assets/imgs/icons/Icon_Feedback.webp', angle: 135 },
        { id: 'close', label: 'CLOSE', icon: ICONS.close, angle: 180 },
        { id: 'pattern', label: 'PATTERN', img: 'assets/imgs/icons/Icon_DMs.webp', angle: 225 },
        { id: 'ambient', label: 'EFFECTS', img: 'assets/imgs/icons/Icon_More.webp', angle: 270 },
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

        // Add shared SVG filter for feathered edges
        const filterDef = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        filterDef.style.position = "absolute";
        filterDef.style.width = "0";
        filterDef.style.height = "0";
        filterDef.innerHTML = `
            <defs>
                <filter id="feather-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                </filter>
            </defs>
        `;
        segmentsContainer.appendChild(filterDef);

        MENU_ITEMS.forEach((item, i) => {
            const segment = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            segment.setAttribute("viewBox", "0 0 480 480");
            segment.classList.add('segment-svg');
            segment.style.setProperty('--seg-angle', `${item.angle}deg`);
            segment.setAttribute('data-id', item.id);
            segment.setAttribute('data-index', i);

            segment.innerHTML = `<path class="segment-path" d="M 165.3 26.2 A 226.5 226.5 0 0 1 314.7 26.2 L 273.9 142.8 A 103 103 0 0 0 206.1 142.8 Z" />`;
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
            const segment = e.target.closest('.segment-svg');
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
            const segment = e.target.closest('.segment-svg');
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
            const segment = e.target.closest('.segment-svg');
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
        initZScrollbar(document.getElementById('agent-scrollbar'));
    }

    function initZScrollbar(el) {
        if (!el) return;
        const wrap = el.querySelector('.z-scrollbar__wrap');
        const track = el.querySelector('.z-scrollbar__track');
        const thumbContainer = el.querySelector('.z-scrollbar__thumb');
        const icons = el.querySelectorAll('.z-icon');

        function update() {
            if (!wrap || !track) return;
            const containerHeight = wrap.clientHeight;
            const scrollHeight = wrap.scrollHeight;
            if (scrollHeight <= containerHeight) {
                track.style.display = 'none';
                return;
            }
            track.style.display = 'block';

            const heightPercentage = Math.max(10, (containerHeight / scrollHeight) * 100);
            track.style.height = heightPercentage + '%';

            const scrollPercentage = (wrap.scrollTop / (scrollHeight - containerHeight)) * (100 - heightPercentage);
            track.style.transform = `translateY(${scrollPercentage}%)`;
        }

        // Arrow clicking
        if (icons.length >= 2) {
            icons[0].addEventListener('click', () => wrap.scrollBy({ top: -100, behavior: 'smooth' }));
            icons[1].addEventListener('click', () => wrap.scrollBy({ top: 100, behavior: 'smooth' }));
        }

        // Dragging
        let isDragging = false;
        let startY, startScrollTop;

        track.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.pageY;
            startScrollTop = wrap.scrollTop;
            document.body.classList.add('grabbing');
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaY = e.pageY - startY;
            const scrollHeight = wrap.scrollHeight;
            const containerHeight = wrap.clientHeight;
            const ratio = scrollHeight / containerHeight;
            wrap.scrollTop = startScrollTop + deltaY * ratio;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.classList.remove('grabbing');
        });

        wrap.addEventListener('scroll', update);
        window.addEventListener('resize', update);
        el.addEventListener('mouseenter', update);

        const observer = new MutationObserver(update);
        observer.observe(wrap, { childList: true, subtree: true });

        setTimeout(update, 100);
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
