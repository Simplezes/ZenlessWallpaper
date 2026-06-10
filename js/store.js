class Store {
    constructor() {
        const storage = window.safeStorage;
        this.state = {
            currentAgent: storage ? storage.get('selectedCharacter', "Burnice White") : (localStorage.getItem('selectedCharacter') || "Burnice White"),
            faction: storage ? storage.get('selectedFaction', "KOBEBW") : (localStorage.getItem('selectedFaction') || "KOBEBW"),
            nickname: storage ? storage.get('selectedNickname', "BURNICE") : (localStorage.getItem('selectedNickname') || "BURNICE"),
            currentVariant: storage ? storage.get('selectedVariant', "Default") : (localStorage.getItem('selectedVariant') || "Default"),
            accentColor: storage ? storage.get('--accent-color', 'rgb(252, 91, 144)') : (localStorage.getItem('--accent-color') || 'rgb(252, 91, 144)'),
            isPortrait: window.innerHeight > window.innerWidth,
            showAmbient: storage ? storage.getBool('showAmbient', true) : localStorage.getItem('showAmbient') !== 'false',
            footerTheme: storage ? storage.get('footerTheme', 'dark') : (localStorage.getItem('footerTheme') || 'dark'),
            kineticEnabled: storage ? storage.getBool('kineticSway', true) : localStorage.getItem('kineticSway') !== 'false',
            patternEnabled: storage ? storage.getBool('bgPattern', true) : localStorage.getItem('bgPattern') !== 'false',
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
            timeValue: '--:--',
            ampm: '--',
            use24h: storage ? storage.getBool('use24h', false) : localStorage.getItem('use24h') === 'true',
            layout: storage ? storage.get('wallpaperLayout', 'calendar') : (localStorage.getItem('wallpaperLayout') || 'calendar')
        };

        this.listeners = [];
        this._dateUpdateInterval = null;
        this.initDate();
        this.initTime();

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
        if (window.safeStorage) window.safeStorage.set('footerTheme', theme);
        else localStorage.setItem('footerTheme', theme);
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

    initTime() {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            if (this.state.use24h) {
                const timeValue = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                this.setState({ timeValue, ampm: '' });
            } else {
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const hours12 = hours % 12 || 12;
                const timeValue = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                this.setState({ timeValue, ampm });
            }
        };
        this._updateTime = updateTime;
        updateTime();
        setInterval(updateTime, 1000);
    }

    toggleTimeFormat() {
        const use24h = !this.state.use24h;
        const storage = window.safeStorage;
        if (storage) storage.set('use24h', use24h);
        else localStorage.setItem('use24h', use24h);
        this.setState({ use24h });
        if (this._updateTime) this._updateTime();
    }
}

const store = new Store();
export default store;
export { store };
