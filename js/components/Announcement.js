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
    }

    render() {
        if (!this.state.isVisible) return '';

        const isNewLayout = this.state.layout === 'calendar';
        const message = isNewLayout
            ? "Don't like the new calendar layout?"
            : "We created a new calendar layout!";
        const actionLabel = isNewLayout ? "Switch to Classic" : "Try New Layout";

        return `
        <div class="announcement-wrapper ${this.state.isVisible ? 'active' : ''}">
            <div class="announcement-container">
                <div class="announcement-tag">NOTICE</div>
                <div class="announcement-close" id="announcement-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </div>
                <div class="announcement-content">
                    <div class="announcement-body">
                        <p class="announcement-title">${message}</p>
                    </div>
                    <div class="announcement-footer">
                        <button class="announcement-btn primary" id="announcement-action">
                            ${actionLabel}
                        </button>
                        <button class="announcement-btn secondary" id="announcement-dismiss">
                            Dismiss
                        </button>
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
        const closeBtn = this.container.querySelector('#announcement-close');

        if (actionBtn) {
            actionBtn.onclick = () => {
                this.toggleLayout();
                this.dismiss();
            };
        }

        if (dismissBtn) {
            dismissBtn.onclick = () => this.dismiss();
        }

        if (closeBtn) {
            closeBtn.onclick = () => this.dismiss();
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

        setTimeout(() => {
            this.setState({ isVisible: true });
            this.animateIn();
        }, 3000);
    }

    animateIn() {
        const el = this.container.querySelector('.announcement-container');
        if (!el || !window.anime) return;

        anime({
            targets: el,
            translateY: [40, 0],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    dismiss() {
        const el = this.container.querySelector('.announcement-container');
        if (el && window.anime) {
            anime({
                targets: el,
                translateY: 40,
                opacity: 0,
                duration: 400,
                easing: 'easeInBack',
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
