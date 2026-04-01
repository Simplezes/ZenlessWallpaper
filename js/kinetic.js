class KineticSway {
    constructor() {
        this.time = 0;
        this.lastTime = 0;
        this.elements = [];
        this.globalSpeed = 0.0006;
        this.enabled = localStorage.getItem('kineticSway') !== 'false';

        this._orient = null;
        this._manualRot = 0;
        this._manualFlip = 1;
        this._refreshOrientCache();

        this.init();
        this.animate = this.animate.bind(this);

        window.addEventListener('wallpaper:settingsChanged', () => this._invalidateCache());
        window.addEventListener('resize', () => this._invalidateCache());

        requestAnimationFrame(this.animate);
    }

    _refreshOrientCache() {
        const isPortrait = window.innerHeight > window.innerWidth;
        this._orient = isPortrait ? 'portrait' : 'landscape';
        this._isPortrait = isPortrait;
        this._manualRot = parseInt(localStorage.getItem(`charRotate_${this._orient}`) || '0');
        this._manualFlip = localStorage.getItem(`charFlip_${this._orient}`) === 'true' ? -1 : 1;
    }

    _invalidateCache() {
        this._refreshOrientCache();
        for (const item of this.elements) {
            item._imgs = null;
        }
    }

    init() {
        this.elements = [
            {
                id: 'image-container',
                baseScale: 1.03,
                swayX: 5,
                swayY: 7,
                rot: 0.3,
                scaleVariance: 0.008,
                speedOffset: 1,
                speedRatio2: 0.73,
                speedRatio3: 1.31,
                phaseX: 0,
                phaseY: 124,
                phaseR: 42,
                _imgs: null,
                _lastFilterP: -1,
            },
            {
                id: 'backdrop',
                baseScale: 1.08,
                swayX: 20,
                swayY: 15,
                rot: 0.5,
                scaleVariance: 0.02,
                speedOffset: 0.8,
                speedRatio2: 0.82,
                speedRatio3: 1.15,
                phaseX: 89,
                phaseY: 12,
                phaseR: 200,
                _imgs: null,
                _lastFilterP: -1,
            },
            {
                id: 'faction-text',
                baseScale: 1,
                swayX: 25,
                swayY: 15,
                rot: 1.5,
                scaleVariance: 0,
                speedOffset: 1.2,
                speedRatio2: 0.61,
                speedRatio3: 1.45,
                phaseX: 300,
                phaseY: 55,
                phaseR: 110,
                _imgs: null,
                _lastFilterP: -1,
            },
            {
                id: 'nickname-text',
                baseScale: 1,
                swayX: 35,
                swayY: 20,
                rot: -2,
                scaleVariance: 0,
                speedOffset: 0.9,
                speedRatio2: 0.77,
                speedRatio3: 1.23,
                phaseX: 45,
                phaseY: 210,
                phaseR: 95,
                _imgs: null,
                _lastFilterP: -1,
            }
        ];
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.resetElements();
        } else {
            this.lastTime = performance.now();
        }
    }

    resetElements() {
        this._refreshOrientCache();

        const isPortrait = this._isPortrait;
        const manualRot = this._manualRot;
        const manualFlip = this._manualFlip;

        for (let item of this.elements) {
            if (!item.el) {
                if (item.id) item.el = document.getElementById(item.id);
                if (!item.el) continue;
            }
            item.el.style.translate = '';
            item.el.style.rotate = '';
            item.el.style.scale = '';
            item.el.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1, 1)';

            let baseR = 0;
            let baseScaleX = item.baseScale;

            if (item.el.id === 'image-container') {
                if (isPortrait) {
                    item.el.style.transform = `translate(0px, 0px) rotate(0deg) scale(${item.baseScale}, ${item.baseScale})`;

                    if (!item._imgs) item._imgs = item.el.querySelectorAll('.char-image');
                    item._imgs.forEach(img => {
                        img.style.transform = `rotate(${90 + manualRot}deg) scaleX(${manualFlip})`;
                    });
                    item.el.style.filter = `drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4)) brightness(1)`;
                } else {
                    baseR = manualRot;
                    baseScaleX = item.baseScale * manualFlip;
                    item.el.style.transform = `translate(0px, 0px) rotate(${baseR}deg) scale(${baseScaleX}, ${item.baseScale})`;
                    item.el.style.filter = `drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4)) brightness(1)`;

                    if (!item._imgs) item._imgs = item.el.querySelectorAll('.char-image');
                    item._imgs.forEach(img => { img.style.transform = ''; });
                }
            } else {
                item.el.style.transform = `translate(0px, 0px) rotate(${baseR}deg) scale(${baseScaleX}, ${item.baseScale})`;
            }
        }
    }

    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (!this.enabled) {
            requestAnimationFrame(this.animate);
            return;
        }

        this.time += Math.min(dt, 50);

        const isPortrait = this._isPortrait;
        const manualRot = this._manualRot;
        const manualFlip = this._manualFlip;

        for (let item of this.elements) {
            if (!item.el) {
                if (item.id) item.el = document.getElementById(item.id);
                if (!item.el) continue;
                item.el.style.translate = '';
                item.el.style.rotate = '';
                item.el.style.scale = '';
            }

            const t = this.time * this.globalSpeed * item.speedOffset;

            const x = Math.sin(t + item.phaseX) * Math.cos(t * item.speedRatio2) * item.swayX;
            const y = Math.sin(t + item.phaseY) * Math.sin(t * item.speedRatio3) * item.swayY;
            const r = Math.sin(t + item.phaseR) * Math.cos(t * item.speedRatio2 + 1) * item.rot;

            let scaleOffset = 0;
            if (item.scaleVariance > 0) {
                scaleOffset = Math.sin(t * 0.8 + item.phaseX) * item.scaleVariance;
            }

            const finalScale = item.baseScale + scaleOffset;
            let finalRotate = r;
            let finalScaleX = finalScale;

            if (item.el.id === 'image-container') {
                if (isPortrait) {
                    finalRotate = 0;
                    finalScaleX = finalScale;

                    if (!item._imgs) item._imgs = item.el.querySelectorAll('.char-image');
                    item._imgs.forEach(img => {
                        img.style.transform = `rotate(${90 + manualRot}deg) scaleX(${manualFlip})`;
                    });
                } else {
                    finalRotate += manualRot;
                    finalScaleX = finalScale * manualFlip;

                    if (!item._imgs) item._imgs = item.el.querySelectorAll('.char-image');
                    item._imgs.forEach(img => { img.style.transform = ''; });
                }
            }

            item.el.style.transform = `translate(${x}px, ${y}px) rotate(${finalRotate}deg) scale(${finalScaleX}, ${finalScale})`;

            item.currentSway = {
                x, y,
                rotate: finalRotate,
                scaleX: finalScaleX,
                scaleY: finalScale
            };

            if (item.el.id === 'image-container') {
                const progress = (Math.sin(t + item.phaseY) * Math.sin(t * item.speedRatio3) + 1) / 2;

                if (Math.abs(progress - item._lastFilterP) > 0.012) {
                    const shadowY = 10 + (20 * progress);
                    const shadowBlur = 30 + (30 * progress);
                    const shadowAlpha = 0.3 + (0.2 * progress);
                    const brightness = 1 + (0.04 * progress);

                    const filter = `drop-shadow(0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0,0,0,${shadowAlpha.toFixed(3)})) brightness(${brightness.toFixed(4)})`;
                    item.el.style.filter = filter;
                    item.currentSway.filter = filter;
                    item._lastFilterP = progress;
                } else {
                    item.currentSway.filter = item.el.style.filter;
                }
            }
        }

        requestAnimationFrame(this.animate);
    }

    getSway(id) {
        if (!this.enabled) return null;
        const item = this.elements.find(e => e.id === id);
        return item ? item.currentSway : null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.kineticSway = new KineticSway();
});
