import Footer from './components/Footer.js';
import LoadingScreen from './components/LoadingScreen.js';
import Header from './components/Header.js';
import Background from './components/Background.js';
import Settings from './components/Settings.js';

import store from './store.js';

window.store = store;

class App {
    constructor() {
        this.components = {};
    }

    async init() {
        console.log("Initializing App...");

        const DEBUG_SKIP_LOADER = false;

        if (!DEBUG_SKIP_LOADER) {
            this.loadingScreen = new LoadingScreen();
            this.loadingScreen.mount('#loader-container');
            this.loadingScreen.init();

            await new Promise(resolve => requestAnimationFrame(resolve));
        } else {
            console.log("DEBUG: Loading screen skipped.");
        }

        this.header = new Header();
        this.header.mount('#header-container');

        this.background = new Background();
        this.background.mount('#background-container');

        this.footer = new Footer();
        this.footer.mount('#footer-container');

        this.settings = new Settings();
        this.settings.mount('#settings-root');

        console.log("App ready!");
        window.dispatchEvent(new CustomEvent('app-ready'));
    }
}

window.app = new App();

document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});
