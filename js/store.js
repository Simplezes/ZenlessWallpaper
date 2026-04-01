class Store {
    constructor() {
        this.state = {
            currentAgent: localStorage.getItem('selectedCharacter') || "Burnice White",
            currentVariant: localStorage.getItem('selectedVariant') || "Default",
            accentColor: localStorage.getItem('--accent-color') || 'rgb(252, 91, 144)',
            isPortrait: window.innerHeight > window.innerWidth,
            showAmbient: localStorage.getItem('showAmbient') !== 'false',
            footerTheme: localStorage.getItem('footerTheme') || 'dark',
            kineticEnabled: localStorage.getItem('kineticSway') !== 'false',
            patternEnabled: localStorage.getItem('bgPattern') !== 'false',

            
            month: 'MAR',
            monthNum: '03',
            year: '2026',
            
            media: {
                title: 'NO MEDIA',
                artist: 'IDLE',
                isPlaying: false,
                playbackState: 0
            }
        };

        this.listeners = [];
        this.initDate();
        
        window.addEventListener('resize', () => {
            this.setState({ isPortrait: window.innerHeight > window.innerWidth });
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

    subscribe(listener) {
        this.listeners.push(listener);
        listener(this.state);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    initDate() {
        const updateDate = () => {
            const now = new Date();
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            this.setState({
                month: monthNames[now.getMonth()],
                monthNum: (now.getMonth() + 1).toString().padStart(2, '0'),
                year: now.getFullYear().toString()
            });
        };
        updateDate();
        
        setInterval(updateDate, 60000);
    }
}

const store = new Store();
export default store;
export { store };
