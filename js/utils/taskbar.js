(function () {
    'use strict';

    var root = document.documentElement;

    var lastSW = 0, lastSH = 0;
    var lastAW = 0, lastAH = 0;
    var lastAL = 0, lastAT = 0;

    function toRem(px) {
        if (typeof window.pxToCurrentRem === 'function') {
            return window.pxToCurrentRem(px);
        }
        return px + 'px';
    }

    function applyOffsets() {
        var offBottom = 0, offLeft = 0, offTop = 0, offRight = 0;

        var sl = (window.screenLeft !== undefined) ? window.screenLeft : window.screenX;
        var st = (window.screenTop  !== undefined) ? window.screenTop  : window.screenY;
        var sh = lastSH, sw = lastSW;
        var ah = lastAH, aw = lastAW;
        var al = lastAL, at = lastAT;

        if (at > st)           offTop    = at - st;
        if (at + ah < st + sh) offBottom = (st + sh) - (at + ah);
        if (al > sl)           offLeft   = al - sl;
        if (al + aw < sl + sw) offRight  = (sl + sw) - (al + aw);

        var limit = 250;
        if (offBottom > limit || offBottom < 0) offBottom = 0;
        if (offTop    > limit || offTop    < 0) offTop    = 0;
        if (offLeft   > limit || offLeft   < 0) offLeft   = 0;
        if (offRight  > limit || offRight  < 0) offRight  = 0;

        root.style.setProperty('--taskbar-bottom', toRem(offBottom));
        root.style.setProperty('--taskbar-left',   toRem(offLeft));
        root.style.setProperty('--taskbar-top',    toRem(offTop));
        root.style.setProperty('--taskbar-right',  toRem(offRight));

        var legacy = offBottom;
        if (window.innerHeight > window.innerWidth) {
            if (offLeft  > 0) legacy = offLeft;
            else if (offRight > 0) legacy = offRight;
        }
        root.style.setProperty('--taskbar-offset', toRem(legacy));
    }

    function pollGeometry() {
        var sw = window.screen.width;
        var sh = window.screen.height;
        var aw = window.screen.availWidth;
        var ah = window.screen.availHeight;
        var al = window.screen.availLeft || 0;
        var at = window.screen.availTop  || 0;

        if (sw === lastSW && sh === lastSH &&
            aw === lastAW && ah === lastAH &&
            al === lastAL && at === lastAT) {
            return;
        }

        lastSW = sw; lastSH = sh;
        lastAW = aw; lastAH = ah;
        lastAL = al; lastAT = at;
        applyOffsets();
    }

    pollGeometry();

    setInterval(pollGeometry, 500);

    window.addEventListener('resize', pollGeometry);

}());
