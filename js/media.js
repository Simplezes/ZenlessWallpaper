let currentMediaTitle = 'NO MEDIA';
let currentMediaArtist = 'IDLE';
let currentPlaybackState = 0;
let lastTitleText = '';

function updateMediaUI() {
    const container = document.getElementById('media-container');
    const titleEl = document.getElementById('media-title');
    const artistEl = document.getElementById('media-artist');
    const statusEl = document.getElementById('terminal-status');
    const recTitle = document.getElementById('record-title');
    const recArtist = document.getElementById('record-artist');

    if (!container) return;

    const isPlaying = currentPlaybackState === 1;
    const hasMedia = currentMediaTitle && currentMediaTitle !== 'NO MEDIA' && currentMediaTitle.trim() !== '';
    const shouldShow = hasMedia && isPlaying;

    if (shouldShow) {
        container.classList.remove('is-idle');
        container.classList.add('is-playing');
        if (statusEl) statusEl.textContent = 'SIGNAL RECEIVED // PLAYING';
        if (titleEl) {
            if (lastTitleText !== currentMediaTitle) {
                titleEl.textContent = currentMediaTitle;
                updateScrolling(titleEl);
                lastTitleText = currentMediaTitle;
            }
        }
        if (artistEl) artistEl.textContent = currentMediaArtist;
        if (recTitle) recTitle.textContent = currentMediaTitle;
        if (recArtist) recArtist.textContent = currentMediaArtist;
    } else {
        container.classList.add('is-idle');
        container.classList.remove('is-playing');
        if (statusEl) statusEl.textContent = 'SIGNAL LOST // IDLE';
        if (titleEl) {
            titleEl.textContent = 'NO MEDIA';
            titleEl.classList.remove('scrolling');
            lastTitleText = 'NO MEDIA';
        }
        if (artistEl) artistEl.textContent = 'IDLE';
        if (recTitle) recTitle.textContent = 'NO MEDIA';
        if (recArtist) recArtist.textContent = 'IDLE';
    }
}

function updateScrolling(el) {
    if (!el) return;
    el.classList.remove('scrolling');
    setTimeout(() => {
        const wrap = el.parentElement;
        if (wrap && el.scrollWidth > wrap.offsetWidth) {
            const dist = el.scrollWidth - wrap.offsetWidth;
            el.style.setProperty('--scroll-dist', `-${dist}px`);
            el.classList.add('scrolling');
            const duration = Math.max(5, dist / 30 + 4);
            el.style.animationDuration = `${duration}s`;
        }
    }, 100);
}

if (window.wallpaperRegisterMediaPlaybackListener) {
    window.wallpaperRegisterMediaPlaybackListener(function (event) {
        currentPlaybackState = event.state;
        updateMediaUI();
    });
}

if (window.wallpaperRegisterMediaPropertiesListener) {
    window.wallpaperRegisterMediaPropertiesListener(function (props) {
        currentMediaTitle = props.title || 'NO MEDIA';
        currentMediaArtist = props.artist || 'IDLE';
        updateMediaUI();
    });
}

let visualizerPeak = 0.1;
const peakdecay = 0.98;
const peakgrowth = 0.02;

window.wallpaperRegisterAudioListener(function (audioData) {
    const bars = document.querySelectorAll('.v3-bar');
    if (!bars || bars.length === 0) return;

    let frameMax = 0;
    for (let i = 0; i < audioData.length; i++) {
        if (audioData[i] > frameMax) frameMax = audioData[i];
    }

    visualizerPeak = (visualizerPeak * peakdecay) + (frameMax * (1 - peakdecay));
    if (visualizerPeak < 0.1) visualizerPeak = 0.1;

    for (let i = 0; i < bars.length; i++) {
        let index = i * 4;
        let leftVal = audioData[index];
        let rightVal = audioData[index + 64];
        let val = (leftVal + rightVal) / 2;

        let sensitivity = 3.5;
        let normalized = (val * sensitivity) / visualizerPeak;

        normalized = Math.min(Math.max(normalized, 0), 1);

        let height = 2 + (normalized * 28);
        bars[i].style.height = `${height}px`;
    }
});

updateMediaUI();
