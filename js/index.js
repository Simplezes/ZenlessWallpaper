import Footer from './components/Footer.js';
import FooterSlim from './components/FooterSlim.js';
import LoadingScreen from './components/LoadingScreen.js';
import Header from './components/Header.js';
import Background from './components/Background.js';
import AgentDossier from './components/AgentDossier.js';
import Announcement from './components/Announcement.js';

import store from './store.js';

window.store = store;

class App {
    constructor() {
        this.components = {};
        window.charactersFetch = fetch('assets/characters.json')
            .then(r => {
                if (!r.ok) throw new Error(`characters.json request failed: ${r.status}`);
                return r.json();
            })
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

        this.footerSlim = new FooterSlim();
        this.footerSlim.mount('#footer-slim-root');

        this.dossier = new AgentDossier();
        this.dossier.mount('#dossier-root');

        this.announcement = new Announcement();
        this.announcement.mount('#announcement-root');
        this.announcement.show();

        store.subscribe((s) => {
            document.body.classList.toggle('show-ambient', !!s.showAmbient);
            document.body.classList.toggle('show-pattern', !!s.patternEnabled);
            document.body.classList.toggle('hide-footer', !!s.hideFooter);
        });
        document.body.classList.toggle('show-ambient', !!store.state.showAmbient);
        document.body.classList.toggle('show-pattern', !!store.state.patternEnabled);
        document.body.classList.toggle('hide-footer', !!store.state.hideFooter);

        console.log("App ready!");
        window.dispatchEvent(new CustomEvent('app-ready'));
    }
}

window.app = new App();

window.onerror = (msg, url, line, col, err) => {
    console.error('Global error:', { msg, url, line, col, err });
};

window.onunhandledrejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
};

document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});
