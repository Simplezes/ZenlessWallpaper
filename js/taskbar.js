function detectTaskbar() {
    const screenHeight = window.screen.height;
    const availHeight = window.screen.availHeight;
    const taskbarHeight = screenHeight - availHeight;
    if (window.screen.availTop === 0) {
        document.documentElement.style.setProperty('--taskbar-offset', window.pxToCurrentRem(taskbarHeight));
    } else {
        document.documentElement.style.setProperty('--taskbar-offset', '0rem');
    }
}
detectTaskbar();
window.addEventListener('resize', detectTaskbar);
