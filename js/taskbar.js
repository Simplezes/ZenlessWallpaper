function detectTaskbar() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const availWidth = window.screen.availWidth;
    const availHeight = window.screen.availHeight;
    const availLeft = window.screen.availLeft || 0;
    const availTop = window.screen.availTop || 0;

    let offsetBottom = 0;
    let offsetLeft = 0;
    let offsetTop = 0;
    let offsetRight = 0;

    if (availTop > 0) offsetTop = availTop;
    if (availTop + availHeight < screenHeight) offsetBottom = screenHeight - (availTop + availHeight);

    if (availLeft > 0) offsetLeft = availLeft;
    if (availLeft + availWidth < screenWidth) offsetRight = screenWidth - (availLeft + availWidth);

    const limit = 200;
    if (offsetBottom > limit) offsetBottom = 0;
    if (offsetTop > limit) offsetTop = 0;
    if (offsetLeft > limit) offsetLeft = 0;
    if (offsetRight > limit) offsetRight = 0;

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
