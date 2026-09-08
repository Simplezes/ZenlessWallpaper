import Component from './Component.js';
import store from '../store.js';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default class FooterSlim extends Component {
    render() {
        const now = new Date();
        const dayLabel = `${DAY_NAMES[now.getDay()]} ${now.getDate().toString().padStart(2, '0')}`;

        const timeValue = store.state.timeValue || '--:--';
        const ampm = store.state.ampm;
        const use24h = store.state.use24h;
        const monthNum = store.state.monthNum || '--';

        const media = store.state.media || {};
        const isPlaying = Number(media.playbackState) === 1 && media.title;

        return `
        <div class="chip-media ${isPlaying ? 'active' : ''}">${isPlaying ? `${escapeHtml(media.title)}${media.artist ? ` - ${escapeHtml(media.artist)}` : ''}` : ''}</div>
        <div class="chip-clock" id="chip-clock">
            <div class="dock">
                <div class="month-wedge"><span>${escapeHtml(monthNum)}</span></div>
                <div class="plate">
                    <span class="chip-day">${dayLabel}</span>
                    <span class="time">${timeValue}${!use24h && ampm ? ` <small>${ampm}</small>` : ''}</span>
                </div>
            </div>
        </div>
        <div class="chip-zmark dossier-trigger"><span>Z</span></div>
        `;
    }

    onMounted() {
        this.useStore(store, (s) => ({
            timeValue: s.timeValue,
            ampm: s.ampm,
            use24h: s.use24h,
            media: s.media,
            monthNum: s.monthNum
        }));

        const clock = this.container.querySelector('#chip-clock');
        if (clock && !clock._clickBound) {
            clock._clickBound = true;
            clock.addEventListener('click', () => store.toggleTimeFormat());
        }
    }

    onUpdated() {
        const clock = this.container.querySelector('#chip-clock');
        if (clock && !clock._clickBound) {
            clock._clickBound = true;
            clock.addEventListener('click', () => store.toggleTimeFormat());
        }
    }
}

function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
