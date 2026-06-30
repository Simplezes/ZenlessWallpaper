class TaskbarMonitor {
    constructor() {
        this.lastState = {
            sw: 0,
            sh: 0,
            aw: 0,
            ah: 0,
            al: 0,
            at: 0
        };
        this.root = document.documentElement;
        this.detectTaskbar = this.detectTaskbar.bind(this);
        this.detectTaskbar();
        setInterval(this.detectTaskbar, 500);
        window.addEventListener('resize', this.detectTaskbar);
    }

    detectTaskbar() {
        const sw = window.screen.width;
        const sh = window.screen.height;
        const aw = window.screen.availWidth;
        const ah = window.screen.availHeight;
        const al = window.screen.availLeft || 0;
        const at = window.screen.availTop || 0;

        if (
            this.lastState.sw === sw &&
            this.lastState.sh === sh &&
            this.lastState.aw === aw &&
            this.lastState.ah === ah &&
            this.lastState.al === al &&
            this.lastState.at === at
        ) {
            return;
        }

        this.lastState = { sw, sh, aw, ah, al, at };

        const sl = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const st = window.screenTop !== undefined ? window.screenTop : window.screenY;

        let offsetBottom = 0;
        let offsetLeft = 0;
        let offsetTop = 0;
        let offsetRight = 0;

        if (at > st) offsetTop = at - st;
        if (at + ah < st + sh) offsetBottom = (st + sh) - (at + ah);

        if (al > sl) offsetLeft = al - sl;
        if (al + aw < sl + sw) offsetRight = (sl + sw) - (al + aw);

        const limit = 250;
        if (offsetBottom > limit || offsetBottom < 0) offsetBottom = 0;
        if (offsetTop > limit || offsetTop < 0) offsetTop = 0;
        if (offsetLeft > limit || offsetLeft < 0) offsetLeft = 0;
        if (offsetRight > limit || offsetRight < 0) offsetRight = 0;

        const toRem = (px) => typeof window.pxToCurrentRem === 'function' ? window.pxToCurrentRem(px) : `${px}px`;

        this.root.style.setProperty('--taskbar-bottom', toRem(offsetBottom));
        this.root.style.setProperty('--taskbar-left', toRem(offsetLeft));
        this.root.style.setProperty('--taskbar-top', toRem(offsetTop));
        this.root.style.setProperty('--taskbar-right', toRem(offsetRight));

        let legacyOffset = offsetBottom;
        if (window.innerHeight > window.innerWidth) {
            if (offsetLeft > 0) legacyOffset = offsetLeft;
            else if (offsetRight > 0) legacyOffset = offsetRight;
        }
        this.root.style.setProperty('--taskbar-offset', toRem(legacyOffset));
    }
}

new TaskbarMonitor();
