import Footer from './components/Footer.js';
import LoadingScreen from './components/LoadingScreen.js';
import Header from './components/Header.js';
import Background from './components/Background.js';
import Settings from './components/Settings.js';
import Announcement from './components/Announcement.js';

import store from './store.js';

window.store = store;

class App {
    constructor() {
        this.components = {};
        window.charactersFetch = fetch('assets/characters.json')
            .then(r => r.json())
            .catch(e => console.error("Early fetch error", e));
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

        this.announcement = new Announcement();
        this.announcement.mount('#announcement-root');
        this.announcement.show();

        store.subscribe((s) => {
            document.body.classList.toggle('show-ambient', !!s.showAmbient);
            document.body.classList.toggle('show-pattern', !!s.patternEnabled);
        });
        document.body.classList.toggle('show-ambient', !!store.state.showAmbient);
        document.body.classList.toggle('show-pattern', !!store.state.patternEnabled);

        console.log("App ready!");
        window.dispatchEvent(new CustomEvent('app-ready'));
    }
}

window.app = new App();

document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});
