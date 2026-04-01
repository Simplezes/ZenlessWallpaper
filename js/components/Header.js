import Component from './Component.js';
import store from '../store.js';

export default class Header extends Component {
    constructor(props = {}) {
        super(props);
        
        this.useStore(store, (s) => ({
            month: s.month,
            year: s.year
        }));
    }

    render() {
        return `
        <div class="mobile-header">
            <div class="header-left">
                <h1 class="calendar-title">CALENDAR</h1>
                <div class="header-sub">
                    <img src="assets/imgs/logo_white.png" alt="ZZZ" class="mini-logo">
                    <div class="header-glyphs">KOBEBW BBABA BBZBE YEAUKE</div>
                </div>
            </div>
            <div class="header-right">
                <div class="pill-month" id="header-month-name">${this.state.month}</div>
                <div class="year-display">[ <span id="header-year">${this.state.year}</span> ]</div>
                <div class="zzz-dashed-svg"></div>
            </div>
        </div>
        `;
    }
}
