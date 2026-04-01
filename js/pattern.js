const PatternRenderer = (() => {
    const ANGLE_DEG = -25;
    const ANGLE_RAD = ANGLE_DEG * (Math.PI / 180);

    const SCALE_1 = 0.3;
    const SCALE_2 = 0.3;

    const V_GAP = 40;
    const H_GAP = 10;

    const SHIFT_DISTANCE = 400;

    let canvas = null;
    let ctx = null;
    let image1 = null;
    let image2 = null;

    function init() {
        if (!canvas) canvas = document.getElementById('bg-pattern-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');

        window.removeEventListener('resize', onResize);
        window.addEventListener('resize', onResize);

        resize();

        const loadImg = (src) => new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
        });

        Promise.all([
            loadImg('assets/imgs/zenless_bangboo.webp'),
            loadImg('assets/imgs/zenless_bangboo_middle.webp')
        ]).then(([img1, img2]) => {
            image1 = img1;
            image2 = img2;
            draw();
        });
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
        if (!ctx || !image1 || !image2) return;

        const W = window.innerWidth;
        const H = window.innerHeight;
        ctx.clearRect(0, 0, W, H);

        const tileW1 = Math.round(image1.naturalWidth * SCALE_1);
        const tileH1 = Math.round(image1.naturalHeight * SCALE_1);
        const tileW2 = Math.round(image2.naturalWidth * SCALE_2);
        const tileH2 = Math.round(image2.naturalHeight * SCALE_2);

        const colPitch1 = tileW1 + H_GAP;
        const colPitch2 = tileW2 + H_GAP;

        const rowBlock = tileH1 + V_GAP + tileH2 + V_GAP;
        const extra = (Math.max(W, H)) * 1.5;

        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(ANGLE_RAD);
        ctx.translate(-W / 2, -H / 2);

        let rowIndex = 0;

        for (let y = -extra; y < H + extra; y += rowBlock) {

            const isEven = rowIndex % 2 === 0;
            const rowAShift = isEven ? -SHIFT_DISTANCE : SHIFT_DISTANCE;

            for (let x = -extra - SHIFT_DISTANCE; x < W + extra + SHIFT_DISTANCE; x += colPitch1) {
                ctx.drawImage(image1, x + rowAShift, y, tileW1, tileH1);
            }

            const yMid = y + tileH1 + V_GAP;

            const rowBShift = isEven ? SHIFT_DISTANCE : -SHIFT_DISTANCE;
            const xOffset = colPitch1 / 2;

            for (let x = -extra - SHIFT_DISTANCE; x < W + extra + SHIFT_DISTANCE; x += colPitch2) {
                ctx.drawImage(image2, x + xOffset + rowBShift, yMid, tileW2, tileH2);
            }

            rowIndex++;
        }

        ctx.restore();

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

        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = ctx.createPattern(pCanvas, 'repeat');
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }

    function onResize() {
        resize();
        if (image1 && image2) draw();
    }

    function setVisible(visible) {
        if (!canvas) canvas = document.getElementById('bg-pattern-canvas');
        if (!canvas) return;
        canvas.classList.toggle('visible', visible);
    }

    document.addEventListener('DOMContentLoaded', init);
    return { setVisible, init };
})();

window.PatternRenderer = PatternRenderer;