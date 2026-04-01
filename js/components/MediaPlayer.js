import Component from './Component.js';

export default class MediaPlayer extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            rawTitle: '',
            rawArtist: '',
            playbackState: 0
        };

        this.visualizerPeak = 0.1;
        this.peakdecay = 0.98;
    }

    render() {
        const { title, artist, status, isPlaying } = this.getDisplayState();
        return `
            <div class="media-container ${isPlaying ? 'is-playing' : 'is-idle'}" id="media-container">
                <div class="terminal-status" id="terminal-status">${status}</div>
                <div class="media-title-wrap">
                    <div id="media-title" class="media-title">${title}</div>
                </div>
                <div id="media-artist" class="media-artist">${artist}</div>
                <div class="terminal-visualizer">
                    <div class="v3-bar" style="animation-delay: 0.16s"></div>
                    <div class="v3-bar" style="animation-delay: 0.3s"></div>
                    <div class="v3-bar" style="animation-delay: 0.2s"></div>
                    <div class="v3-bar" style="animation-delay: 0.5s"></div>
                    <div class="v3-bar" style="animation-delay: 0.4s"></div>
                    <div class="v3-bar" style="animation-delay: 0.7s"></div>
                </div>
            </div>
        `;
    }

    onMounted() {
        if (!this.initialized) {
            this.initListeners();
            this.initialized = true;
        }
        this.updateScrolling();
    }

    onUpdated() {
        this.updateScrolling();
    }

    getDisplayState() {
        const title = this.normalizeText(this.state.rawTitle);
        const artist = this.normalizeText(this.state.rawArtist);
        const isPlaying = Number(this.state.playbackState) === 1;
        const shouldShow = isPlaying && title !== '';

        return {
            title: shouldShow ? title : 'NO MEDIA',
            artist: shouldShow ? (artist || 'IDLE') : 'IDLE',
            status: shouldShow ? 'SIGNAL RECEIVED // PLAYING' : 'SIGNAL LOST // IDLE',
            isPlaying: shouldShow
        };
    }

    normalizeText(value) {
        if (typeof value !== 'string') return '';
        const normalized = value.trim();
        if (!normalized || normalized === 'NO MEDIA' || normalized === 'IDLE') {
            return '';
        }
        return normalized;
    }

    logMediaEvent(source, playbackState, title, artist) {
        const stateLabels = {
            0: 'stopped',
            1: 'playing',
            2: 'paused'
        };
        const state = Number(playbackState) || 0;
        const label = stateLabels[state] || `unknown(${state})`;

        console.log('[MediaPlayer]', {
            source,
            state,
            stateLabel: label,
            title: title || '(empty)',
            artist: artist || '(empty)'
        });
    }

    initListeners() {
        if (window.wallpaperRegisterMediaPlaybackListener) {
            window.wallpaperRegisterMediaPlaybackListener((event) => {
                // Only update playback state — keep last known title/artist so
                // resuming the same track restores the title without a new properties event.
                const playbackState = Number(event?.state) || 0;
                this.setState({ playbackState });
                this.logMediaEvent('playback', playbackState, this.state.rawTitle, this.state.rawArtist);
            });
        }

        if (window.wallpaperRegisterMediaPropertiesListener) {
            window.wallpaperRegisterMediaPropertiesListener((props) => {
                const rawTitle = this.normalizeText(props?.title);
                const rawArtist = this.normalizeText(props?.artist);
                this.setState({
                    rawTitle,
                    rawArtist
                });
                this.logMediaEvent('properties', this.state.playbackState, rawTitle, rawArtist);
            });
        }

        if (window.wallpaperRegisterAudioListener) {
            window.wallpaperRegisterAudioListener((audioData) => {
                const bars = this.container.querySelectorAll('.v3-bar');
                if (!bars.length) return;

                let frameMax = 0;
                for (let i = 0; i < audioData.length; i++) {
                    if (audioData[i] > frameMax) frameMax = audioData[i];
                }

                this.visualizerPeak = (this.visualizerPeak * this.peakdecay) + (frameMax * (1 - this.peakdecay));
                if (this.visualizerPeak < 0.1) this.visualizerPeak = 0.1;

                const sensitivity = 4.3;
                for (let i = 0; i < bars.length; i++) {
                    const val = (audioData[i * 4] + audioData[i * 4 + 64]) / 2;
                    let normalized = (val * sensitivity) / this.visualizerPeak;
                    normalized = Math.min(Math.max(normalized, 0), 1);
                    const height = 2 + (normalized * 28);
                    bars[i].style.height = (height / 10) + 'rem';
                }
            });
        }
    }

    updateScrolling() {
        const titleEl = this.container.querySelector('#media-title');
        const wrap = this.container.querySelector('.media-title-wrap');
        if (!titleEl || !wrap) return;

        titleEl.classList.remove('scrolling');
        if (titleEl.scrollWidth > wrap.offsetWidth) {
            const dist = titleEl.scrollWidth - wrap.offsetWidth;
            const remDist = window.pxToCurrentRem ? window.pxToCurrentRem(dist) : (dist / 16) + 'rem';
            titleEl.style.setProperty('--scroll-dist', `-${remDist}`);
            titleEl.classList.add('scrolling');
            const duration = Math.max(5, dist / 30 + 4);
            titleEl.style.animationDuration = `${duration}s`;
        }
    }
}
