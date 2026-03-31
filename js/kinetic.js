class KineticSway {
    constructor() {
        this.time = 0;
        this.lastTime = 0;
        this.elements = [];
        this.globalSpeed = 0.0006;
        this.enabled = localStorage.getItem('kineticSway') !== 'false';

        this.init();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    init() {
        this.elements.push({
            el: document.getElementById('image-container'),
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
            phaseR: 42
        });

        this.elements.push({
            el: document.getElementById('backdrop'),
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
            phaseR: 200
        });

        this.elements.push({
            el: document.getElementById('faction-text'),
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
            phaseR: 110
        });

        this.elements.push({
            el: document.getElementById('nickname-text'),
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
            phaseR: 95
        });
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
        const orient = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        const manualRot = parseInt(localStorage.getItem(`charRotate_${orient}`) || '0');
        const manualFlip = localStorage.getItem(`charFlip_${orient}`) === 'true' ? -1 : 1;

        for (let item of this.elements) {
            if (!item.el) continue;
            item.el.style.translate = `0px 0px`;
            
            let baseR = 0;
            let baseScaleX = item.baseScale;

            if (item.el.id === 'image-container') {
                baseR = manualRot;
                baseScaleX = item.baseScale * manualFlip;
            }

            item.el.style.rotate = `${baseR}deg`;
            item.el.style.scale = `${baseScaleX} ${item.baseScale}`;
            
            if (item.el.id === 'image-container') {
                item.el.style.filter = `drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4)) brightness(1)`;
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

        const orient = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        const manualRot = parseInt(localStorage.getItem(`charRotate_${orient}`) || '0');
        const manualFlip = localStorage.getItem(`charFlip_${orient}`) === 'true' ? -1 : 1;

        for (let item of this.elements) {
            if (!item.el) {
                if (item.id) item.el = document.getElementById(item.id);
                if (!item.el) continue;
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
                finalRotate += manualRot;
                finalScaleX = finalScale * manualFlip;
            }

            item.el.style.translate = `${x}px ${y}px`;
            item.el.style.rotate = `${finalRotate}deg`;
            item.el.style.scale = `${finalScaleX} ${finalScale}`;

            if (item.el.id === 'image-container') {
                const progress = (Math.sin(t + item.phaseY) * Math.sin(t * item.speedRatio3) + 1) / 2;

                const shadowY = 10 + (20 * progress);
                const shadowBlur = 30 + (30 * progress);
                const shadowAlpha = 0.3 + (0.2 * progress);
                const brightness = 1 + (0.04 * progress);

                item.el.style.filter = `drop-shadow(0 ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha})) brightness(${brightness})`;
            }
        }

        requestAnimationFrame(this.animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.kineticSway = new KineticSway();
});
