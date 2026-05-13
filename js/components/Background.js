import Component from './Component.js';
import store from '../store.js';

const ZZZ_MAIN_PATH = "M1737.9,343.4c.2,95.3.3,190.7.1,286,0,4.1-.2,9.7-3.1,12.1-2.4,2.1-5.4,2.4-8.6,2.5-108.3-.5-216.7,1.1-325,1.1s-21.7,0-32.6,0c-49.4-.8-94.7,4.7-139.2-21.9-10.7-6.4-20.7-14.4-29.2-23.5-6.7-6.3-12.2-14.2-19.1-20.3-9.6-7.2-14.9,1.3-14.2,10.9,0,13.7.2,27.5-.4,41.2-.2,3.9-1,8.3-4.3,10.6-2.5,1.8-6.6,2-10,2-9.2,0-18.4-.1-27.6,0-113.1,2.3-226.1.6-339.2,1.1-6.9,0-13.8.1-20.7.1-14.7,0-29.5-.3-43.9-2.1-26.8-2.6-52.8-12.1-74.6-27.6-9.9-7-18.9-15.3-26.8-24.8-5.4-7-18.5-23.7-24.2-8-1.4,5-1.3,10.5-1.3,15.7,0,10.8.2,21.7-.3,32.5-.1,8.4-4.3,12.3-13,12.2-138.5.5-276.9,1.6-415.4,0-39.4,1-78.9,1-118.3.9-7.3,0-14.5-.2-21.8-.5-9.1,0-14.5-3.4-15.1-12.6-.8-30.4,0-60.9-.2-91.4.5-31.5-2-63.6,6.1-94.4,7.3-29.3,24.6-55.5,47.5-74.9,7.3-6.4,15.1-12.2,23.4-17.5,4.9-3.2,11.2-7.2,12.8-12.8,2.7-11-5-14.9-16.2-14.9-19.1-.4-38.5,0-57.5,0-4.6,0-10,.1-13-3.7-1.6-2-2-4.6-2.2-7.6-2.4-96.2.4-192.6.2-288.8,0-2.7.4-5.2,1.3-7.2,1.3-2.7,3.8-4.1,6.8-4.5,53.3-.8,106.9,0,160.2-.9h.2c66-1.4,132.1,1.5,198.1-.2,18.5-.6,37.1.7,55.6.8,16.7-.4,33.8.5,49.9,5.1,6.3,1.8,12.5,4.1,18.5,7.2,7.8,4.1,15.7,7.8,23.2,12.3,15.2,9.5,27.2,23.2,38.8,36.7,3.5,4.7,10.4,8.9,15.1,3.4,3.6-4.2,3.4-10.5,3.6-15.7,0-10-.2-20-.3-30-.4-11.6,1.3-19.3,14.7-19.3,55.9-1.6,111.8,1.3,167.7,0,26.6-.5,53.3-.8,79.9,0,15.2-.4,30.3-1,45.6-.5,42.1,1.6,84.3.8,126.5.9,10.1-.2,20.2.9,30,3.4,9.2,1.9,18.2,4.3,26.7,7.8,5.9,2.4,11.5,5.2,16.9,8.8,15.2,9.4,29.6,20.4,40.4,34.6,2.9,3.6,5.4,7.7,8.8,10.7,12.1,9.9,15.9-4.1,16-14.3.6-11.3.3-22.8.6-34-.1-11.4,4.3-16.9,16.5-16.8,14.5-.4,29-.2,43.5-.1,65.3-.1,130.7.8,196-.7,55,1.4,110,.7,165,.7,49.7,0,99.5-.2,149.2,0,4.2.2,7.8.5,10,3.3,1.6,2,2,4.3,2.2,7-.1,55.2,1.4,110.5-.2,165.6-3.2,43-28.2,81.8-62.7,106.9-4.8,3.4-9.8,6.6-14.9,9.6-4.5,2.7-9.4,6.5-10.5,11.4-2.2,9,7.7,13.9,15.4,14,15.4.6,30.9.1,46.3,0,2.7,0,5.3,0,8,0,5.5.1,12.3-.5,16.1,4.2,1.6,2.1,2.2,5.1,2.4,8.4Z";
const ZZZ_PORTRAIT_PATH = "M7.5,1.8c231.3-2.5,464.1,0,695.4,0,36.9,2.5,70.7,13.5,101.2,28.3,6.4,4.9,14.5,7.4,20.9,13.5,9.6,6.2,16.1,17.2,28.9,20.9,1.6,0,3.2,0,4.8-2.5,6.4-16,0-39.4,3.2-56.6,4.8-7.4,19.3-3.7,28.9-4.9,54.6-1.2,107.6,0,162.2,0h669.7c8,0,17.7,0,24.1,3.7,3.2,2.5,3.2,4.9,3.2,8.6v156.4c-1.6,34.5-16.1,67.7-45,94.8-14.5,9.8-22.5,23.4-41.8,30.8-9.6,3.7-17.7,7.4-25.7,12.3-6.4,4.9-24.1,4.9-24.1,13.5s6.4,4.9,11.2,4.9c36.9,0,77.1,0,114,1.2,9.6,0,9.6,9.8,9.6,16v295.5c0,8.6-6.4,12.3-17.7,11.1h-597.4c-102.8,1.2-162.2,0-232.9-62.8-17.7-4.9-9.6,19.7-11.2,28.3-3.2,13.5,6.4,35.7-19.3,34.5-287.5-2.5-581.4,4.9-867.2-3.7-4.8-43.1,0-89.9-1.6-134.2-8-64,27.3-131.7,102.8-163.7,101.2-33.2-64.2-19.7-93.1-22.2-8,0-9.6-7.4-9.6-13.5V12.9c0-3.7,0-7.4,3.2-9.8";

