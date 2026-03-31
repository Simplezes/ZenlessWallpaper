(function () {
    'use strict';

    const CFG = {
        slashAngle: -40,
        duration: 2000,
        easing: easeInOutQuart,
        edgeWidth: 250,
        trailWidth: 420,
        trailOffset: 180,
        accentColor: '#FC5B90',
        trailColor: 'rgba(255, 255, 255, 0.5)',
        fadeStartVh: 17,
        fadeEndVh: 13,
    };

    function easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }

    let canvas = null;
    let ctx = null;
    let raf = null;
    let active = false;

    function getScale() {
        return parseFloat(getComputedStyle(document.documentElement).fontSize) / 10;
    }

    function ensureCanvas() {
        if (canvas) return;

        canvas = document.createElement('canvas');
        canvas.id = 'manga-wipe-canvas';

        canvas.style.cssText = [
            'position:absolute',
            'inset:0',
            'width:100%',
            'height:100%',
            'z-index:400',
            'pointer-events:none',
            'display:none',
        ].join(';');

        const container = document.getElementById('image-container');
        if (container) {
            container.appendChild(canvas);
        } else {
            document.body.appendChild(canvas);
        }
        ctx = canvas.getContext('2d');
    }

    function syncToContainer() {
        const container = document.getElementById('image-container');
        if (!container || !canvas) return;

        const w = container.offsetWidth;
        const h = container.offsetHeight;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);

        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        canvas._simW = w;
        canvas._simH = h;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawImgFit(img, W, H) {
        if (!img || !img.naturalWidth || !img.naturalHeight) return;

        const aspect = img.naturalWidth / img.naturalHeight;
        const drawH = H;
        const drawW = drawH * aspect;
        const drawX = (W - drawW) / 2;

        ctx.drawImage(img, drawX, 0, drawW, drawH);
    }

    function actionLineX(p, W, H) {
        const s = getScale();
        const tan = Math.tan(CFG.slashAngle * Math.PI / 180);
        const slashHalf = Math.abs(tan * H / 2);

        const startPadding = (CFG.edgeWidth / 2) * s;
        const endPadding = (CFG.trailOffset + CFG.trailWidth / 2) * s;
        const buffer = 50 * s;

        const start = -slashHalf - startPadding - buffer;
        const end = W + slashHalf + endPadding + buffer;

        return start + p * (end - start);
    }

    function linePair(cx, ox, H) {
        const tan = Math.tan(CFG.slashAngle * Math.PI / 180);
        const half = H / 2;
        return [
            { x: cx + ox + tan * -half, y: 0 },
            { x: cx + ox + tan * half, y: H },
        ];
    }

    let cachedCanvasRect = null;

    function syncWipes(progress, W, H, cx, oldBgColor) {
        let bgOverlay = document.getElementById('manga-bg-wipe');
        let footerOverlay = document.getElementById('manga-footer-wipe');

        if (!bgOverlay) {
            bgOverlay = document.createElement('div');
            bgOverlay.id = 'manga-bg-wipe';
            bgOverlay.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
            document.body.appendChild(bgOverlay);
        }

        if (progress >= 1) {
            bgOverlay.style.display = 'none';
            if (footerOverlay) footerOverlay.style.visibility = 'hidden';
            return;
        }

        bgOverlay.style.display = 'block';
        if (oldBgColor) bgOverlay.style.backgroundColor = oldBgColor;

        const [tL, bL] = linePair(cx, 0, H);
        if (!cachedCanvasRect && canvas) {
            cachedCanvasRect = canvas.getBoundingClientRect();
        }
        const rect = cachedCanvasRect || { left: 0, top: 0 };

        const globalTopX = rect.left + tL.x;
        const globalBottomX = rect.left + bL.x;

        const clip = `polygon(${globalTopX}px 0, 100vw 0, 100vw 100vh, ${globalBottomX}px 100vh)`;

        bgOverlay.style.clipPath = clip;

        if (footerOverlay) {
            footerOverlay.style.clipPath = clip;
            footerOverlay.style.visibility = 'visible';
        }
    }

    function drawFrame(oldImg, newImg, progress, accent, oldBgColor) {
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, W, H);

        const cx = actionLineX(progress, W, H);

        if (progress > 0) {
            const [tL, bL] = linePair(cx, 0, H);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(tL.x, tL.y);
            ctx.lineTo(bL.x, bL.y);
            ctx.lineTo(0, H);
            ctx.closePath();
            ctx.clip();
            drawImgFit(newImg, W, H);
            ctx.restore();
        }

        if (progress < 1) {
            const [tR, bR] = linePair(cx, 0, H);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(tR.x, tR.y);
            ctx.lineTo(W, 0);
            ctx.lineTo(W, H);
            ctx.lineTo(bR.x, bR.y);
            ctx.closePath();
            ctx.clip();
            drawImgFit(oldImg, W, H);
            ctx.restore();
        }

        syncWipes(progress, W, H, cx, oldBgColor);

        if (progress > 0 && progress < 1) {
            drawSlashFX(cx, H, accent);
        }
    }

    function drawSlashFX(cx, H, accent) {
        const s = getScale();
        drawDiagonalBand(cx, 0, CFG.edgeWidth * s, H, accent);
        drawDiagonalBand(cx - (CFG.trailOffset * s), 0, CFG.trailWidth * s, H, CFG.trailColor);
    }

    function drawDiagonalBand(cx, ox, w, H, color) {
        const [t1, b1] = linePair(cx, ox - w / 2, H);
        const [t2, b2] = linePair(cx, ox + w / 2, H);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }


    window.MangaWipe = {
        run(oldImg, newImg, options = {}) {
            ensureCanvas();
            syncToContainer();
            cachedCanvasRect = null;

            if (active) {
                cancelAnimationFrame(raf);
                canvas.style.display = 'none';
                active = false;
            }

            const accent = options.accent || CFG.accentColor;
            const duration = options.duration || CFG.duration;
            const onDone = options.onDone || null;
            const onStart = options.onStart || null;
            const oldBgColor = options.oldBgColor || null;
            const oldAccent = options.oldAccent || null;

            let footerOverlay = document.getElementById('manga-footer-wipe');
            if (footerOverlay) footerOverlay.remove();

            const realFooter = document.querySelector('.footer');
            if (realFooter && oldAccent) {
                footerOverlay = realFooter.cloneNode(true);
                footerOverlay.id = 'manga-footer-wipe';
                footerOverlay.style.zIndex = '515';
                footerOverlay.style.pointerEvents = 'none';
                footerOverlay.style.visibility = 'hidden';
                footerOverlay.style.setProperty('--accent-color', oldAccent);
                document.body.appendChild(footerOverlay);
            }

            oldImg.style.opacity = '0';
            newImg.style.opacity = '0';

            canvas.style.display = 'block';
            active = true;

            drawFrame(oldImg, newImg, 0, accent, oldBgColor);

            if (typeof onStart === 'function') {
                onStart();
            }

            const startTime = performance.now();

            function frame(now) {
                if (!active) return;

                const elapsed = now - startTime;
                const raw = Math.min(elapsed / duration, 1);
                const progress = CFG.easing(raw);

                drawFrame(oldImg, newImg, progress, accent, oldBgColor);

                if (raw < 1) {
                    raf = requestAnimationFrame(frame);
                } else {
                    finish(newImg, onDone);
                }
            }

            raf = requestAnimationFrame(frame);
        },

        cancel() {
            if (!active) return;
            cancelAnimationFrame(raf);
            if (canvas) canvas.style.display = 'none';
            const footerOverlay = document.getElementById('manga-footer-wipe');
            if (footerOverlay) footerOverlay.remove();
            active = false;
        },
    };

    function finish(newImg, onDone) {
        let p = null;
        if (typeof onDone === 'function') p = onDone();

        const cleanup = () => {
            canvas.style.display = 'none';
            if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);

            const footerOverlay = document.getElementById('manga-footer-wipe');
            if (footerOverlay) footerOverlay.remove();

            active = false;
            newImg.style.opacity = '1';
        };

        if (p && typeof p.then === 'function') {
            p.then(() => requestAnimationFrame(() => requestAnimationFrame(cleanup)))
                .catch(() => cleanup());
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(cleanup);
            });
        }
    }

})();
