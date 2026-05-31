const PatternRenderer = (() => {
    const ANGLE_DEG = -25;
    const ANGLE_RAD = ANGLE_DEG * (Math.PI / 180);

    const SCALE_1 = 0.3;
    const SCALE_2 = 0.3;

    const V_GAP = 40;
    const H_GAP = 10;

    const SHIFT_DISTANCE = 400;
    const MOTION_SPEED = 20;
    const FRAME_INTERVAL = 1000 / 30;

    let canvas = null;
    let ctx = null;
    let image1 = null;
    let image2 = null;
    let pixelPattern = null;
    let animationId = null;
    let startTime = Date.now();
    let lastFrameTime = 0;
    let isVisible = false;
    let motionEnabledCache = localStorage.getItem('kineticSway') !== 'false';

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

    let rowCanvas1 = null;
    let rowCanvas2 = null;

    function preRenderRows() {
        if (!image1 || !image2) return;

        const W = window.innerWidth;
        const H = window.innerHeight;
        if (W === 0 || H === 0) return;

        const extra = Math.ceil(Math.sqrt(W * W + H * H) / 2);
        const startX = -extra - SHIFT_DISTANCE;
        const endX = W + extra + SHIFT_DISTANCE;

        const tileW1 = Math.round(image1.naturalWidth * SCALE_1);
        const tileH1 = Math.round(image1.naturalHeight * SCALE_1);
        const tileW2 = Math.round(image2.naturalWidth * SCALE_2);
        const tileH2 = Math.round(image2.naturalHeight * SCALE_2);

        if (tileW1 === 0 || tileW2 === 0) return;

        const colPitch1 = tileW1 + H_GAP;
        const colPitch2 = tileW2 + H_GAP;

        const totalWidth1 = endX - startX + colPitch1;
        const totalWidth2 = endX - startX + colPitch2;

        rowCanvas1 = document.createElement('canvas');
        rowCanvas1.width = totalWidth1;
        rowCanvas1.height = tileH1;
        const ctx1 = rowCanvas1.getContext('2d');
        for (let x = 0; x < totalWidth1; x += colPitch1) {
            ctx1.drawImage(image1, x, 0, tileW1, tileH1);
        }

        rowCanvas2 = document.createElement('canvas');
        rowCanvas2.width = totalWidth2;
        rowCanvas2.height = tileH2;
        const ctx2 = rowCanvas2.getContext('2d');
        for (let x = 0; x < totalWidth2; x += colPitch2) {
            ctx2.drawImage(image2, x, 0, tileW2, tileH2);
        }

        if (pixelPattern) {
            ctx1.save();
            ctx1.globalCompositeOperation = 'source-atop';
            ctx1.fillStyle = pixelPattern;
            ctx1.fillRect(0, 0, totalWidth1, tileH1);
            ctx1.restore();

            ctx2.save();
            ctx2.globalCompositeOperation = 'source-atop';
            ctx2.fillStyle = pixelPattern;
            ctx2.fillRect(0, 0, totalWidth2, tileH2);
            ctx2.restore();
        }
    }

    function resize() {
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = window.innerWidth;
        const h = window.innerHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        preRenderRows();
    }

    function startAnimation() {
        if (animationId) cancelAnimationFrame(animationId);
        if (!animationId) {
            startTime = Date.now();
            lastFrameTime = 0;
        }
        animationId = requestAnimationFrame(animate);
    }

    function animate(timestamp) {
        if (!isVisible) {
            animationId = null;
            return;
        }

        const delta = timestamp - lastFrameTime;
        if (delta < FRAME_INTERVAL) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = timestamp - (delta % FRAME_INTERVAL);

        try {
            const elapsed = motionEnabledCache ? (Date.now() - startTime) / 1000 : 0;
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

        if (!rowCanvas1 || !rowCanvas2) {
            preRenderRows();
        }

        ctx.clearRect(0, 0, W, H);

        if (!rowCanvas1 || !rowCanvas2) return;

        const tileW1 = Math.round(image1.naturalWidth * SCALE_1);
        const tileH1 = Math.round(image1.naturalHeight * SCALE_1);
        const tileW2 = Math.round(image2.naturalWidth * SCALE_2);
        const tileH2 = Math.round(image2.naturalHeight * SCALE_2);

        if (tileH1 === 0 || tileH2 === 0) return;

        const colPitch1 = tileW1 + H_GAP;
        const colPitch2 = tileW2 + H_GAP;
        const rowBlock = tileH1 + V_GAP + tileH2 + V_GAP;
        const extra = Math.ceil(Math.sqrt(W * W + H * H) / 2);
        const startX = -extra - SHIFT_DISTANCE;

        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(ANGLE_RAD);
        ctx.translate(-W / 2, -H / 2);

        let rowIndex = 0;
        for (let y = -extra; y < H + extra; y += rowBlock) {
            const isEven = rowIndex % 2 === 0;
            const dirA = (rowIndex * 2 % 2 === 0) ? 1 : -1;
            const dirB = ((rowIndex * 2 + 1) % 2 === 0) ? 1 : -1;

            const speedM_A = 0.85 + ((rowIndex * 3) % 7) * 0.1;
            const speedM_B = 0.85 + ((rowIndex * 11) % 7) * 0.1;
            const phaseA = rowIndex * 123.456;
            const phaseB = rowIndex * 789.012;

            const motionA = ((elapsed * MOTION_SPEED * speedM_A + phaseA) * dirA) % colPitch1;
            const motionB = ((elapsed * MOTION_SPEED * speedM_B + phaseB) * dirB) % colPitch2;

            const rowAShift = (isEven ? -SHIFT_DISTANCE : SHIFT_DISTANCE) + motionA;
            const rowBShift = (isEven ? SHIFT_DISTANCE : -SHIFT_DISTANCE) + motionB;

            ctx.drawImage(rowCanvas1, startX + rowAShift, y);

            const yMid = y + tileH1 + V_GAP;
            const xOffset = colPitch1 / 2;
            ctx.drawImage(rowCanvas2, startX + xOffset + rowBShift, yMid);

            rowIndex++;
        }

        ctx.restore();
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
            } else if (!visible && animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    }

    function setMotion(enabled) {
        motionEnabledCache = enabled;
        if (!enabled) {
            if (isVisible) draw(0);
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            if (isVisible && !animationId) {
                startTime = Date.now();
                lastFrameTime = 0;
                animationId = requestAnimationFrame(animate);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    return { setVisible, setMotion, init };
})();

window.PatternRenderer = PatternRenderer;