export default class Background extends Component {
    constructor(props = {}) {
        super(props);

        this.useStore(store, (s) => ({
            layout: s.layout,
            character: s.currentAgent,
            isPortrait: s.isPortrait,
            accentColor: s.accentColor,
            footerTheme: s.footerTheme,
            showAmbient: s.showAmbient
        }));

        this._lastRenderedLayout = this.state.layout;
    }

    render() {
        const isCalendar = this.state.layout === 'calendar';
        const themeClass = this.state.footerTheme === 'white' ? 'theme-light' : '';
        const ambientClass = this.state.showAmbient ? 'show-ambient' : '';

        return `
            <div class="layout-container layout-${this.state.layout} ${this.state.isPortrait ? 'is-mobile' : 'is-desktop'} ${themeClass} ${ambientClass}">
                ${isCalendar ? this.renderCalendarLayout() : this.renderDefaultLayout()}
            </div>
        `;
    }

    renderCalendarLayout() {
        const now = new Date();
        const monthData = {
            num: String(now.getMonth() + 1).padStart(2, '0'),
            name: now.toLocaleString('en-US', { month: 'short' })
        };

        if (this.state.isPortrait) {
            return this.renderPortraitSVG(monthData);
        } else {
            return this.renderDesktopSVG(monthData);
        }
    }

    renderDesktopSVG(monthData) {
        return `
            <div id="logo-container" class="desktop-view">
                <svg id="logo-svg" viewBox="0 0 2438 1001.7" preserveAspectRatio="xMidYMid meet" style="${this.getDesktopStyles()}">
                    ${this.renderCommonDefs('zzz-logo-clip')}
                    ${this.renderMaskedLayer('zzz-logo-clip', 2438, 1001.7)}
                    
                    <g style="transform: translate(var(--box-bottom-tx), var(--box-bottom-ty));">
                        <foreignObject x="20" y="694" width="700" height="299">
                            ${this.renderUIBoxContent(monthData)}
                        </foreignObject>
                    </g>

                    <g style="transform: translate(var(--center-tx), var(--center-ty));">
                        <foreignObject x="620" y="615" width="460" height="500">
                            ${this.renderMonthDisplayContent(monthData)}
                        </foreignObject>
                    </g>
                </svg>
            </div>
        `;
    }

