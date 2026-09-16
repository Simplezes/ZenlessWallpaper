(function () {
    'use strict';

    const CHARACTER_DURATION = 5400;
    const BG_DURATION = 750;
    const COLOR_DURATION = 750;
    const OUTLINE_THICKNESS = 8;
    const WAVY_STEPS = 30;
    const DEFAULT_ACCENT = 'rgb(252, 91, 144)';

    function isPortrait() {
        return window.innerHeight > window.innerWidth;
    }

    function rgbBlend(color, factor) {
        let r = 252, g = 91, b = 144;
        const m = String(color || DEFAULT_ACCENT).trim().match(/(?:rgb|rgba)\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (m) { r = +m[1]; g = +m[2]; b = +m[3]; }
        const keep = 1 - (factor / 100);
        return `rgb(${Math.floor(r * keep)}, ${Math.floor(g * keep)}, ${Math.floor(b * keep)})`;
    }

    function drawImgFit(ctx, img, w, h) {
        if (!img || !img.naturalWidth) return;
        const aspect = img.naturalWidth / img.naturalHeight;
        let drawW, drawH;

        if (isPortrait()) {
            if (h * aspect <= w) { drawW = w; drawH = w / aspect; }
            else { drawH = h; drawW = h * aspect; }
        } else {
            drawH = h;
            drawW = h * aspect;
        }

        ctx.drawImage(img, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
    }

    function drawWavyCircle(ctx, cx, cy, r, segments, amp, p) {
        const step = (Math.PI * 2) / WAVY_STEPS;
        for (let i = 0; i <= WAVY_STEPS; i++) {
            const angle = i * step;
            const wobble = Math.sin(angle * segments + p * 4) + Math.sin(angle * segments * 0.5 - p * 2) * 0.4;
            const dist = Math.max(0, r + wobble * amp);
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
    }

    class CanvasRig {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.bgCanvas = null;
            this.bgCtx = null;
            this.scanlinePattern = null;
            this._lastCharSway = null;
            this._lastBgSway = null;
            this._cachedDpr = 1;
            this._outroTask = null;
        }

        init() {
            if (this.canvas) return;

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'zzz-cyber-transition';
            this.canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:150;pointer-events:none;display:block;opacity:0;will-change:transform;backface-visibility:hidden;';

            this.bgCanvas = document.createElement('canvas');
            this.bgCanvas.id = 'zzz-bg-transition';
            this.bgCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-15;pointer-events:none;display:block;opacity:0;will-change:transform;';

            document.body.appendChild(this.canvas);
            document.body.appendChild(this.bgCanvas);

            this.ctx = this.canvas.getContext('2d');
            this.bgCtx = this.bgCanvas.getContext('2d');

            const pat = document.createElement('canvas');
            pat.width = 1; pat.height = 3;
            const pCtx = pat.getContext('2d');
            pCtx.fillStyle = 'rgba(0,0,0,0.07)';
            pCtx.fillRect(0, 1, 1, 1);
            this.scanlinePattern = this.ctx.createPattern(pat, 'repeat');
        }

        _swayChanged(a, b) {
            if (!a || !b) return true;
            return Math.abs(a.x - b.x) > 0.3 ||
                Math.abs(a.y - b.y) > 0.3 ||
                Math.abs((a.rotate || 0) - (b.rotate || 0)) > 0.05 ||
                Math.abs((a.scaleX || 1) - (b.scaleX || 1)) > 0.0005 ||
                Math.abs((a.scaleY || 1) - (b.scaleY || 1)) > 0.0005 ||
                (a.filter || '') !== (b.filter || '');
        }

        resetSwayCache() {
            this._lastCharSway = null;
            this._lastBgSway = null;
        }

        _applyPortraitCentering(portrait, w, h) {
            for (const c of [this.canvas, this.bgCanvas]) {
                if (portrait) {
                    c.style.inset = 'unset';
                    c.style.top = '50%';
                    c.style.left = '50%';
                    c.style.marginTop = (-h / 2) + 'px';
                    c.style.marginLeft = (-w / 2) + 'px';
                } else {
                    c.style.inset = '0';
                    c.style.top = '';
                    c.style.left = '';
                    c.style.marginTop = '';
                    c.style.marginLeft = '';
                }
            }
        }

        _applySwayTransforms(portrait) {
            const orientKey = portrait ? 'portrait' : 'landscape';
            const manualRot = parseInt(localStorage.getItem(`charRotate_${orientKey}`) || '0', 10);
            const manualFlip = localStorage.getItem(`charFlip_${orientKey}`) === 'true' ? -1 : 1;

            const rawCharSway = window.kineticSway && window.kineticSway.getSway('image-container');
            const charSway = rawCharSway || { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, filter: '' };
            const bgSway = (window.kineticSway && window.kineticSway.getSway('backdrop')) || { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 };

            if (this._swayChanged(charSway, this._lastCharSway)) {
                const cRot = portrait ? (90 + manualRot + (charSway.rotate || 0)) : (rawCharSway ? (charSway.rotate || 0) : manualRot);
                const cSX = portrait ? (manualFlip * (charSway.scaleX || 1)) : (rawCharSway ? (charSway.scaleX || 1) : manualFlip);
                const cSY = charSway.scaleY || 1;
                this.canvas.style.transform = `translate(${charSway.x}px, ${charSway.y}px) rotate(${cRot}deg) scale(${cSX}, ${cSY})`;
                this.canvas.style.filter = charSway.filter || 'none';
                this._lastCharSway = { ...charSway };
            }

            if (this._swayChanged(bgSway, this._lastBgSway)) {
                const bgRot = portrait ? (90 + manualRot + (bgSway.rotate || 0)) : (manualRot + (bgSway.rotate || 0));
                const bgSX = manualFlip * (bgSway.scaleX || 1);
                const bgSY = bgSway.scaleY || 1;
                this.bgCanvas.style.transform = `translate(${bgSway.x}px, ${bgSway.y}px) rotate(${bgRot}deg) scale(${bgSX}, ${bgSY})`;
                this._lastBgSway = { ...bgSway };
            }
        }

        _resizeIfNeeded(w, h) {
            const dpr = window.devicePixelRatio || 1;
            let drawDpr = dpr;
            if (w * drawDpr > 2560) drawDpr = 2560 / w;
            if (h * drawDpr > 1600) drawDpr = Math.min(drawDpr, 1600 / h);

            const targetW = Math.round(w * drawDpr);
            const targetH = Math.round(h * drawDpr);
            let resized = false;

            for (const c of [this.canvas, this.bgCanvas]) {
                if (c.width !== targetW || c.height !== targetH) {
                    c.width = targetW;
                    c.height = targetH;
                    c.style.width = w + 'px';
                    c.style.height = h + 'px';
                    resized = true;
                }
            }

            if (resized || this._cachedDpr !== drawDpr) {
                this.ctx.setTransform(drawDpr, 0, 0, drawDpr, 0, 0);
                this.bgCtx.setTransform(drawDpr, 0, 0, drawDpr, 0, 0);
                this._cachedDpr = drawDpr;
            }
        }

        sync() {
            const portrait = isPortrait();
            const isCalendar = document.querySelector('.layout-calendar') !== null;
            const scaleFactor = portrait ? (isCalendar ? 0.96 : 1.0) : 1.0;
            const w = (portrait ? window.innerHeight : window.innerWidth) * scaleFactor;
            const h = (portrait ? window.innerWidth : window.innerHeight) * scaleFactor;

            this._applyPortraitCentering(portrait, w, h);
            this._applySwayTransforms(portrait);
            this._resizeIfNeeded(w, h);

            return { w, h };
        }

        show() {
            this._stopOutro();
            this.canvas.style.opacity = '1';
            this.bgCanvas.style.opacity = '1';
        }

        beginOutro() {
            this._stopOutro();
            const step = () => {
                this.sync();
                this._outroTask = requestAnimationFrame(step);
            };
            this._outroTask = requestAnimationFrame(step);
        }

        fadeOut(duration = 400) {
            this._stopOutro();
            const start = performance.now();
            const step = (now) => {
                const t = Math.min(1, (now - start) / duration);
                this.sync();
                this.canvas.style.opacity = String(1 - t);
                this.bgCanvas.style.opacity = String(1 - t);
                this._outroTask = t < 1 ? requestAnimationFrame(step) : null;
            };
            this._outroTask = requestAnimationFrame(step);
        }

        _stopOutro() {
            if (this._outroTask) {
                cancelAnimationFrame(this._outroTask);
                this._outroTask = null;
            }
        }

        clear(w = this.canvas.width, h = this.canvas.height) {
            this.ctx.clearRect(0, 0, w, h);
            this.bgCtx.clearRect(0, 0, w, h);
        }
    }

    const Effects = {

        shutter: {
            reset(state, W) {
                const skew = 250;
                const coverageBuffer = skew + 300;
                const stripCount = Math.max(12, Math.ceil(W / 65));
                const stripWidth = (W + coverageBuffer) / stripCount;
                state.cells = [];
                for (let i = 0; i < stripCount; i++) {
                    state.cells.push({
                        x: i * (stripWidth - 1) - 150,
                        w: stripWidth + 5,
                        p: 0,
                        dir: (i % 2 === 0 ? 1 : -1)
                    });
                }
            },
            animConfig(state) {
                return {
                    targets: state.cells,
                    p: [0, 1],
                    duration: CHARACTER_DURATION * 0.85,
                    easing: 'easeOutExpo',
                    delay: anime.stagger(35, { from: 'first' })
                };
            },
            definePath(state, ctx, W, H, p, variant) {
                const skew = 250;
                for (const cell of state.cells) {
                    const w = cell.w * cell.p;
                    const slide = (1 - cell.p) * (cell.dir * 400);
                    ctx.moveTo(cell.x + slide, 0);
                    ctx.lineTo(cell.x + slide + w, 0);
                    ctx.lineTo(cell.x + slide + w - skew, H);
                    ctx.lineTo(cell.x + slide - skew, H);
                    ctx.closePath();
                }
            },
            accents(state, ctx, W, H, p, accent) {
                const skew = 250;
                for (const cell of state.cells) {
                    if (cell.p <= 0 || cell.p >= 1) continue;
                    const w = cell.w * cell.p;
                    const slide = (1 - cell.p) * (cell.dir * 400);

                    ctx.globalAlpha = (1 - cell.p) * 0.8;
                    ctx.fillStyle = accent;
                    ctx.beginPath();
                    ctx.moveTo(cell.x + slide - 20, 0);
                    ctx.lineTo(cell.x + slide + w + 20, 0);
                    ctx.lineTo(cell.x + slide + w + 20 - skew, H);
                    ctx.lineTo(cell.x + slide - 20 - skew, H);
                    ctx.fill();

                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = 'rgb(255, 255, 255)';
                    ctx.beginPath();
                    ctx.moveTo(cell.x + slide + w - 4, 0);
                    ctx.lineTo(cell.x + slide + w + 2, 0);
                    ctx.lineTo(cell.x + slide + w + 2 - skew, H);
                    ctx.lineTo(cell.x + slide + w - 4 - skew, H);
                    ctx.fill();
                }
            },
            alwaysAccent: true
        },

        cornerWaves: {
            definePath(state, ctx, W, H, p, variant) {
                const maxR = Math.sqrt(W * W + H * H) * 1.2;
                const rP = variant === 'inner' ? Math.pow(p, 1.2) : p;
                const r = maxR * rP;
                if (r <= 0) return;
                drawWavyCircle(ctx, W, 0, r, 5, 80 * (1 - rP), rP);
                drawWavyCircle(ctx, 0, H, r, 5, 80 * (1 - rP), rP);
            },
            accents() { }
        },

        triangle: {
            definePath(state, ctx, W, H, p, variant) {
                const rP = variant === 'inner' ? Math.pow(p, 1.5) : p;
                const size = Math.max(W, H) * 2.5 * rP;
                const rot = p * Math.PI * 0.5;
                ctx.save();
                ctx.translate(W / 2, H / 2);
                ctx.rotate(rot);
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.86, size * 0.5);
                ctx.lineTo(-size * 0.86, size * 0.5);
                ctx.closePath();
                ctx.restore();
            },
            accents(state, ctx, W, H, p, accent) {
                ctx.save();
                ctx.strokeStyle = accent;
                ctx.lineWidth = 20 * (1 - p);
                ctx.beginPath();
                Effects.triangle.definePath(state, ctx, W, H, p, 'main');
                ctx.stroke();

                ctx.strokeStyle = 'rgb(255, 255, 255)';
                ctx.lineWidth = 5;
                ctx.beginPath();
                Effects.triangle.definePath(state, ctx, W, H, Math.max(0, p - 0.08), 'inner');
                ctx.stroke();
                ctx.restore();
            }
        },

        wavyCircle: {
            animConfig() {
                return { duration: CHARACTER_DURATION * 1.1 };
            },
            pBG(p) { return p; },
            definePath(state, ctx, W, H, p, variant) {
                const maxR = Math.sqrt(W * W + H * H) / 2.0;
                let rP;
                if (variant === 'inner') {
                    const delay = 0.24, tinyStart = 0.008;
                    const t = p < delay ? 0 : (p - delay) / (1 - delay);
                    rP = tinyStart + (1 - tinyStart) * (1 - Math.pow(1 - t, 2.4));
                } else {
                    const delay = 0.03, tinyStart = 0.01;
                    const t = p < delay ? 0 : (p - delay) / (1 - delay);
                    rP = tinyStart + (1 - tinyStart) * (1 - Math.pow(1 - t, 3.1));
                }
                const r = maxR * rP;
                if (r <= 0) return;
                drawWavyCircle(ctx, W / 2, H / 2, r, 8, 120 * (1 - rP) * rP, rP);
                ctx.closePath();
            },
            accents(state, ctx, W, H, p, accent) {
                const oldAccent = state.colors.old || 'rgb(17, 17, 17)';
                ctx.strokeStyle = oldAccent;
                ctx.lineWidth = 12 * (1 - p);
                ctx.beginPath();
                Effects.wavyCircle.definePath(state, ctx, W, H, p, 'main');
                ctx.stroke();

                ctx.lineWidth = 8 * (1 - p);
                ctx.beginPath();
                Effects.wavyCircle.definePath(state, ctx, W, H, p, 'inner');
                ctx.stroke();
            }
        },

        lineCutIn: {
            pBG(p) { return p; },
            definePath(state, ctx, W, H, p, variant) {
                const skew = 450;
                const sweepRange = W + skew * 2 + 500;
                const pVal = variant === 'inner' ? Math.pow(p, 1.3) : p;
                const edgeX = -skew - 300 + sweepRange * pVal;

                ctx.moveTo(-W, 0);
                ctx.lineTo(edgeX, 0);
                ctx.lineTo(edgeX - skew, H);
                ctx.lineTo(-W, H);
                ctx.closePath();

                if (variant === 'main' && p > 0 && p < 1) {
                    const block = (offset, blockW) => {
                        ctx.moveTo(edgeX + offset, 0);
                        ctx.lineTo(edgeX + offset + blockW, 0);
                        ctx.lineTo(edgeX + offset + blockW - skew, H);
                        ctx.lineTo(edgeX + offset - skew, H);
                        ctx.closePath();
                    };
                    block(60, 180);
                    block(300, 40);
                }
            },
            accents(state, ctx, W, H, p, accent) {
                if (p <= 0 || p >= 1) return;
                const skew = 450;
                const sweepRange = W + skew * 2 + 500;
                const edgeX = -skew - 300 + sweepRange * p;

                const drawLine = (offsetX, alpha, lineWidth, color) => {
                    ctx.beginPath();
                    ctx.moveTo(edgeX + offsetX, 0);
                    ctx.lineTo(edgeX + offsetX - skew, H);
                    ctx.lineWidth = lineWidth * Math.max(0, 1 - Math.pow(p, 3));
                    ctx.strokeStyle = color;
                    ctx.globalAlpha = alpha;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                };

                drawLine(0, 1, 30, accent);
                drawLine(35, 1, 12, 'rgb(255, 255, 255)');
                drawLine(-45, 0.8, 8, 'rgb(0, 212, 255)');

                if (p > 0.02) {
                    ctx.beginPath();
                    const outline = (offset, blockW) => {
                        ctx.moveTo(edgeX + offset, 0);
                        ctx.lineTo(edgeX + offset + blockW, 0);
                        ctx.lineTo(edgeX + offset + blockW - skew, H);
                        ctx.lineTo(edgeX + offset - skew, H);
                        ctx.closePath();
                    };
                    outline(60, 180);
                    outline(300, 40);

                    ctx.strokeStyle = accent;
                    ctx.lineWidth = 6 * Math.max(0, 1 - Math.pow(p, 3));
                    ctx.globalAlpha = 0.9;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        },

        glitchBlocks: {
            reset(state) {
                state.glitchRects = [];
                for (let i = 0; i < 60; i++) {
                    const s = Math.random() * 0.4;
                    state.glitchRects.push({
                        x: Math.random(), y: Math.random(),
                        w: Math.random() * 0.2 + 0.05, h: Math.random() * 0.2 + 0.05,
                        start: s, end: s + 0.1 + Math.random() * 0.3
                    });
                }
            },
            animConfig() {
                return { duration: CHARACTER_DURATION * 0.55, easing: 'linear' };
            },
            definePath(state, ctx, W, H, p, variant) {
                for (const rect of state.glitchRects) {
                    const localP = variant === 'inner' ? Math.pow(p, 1.2) : p;
                    if (localP >= rect.start) {
                        const bP = Math.min(1, (localP - rect.start) / (rect.end - rect.start));
                        const scale = Math.sin(bP * Math.PI * 0.5) * rect.h;
                        ctx.rect(rect.x * W, rect.y * H, rect.w * W, scale * H);
                    }
                }

                if (p > 0.3) {
                    const sweepP = (p - 0.3) / 0.7;
                    const localSweep = variant === 'inner' ? Math.pow(sweepP, 1.2) : sweepP;
                    const easeSweep = 1 - Math.pow(1 - localSweep, 4);
                    const strips = 10;
                    for (let i = 0; i < strips; i++) {
                        const stripDelay = (i % 3) * 0.05;
                        const sp = Math.max(0, easeSweep - stripDelay) * 1.15;
                        ctx.rect(0, (i / strips) * H - 1, W * Math.min(1, sp), (H / strips) + 3);
                    }
                }
            },
            accents(state, ctx, W, H, p, accent) {
                if (p > 0 && p < 0.95) {
                    ctx.save();
                    ctx.fillStyle = accent;
                    ctx.globalAlpha = 0.5 * (1 - p);
                    ctx.beginPath();
                    Effects.glitchBlocks.definePath(state, ctx, W, H, p, 'main');
                    ctx.fill();
                    ctx.restore();
                }
            }
        },

        highContrastCutIn: {
            customRender(state, ctx, bgCtx, W, H, p, accent) {
                renderHighContrastCutIn(state, ctx, bgCtx, W, H, p, accent);
            },
            animConfig() {
                return { duration: CHARACTER_DURATION * 1.05, easing: 'linear' };
            }
        },

        pixelVortex: {
            reset(state, W, H) {
                const tileSize = 80;
                const cols = Math.ceil(W / tileSize) + 1;
                const rows = Math.ceil(H / tileSize) + 1;
                const offsetX = Math.floor((cols * tileSize - W) / 2);
                const offsetY = Math.floor((rows * tileSize - H) / 2);
                const maxDist = Math.sqrt((W / 2) * (W / 2) + (H / 2) * (H / 2));
                state.vortexTiles = [];
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const tx = c * tileSize - offsetX;
                        const ty = r * tileSize - offsetY;
                        const dx = tx + tileSize / 2 - W / 2;
                        const dy = ty + tileSize / 2 - H / 2;
                        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
                        state.vortexTiles.push({ x: tx, y: ty, w: tileSize, h: tileSize, delay: dist * 0.55, p: 0 });
                    }
                }
            },
            animConfig(state) {
                return {
                    targets: state.vortexTiles,
                    p: [0, 1],
                    duration: CHARACTER_DURATION * 0.45,
                    easing: 'easeInOutBack',
                    delay: (el) => el.delay * CHARACTER_DURATION * 0.45
                };
            },
            customRender(state, ctx, bgCtx, W, H, p, accent) {
                renderPixelVortex(state, ctx, bgCtx, W, H, accent);
            }
        }
    };

    const TRANSITION_TYPES = Object.keys(Effects);

    function renderHighContrastCutIn(state, ctx, bgCtx, W, H, p, accent) {
        const oldAccent = state.colors.old || 'rgb(17, 17, 17)';
        const BG_OLD = rgbBlend(oldAccent, 24);
        const BG_NEW = rgbBlend(accent, 24);
        const BG_PANEL = rgbBlend(oldAccent, 38);
        const CYAN = 'rgb(0, 0, 0)';
        const WHITE = 'rgb(255, 255, 255)';

        bgCtx.fillStyle = BG_OLD;
        bgCtx.fillRect(0, 0, W, H);

        if (p < 0.06) {
            drawImgFit(ctx, state.images.old, W, H);
            ctx.fillStyle = WHITE;
            ctx.globalAlpha = Math.sin((p / 0.06) * Math.PI);
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
            return;
        }

        const N_PNL = 8;
        const PSKEW = 260;
        const pW = (W + PSKEW + 300) / N_PNL;
        const pRange = W + PSKEW + pW + 200;
        const swpP = Math.max(0, Math.min(1, (p - 0.06) / 0.46));

        const imgA = Math.max(0, 1 - swpP * 3.5);
        if (imgA > 0) {
            ctx.save();
            ctx.globalAlpha = imgA;
            drawImgFit(ctx, state.images.old, W, H);
            ctx.restore();
        }

        for (let i = 0; i < N_PNL; i++) {
            const del = (i / N_PNL) * 0.28;
            const iRaw = Math.max(0, (swpP - del) / (1 - del + 0.001));
            const iP = 1 - Math.pow(1 - Math.min(iRaw * 1.15, 1), 5);

            const leadX = -PSKEW - pW + pRange * iP;
            bgCtx.beginPath();
            bgCtx.moveTo(leadX, 0);
            bgCtx.lineTo(leadX + pW, 0);
            bgCtx.lineTo(leadX + pW - PSKEW, H);
            bgCtx.lineTo(leadX - PSKEW, H);
            bgCtx.closePath();
            bgCtx.fillStyle = (i % 2 === 0) ? BG_PANEL : BG_OLD;
            bgCtx.fill();

            const edgeA = Math.max(0, Math.sin(Math.min(1, iP) * Math.PI) * 0.85);
            if (edgeA > 0.02) {
                bgCtx.save();
                bgCtx.strokeStyle = CYAN;
                bgCtx.lineWidth = 2;
                bgCtx.globalAlpha = edgeA;
                bgCtx.beginPath();
                bgCtx.moveTo(leadX + pW, 0);
                bgCtx.lineTo(leadX + pW - PSKEW, H);
                bgCtx.stroke();
                bgCtx.restore();
            }
        }

        if (p > 0.28) {
            const sIn = Math.min(1, (p - 0.28) / 0.22);
            const sOut = p > 0.54 ? Math.max(0, 1 - (p - 0.54) / 0.15) : 1;
            const sA = (1 - Math.pow(1 - sIn, 3)) * sOut;

            if (sA > 0.01) {
                ctx.save();
                ctx.globalAlpha = sA * 0.30;
                ctx.translate(10, 10);
                drawImgFit(ctx, state.images.new, W, H);
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = 'rgb(0, 0, 0)';
                ctx.fillRect(-50, -50, W + 100, H + 100);
                ctx.restore();

                ctx.save();
                ctx.globalAlpha = sA * 0.88;
                drawImgFit(ctx, state.images.new, W, H);
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = CYAN;
                ctx.fillRect(0, 0, W, H);
                ctx.restore();
            }
        }

        if (p > 0.44 && p < 0.55) {
            const gA = Math.sin(((p - 0.44) / 0.11) * Math.PI) * 0.11;
            if (gA > 0.005) {
                const G = 44;
                ctx.save();
                ctx.strokeStyle = CYAN;
                ctx.lineWidth = 1;
                ctx.globalAlpha = gA;
                ctx.beginPath();
                for (let x = 0; x <= W + G; x += G) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
                for (let y = 0; y <= H + G; y += G) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
                ctx.stroke();
                ctx.restore();
            }
        }

        if (p > 0.52) {
            const rP = Math.max(0, Math.min(1, (p - 0.52) / 0.42));
            const easeR = 1 - Math.pow(1 - rP, 6);
            const RSKEW = 380;
            const rw = (W + RSKEW + 120) * easeR - 120;

            bgCtx.save();
            bgCtx.beginPath();
            bgCtx.moveTo(-120, 0);
            bgCtx.lineTo(rw, 0);
            bgCtx.lineTo(rw - RSKEW, H);
            bgCtx.lineTo(-120 - RSKEW, H);
            bgCtx.closePath();
            bgCtx.fillStyle = BG_NEW;
            bgCtx.fill();
            bgCtx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-120, 0);
            ctx.lineTo(rw, 0);
            ctx.lineTo(rw - RSKEW, H);
            ctx.lineTo(-120 - RSKEW, H);
            ctx.closePath();
            ctx.clip();

            const scale = 1.04 - easeR * 0.04;
            ctx.translate(W / 2, H / 2);
            ctx.scale(scale, scale);
            ctx.translate(-W / 2, -H / 2);
            drawImgFit(ctx, state.images.new, W, H);
            ctx.restore();

            const lineA = Math.max(0, 1 - Math.pow(rP, 2.5));
            if (lineA > 0.01) {
                ctx.save();
                ctx.globalAlpha = lineA;
                ctx.strokeStyle = WHITE;
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.moveTo(rw, 0);
                ctx.lineTo(rw - RSKEW, H);
                ctx.stroke();

                ctx.strokeStyle = CYAN;
                ctx.lineWidth = 4;
                ctx.globalAlpha = lineA * 0.8;
                ctx.beginPath();
                ctx.moveTo(rw + 8, 0);
                ctx.lineTo(rw - RSKEW + 8, H);
                ctx.stroke();
                ctx.restore();
            }

            if (rP < 0.65) {
                const gp = Math.max(0, (p - 0.57) / (0.94 - 0.57));
                const grw = (W + RSKEW + 120) * (1 - Math.pow(1 - Math.min(gp, 1), 6)) - 120;
                ctx.save();
                ctx.strokeStyle = CYAN;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = (1 - rP) * 0.25;
                ctx.beginPath();
                ctx.moveTo(grw, 0);
                ctx.lineTo(grw - RSKEW, H);
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.save();
        ctx.fillStyle = state.rig.scanlinePattern;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        if (p > 0.30 && p < 0.95) {
            const bIn = Math.min(1, (p - 0.30) / 0.15);
            const bOut = p > 0.88 ? Math.max(0, 1 - (p - 0.88) / 0.07) : 1;
            const bA = bIn * bOut * 0.55;

            if (bA > 0.01) {
                const bLen = W * Math.min(1, bIn * 1.6);
                bgCtx.save();
                bgCtx.strokeStyle = CYAN;
                bgCtx.lineWidth = 1.5;
                bgCtx.globalAlpha = bA;

                bgCtx.beginPath();
                bgCtx.moveTo(0, 18);
                bgCtx.lineTo(bLen, 18);
                bgCtx.stroke();

                bgCtx.beginPath();
                bgCtx.moveTo(0, H - 18);
                bgCtx.lineTo(bLen, H - 18);
                bgCtx.stroke();

                if (bIn > 0.55) {
                    bgCtx.lineWidth = 1;
                    bgCtx.globalAlpha = bA * 0.65;
                    for (let i = 1; i <= 7; i++) {
                        const tx = (W / 8) * i;
                        if (tx > bLen) break;
                        bgCtx.beginPath();
                        bgCtx.moveTo(tx, 12);
                        bgCtx.lineTo(tx, 24);
                        bgCtx.stroke();
                        bgCtx.beginPath();
                        bgCtx.moveTo(tx, H - 24);
                        bgCtx.lineTo(tx, H - 12);
                        bgCtx.stroke();
                    }
                }
                bgCtx.restore();
            }
        }
    }

    function renderPixelVortex(state, ctx, bgCtx, W, H, accent) {
        const oldAccent = state.colors.old || DEFAULT_ACCENT;
        bgCtx.fillStyle = rgbBlend(oldAccent, 24);
        bgCtx.fillRect(0, 0, W, H);

        const tiles = state.vortexTiles;
        if (!tiles) return;

        let tileSum = 0;
        for (const t of tiles) tileSum += t.p;
        const overallP = tileSum / tiles.length;

        if (overallP > 0.25) {
            const bgP = Math.min(1, (overallP - 0.25) / 0.55);
            bgCtx.save();
            bgCtx.globalAlpha = 1 - Math.pow(1 - bgP, 3);
            bgCtx.fillStyle = rgbBlend(accent, 24);
            bgCtx.fillRect(0, 0, W, H);
            bgCtx.restore();
        }

        for (const tile of tiles) {
            const tp = tile.p;

            if (tp <= 0) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(tile.x, tile.y, tile.w, tile.h);
                ctx.clip();
                drawImgFit(ctx, state.images.old, W, H);
                ctx.restore();
                continue;
            }

            if (tp >= 1) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(tile.x, tile.y, tile.w, tile.h);
                ctx.clip();
                drawImgFit(ctx, state.images.new, W, H);
                ctx.restore();
                continue;
            }

            const cx = tile.x + tile.w / 2;
            const cy = tile.y + tile.h / 2;
            const scaleX = Math.abs(Math.cos(tp * Math.PI));
            const showNew = tp > 0.5;

            ctx.save();
            ctx.beginPath();
            ctx.rect(tile.x, tile.y, tile.w, tile.h);
            ctx.clip();
            ctx.translate(cx, cy);
            ctx.scale(Math.max(0.001, scaleX), 1);
            ctx.translate(-cx, -cy);
            drawImgFit(ctx, showNew ? state.images.new : state.images.old, W, H);

            const flashAlpha = Math.max(0, 1 - Math.abs(tp - 0.5) * 8) * 0.9;
            if (flashAlpha > 0.01) {
                ctx.translate(cx, cy);
                ctx.scale(1 / Math.max(0.001, scaleX), 1);
                ctx.translate(-cx, -cy);
                ctx.fillStyle = accent;
                ctx.globalAlpha = flashAlpha;
                ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
            }
            ctx.restore();
        }
    }

    function renderPathEffect(effect, state, ctx, bgCtx, W, H, p, accent, oldAccent) {
        bgCtx.save();
        bgCtx.fillStyle = rgbBlend(oldAccent, 24);
        bgCtx.fillRect(0, 0, W, H);
        const pBG = effect.pBG ? effect.pBG(p) : Math.min(1, p * 1.2);
        bgCtx.beginPath();
        effect.definePath(state, bgCtx, W, H, pBG, 'inner');
        bgCtx.clip();
        bgCtx.fillStyle = rgbBlend(accent, 24);
        bgCtx.fillRect(0, 0, W, H);
        bgCtx.restore();

        ctx.save();
        drawImgFit(ctx, state.images.old, W, H);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        effect.definePath(state, ctx, W, H, p, 'main');
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        effect.definePath(state, ctx, W, H, p, 'inner');
        ctx.clip();
        drawImgFit(ctx, state.images.new, W, H);
        ctx.restore();

        if (effect.alwaysAccent || (p > 0 && p < 1)) {
            ctx.save();
            ctx.strokeStyle = accent;
            ctx.lineWidth = OUTLINE_THICKNESS;
            ctx.fillStyle = accent;
            effect.accents(state, ctx, W, H, p, accent);
            ctx.restore();
        }
    }

    class CharacterTransition {
        constructor() {
            this.rig = new CanvasRig();
            this.active = false;
            this.animation = null;
            this.images = { old: null, new: null };
            this.colors = { old: null, new: null };
            this.onDone = null;
            this.progress = { value: 0 };
            this.currentType = TRANSITION_TYPES[0];
            this.cleanupTask = null;
            this._transitionDeck = [];
            this._generation = 0;

            window.addEventListener('wallpaper:settingsChanged', () => {
                this.rig.resetSwayCache();
                if (this.active) this.rig.sync();
            });
        }

        init() {
            this.rig.init();
        }

        pickTransitionType() {
            if (this._transitionDeck.length === 0) {
                const deck = [...TRANSITION_TYPES];
                for (let i = deck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [deck[i], deck[j]] = [deck[j], deck[i]];
                }
                if (this.currentType && deck[0] === this.currentType && deck.length > 1) {
                    const swapIdx = 1 + Math.floor(Math.random() * (deck.length - 1));
                    [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
                }
                this._transitionDeck = deck;
            }
            this.currentType = this._transitionDeck.shift();
        }

        getAnimationConfig() {
            const effect = Effects[this.currentType];
            const base = {
                duration: CHARACTER_DURATION,
                easing: 'easeOutExpo',
                update: () => this.render(),
                complete: () => this.finish()
            };
            const config = Object.assign(base, effect.animConfig ? effect.animConfig(this) : null);

            if (!config.targets) {
                config.targets = this.progress;
                config.value = [0, 1];
            }
            return config;
        }

        render() {
            const { w: W, h: H } = this.rig.sync();
            const effect = Effects[this.currentType];
            const accent = this.colors.new || DEFAULT_ACCENT;
            const oldAccent = this.colors.old || DEFAULT_ACCENT;
            const p = this.progress.value;

            this.rig.clear(W, H);

            if (effect.customRender) {
                effect.customRender(this, this.rig.ctx, this.rig.bgCtx, W, H, p, accent, oldAccent);
            } else {
                renderPathEffect(effect, this, this.rig.ctx, this.rig.bgCtx, W, H, p, accent, oldAccent);
            }
        }

        run(oldImg, newImg, options = {}) {
            this.init();

            if (this.cleanupTask) {
                cancelAnimationFrame(this.cleanupTask);
                this.cleanupTask = null;
            }

            if (this.active) {
                if (this.animation) this.animation.pause();
                anime.remove(this.progress);
                if (this.cells) anime.remove(this.cells);
                if (this.vortexTiles) anime.remove(this.vortexTiles);
                this.active = false;
            }

            this._generation++;
            this.active = true;
            this.images.old = oldImg;
            this.images.new = newImg;
            this.colors.new = options.accent || DEFAULT_ACCENT;
            this.colors.old = options.oldAccent || DEFAULT_ACCENT;
            this.onDone = options.onDone || null;

            if (options.type && TRANSITION_TYPES.includes(options.type)) {
                this.currentType = options.type;
            } else {
                this.pickTransitionType();
            }

            options.onStart?.();

            const { w: W, h: H } = this.rig.sync();

            this.progress.value = 0;
            this.cells = null;
            this.glitchRects = null;
            this.vortexTiles = null;
            this.haloGrid = null;
            const effect = Effects[this.currentType];
            if (effect.reset) effect.reset(this, W, H);

            this.render();
            if (this.images.old) this.images.old.style.opacity = '0';
            this.rig.show();

            this.animation = anime(this.getAnimationConfig());
        }

        finish() {
            const finishGen = this._generation;
            this.rig.beginOutro();

            let result = null;
            if (typeof this.onDone === 'function') result = this.onDone();

            const finalCleanup = () => {
                if (finishGen === this._generation) {
                    this.images.new.style.opacity = '1';
                    this.active = false;
                    this.rig.fadeOut();
                } else {
                    this.rig._stopOutro();
                }
                this.cleanupTask = null;
            };

            if (result && typeof result.then === 'function') {
                result.then(() => { this.cleanupTask = requestAnimationFrame(finalCleanup); });
            } else {
                this.cleanupTask = requestAnimationFrame(finalCleanup);
            }
        }

        cancel() {
            if (!this.active) return;
            if (this.animation) this.animation.pause();
            if (this.cleanupTask) { cancelAnimationFrame(this.cleanupTask); this.cleanupTask = null; }
            this.rig.fadeOut();
            if (this.images.new) this.images.new.style.opacity = '1';
            this.active = false;
        }
    }

    const instance = new CharacterTransition();
    window.CharacterTransition = {
        DURATION: CHARACTER_DURATION,
        BG_DURATION: BG_DURATION,
        COLOR_DURATION: COLOR_DURATION,
        run: (old, next, opt) => instance.run(old, next, opt),
        cancel: () => instance.cancel(),
        isActive: () => instance.active
    };

})();
