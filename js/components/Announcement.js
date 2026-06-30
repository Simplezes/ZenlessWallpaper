import Component from './Component.js';
import store from '../store.js';

export default class Announcement extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            isVisible: false,
            layout: store.state.layout,
            hasSeen: localStorage.getItem('announcementSeen_v2') === 'true'
        };

        this.useStore(store, (s) => ({
            layout: s.layout
        }));

        this._showTimer = null;
    }

    render() {
        if (!this.state.isVisible) return '';

        const isNewLayout = this.state.layout === 'calendar';
        const message = "Hey Proxy! We have other calendar versions you can try! You can switch between them anytime in the settings to find your favorite.";
        const actionLabel = isNewLayout ? "Try Classic Version" : "Try Modern Version";

        return `
        <div class="announcement-wrapper ${this.state.isVisible ? 'active' : ''}">
            <div class="announcement-choices">
                <div class="choice-item primary" id="announcement-action">
                    <div class="choice-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.45L18.85 19H5.15L12 5.45zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z"/></svg>
                    </div>
                    <span class="choice-text">${actionLabel}</span>
                </div>
                <div class="choice-item secondary" id="announcement-dismiss">
                    <div class="choice-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                    <span class="choice-text">Wait, not yet</span>
                </div>
            </div>
            <div class="announcement-dialogue">
                <div class="dialogue-content">
                    <p class="dialogue-text">${message}</p>
                    <div class="dialogue-next-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 17.59L11.58 12 6 6.41 7.41 5l7 7-7 7-1.41-1.41zm6 0L17.58 12 12 6.41 13.41 5l7 7-7 7-1.41-1.41z"/></svg>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    onMounted() {
        if (this.state.isVisible) {
            this.attachListeners();
        }
    }

    onUpdated() {
        if (this.state.isVisible) {
            this.attachListeners();
        }
    }

    attachListeners() {
        const actionBtn = this.container.querySelector('#announcement-action');
        const dismissBtn = this.container.querySelector('#announcement-dismiss');

        if (actionBtn) {
            actionBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleLayout();
                this.dismiss();
            };
        }

        if (dismissBtn) {
            dismissBtn.onclick = (e) => {
                e.stopPropagation();
                this.dismiss();
            };
        }
    }

    toggleLayout() {
        const current = localStorage.getItem('wallpaperLayout') || 'calendar';
        const next = current === 'calendar' ? 'default' : 'calendar';
        localStorage.setItem('wallpaperLayout', next);
        if (window.store) window.store.setState({ layout: next });
        window.dispatchEvent(new CustomEvent('layout-changed', { detail: { layout: next } }));
    }

    show() {
        if (this.state.hasSeen) return;

        if (this._showTimer) clearTimeout(this._showTimer);
        this._showTimer = setTimeout(() => {
            this.setState({ isVisible: true });
            this.animateIn();

            this._autoDismissTimer = setTimeout(() => {
                if (this.state.isVisible) {
                    this.dismiss();
                }
            }, 12000);
        }, 3000);
    }

    onUnmounted() {
        if (this._showTimer) {
            clearTimeout(this._showTimer);
            this._showTimer = null;
        }
        if (this._autoDismissTimer) {
            clearTimeout(this._autoDismissTimer);
            this._autoDismissTimer = null;
        }
    }

    animateIn() {
        const dialogue = this.container.querySelector('.announcement-dialogue');
        const choices = this.container.querySelectorAll('.choice-item');
        if (!window.anime) return;

        const tl = anime.timeline();

        if (dialogue) {
            tl.add({
                targets: dialogue,
                translateY: [60, 0],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutCubic'
            });
        }

        if (choices.length) {
            tl.add({
                targets: choices,
                translateX: [40, 0],
                opacity: [0, 1],
                delay: anime.stagger(100),
                duration: 500,
                easing: 'easeOutCubic'
            }, '-=400');
        }
    }

    dismiss() {
        if (this._autoDismissTimer) {
            clearTimeout(this._autoDismissTimer);
            this._autoDismissTimer = null;
        }
        const dialogue = this.container.querySelector('.announcement-dialogue');
        const choices = this.container.querySelectorAll('.choice-item');
        if (window.anime) {
            anime({
                targets: [dialogue, ...choices],
                opacity: 0,
                translateY: 20,
                duration: 400,
                easing: 'easeInQuad',
                complete: () => {
                    this.setState({ isVisible: false, hasSeen: true });
                    localStorage.setItem('announcementSeen_v2', 'true');
                }
            });
        } else {
            this.setState({ isVisible: false, hasSeen: true });
            localStorage.setItem('announcementSeen_v2', 'true');
        }
    }
}