    renderPortraitSVG(monthData) {
        return `
            <div id="logo-container" class="mobile-view">
                <svg id="logo-svg" viewBox="0 0 1080 2400" preserveAspectRatio="xMidYMid meet" style="${this.getPortraitStyles()}">
                    ${this.renderCommonDefs('zzz-logo-clip-mobile', true)}
                    ${this.renderMaskedLayer('zzz-logo-clip-mobile', 1080, 2400)}
                    
                    <g style="transform: translate(var(--m-label-tx), var(--m-label-ty));">
                        <foreignObject x="50" y="1500" width="900" height="300">
                            ${this.renderCalendarHeader(monthData)}
                        </foreignObject>
                    </g>

                    <g style="transform: translate(var(--m-name-tx), var(--m-name-ty)) scale(var(--m-name-s));">
                        <foreignObject x="50" y="1722" width="1000" height="280">
                            ${this.renderAgentName()}
                        </foreignObject>
                    </g>

                    <g style="transform: translate(var(--m-center-tx), var(--m-center-ty)) scale(var(--m-center-s));">
                        <foreignObject x="620" y="615" width="460" height="500">
                            ${this.renderMonthDisplayContent(monthData)}
                        </foreignObject>
                    </g>

                    <g style="transform: translate(var(--m-center-tx), var(--m-center-ty)) scale(var(--m-center-s));">
                        <foreignObject x="620" y="615" width="460" height="500" style="overflow:visible; pointer-events:none;">
                            <img class="calendar-patch" src="assets/imgs/patch.webp" style="position:absolute; width:45%; left:-2%; top:10%; transform:rotate(-5deg); z-index:1000;" />
                        </foreignObject>
                    </g>
                </svg>
            </div>
        `;
    }

    renderCommonDefs(clipId, isPortrait = false) {
        const zzzTransform = isPortrait
            ? "translate(var(--m-zzz-tx), var(--m-zzz-ty)) scale(var(--m-zzz-s))"
            : "translate(var(--zzz-tx), var(--zzz-ty)) rotate(var(--zzz-r)) scale(var(--zzz-s)); transform-origin: 1737.9px 343.4px;";

        const sideTransform = isPortrait
            ? "translate(var(--m-side-tx), var(--m-side-ty))"
            : "translate(var(--box-side-tx), var(--box-side-ty))";

        const bottomTransform = isPortrait
            ? "translate(var(--m-bottom-tx), var(--m-bottom-ty))"
            : "translate(var(--box-bottom-tx), var(--box-bottom-ty))";

        const sideW = isPortrait ? 880 : 630;
        const sideH = isPortrait ? 750 : 984.3;
        const bottomW = isPortrait ? 350 : 650;
        const bottomH = isPortrait ? 550 : 299;

        const zzzPath = isPortrait ? ZZZ_PORTRAIT_PATH : ZZZ_MAIN_PATH;

        return `
            <defs>
                <path id="shape-zzz" d="${zzzPath}" />
                <rect id="shape-box-bottom" x="1087.9" y="694" width="${bottomW}" height="${bottomH}" rx="6" />
                <rect id="shape-box-side" x="1788" y="8.7" width="${sideW}" height="${sideH}" rx="6" />
                
                <clipPath id="${clipId}">
                    <use href="#shape-zzz" style="transform: ${zzzTransform}" />
                    <use href="#shape-box-side" style="transform: ${sideTransform}" />
                    <use href="#shape-box-bottom" style="transform: ${bottomTransform}" />
                </clipPath>
            </defs>
        `;
    }

    renderMaskedLayer(clipId, w, h) {
        const inkClass = this.state.showAmbient ? 'ink-print' : '';
        const pathData = this.state.isPortrait ? ZZZ_PORTRAIT_PATH : ZZZ_MAIN_PATH;
        return `
            <g class="masked-content-group">
                <g style="clip-path: url(#${clipId}); -webkit-clip-path: url(#${clipId});">
                    <foreignObject x="0" y="0" width="${w}" height="${h}">
                        <div id="background-masked-content" style="width:${w}px; height:${h}px;">
                            <canvas id="bg-pattern-canvas"></canvas>
                            <canvas id="zzz-bg-transition" style="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0;"></canvas>
                            <div id="backdrop" class="bg-layer active" style="opacity: 0;"></div>
                            <div id="transition-backdrop" class="bg-layer" style="opacity: 0;"></div>
                            <canvas id="zzz-cyber-transition" style="position:absolute;inset:0;width:100%;height:100%;z-index:100;pointer-events:none;opacity:0;"></canvas>
                            <div id="image-container">
                                <img id="main-image" class="char-image active" />
                                <img id="transition-image" class="char-image" />
                            </div>
                        </div>
                    </foreignObject>
                </g>
            </g>
        `;
    }

