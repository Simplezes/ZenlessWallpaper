let currentMediaTitle = 'NO MEDIA';
let currentMediaArtist = 'IDLE';
let currentPlaybackState = 0;
let playbackStateReceived = false;
let lastTitleText = '';

function updateMediaUI() {
    const container = document.getElementById('media-container');
    const titleEl = document.getElementById('media-title');
    const artistEl = document.getElementById('media-artist');
    const recTitle = document.getElementById('record-title');
    const recArtist = document.getElementById('record-artist');
    
    if (!container) return;

    const isPaused = playbackStateReceived && (currentPlaybackState === 0 || currentPlaybackState === 2);
    const hasMedia = (currentMediaTitle && currentMediaTitle !== 'NO MEDIA');
    const shouldShow = hasMedia && !isPaused;

    if (shouldShow) {
        container.classList.remove('is-idle');
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

function initMediaIntegration() {
    if (window.wallpaperRegisterMediaPropertiesListener) {
        window.wallpaperRegisterMediaPropertiesListener(function (props) {
            currentMediaTitle = props.title || 'NO MEDIA';
            currentMediaArtist = props.artist || 'IDLE';
            updateMediaUI();
        });
    }

    if (window.wallpaperRegisterMediaPlaybackStateListener) {
        window.wallpaperRegisterMediaPlaybackStateListener(function (state) {
            playbackStateReceived = true;
            currentPlaybackState = state;
            updateMediaUI();
        });
    }
}
initMediaIntegration();
