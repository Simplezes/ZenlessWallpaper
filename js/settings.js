document.addEventListener('DOMContentLoaded', () => {
    let currentAgent = localStorage.getItem('selectedCharacter') || "Ellen Joe";
    let currentVariant = localStorage.getItem('selectedVariant') || "Default";
    let showAmbient = localStorage.getItem('showAmbient') !== 'false';
    let footerTheme = localStorage.getItem('footerTheme') || 'dark';
    let kineticSwayEnabled = localStorage.getItem('kineticSway') !== 'false';

    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settings-container';
    settingsContainer.className = 'settings-container';

    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    document.body.appendChild(overlay);

    const menu = document.createElement('div');
    menu.className = 'settings-menu';

    menu.innerHTML = `
        <div class="menu-header">
            <div class="header-main">
                <span class="header-title">SYSTEM_SETTINGS</span>
            </div>
            <button class="close-btn">
                <div class="close-icon"></div>
            </button>
        </div>
        <div class="menu-content">
            <div class="menu-content-inner">
                <div class="section-label">CONFIGURATION</div>
                <div class="menu-row variant-toggle">
                    <div class="menu-label">VARIANT_TYPE</div>
                    <div class="toggle-group">
                        <button class="toggle-btn" data-variant="Default">STD</button>
                        <button class="toggle-btn" data-variant="Partial">PRT</button>
                        <button class="toggle-btn" data-variant="Full">MAX</button>
                    </div>
                </div>
                <div class="menu-row ambient-toggle">
                    <div class="menu-label">AMBIENT_TEXT</div>
                    <div class="toggle-group">
                        <button class="toggle-btn" data-ambient="true">ON</button>
                        <button class="toggle-btn" data-ambient="false">OFF</button>
                    </div>
                </div>
                <div class="menu-row movement-toggle">
                    <div class="menu-label">KINETIC_SWAY</div>
                    <div class="toggle-group">
                        <button class="toggle-btn" data-kinetic="true">ON</button>
                        <button class="toggle-btn" data-kinetic="false">OFF</button>
                    </div>
                </div>
                <div class="menu-row footer-toggle">
                    <div class="menu-label">FOOTER_STYLE</div>
                    <div class="toggle-group">
                        <button class="toggle-btn" data-theme="dark">DRK</button>
                        <button class="toggle-btn" data-theme="white">WHT</button>
                    </div>
                </div>
                <div class="section-separator"></div>
                <div class="section-label">DATABASE_ENTRIES</div>
            </div>
            <div class="agent-scroll-list-wrapper">
                <div class="agent-scroll-list" id="agent-list"></div>
                <div class="scroll-controls">
                    <button id="scroll-up" class="nav-btn">▲</button>
                    <button id="scroll-down" class="nav-btn">▼</button>
                </div>
            </div>
            </div>
        </div>
    `;

    document.body.appendChild(menu);

    const scrollContainer = menu.querySelector('#agent-list');
    const closeBtn = menu.querySelector('.close-btn');

    function populateCharacters() {
        if (!window.characters || !window.characters.characters) {
            setTimeout(populateCharacters, 100);
            return;
        }

        scrollContainer.innerHTML = '';

        const factionData = window.characters.characters;
        for (const factionName in factionData) {
            const header = document.createElement('div');
            header.className = 'faction-header';
            header.innerHTML = `
                <span class="faction-name">${factionName}</span>
                <span class="faction-accent"></span>
            `;
            scrollContainer.appendChild(header);

            const agents = factionData[factionName];
            for (const agentName in agents) {
                const color = agents[agentName];
                const item = document.createElement('div');
                item.className = 'menu-item';
                if (agentName === currentAgent) item.classList.add('active');


                item.innerHTML = `
                    <div class="item-active-bar"></div>
                    <div class="item-main">
                        <span class="item-name">${agentName}</span>
                    </div>
                `;

                item.addEventListener('click', () => {
                    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    currentAgent = agentName;
                    applySettings();
                });

                scrollContainer.appendChild(item);
            }
        }
    }

    menu.querySelectorAll('.variant-toggle .toggle-btn').forEach(btn => {
        if (btn.dataset.variant === currentVariant) btn.classList.add('active');
        btn.addEventListener('click', () => {
            menu.querySelectorAll('.variant-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentVariant = btn.dataset.variant;
            localStorage.setItem('selectedVariant', currentVariant);
            applySettings();
        });
    });

    function applySettings(textOnly = false) {
        if (window.setWallpaper) {
            window.setWallpaper(currentAgent, currentVariant, textOnly);
        }
    }

    menu.querySelectorAll('.ambient-toggle .toggle-btn').forEach(btn => {
        if (btn.dataset.ambient === String(showAmbient)) btn.classList.add('active');
        btn.addEventListener('click', () => {
            menu.querySelectorAll('.ambient-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showAmbient = btn.dataset.ambient === 'true';
            localStorage.setItem('showAmbient', showAmbient);
            applySettings(true);
        });
    });

    menu.querySelectorAll('.movement-toggle .toggle-btn').forEach(btn => {
        if (btn.dataset.kinetic === String(kineticSwayEnabled)) btn.classList.add('active');
        btn.addEventListener('click', () => {
            menu.querySelectorAll('.movement-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            kineticSwayEnabled = btn.dataset.kinetic === 'true';
            localStorage.setItem('kineticSway', kineticSwayEnabled);
            if (window.kineticSway) window.kineticSway.setEnabled(kineticSwayEnabled);
        });
    });

    menu.querySelectorAll('.footer-toggle .toggle-btn').forEach(btn => {
        if (btn.dataset.theme === footerTheme) btn.classList.add('active');
        btn.addEventListener('click', () => {
            menu.querySelectorAll('.footer-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            footerTheme = btn.dataset.theme;
            localStorage.setItem('footerTheme', footerTheme);
            applyFooterTheme();
        });
    });

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

    applyFooterTheme();

    const openMenu = () => {
        overlay.classList.add('active');
        menu.style.display = 'flex';
        populateCharacters();

        anime({
            targets: menu,
            translateX: ['100%', '0%'],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutQuart'
        });

        anime({
            targets: overlay,
            opacity: [0, 1],
            duration: 400,
            easing: 'linear'
        });
    };

    const closeMenu = () => {
        anime({
            targets: menu,
            translateX: '100%',
            opacity: 0,
            duration: 400,
            easing: 'easeInExpo',
            complete: () => {
                menu.style.display = 'none';
                overlay.classList.remove('active');
            }
        });

        anime({
            targets: overlay,
            opacity: 0,
            duration: 300,
            easing: 'linear'
        });
    };

    const settingsTriggers = document.querySelectorAll('.zzz-logo-final, .mobile-settings-trigger');
    settingsTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            openMenu();
        });
    });

    const setupScrollControls = () => {
        const scrollUp = menu.querySelector('#scroll-up');
        const scrollDown = menu.querySelector('#scroll-down');

        scrollUp.addEventListener('click', () => {
            scrollContainer.scrollBy({ top: -100, behavior: 'smooth' });
        });

        scrollDown.addEventListener('click', () => {
            scrollContainer.scrollBy({ top: 100, behavior: 'smooth' });
        });

        let isDown = false;
        let startY;
        let scrollTop;
        let moved = false;

        scrollContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            moved = false;
            scrollContainer.classList.add('grabbing');
            startY = e.pageY - scrollContainer.offsetTop;
            scrollTop = scrollContainer.scrollTop;
        });

        scrollContainer.addEventListener('mouseleave', () => {
            isDown = false;
            scrollContainer.classList.remove('grabbing');
        });

        scrollContainer.addEventListener('mouseup', () => {
            isDown = false;
            scrollContainer.classList.remove('grabbing');
        });

        scrollContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const y = e.pageY - scrollContainer.offsetTop;
            const walk = (y - startY) * 1.5;
            if (Math.abs(walk) > 5) moved = true;
            if (moved) {
                e.preventDefault();
                scrollContainer.scrollTop = scrollTop - walk;
            }
        });

        scrollContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            scrollContainer.scrollBy({ top: e.deltaY, behavior: 'auto' });
        }, { passive: false });

        scrollContainer.addEventListener('click', (e) => {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    };

    setupScrollControls();

    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
});