    renderUIBoxContent(monthData) {
        return `
            <div class="calendar-modular-column">
                ${this.renderCalendarHeader(monthData)}
                ${this.renderAgentName()}
            </div>
        `;
    }

    renderCalendarHeader(monthData) {
        const inkClass = this.state.showAmbient ? 'ink-print' : '';
        return `
            <div class="calendar-header-block ${inkClass}">
                <div class="header-left-group">
                    <div class="calendar-label">CALENDAR</div>
                    <div class="calendar-sub-label">
                        <span class="zzz-tag-svg">
                            <svg viewBox="0 0 70 39" fill="currentColor">
                                <path d="M70 190 l0 -130 290 0 290 0 0 130 0 130 -290 0 -290 0 0 -130z m210 51 c0 -10 -16 -31 -35 -45 -20 -15 -33 -32 -29 -37 4 -6 11 -5 21 2 10 9 19 10 31 2 14 -8 24 -3 52 24 l35 35 -32 -7 c-30 -6 -33 -5 -33 19 l0 26 140 0 c125 0 140 -2 140 -17 0 -9 -14 -32 -32 -50 -17 -18 -28 -36 -25 -40 4 -4 13 -1 19 5 20 20 38 14 38 -13 0 -24 -2 -25 -70 -25 -60 0 -70 3 -70 18 0 9 17 32 37 50 l38 32 -37 -6 c-33 -5 -38 -3 -39 12 0 13 -2 15 -6 5 -3 -7 -20 -27 -37 -43 l-31 -29 33 6 c29 6 32 5 32 -19 l0 -26 -139 0 c-90 0 -142 4 -147 11 -3 6 11 29 32 51 l39 40 -37 -7 c-36 -7 -38 -6 -38 19 0 26 1 26 75 26 67 0 75 -2 75 -19z" transform="translate(0,39) scale(0.1,-0.1)" />
                            </svg>
                        </span>
                        <div class="calendar-sub-content">
                            <span class="calendar-zenless-label">ZENLESS — ${monthData.num}</span>
                            <div class="calendar-meta-text">
                                KOBEBW BBABA SWEGVW<br>
                                PERSONA 3 IS THE BEST PERSONA
                            </div>
                        </div>
                    </div>
                </div>
                ${this.state.isPortrait ? this.renderCalendarDateBlock(monthData) : ''}
            </div>
        `;
    }

