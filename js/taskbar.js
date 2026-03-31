function detectTaskbar() {
    const screenHeight = window.screen.height;
    const availHeight = window.screen.availHeight;
    let taskbarHeight = screenHeight - availHeight;

    if (taskbarHeight < 0) taskbarHeight = 0;
    if (taskbarHeight > 200) taskbarHeight = 0;

    if (window.screen.availTop === 0 && taskbarHeight > 0) {
        document.documentElement.style.setProperty('--taskbar-offset', window.pxToCurrentRem(taskbarHeight));
    } else {
        document.documentElement.style.setProperty('--taskbar-offset', '0rem');
    }
}
detectTaskbar();
window.addEventListener('resize', detectTaskbar);
