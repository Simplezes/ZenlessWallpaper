import Component from './Component.js';

export default class LoadingScreen extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            tip: '',
            wallpaper: '',
            icon: '',
            no: '01',
            modeName: 'HOLLOW INVESTIGATION',
            ready: false
        };
    }

    render() {
        return `
        <div id="loading-screen">
            <div class="loader-layout ${this.state.ready ? 'ready' : ''}">
                <div class="loader-left">
                    <div class="loader-mode-header">
                        <img id="loader-mode-icon" src="${this.state.icon}" alt="">
                    </div>
                    <div class="loader-tips-wrap">
                        <p id="loader-tip-text">${this.state.tip}</p>
                    </div>
                    <div class="loader-footer-left">
                        <div class="loader-icons-bottom">
                            <img src="assets/imgs/svg/icon_loading_bottom.svg" alt="" class="loader-bottom-icons">
                        </div>
                        <div class="loader-metadata-block">
                            <div class="loader-no">No.${this.state.no}</div>
                            <div class="loader-mode-name">${this.state.modeName}</div>
                        </div>
                    </div>
                </div>
                <div class="loader-right">
                    <img id="loader-wallpaper" src="${this.state.wallpaper}" alt="">
                    <div class="loader-footer-right">
                        <img src="assets/imgs/Bangboo_Net_Loading.webp" class="loader-bangboo-indicator">
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async init() {
        try {
            const response = await fetch('assets/loading/tips.json');
            const loaderTips = await response.json();

            const categories = Object.keys(loaderTips).filter(cat => {
                return loaderTips[cat].lines && Object.keys(loaderTips[cat].lines).length > 0;
            });

            if (categories.length === 0) throw new Error("No categories with tips found");

            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            const categoryData = loaderTips[randomCat];
            const tipKeys = Object.keys(categoryData.lines);
            const randomTipKey = tipKeys[Math.floor(Math.random() * tipKeys.length)];
            const randomTip = categoryData.lines[randomTipKey];

            const randomWallpaperId = Math.floor(Math.random() * 5) + 1;
            const wallpaperImg = `assets/loading/wallpaper_${randomWallpaperId}.webp`;
            const iconName = randomCat.split('_')[0];
            const iconImg = `assets/imgs/svg/icon_${iconName}.svg`;

            this.setState({
                tip: randomTip,
                wallpaper: wallpaperImg,
                icon: iconImg,
                no: randomTipKey,
                modeName: categoryData.title.toUpperCase()
            });

            await this.preloadImages([wallpaperImg, iconImg, 'assets/imgs/Bangboo_Net_Loading.webp']);
            this.setState({ ready: true });

        } catch (e) {
            console.error("Failed to init LoadingScreen", e);
            this.setState({ ready: true });
        }
    }

    async preloadImages(urls) {
        const promises = urls.map(url => new Promise(res => {
            const img = new Image();
            img.src = url;
            img.onload = res;
            img.onerror = res;
        }));
        return Promise.all(promises);
    }
}