    renderAgentName() {
        const { character: name, isPortrait } = this.state;

        const landscapeFontSize = [
            [24, '44px'],
            [20, '52px'],
            [17, '64px'],
            [13, '50px'],
            [10, '70px'],
        ].find(([limit]) => name.length > limit)?.[1] || '85px';

        const portraitFontSize = [
            [24, '20px'],
            [20, '30px'],
            [17, '40px'],
            [13, '42px'],
            [10, '47px'],
        ].find(([limit]) => name.length > limit)?.[1] || '70px';

        const fontSize = isPortrait ? portraitFontSize : landscapeFontSize;
        const maxWidth = isPortrait ? '62%' : '650px';

        const inkClass = this.state.showAmbient ? 'ink-print' : '';

        return `
            <div class="calendar-footer-block ${inkClass}">
                <div class="calendar-name-badge-svg">
                    <svg viewBox="0 0 216 53" fill="currentColor">
                        <g transform="translate(0,53) scale(0.1,-0.1)">
                            <path d="M72 474 c-21 -15 -22 -20 -22 -195 0 -105 4 -188 10 -200 10 -19 32 -19 1030 -19 913 0 1020 2 1034 16 13 13 16 45 16 195 0 166 -1 180 -20 199 -20 20 -33 20 -1023 20 -891 0 -1005 -2 -1025 -16z m348 -82 c0 -16 -55 -60 -94 -76 -45 -19 -90 -20 -152 -5 -43 11 -44 13 -44 50 l0 39 145 0 c80 0 145 -4 145 -8z m235 -47 c38 -30 73 -55 78 -55 4 0 7 10 6 23 -1 12 -1 37 -1 55 l2 33 53 -3 52 -3 5 -95 5 -95 49 80 c72 117 70 115 140 115 69 -1 65 3 135 -117 23 -40 46 -73 51 -73 6 0 10 41 10 95 l0 95 53 0 c46 0 59 -5 93 -33 74 -61 65 -61 124 -12 50 41 60 45 107 45 l53 0 0 -124 c0 -138 2 -135 -72 -128 l-38 4 0 49 c0 27 -3 49 -6 49 -4 0 -24 -16 -45 -35 -22 -19 -45 -35 -52 -35 -7 0 -32 16 -54 35 -23 19 -44 35 -47 35 -3 0 -6 -22 -6 -50 0 -57 11 -53 -130 -50 -49 1 -80 6 -91 16 -22 20 -162 20 -179 -1 -10 -12 -36 -15 -117 -15 l-104 0 -62 50 c-34 28 -65 50 -69 50 -5 0 -8 -22 -8 -50 l0 -50 -41 0 c-36 0 -41 3 -55 36 -24 58 -27 91 -14 154 l13 60 47 0 c41 0 54 -6 115 -55z m1373 18 l3 -33 -105 0 c-141 0 -149 -18 -9 -22 l108 -3 3 -32 3 -33 -93 -1 c-113 -2 -112 -2 -115 -14 -3 -11 -1 -11 120 -14 l87 -1 0 -30 0 -30 -165 0 -165 0 0 125 0 125 163 -2 162 -3 3 -32z m-1854 -145 c47 -55 46 -68 -4 -68 -40 0 -40 0 -40 39 0 22 -3 46 -6 55 -11 29 14 16 50 -26z" />
                            <path d="M1020 281 c-15 -28 -13 -31 20 -31 17 0 30 3 30 6 0 12 -21 44 -30 44 -5 0 -14 -9 -20 -19z" />
                        </g>
                    </svg>
                </div>
                <div class="calendar-agent-name-row">
                    <div class="calendar-agent-name" style="font-size: ${fontSize}; max-width: ${maxWidth}; text-overflow: ellipsis; white-space: nowrap;">${name}</div>
                    ${this.state.isPortrait ? this.renderAgentNameAddon() : ''}
                </div>
            </div>
        `;
    }

    renderAgentNameAddon() {
        return `
            <div class="agent-name-addon">
                <div class="addon-top">
                    <div class="addon-glyphs">
                        <div class="glyph-line">THE AGENT HAS</div>
                        <div class="glyph-line">KNOWN UNDER THE</div>
                    </div>
                    <span class="addon-z">[ Z ]</span>
                </div>
                <div class="addon-bottom">
                    <div class="addon-dashed-svg"></div>
                </div>
            </div>
        `;
    }


    renderMonthDisplayContent(monthData) {
        const inkClass = this.state.showAmbient ? 'ink-print' : '';
        return `
            <div class="calendar-month-center-display-svg ${inkClass}">
                <div class="center-month-num">${monthData.num}</div>
                <div class="center-month-name">${monthData.name}.</div>
            </div>
        `;
    }

    renderCalendarDateBlock(monthData) {
        const year = new Date().getFullYear();
        const inkClass = this.state.showAmbient ? 'ink-print' : '';
        return `
            <div class="calendar-date-block ${inkClass}">
                <div class="date-month-pill">${monthData.name.toUpperCase()}</div>
                <div class="date-year-display">[ ${year} ]</div>
            </div>
        `;
    }

    renderDefaultLayout() {
        return `
            <canvas id="bg-pattern-canvas"></canvas>
            <canvas id="zzz-bg-transition" style="position:fixed;inset:0;width:100%;height:100%;z-index:-5;pointer-events:none;opacity:0;"></canvas>
            <div id="backdrop" class="bg-layer active" style="opacity: 0;"></div>
            <div id="transition-backdrop" class="bg-layer" style="opacity: 0;"></div>
            <div id="faction-text" class="ambient-text faction"></div>
            <div id="image-container">
                <img id="main-image" class="char-image active" />
                <img id="transition-image" class="char-image" />
            </div>
            <canvas id="zzz-cyber-transition" style="position:fixed;inset:0;width:100%;height:100%;z-index:509;pointer-events:none;opacity:0;"></canvas>
            <div id="nickname-text" class="ambient-text nickname"></div>
        `;
    }

