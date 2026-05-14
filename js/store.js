class Store {
    constructor() {
        this.state = {
            currentAgent: localStorage.getItem('selectedCharacter') || "Burnice White",
            faction: localStorage.getItem('selectedFaction') || "KOBEBW",
            nickname: localStorage.getItem('selectedNickname') || "BURNICE",
            currentVariant: localStorage.getItem('selectedVariant') || "Default",
            accentColor: localStorage.getItem('--accent-color') || 'rgb(252, 91, 144)',
            isPortrait: window.innerHeight > window.innerWidth,
            showAmbient: localStorage.getItem('showAmbient') !== 'false',
            footerTheme: localStorage.getItem('footerTheme') || 'dark',
            kineticEnabled: localStorage.getItem('kineticSway') !== 'false',
            patternEnabled: localStorage.getItem('bgPattern') !== 'false',
            viewOffset: 0,

            month: 'MAR',
            monthNum: '03',
            year: '2026',

            media: {
                title: 'NO MEDIA',
                artist: 'IDLE',
                isPlaying: false,
                playbackState: 0
            },
            layout: localStorage.getItem('wallpaperLayout') || 'calendar'
        };

        this.listeners = [];
        this._dateUpdateInterval = null;
        this.initDate();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.setState({ isPortrait: window.innerHeight > window.innerWidth });
            }, 150);
        });
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener(this.state));
    }

    setFooterTheme(theme) {
        localStorage.setItem('footerTheme', theme);
        this.setState({ footerTheme: theme });
    }

    setViewOffset(offset) {
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        this.setState({
            viewOffset: offset,
            month: monthNames[target.getMonth()],
            monthNum: (target.getMonth() + 1).toString().padStart(2, '0'),
            year: target.getFullYear().toString()
        });
    }

    subscribe(listener) {
        this.listeners.push(listener);
        listener(this.state);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    initDate() {
        const updateDate = () => {
            this.setViewOffset(this.state.viewOffset || 0);
        };
        updateDate();
        this._dateUpdateInterval = setInterval(updateDate, 60000);
    }
}

const store = new Store();
export default store;
export { store };
