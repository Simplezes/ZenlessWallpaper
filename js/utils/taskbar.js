function detectTaskbar() {
    const sw = window.screen.width;
    const sh = window.screen.height;
    const aw = window.screen.availWidth;
    const ah = window.screen.availHeight;
    const al = window.screen.availLeft || 0;
    const at = window.screen.availTop || 0;

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

    const root = document.documentElement;
    root.style.setProperty('--taskbar-bottom', window.pxToCurrentRem(offsetBottom));
    root.style.setProperty('--taskbar-left', window.pxToCurrentRem(offsetLeft));
    root.style.setProperty('--taskbar-top', window.pxToCurrentRem(offsetTop));
    root.style.setProperty('--taskbar-right', window.pxToCurrentRem(offsetRight));

    let legacyOffset = offsetBottom;
    if (window.innerHeight > window.innerWidth) {
        if (offsetLeft > 0) legacyOffset = offsetLeft;
        else if (offsetRight > 0) legacyOffset = offsetRight;
    }
    root.style.setProperty('--taskbar-offset', window.pxToCurrentRem(legacyOffset));
}

detectTaskbar();
window.addEventListener('resize', detectTaskbar);
setTimeout(detectTaskbar, 500);