    getDesktopStyles() {
        return `
            --zzz-tx: 0px; --zzz-ty: 0px; --zzz-r: 0deg; --zzz-s: 1;
            --box-bottom-tx: 0px; --box-bottom-ty: 0px;
            --box-side-tx: 0px; --box-side-ty: 0px;
            --center-tx: 0px; --center-ty: 0px;
        `;
    }

    getPortraitStyles() {
        return `
            --m-zzz-tx: 175px; --m-zzz-ty: 520px; --m-zzz-s: 0.51;
            --m-side-tx: -1610px; --m-side-ty: 890px;
            --m-bottom-tx: -380px; --m-bottom-ty: 1010px;
            --m-center-tx: -860px; --m-center-ty: 685px; --m-center-s: 1.45;
            --m-label-tx: 110px; --m-label-ty: -1395px;
            --m-name-tx: 110px; --m-name-ty: 527px; --m-name-s: 0.95;
        `;
    }

    onMounted() {
        window.addEventListener('layout-changed', (e) => {
            this.syncStateFromStorage();
            this.setState({ layout: e.detail.layout });
            if (typeof resetImageCache === 'function') resetImageCache();
            this.refreshCharacterImage();
        });

        window.addEventListener('character-changed', (e) => {
            if (this.state.character !== e.detail.character) {
                this.setState({
                    character: e.detail.character,
                    faction: e.detail.faction,
                    nickname: e.detail.nickname,
                    baseColor: localStorage.getItem('--accent-color')
                });
            }
        });

        window.addEventListener('resize', () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            if (isPortrait !== this.state.isPortrait) {
                this.syncStateFromStorage();
                this.setState({ isPortrait });
                this.refreshCharacterImage();
            }
        });

        this.refreshCharacterImage();
        this.initAll(true);
    }

    onUpdated() {
        this.refreshCharacterImage();
        const layoutChanged = this._lastRenderedLayout !== this.state.layout;
        this._lastRenderedLayout = this.state.layout;
        this.initAll(layoutChanged);
    }

    initAll(forceWallpaperUpdate = false) {
        if (window.PatternRenderer && window.PatternRenderer.init) {
            window.PatternRenderer.init();
            const patternPref = localStorage.getItem('bgPattern') !== 'false';
            window.PatternRenderer.setVisible(patternPref);
        }

        if (window.kineticSway) {
            window.kineticSway.resetElements();
            window.kineticSway.setEnabled(localStorage.getItem('kineticSway') !== 'false');
        }

        const currentAgent = this.state.character;
        const currentVariant = localStorage.getItem('selectedVariant') || "Full";

        if (window.setWallpaper && forceWallpaperUpdate) {
            window.setWallpaper(currentAgent, currentVariant, true);
        }

        window.dispatchEvent(new CustomEvent('background-ready'));
    }

    refreshCharacterImage() {
        const char = localStorage.getItem('selectedCharacter');
        const variant = localStorage.getItem('selectedVariant') || "Default";
        if (char && window.getCharacterData) {
            const charData = window.getCharacterData(char);
            if (charData) {
                const imgPath = `assets/wallpaper/Mindscape_${charData.idName}_${variant}.webp`;
                const mainImg = document.getElementById('main-image');
                if (mainImg && (!mainImg.src || mainImg.src === '')) {
                    mainImg.src = imgPath;
                    mainImg.style.opacity = '1';
                }
            }
        }
    }

    syncStateFromStorage() {
        this.setState({
            character: localStorage.getItem('selectedCharacter') || 'Burnice White',
            faction: localStorage.getItem('selectedFaction') || 'KOBEBW',
            nickname: localStorage.getItem('selectedNickname') || 'BURNICE',
            baseColor: localStorage.getItem('--accent-color') || 'rgb(252, 91, 144)'
        });
    }
}
