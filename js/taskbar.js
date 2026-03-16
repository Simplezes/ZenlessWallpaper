function detectTaskbar() {
    const screenHeight = window.screen.height;
    const availHeight = window.screen.availHeight;
    const taskbarHeight = screenHeight - availHeight;
    if (window.screen.availTop === 0) {
        document.documentElement.style.setProperty('--taskbar-offset', taskbarHeight + 'px');
    } else {
        document.documentElement.style.setProperty('--taskbar-offset', '0px');
    }
}
detectTaskbar();
window.addEventListener('resize', detectTaskbar);
