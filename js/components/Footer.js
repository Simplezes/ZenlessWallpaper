import Component from './Component.js';
import Calendar from './Calendar.js';
import Watch from './Watch.js';
import MediaPlayer from './MediaPlayer.js';
import store from '../store.js';

export default class Footer extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            footerTheme: 'dark',
            month: 'MAR',
            year: '2026'
        };

        this.useStore(store, (s) => ({
            footerTheme: s.footerTheme,
            month: s.month,
            year: s.year
        }));

        this.mediaPlayer = new MediaPlayer();
        this.calendar = new Calendar();
        this.watchDesktop = new Watch();
        this.watchMobile = new Watch();
    }

    render() {
        const { footerTheme, month, year } = this.state;
        const logoSrc = footerTheme === 'white' ? 'assets/imgs/logo_dark.png' : 'assets/imgs/logo_white.png';

        return `
        <div class="footer container-fluid p-0 m-0 ${footerTheme === 'white' ? 'footer-light' : ''}">
            <div class="row w-100 h-100 m-0 align-items-center justify-content-between flex-nowrap">
                <!-- Media Player Section -->
                <div class="col-auto d-flex align-items-center h-100 p-0 footer-left">
                    <div id="media-player-root"></div>
                </div>

                <!-- Calendar Section (Middle) -->
                <div class="col d-flex justify-content-center align-items-center h-100 px-3 overflow-hidden">
                    <div class="calendar-wrap d-flex flex-column w-100" id="dynamic-calendar">
                        <!-- Content will be injected by Calendar.js -->
                    </div>
                </div>

                <!-- Brand & Watch Section (Right) -->
                <div class="col-auto d-flex align-items-center justify-content-end h-100 p-0 pe-5 footer-right">
                    <div class="brand-container">
                        <div class="top-row">
                            <div class="title-text title-svg"></div>
                            <div class="badge-container">
                                <div id="watch-desktop-root"></div>
                                <div class="z-tag">Z</div>
                            </div>
                        </div>
                        <div class="bottom-row">
                            <div class="left-block">
                                KOBEBW BBABA SWEGVW<br>
                                PERSONA 3&4 ARE THE BEST PERSONA
                            </div>
                            <div class="right-meta-group">
                                <div class="right-meta">
                                    <div class="pill-month" id="brand-month-name">${month}</div>
                                    <div class="year-display">[ <span id="brand-year">${year}</span> ]</div>
                                </div>
                                <div class="zzz-dashed-svg"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="zzz-logo-final ms-5 mobile-settings-trigger">
                        <img src="${logoSrc}" alt="ZZZ">
                        <div class="zzz-logo-sub">Settings</div>
                    </div>
                </div>

                <!-- Vertical Mobile Brand (Hidden by default, shown via media query) -->
                <div class="vertical-brand d-none mobile-settings-trigger">
                    <div class="vertical-month-text vertical-month-svg"></div>
                    <div id="watch-mobile-root"></div>
                    <div class="zzz-logo-final">
                        <img src="${logoSrc}" alt="ZZZ">
                        <div class="zzz-logo-sub">CONFIG</div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    onMounted() {
        this.reMountChildren();
        window.dispatchEvent(new CustomEvent('footer-ready'));
    }

    onUpdated() {
        this.reMountChildren();
        if (window.CMYKManager) {
            window.CMYKManager.apply(this.container.closest('.footer') || '.footer');
        }
    }

    reMountChildren() {
        if (this.mediaPlayer) this.mediaPlayer.mount('#media-player-root');
        if (this.calendar) this.calendar.mount('#dynamic-calendar');
        if (this.watchDesktop) this.watchDesktop.mount('#watch-desktop-root');
        if (this.watchMobile) this.watchMobile.mount('#watch-mobile-root');
    }
}
