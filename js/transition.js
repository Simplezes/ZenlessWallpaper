(function () {
    'use strict';

    const CHARACTER_DURATION = 5400;
    const BG_DURATION = 750;
    const COLOR_DURATION = 750;
    const TRANSITION_OUTLINE_THICKNESS = 8;
    const WAVY_CIRCLE_STEPS = 30;
    const TRANSITION_TYPES = ['shutter', 'cornerWaves', 'triangle', 'wavyCircle', 'lineCutIn', 'highContrastCutIn'];

    class CharacterTransition {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.bgCanvas = null;
            this.bgCtx = null;
            this.active = false;
            this.animation = null;
            this.images = { old: null, new: null };
            this.colors = { old: null, new: null };
            this.onDone = null;
            this.cells = [];
            this.progress = { value: 0 };
            this.currentType = 'shutter';
            this.cleanupTask = null;
            this._generation = 0;
            this._lastCharSway = null;
            this._lastBgSway = null;
            this._cachedW = 0;
            this._cachedH = 0;
            this._cachedDpr = 1;

            window.addEventListener('wallpaper:settingsChanged', () => {
                this._lastCharSway = null;
                this._lastBgSway = null;

                if (this.canvas && this.bgCanvas) {
                    this.syncCanvas();
                }
            });
        }

        init() {
            if (this.canvas) return;

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'zzz-cyber-transition';
            const charMask = 'linear-gradient(to bottom, black 0%, black calc(100% - 17vh), transparent 100%)';

            this.canvas.style.cssText = `position:fixed;inset:0;width:100%;height:100%;z-index:509;pointer-events:none;display:block;opacity:0;will-change:transform;backface-visibility:hidden; -webkit-mask-image: ${charMask}; mask-image: ${charMask};`;

            this.bgCanvas = document.createElement('canvas');
            this.bgCanvas.id = 'zzz-bg-transition';
            this.bgCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-5;pointer-events:none;display:block;opacity:0;will-change:transform;';

            document.body.appendChild(this.canvas);
            document.body.appendChild(this.bgCanvas);

            this.ctx = this.canvas.getContext('2d');
            this.bgCtx = this.bgCanvas.getContext('2d');

            const patCanvas = document.createElement('canvas');
            patCanvas.width = 1;
            patCanvas.height = 3;
            const pCtx = patCanvas.getContext('2d');
            pCtx.fillStyle = 'rgba(0,0,0,0.07)';
            pCtx.fillRect(0, 1, 1, 1);
            this.scanlinePattern = this.ctx.createPattern(patCanvas, 'repeat');
        }

                rgbBlend(color, factor) {
            let str = String(color || 'rgb(252, 91, 144)').trim();
            let r = 252, g = 91, b = 144;

            const rgbMatch = str.match(/(?:rgb|rgba)\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (rgbMatch) {
                r = parseInt(rgbMatch[1], 10);
                g = parseInt(rgbMatch[2], 10);
                b = parseInt(rgbMatch[3], 10);
            }

            const p = 1 - (factor / 100);
            return `rgb(${Math.floor(r * p)}, ${Math.floor(g * p)}, ${Math.floor(b * p)})`;
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

        syncCanvas() {
            const isPortrait = window.innerHeight > window.innerWidth;
            const dpr = window.devicePixelRatio || 1;
            const w = isPortrait ? window.innerHeight : window.innerWidth;
            const h = isPortrait ? window.innerWidth : window.innerHeight;
            const orientKey = isPortrait ? 'portrait' : 'landscape';
            const manualRot = parseInt(localStorage.getItem(`charRotate_${orientKey}`) || '0', 10);
            const manualFlip = localStorage.getItem(`charFlip_${orientKey}`) === 'true' ? -1 : 1;

            const rawCharSway = window.kineticSway && window.kineticSway.getSway('image-container');
            const charSway = rawCharSway || { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, filter: '' };
            const bgSway = (window.kineticSway && window.kineticSway.getSway('backdrop')) || { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 };

            if (this._swayChanged(charSway, this._lastCharSway)) {
                if (isPortrait) {
                    const basePortraitRot = 90;

                    this.canvas.style.inset = 'unset';
                    this.canvas.style.top = '50%';
                    this.canvas.style.left = '50%';
                    this.canvas.style.marginTop = (-h / 2) + 'px';
                    this.canvas.style.marginLeft = (-w / 2) + 'px';

                    const cRot = basePortraitRot + manualRot + (charSway.rotate || 0);
                    const cSX = manualFlip * (charSway.scaleX || 1);
                    const cSY = charSway.scaleY || 1;
                    this.canvas.style.transform = `translate(${charSway.x}px, ${charSway.y}px) rotate(${cRot}deg) scale(${cSX}, ${cSY})`;
                    this.canvas.style.filter = charSway.filter || 'none';
                } else {
                    this.canvas.style.inset = '0';
                    this.canvas.style.top = '';
                    this.canvas.style.left = '';
                    this.canvas.style.marginTop = '';
                    this.canvas.style.marginLeft = '';

                    const cRot = rawCharSway ? (charSway.rotate || 0) : manualRot;
                    const cSX = rawCharSway ? (charSway.scaleX || 1) : manualFlip;
                    const cSY = charSway.scaleY || 1;
                    this.canvas.style.transform = `translate(${charSway.x}px, ${charSway.y}px) rotate(${cRot}deg) scale(${cSX}, ${cSY})`;
                    this.canvas.style.filter = charSway.filter || 'none';
                }
                this._lastCharSway = { ...charSway };
            }

            if (this._swayChanged(bgSway, this._lastBgSway)) {
                const bgRot = bgSway.rotate || 0;
                const bgSX = bgSway.scaleX || 1;
                const bgSY = bgSway.scaleY || 1;

                if (isPortrait) {
                    const basePortraitRot = 90;

                    this.bgCanvas.style.inset = 'unset';
                    this.bgCanvas.style.top = '50%';
                    this.bgCanvas.style.left = '50%';
                    this.bgCanvas.style.marginTop = (-h / 2) + 'px';
                    this.bgCanvas.style.marginLeft = (-w / 2) + 'px';

                    const finalRot = basePortraitRot + manualRot + bgRot;
                    const finalScaleX = manualFlip * bgSX;
                    this.bgCanvas.style.transform = `translate(${bgSway.x}px, ${bgSway.y}px) rotate(${finalRot}deg) scale(${finalScaleX}, ${bgSY})`;
                } else {
                    this.bgCanvas.style.inset = '0';
                    this.bgCanvas.style.top = '';
                    this.bgCanvas.style.left = '';
                    this.bgCanvas.style.marginTop = '';
                    this.bgCanvas.style.marginLeft = '';

                    const finalRot = manualRot + bgRot;
                    const finalScaleX = manualFlip * bgSX;
                    this.bgCanvas.style.transform = `translate(${bgSway.x}px, ${bgSway.y}px) rotate(${finalRot}deg) scale(${finalScaleX}, ${bgSY})`;
                }

                this._lastBgSway = { ...bgSway };
            }

            let drawDpr = dpr;
            if (w * drawDpr > 2560) {
                drawDpr = 2560 / w;
            }
            if (h * drawDpr > 1600) {
                drawDpr = Math.min(drawDpr, 1600 / h);
            }

            const targetW = Math.round(w * drawDpr);
            const targetH = Math.round(h * drawDpr);

            for (let c of [this.canvas, this.bgCanvas]) {
                if (c.width !== targetW || c.height !== targetH) {
                    c.width = targetW;
                    c.height = targetH;
                    c.style.width = w + 'px';
                    c.style.height = h + 'px';
                    this.ctx.setTransform(drawDpr, 0, 0, drawDpr, 0, 0);
                    this.bgCtx.setTransform(drawDpr, 0, 0, drawDpr, 0, 0);
                    this._cachedDpr = drawDpr;
                }
            }

            if (this._cachedDpr !== drawDpr) {
                this.ctx.setTransform(drawDpr, 0, 0, drawDpr, 0, 0);
                this.bgCtx.setTransform(drawDpr, 0, 0, drawDpr, 0, 0);
                this._cachedDpr = drawDpr;
            }

            return { w, h };
        }

        drawImgFit(img, w, h) {
            if (!img || !img.naturalWidth) return;
            const imgAspect = img.naturalWidth / img.naturalHeight;
            let drawW, drawH, drawX, drawY;
            const isPortrait = window.innerHeight > window.innerWidth;

            if (isPortrait) {
                if (h * imgAspect >= w) {
                    drawH = h;
                    drawW = h * imgAspect;
                } else {
                    drawW = w;
                    drawH = w / imgAspect;
                }
            } else {
                drawH = h;
                drawW = h * imgAspect;
            }

            drawX = (w - drawW) / 2;
            drawY = (h - drawH) / 2;

            this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }

        render() {
            const { w: W, h: H } = this.syncCanvas();
            const ctx = this.ctx;
            const bgCtx = this.bgCtx;
            const accent = this.colors.new || 'rgb(252, 91, 144)';
            const oldAccent = this.colors.old || 'rgb(252, 91, 144)';
            const p = this.progress.value;

            ctx.clearRect(0, 0, W, H);
            bgCtx.clearRect(0, 0, W, H);

            if (this.currentType === 'highContrastCutIn') {
                this.renderCutIn(W, H, p, accent);
                return;
            }

            bgCtx.save();
            bgCtx.fillStyle = this.rgbBlend(oldAccent, 24);
            bgCtx.fillRect(0, 0, W, H);

            let pBG = Math.min(1, p * 1.2);

            if (this.currentType === 'wavyCircle' || this.currentType === 'lineCutIn') {
                pBG = p;
            }

            this.definePath(bgCtx, W, H, pBG, 'inner');
            bgCtx.clip();
            bgCtx.fillStyle = this.rgbBlend(accent, 24);
            bgCtx.fillRect(0, 0, W, H);
            bgCtx.restore();

            ctx.save();
            this.drawImgFit(this.images.old, W, H);

            ctx.globalCompositeOperation = 'destination-out';
            this.definePath(ctx, W, H, p, 'main');
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            this.definePath(ctx, W, H, p, 'inner');
            ctx.clip();
            this.drawImgFit(this.images.new, W, H);
            ctx.restore();

            ctx.save();
            this.applyAccents(ctx, W, H, p, accent);
            ctx.restore();
        }

        renderCutIn(W, H, p, accent) {
            const ctx = this.ctx;
            const bgCtx = this.bgCtx;

            const oldAccent = this.colors.old || 'rgb(17, 17, 17)';
            const BG_OLD = this.rgbBlend(oldAccent, 24);
            const BG_NEW = this.rgbBlend(accent, 24);
            const BG_PANEL = this.rgbBlend(oldAccent, 38);
            const P3_CYAN = 'rgb(0, 0, 0)';
            const P3_WHITE = 'rgb(255, 255, 255)';

            ctx.clearRect(0, 0, W, H);
            bgCtx.clearRect(0, 0, W, H);

            bgCtx.fillStyle = BG_OLD;
            bgCtx.fillRect(0, 0, W, H);

            if (p < 0.06) {
                this.drawImgFit(this.images.old, W, H);
                ctx.fillStyle = P3_WHITE;
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

            {
                const imgA = Math.max(0, 1 - swpP * 3.5);
                if (imgA > 0) {
                    ctx.save();
                    ctx.globalAlpha = imgA;
                    this.drawImgFit(this.images.old, W, H);
                    ctx.restore();
                }
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
                bgCtx.fillStyle = (i % 2 === 0)
                    ? BG_PANEL
                    : BG_OLD;
                bgCtx.fill();

                const edgeA = Math.max(0, Math.sin(Math.min(1, iP) * Math.PI) * 0.85);
                if (edgeA > 0.02) {
                    bgCtx.save();
                    bgCtx.strokeStyle = P3_CYAN;
                    bgCtx.lineWidth = 2;
                    bgCtx.globalAlpha = edgeA;
                    bgCtx.shadowColor = P3_CYAN;
                    bgCtx.shadowBlur = 8;
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
                    this.drawImgFit(this.images.new, W, H);
                    ctx.globalCompositeOperation = 'source-in';
                    ctx.fillStyle = 'rgb(0, 0, 0)';
                    ctx.fillRect(-50, -50, W + 100, H + 100);
                    ctx.restore();

                    ctx.save();
                    ctx.globalAlpha = sA * 0.88;
                    this.drawImgFit(this.images.new, W, H);
                    ctx.globalCompositeOperation = 'source-in';
                    ctx.fillStyle = P3_CYAN;
                    ctx.fillRect(0, 0, W, H);
                    ctx.restore();
                }
            }

            if (p > 0.44 && p < 0.55) {
                const gA = Math.sin(((p - 0.44) / 0.11) * Math.PI) * 0.11;
                if (gA > 0.005) {
                    const G = 44;
                    ctx.save();
                    ctx.strokeStyle = P3_CYAN;
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = gA;
                    ctx.beginPath();
                    for (let x = 0; x <= W + G; x += G) {
                        ctx.moveTo(x, 0); ctx.lineTo(x, H);
                    }
                    for (let y = 0; y <= H + G; y += G) {
                        ctx.moveTo(0, y); ctx.lineTo(W, y);
                    }
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
                this.drawImgFit(this.images.new, W, H);
                ctx.restore();

                const lineA = Math.max(0, 1 - Math.pow(rP, 2.5));
                if (lineA > 0.01) {
                    ctx.save();
                    ctx.globalAlpha = lineA;
                    ctx.strokeStyle = P3_WHITE;
                    ctx.lineWidth = 10;
                    ctx.shadowColor = P3_WHITE;
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.moveTo(rw, 0);
                    ctx.lineTo(rw - RSKEW, H);
                    ctx.stroke();

                    ctx.strokeStyle = P3_CYAN;
                    ctx.lineWidth = 4;
                    ctx.globalAlpha = lineA * 0.8;
                    ctx.shadowColor = P3_CYAN;
                    ctx.shadowBlur = 18;
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
                    ctx.strokeStyle = P3_CYAN;
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
            ctx.fillStyle = this.scanlinePattern;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();

            if (p > 0.30 && p < 0.95) {
                const bIn = Math.min(1, (p - 0.30) / 0.15);
                const bOut = p > 0.88 ? Math.max(0, 1 - (p - 0.88) / 0.07) : 1;
                const bA = bIn * bOut * 0.55;

                if (bA > 0.01) {
                    const bLen = W * Math.min(1, bIn * 1.6);
                    bgCtx.save();
                    bgCtx.strokeStyle = P3_CYAN;
                    bgCtx.lineWidth = 1.5;
                    bgCtx.shadowColor = P3_CYAN;
                    bgCtx.shadowBlur = 4;
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

        definePath(ctx, W, H, p, variant = 'main') {
            ctx.beginPath();
            switch (this.currentType) {
                case 'shutter': {
                    const skew = 250;
                    for (const cell of this.cells) {
                        const w = cell.w * cell.p;
                        const slide = (1 - cell.p) * (cell.dir * 400);
                        ctx.moveTo(cell.x + slide, 0);
                        ctx.lineTo(cell.x + slide + w, 0);
                        ctx.lineTo(cell.x + slide + w - skew, H);
                        ctx.lineTo(cell.x + slide - skew, H);
                        ctx.closePath();
                    }
                    break;
                }

                case 'cornerWaves': {
                    const maxR = Math.sqrt(W * W + H * H) * 1.2;
                    let rP = p;
                    if (variant === 'inner') rP = Math.pow(p, 1.2);
                    const r = maxR * rP;
                    if (r <= 0) return;

                    this.drawWavyCircle(ctx, W, 0, r, 5, 80 * (1 - rP), rP);
                    this.drawWavyCircle(ctx, 0, H, r, 5, 80 * (1 - rP), rP);
                    break;
                }

                case 'triangle': {
                    const rP = variant === 'inner' ? Math.pow(p, 1.5) : p;
                    const size = Math.max(W, H) * 2.5 * rP;
                    const cx = W / 2, cy = H / 2;
                    const rot = p * Math.PI * 0.5;

                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.rotate(rot);
                    ctx.moveTo(0, -size);
                    ctx.lineTo(size * 0.86, size * 0.5);
                    ctx.lineTo(-size * 0.86, size * 0.5);
                    ctx.closePath();
                    ctx.restore();
                    break;
                }

                case 'wavyCircle': {
                    const maxR = Math.sqrt(W * W + H * H) / 2.0;

                    let rP;

                    if (variant === 'inner') {
                        const delay = 0.24;
                        const tinyStart = 0.008;
                        const t = p < delay ? 0 : (p - delay) / (1 - delay);
                        const eased = 1 - Math.pow(1 - t, 2.4);
                        rP = tinyStart + (1 - tinyStart) * eased;
                    } else {
                        const delay = 0.03;
                        const tinyStart = 0.01;
                        const t = p < delay ? 0 : (p - delay) / (1 - delay);
                        const eased = 1 - Math.pow(1 - t, 3.1);
                        rP = tinyStart + (1 - tinyStart) * eased;
                    }

                    const r = maxR * rP;
                    if (r <= 0) return;
                    this.drawWavyCircle(ctx, W / 2, H / 2, r, 8, 120 * (1 - rP) * rP, rP);
                    ctx.closePath();
                    break;
                }

                case 'lineCutIn': {
                    const skew = 450;
                    const sweepRange = W + skew + 600;
                    let pVal = p;
                    if (variant === 'inner') {
                        pVal = Math.pow(p, 1.3);
                    }
                    const edgeX = -skew - 300 + sweepRange * pVal;

                    ctx.moveTo(-W, 0);
                    ctx.lineTo(edgeX, 0);
                    ctx.lineTo(edgeX - skew, H);
                    ctx.lineTo(-W, H);
                    ctx.closePath();

                    if (variant === 'main' && p > 0 && p < 1) {
                        const drawBlock = (offset, blockW) => {
                            ctx.moveTo(edgeX + offset, 0);
                            ctx.lineTo(edgeX + offset + blockW, 0);
                            ctx.lineTo(edgeX + offset + blockW - skew, H);
                            ctx.lineTo(edgeX + offset - skew, H);
                            ctx.closePath();
                        };
                        drawBlock(60, 180);
                        drawBlock(300, 40);
                    }
                    break;
                }
            }
        }

        applyAccents(ctx, W, H, p, accent) {
            ctx.strokeStyle = accent;
            ctx.lineWidth = TRANSITION_OUTLINE_THICKNESS;
            ctx.fillStyle = accent;

            if (p <= 0 || p >= 1) return;

            switch (this.currentType) {
                case 'shutter': {
                    const skewS = 250;
                    for (const cell of this.cells) {
                        if (cell.p <= 0 || cell.p >= 1) continue;
                        const w = cell.w * cell.p;
                        const slide = (1 - cell.p) * (cell.dir * 400);

                        ctx.globalAlpha = (1 - cell.p) * 0.8;
                        ctx.fillStyle = accent;
                        ctx.beginPath();
                        ctx.moveTo(cell.x + slide - 20, 0);
                        ctx.lineTo(cell.x + slide + w + 20, 0);
                        ctx.lineTo(cell.x + slide + w + 20 - skewS, H);
                        ctx.lineTo(cell.x + slide - 20 - skewS, H);
                        ctx.fill();

                        ctx.globalAlpha = 1.0;
                        ctx.fillStyle = 'rgb(255, 255, 255)';
                        ctx.beginPath();
                        ctx.moveTo(cell.x + slide + w - 4, 0);
                        ctx.lineTo(cell.x + slide + w + 2, 0);
                        ctx.lineTo(cell.x + slide + w + 2 - skewS, H);
                        ctx.lineTo(cell.x + slide + w - 4 - skewS, H);
                        ctx.fill();

                        ctx.fillStyle = accent;
                    }
                    break;
                }

                case 'triangle':
                    ctx.save();
                    ctx.strokeStyle = accent;
                    ctx.lineWidth = 20 * (1 - p);
                    this.definePath(ctx, W, H, p, 'main');
                    ctx.stroke();

                    ctx.strokeStyle = 'rgb(255, 255, 255)';
                    ctx.lineWidth = 5;
                    this.definePath(ctx, W, H, Math.max(0, p - 0.08), 'inner');
                    ctx.stroke();
                    ctx.restore();
                    break;

                case 'lineCutIn': {
                    if (p <= 0 || p >= 1) return;

                    const skew = 450;
                    const sweepRange = W + skew + 600;
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

                    if (p > 0.02 && p < 1) {
                        ctx.beginPath();
                        const outlineBlock = (offset, blockW) => {
                            ctx.moveTo(edgeX + offset, 0);
                            ctx.lineTo(edgeX + offset + blockW, 0);
                            ctx.lineTo(edgeX + offset + blockW - skew, H);
                            ctx.lineTo(edgeX + offset - skew, H);
                            ctx.closePath();
                        };
                        outlineBlock(60, 180);
                        outlineBlock(300, 40);

                        ctx.strokeStyle = accent;
                        ctx.lineWidth = 6 * Math.max(0, 1 - Math.pow(p, 3));
                        ctx.globalAlpha = 0.9;
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }

                    break;
                }

                case 'wavyCircle': {
                    const oldAccent = this.colors.old || 'rgb(17, 17, 17)';

                    ctx.strokeStyle = oldAccent;
                    ctx.lineWidth = 12 * (1 - p);
                    this.definePath(ctx, W, H, p, 'main');

                    ctx.lineWidth = 8 * (1 - p);
                    this.definePath(ctx, W, H, p, 'inner');
                    break;
                }
            }
        }

        drawWavyCircle(ctx, x, y, r, segments, amp, customP) {
            const steps = WAVY_CIRCLE_STEPS;
            const step = (Math.PI * 2) / steps;
            const animP = customP !== undefined ? customP : this.progress.value;

            for (let i = 0; i <= steps; i++) {
                const angle = i * step;

                const s1 = Math.sin(angle * segments + animP * 4);
                const s2 = Math.sin(angle * segments * 0.5 - animP * 2) * 0.4;
                const offset = (s1 + s2) * amp;

                const dist = Math.max(0, r + offset);
                const px = x + Math.cos(angle) * dist;
                const py = y + Math.sin(angle) * dist;

                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
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
                anime.remove(this.cells);
                this.active = false;
            }

            this._generation++;
            this.active = true;
            this.images.old = oldImg;
            this.images.new = newImg;
            this.colors.new = options.accent || 'rgb(252, 91, 144)';
            this.colors.old = options.oldAccent || 'rgb(252, 91, 144)';

            this.onDone = options.onDone || null;

            if (options.type && TRANSITION_TYPES.includes(options.type)) {
                this.currentType = options.type;
            } else {
                this.currentType = TRANSITION_TYPES[Math.floor(Math.random() * TRANSITION_TYPES.length)];
            }

            this.images.old.style.opacity = '0';
            this.images.new.style.opacity = '0';

            const { w: W } = this.syncCanvas();

            this.progress.value = 0;
            this.cells = [];
            if (this.currentType === 'shutter') {
                const skew = 250;
                const coverageBuffer = skew + 300;
                const stripCount = Math.max(12, Math.ceil(W / 65));
                const stripWidth = (W + coverageBuffer) / stripCount;

                for (let i = 0; i < stripCount; i++) {
                    this.cells.push({
                        x: i * (stripWidth - 1) - 150,
                        w: stripWidth + 5,
                        p: 0,
                        dir: (i % 2 === 0 ? 1 : -1)
                    });
                }
            }

            this.render();
            this.canvas.style.opacity = '1';
            this.bgCanvas.style.opacity = '1';
            options.onStart?.();

            const animeConfig = {
                duration: CHARACTER_DURATION,
                easing: 'easeOutExpo',
                update: () => this.render(),
                complete: () => this.finish()
            };

            if (this.currentType === 'shutter') {
                animeConfig.targets = this.cells;
                animeConfig.p = [0, 1];
                animeConfig.duration = CHARACTER_DURATION * 0.85;
                animeConfig.easing = 'easeOutExpo';
                animeConfig.delay = anime.stagger(35, { from: 'first' });
            } else {
                animeConfig.targets = this.progress;
                animeConfig.value = [0, 1];

                if (this.currentType === 'highContrastCutIn') {
                    animeConfig.duration = CHARACTER_DURATION * 1.05;
                    animeConfig.easing = 'linear';
                } else if (this.currentType === 'wavyCircle') {
                    animeConfig.duration = CHARACTER_DURATION * 1.1;
                }
            }

            this.animation = anime(animeConfig);
        }

        finish() {
            const finishGen = this._generation;
            let result = null;
            if (typeof this.onDone === 'function') result = this.onDone();

            const finalCleanup = () => {
                if (finishGen === this._generation) {
                    this.canvas.style.opacity = '0';
                    this.bgCanvas.style.opacity = '0';
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
                    this.images.new.style.opacity = '1';
                    this.active = false;
                }
                this.cleanupTask = null;
            };

            if (result && typeof result.then === 'function') {
                result.then(() => {
                    this.cleanupTask = requestAnimationFrame(finalCleanup);
                });
            } else {
                this.cleanupTask = requestAnimationFrame(finalCleanup);
            }
        }

        cancel() {
            if (!this.active) return;
            if (this.animation) this.animation.pause();
            if (this.cleanupTask) { cancelAnimationFrame(this.cleanupTask); this.cleanupTask = null; }
            this.canvas.style.opacity = '0';
            this.bgCanvas.style.opacity = '0';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
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

