const PatternRenderer = (() => {
    const ANGLE_DEG = -25;
    const ANGLE_RAD = ANGLE_DEG * (Math.PI / 180);

    const TILE_VH = 0.3;
    const GAP_FRAC = 0.08;
    const H_GAP = 0.8;

    let canvas = null;
    let ctx = null;
    let image = null;

    function init() {
        canvas = document.getElementById('bg-pattern-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', () => {
            resize();
            if (image) draw();
        });

        const img = new Image();
        img.src = 'assets/imgs/zenless_bangboo.webp';
        img.onload = () => {
            image = img;
            draw();
        };
    }

    function resize() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
        if (!ctx || !image) return;

        const W = window.innerWidth;
        const H = window.innerHeight;
        ctx.clearRect(0, 0, W, H);

        const tileH = Math.round(H * TILE_VH);
        const tileW = Math.round(tileH * image.naturalWidth / image.naturalHeight);
        const colPitch = tileW * (1 + H_GAP);
        const rowPitch = tileH * (1 + GAP_FRAC);
        const rowOff = colPitch / 2;
        const extra = Math.max(W, H) * 1.5;

        let row = 0;
        for (let y = -extra; y < H + extra; y += rowPitch) {
            const xShift = (row % 2 === 0) ? 0 : rowOff;
            for (let x = -extra + xShift; x < W + extra; x += colPitch) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(ANGLE_RAD);
                ctx.drawImage(image, -tileW / 2, -tileH / 2, tileW, tileH);
                ctx.restore();
            }
            row++;
        }

        const pCanvas = document.createElement('canvas');
        const pCtx = pCanvas.getContext('2d');
        pCanvas.width = 4;
        pCanvas.height = 4;

        pCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        pCtx.lineWidth = 1;
        pCtx.beginPath();
        pCtx.moveTo(0, 4);
        pCtx.lineTo(4, 0);
        pCtx.stroke();

        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';

        const pattern = ctx.createPattern(pCanvas, 'repeat');
        ctx.fillStyle = pattern;

        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }

    function setVisible(visible) {
        if (!canvas) return;
        canvas.classList.toggle('visible', visible);
    }

    document.addEventListener('DOMContentLoaded', init);
    return { setVisible };
})();

window.PatternRenderer = PatternRenderer;
