const PatternRenderer = (() => {
    const ANGLE_DEG = -25;
    const ANGLE_RAD = ANGLE_DEG * (Math.PI / 180);

    const TILE_VH = 0.3;
    const TILE_VH_2 = 0.12;
    const GAP_FRAC = 0.08;
    const H_GAP = 0.8;

    let canvas = null;
    let ctx = null;
    let image1 = null;
    let image2 = null;

    function init() {
        if (!canvas) {
            canvas = document.getElementById('bg-pattern-canvas');
        }
        if (!canvas) return;
        
        ctx = canvas.getContext('2d');

        window.removeEventListener('resize', onResize);
        window.addEventListener('resize', onResize);

        resize();
        
        const loadImg = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
            });
        };

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

        const tileH1 = Math.round(H * TILE_VH);
        const tileH2 = Math.round(H * TILE_VH_2);

        const tileW1 = Math.round(tileH1 * image1.naturalWidth / image1.naturalHeight);
        const tileW2 = Math.round(tileH2 * image2.naturalWidth / image2.naturalHeight);

        const colPitch = tileW1 * (1 + H_GAP);
        const rowPitch = tileH1 * (1 + GAP_FRAC);
        const rowOff = colPitch / 2;
        const extra = Math.max(W, H) * 1.5;

        const drawImage = (img, x, y, tw, th) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(ANGLE_RAD);
            ctx.drawImage(img, -tw / 2, -th / 2, tw, th);
            ctx.restore();
        };

        let row = 0;
        for (let y = -extra; y < H + extra; y += rowPitch) {
            const isRowEven = (row % 2 === 0);
            const shift1 = isRowEven ? 0 : rowOff;
            const shift2 = isRowEven ? rowOff : 0;

            for (let x = -extra + shift1; x < W + extra; x += colPitch) {
                drawImage(image1, x, y, tileW1, tileH1);
            }
            for (let x = -extra + shift2; x < W + extra; x += colPitch) {
                drawImage(image2, x, y, tileW2, tileH2);
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
