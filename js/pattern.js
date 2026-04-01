const PatternRenderer = (() => {
    const ANGLE_DEG = -25;
    const ANGLE_RAD = ANGLE_DEG * (Math.PI / 180);

    const SCALE_1 = 0.3;
    const SCALE_2 = 0.3;

    const V_GAP = 40;
    const H_GAP = 10;

    const SHIFT_DISTANCE = 400;
    const MOTION_SPEED = 20;

    let canvas = null;
    let ctx = null;
    let image1 = null;
    let image2 = null;
    let pixelPattern = null;
    let animationId = null;
    let startTime = Date.now();
    let isVisible = false;

    function init() {
        const foundCanvas = document.getElementById('bg-pattern-canvas');
        if (!foundCanvas) return;

        canvas = foundCanvas;
        ctx = canvas.getContext('2d');

        window.removeEventListener('resize', onResize);
        window.addEventListener('resize', onResize);

        resize();
        if (!pixelPattern) createPixelPattern();

        if (image1 && image2) {
            startAnimation();
            return;
        }

        const loadImg = (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
        });

        Promise.all([
            loadImg('assets/imgs/zenless_bangboo.webp'),
            loadImg('assets/imgs/zenless_bangboo_middle.webp')
        ]).then(([img1, img2]) => {
            image1 = img1;
            image2 = img2;
            startAnimation();
        }).catch(err => {
            console.error("PatternRenderer image load error:", err);
        });
    }

    function createPixelPattern() {
        try {
            const pCanvas = document.createElement('canvas');
            const pCtx = pCanvas.getContext('2d');
            pCanvas.width = 4;
            pCanvas.height = 4;
            pCtx.fillStyle = 'gray';
            pCtx.fillRect(0, 0, 4, 4);
            pCtx.fillStyle = 'rgb(51, 51, 51)';
            pCtx.fillRect(0, 0, 1, 1);
            pCtx.fillRect(1, 1, 1, 1);
            pCtx.fillRect(2, 2, 1, 1);
            pCtx.fillRect(3, 3, 1, 1);
            pixelPattern = pCtx.createPattern(pCanvas, 'repeat');
        } catch (e) {
            console.warn("Failed to create pixel pattern", e);
        }
    }

    function resize() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function startAnimation() {
        if (animationId) cancelAnimationFrame(animationId);
        if (!animationId) startTime = Date.now();
        animate();
    }

    function animate() {
        try {
            const motionEnabled = localStorage.getItem('kineticSway') !== 'false';
            const elapsed = motionEnabled ? (Date.now() - startTime) / 1000 : 0;
            draw(elapsed);
        } catch (e) {
            console.error("Pattern animation error:", e);
        }
        animationId = requestAnimationFrame(animate);
    }

    function draw(elapsed = 0) {
        if (!isVisible) return;

        if (!canvas || !canvas.isConnected) {
            canvas = document.getElementById('bg-pattern-canvas');
            if (canvas) {
                ctx = canvas.getContext('2d');
                resize();
            }
        }

        if (!ctx || !image1 || !image2) return;

        const W = window.innerWidth;
        const H = window.innerHeight;
        if (W === 0 || H === 0) return;

        ctx.clearRect(0, 0, W, H);

        const tileW1 = Math.round(image1.naturalWidth * SCALE_1);
        const tileH1 = Math.round(image1.naturalHeight * SCALE_1);
        const tileW2 = Math.round(image2.naturalWidth * SCALE_2);
        const tileH2 = Math.round(image2.naturalHeight * SCALE_2);

        if (tileH1 === 0 || tileH2 === 0) return;

        const colPitch1 = tileW1 + H_GAP;
        const rowBlock = tileH1 + V_GAP + tileH2 + V_GAP;
        const extra = (Math.max(W, H)) * 1.5;
        const timeOffset = elapsed * MOTION_SPEED;

        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(ANGLE_RAD);
        ctx.translate(-W / 2, -H / 2);

        let rowIndex = 0;
        for (let y = -extra; y < H + extra; y += rowBlock) {
            const isEven = rowIndex % 2 === 0;
            const dirA = (rowIndex * 2 % 2 === 0) ? 1 : -1;
            const dirB = ((rowIndex * 2 + 1) % 2 === 0) ? 1 : -1;

            const motionA = timeOffset * dirA;
            const motionB = timeOffset * dirB;

            const rowAShift = (isEven ? -SHIFT_DISTANCE : SHIFT_DISTANCE) + motionA;
            const rowBShift = (isEven ? SHIFT_DISTANCE : -SHIFT_DISTANCE) + motionB;

            for (let x = -extra - SHIFT_DISTANCE * 2; x < W + extra + SHIFT_DISTANCE * 2; x += colPitch1) {
                ctx.drawImage(image1, x + rowAShift, y, tileW1, tileH1);
            }

            const yMid = y + tileH1 + V_GAP;
            const xOffset = colPitch1 / 2;
            for (let x = -extra - SHIFT_DISTANCE * 2; x < W + extra + SHIFT_DISTANCE * 2; x += colPitch1) {
                ctx.drawImage(image2, x + xOffset + rowBShift, yMid, tileW2, tileH2);
            }
            rowIndex++;
        }

        ctx.restore();

        if (pixelPattern) {
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = pixelPattern;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
        }
    }

    function onResize() {
        resize();
    }

    function setVisible(visible) {
        isVisible = visible;
        const found = document.getElementById('bg-pattern-canvas');
        if (found) {
            canvas = found;
            canvas.classList.toggle('visible', visible);
            if (visible && !animationId) {
                init();
            }
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    return { setVisible, init };
})();

window.PatternRenderer = PatternRenderer;