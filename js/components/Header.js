import Component from './Component.js';
import store from '../store.js';

export default class Header extends Component {
    constructor(props = {}) {
        super(props);

        this.useStore(store, (s) => ({
            month: s.month,
            year: s.year,
            layout: s.layout,
            isPortrait: s.isPortrait,
            footerTheme: s.footerTheme,
            showAmbient: s.showAmbient
        }));
    }

    render() {
        const isCalendar = this.state.layout === 'calendar';
        const hideHeaderLeft = isCalendar && this.state.isPortrait;
        const monthNumber = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const themeClass = this.state.footerTheme === 'white' ? 'theme-light' : '';

        return `
        <div class="mobile-header ${hideHeaderLeft ? 'header-hide-left' : ''} ${themeClass}">
            ${hideHeaderLeft ? '' : `
            <div class="header-left">
                <div class="calendar-label">CALENDAR</div>
                <div class="calendar-sub-label">
                    <span class="zzz-tag-svg">
                        <svg viewBox="0 0 70 39" fill="currentColor">
                            <path d="M70 190 l0 -130 290 0 290 0 0 130 0 130 -290 0 -290 0 0 -130z m210 51 c0 -10 -16 -31 -35 -45 -20 -15 -33 -32 -29 -37 4 -6 11 -5 21 2 10 9 19 10 31 2 14 -8 24 -3 52 24 l35 35 -32 -7 c-30 -6 -33 -5 -33 19 l0 26 140 0 c125 0 140 -2 140 -17 0 -9 -14 -32 -32 -50 -17 -18 -28 -36 -25 -40 4 -4 13 -1 19 5 20 20 38 14 38 -13 0 -24 -2 -25 -70 -25 -60 0 -70 3 -70 18 0 9 17 32 37 50 l38 32 -37 -6 c-33 -5 -38 -3 -39 12 0 13 -2 15 -6 5 -3 -7 -20 -27 -37 -43 l-31 -29 33 6 c29 6 32 5 32 -19 l0 -26 -139 0 c-90 0 -142 4 -147 11 -3 6 11 29 32 51 l39 40 -37 -7 c-36 -7 -38 -6 -38 19 0 26 1 26 75 26 67 0 75 -2 75 -19z" transform="translate(0,39) scale(0.1,-0.1)" />
                        </svg>
                    </span>
                    <div class="calendar-sub-content">
                    
                        <span class="calendar-zenless-label">ZENLESS — ${monthNumber}</span>
                        <div class="calendar-meta-text">
                            KOBEBW BBABA SWEGVW<br>
                            PERSONA 3 IS THE BEST PERSONA
                        </div>
                    </div>
                </div>
            </div>
            `}
            ${isCalendar ? '' : `
            <div class="header-right">
                <div class="pill-month" id="header-month-name">${this.state.month}</div>
                <div class="year-display">[ <span id="header-year">${this.state.year}</span> ]</div>
                <div class="zzz-dashed-svg"></div>
            </div>
            `}
        </div>
        `;
    }
}
