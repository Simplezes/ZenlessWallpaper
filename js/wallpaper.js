window.characters = [];
let loadingComplete = false;
let loaderTips = null;

async function initLoader() {
    try {
        const response = await fetch('assets/loading/tips.json');
        loaderTips = await response.json();

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

        const tipText = document.getElementById('loader-tip-text');
        const wallpaperEl = document.getElementById('loader-wallpaper');
        const iconEl = document.getElementById('loader-mode-icon');
        const loaderNoEl = document.querySelector('.loader-no');
        const metaNameEl = document.querySelector('.loader-mode-name');

        if (tipText) tipText.innerText = randomTip;
        if (wallpaperEl) wallpaperEl.src = wallpaperImg;

        const iconName = randomCat.split('_')[0];
        if (iconEl) iconEl.src = `assets/imgs/svg/icon_${iconName}.svg`;

        if (loaderNoEl) {
            loaderNoEl.innerText = `No.${randomTipKey}`;
        }

        if (metaNameEl) {
            metaNameEl.innerText = categoryData.title.toUpperCase();
        }

        const bangbooEl = document.querySelector('.loader-bangboo-indicator');
        const promises = [];

        if (wallpaperEl) promises.push(new Promise(res => { if (wallpaperEl.complete) res(); else wallpaperEl.onload = res; wallpaperEl.onerror = res; }));
        if (iconEl) promises.push(new Promise(res => { if (iconEl.complete) res(); else iconEl.onload = res; iconEl.onerror = res; }));
        if (bangbooEl) promises.push(new Promise(res => { if (bangbooEl.complete) res(); else bangbooEl.onload = res; bangbooEl.onerror = res; }));

        await Promise.all(promises);
        const layout = document.querySelector('.loader-layout');
        if (layout) layout.classList.add('ready');

    } catch (e) {
        console.error("Failed to init loader tips", e);
        const layout = document.querySelector('.loader-layout');
        if (layout) layout.classList.add('ready');
    }
}

initLoader();

function updateLoading(percent, status) {
    if (percent >= 100) {
        setTimeout(() => {
            const screen = document.getElementById('loading-screen');
            if (screen) screen.classList.add('fade-out');
            loadingComplete = true;
            if (window.loaderInterval) clearInterval(window.loaderInterval);
        }, 2500);
    }

}



let cachedRootFS = null;
function getRootFS() {
    if (cachedRootFS) return cachedRootFS;
    cachedRootFS = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return cachedRootFS;
}

window.addEventListener('resize', () => {
    cachedRootFS = null;
});

window.pxToRem = function (px) {
    return px / getRootFS();
};
window.rem = function (px) {
    return (px / 10) + 'rem';
};
window.pxToCurrentRem = function (px) {
    return (px / getRootFS()) + 'rem';
};

async function loadCharacters() {
    try {
        if (!window.charactersFetch) {
            window.charactersFetch = fetch('assets/characters.json').then(r => r.json());
        }

        updateLoading(30, 'DECRYPTING ARCHIVES...');
        window.characters = await window.charactersFetch;
        updateLoading(50, 'CALIBRATING SIGNAL...');

        const savedChar = localStorage.getItem('selectedCharacter') || "Burnice White";
        const savedVariant = localStorage.getItem('selectedVariant') || "Full";

        setWallpaper(savedChar, savedVariant, false, () => {
            updateLoading(100, 'SIGNAL ESTABLISHED');
        });

        window.cmykApply('.viewport-bg, .bg-layer, .footer, .ambient-text, .calendar-title, .header-glyphs, .zzz-dashed-svg, .pill-month, #header-year');

    } catch (e) {
        console.error("Failed to load characters.json", e);
    }
}

window.getCharacterData = function (name) {
    if (!window.characters || !window.characters.characters) return null;
    for (const faction in window.characters.characters) {
        const characters = window.characters.characters[faction];
        if (characters[name]) {
            return {
                name: name,
                nickname: name.split(' ')[0],
                faction: faction,
                baseColor: characters[name],
                idName: name.replace(/ /g, '_')
            };
        }
    }
    return null;
}

let lastTargetImg = null;

window.setWallpaper = function (characterName, variant = 'Default', textOnly = false, onComplete = null) {
    const charData = window.getCharacterData(characterName);
    if (!charData) {
        console.warn("Character data not found for:", characterName);
        return;
    }

    const backdrop = document.getElementById('backdrop');
    const mainImg = document.getElementById('main-image');
    const transImg = document.getElementById('transition-image');
    const factionText = document.getElementById('faction-text');
    const nicknameText = document.getElementById('nickname-text');

    if (!backdrop || !mainImg) return;

    const baseColor = charData.baseColor;
    const oldBgColor = document.body.style.backgroundColor || getComputedStyle(document.body).backgroundColor;
    const oldAccent = document.documentElement.style.getPropertyValue('--accent-color') || getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

    const imgPath = `assets/wallpaper/Mindscape_${charData.idName}_${variant}.webp`;

    const applyColorsAndText = () => {
        window.CMYKManager.updateVariables(baseColor);
        document.documentElement.style.setProperty('--accent-color', baseColor);

        const textGlow = `0 0 ${window.rem(30)} ${baseColor}66`;
        const isAmbientEnabled = localStorage.getItem('showAmbient') !== 'false';
        const factionOpacity = isAmbientEnabled ? 0.4 : 0;
        const nicknameOpacity = isAmbientEnabled ? 0.9 : 0;

        updateText(factionText, charData.faction, baseColor, -30, factionOpacity, textGlow);
        updateText(nicknameText, charData.name, baseColor, 30, nicknameOpacity, textGlow);
        localStorage.setItem('selectedCharacter', charData.name);
        localStorage.setItem('selectedVariant', variant);
    };

    if (!textOnly) {
        const tempImg = new Image();
        tempImg.src = imgPath;
        tempImg.onload = () => {
            const outgoingImg = lastTargetImg || mainImg;
            const hasOld = outgoingImg.src && outgoingImg.src.indexOf('webp') !== -1;

            if (hasOld) {
                const previousLastTarget = lastTargetImg;
                lastTargetImg = tempImg;

                mainImg.src = imgPath;
                mainImg.style.opacity = '0';

                window.MangaWipe.run(outgoingImg, tempImg, {
                    accent: charData.baseColor || '#FC5B90',
                    oldBgColor: oldBgColor,
                    oldAccent: oldAccent,
                    onStart: applyColorsAndText,
                    onDone: () => {
                        mainImg.src = imgPath;
                        return mainImg.decode().then(() => {
                            mainImg.style.opacity = '1';
                            mainImg.style.transform = '';
                            if (transImg) transImg.style.opacity = '0';
                            if (onComplete) onComplete();
                        }).catch(() => {
                            mainImg.style.opacity = '1';
                            mainImg.style.transform = '';
                            if (transImg) transImg.style.opacity = '0';
                            if (onComplete) onComplete();
                        });
                    }
                });
            } else {
                lastTargetImg = tempImg;
                applyColorsAndText();
                mainImg.src = imgPath;
                mainImg.style.opacity = '1';
                mainImg.style.transform = '';
                if (transImg) transImg.style.opacity = '0';
                if (onComplete) onComplete();
            }
        };
        tempImg.onerror = () => {
            if (onComplete) onComplete();
        };
    } else {
        applyColorsAndText();
        if (onComplete) onComplete();
    }
};


function updateText(el, text, color, offset, targetOpacity, glow) {
    if (!el) return;

    const isEmpty = el.innerHTML.trim() === '';

    const applyContent = () => {
        const isPortrait = window.innerHeight > window.innerWidth;
        let content = text;
        if (isPortrait && text.includes(' ') && (el.id === 'nickname-text' || el.classList.contains('nickname'))) {
            content = text.replace(/ /g, '<br>');
        }

        const halftone = el.querySelector('.halftone-local');
        el.innerHTML = content;
        if (halftone) el.appendChild(halftone);

        window.CMYKManager.apply(el);

        el.style.color = color;
        el.style.textShadow = glow;

        anime({
            targets: el,
            opacity: targetOpacity,
            translateX: [window.rem(offset * -1), 0],
            duration: 800,
            easing: 'easeOutExpo'
        });
    };

    if (isEmpty) {
        applyContent();
    } else {
        anime({
            targets: el,
            opacity: 0,
            translateX: window.rem(offset),
            duration: 400,
            easing: 'easeInCubic',
            complete: applyContent
        });
    }
}

function parseHsl(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

document.addEventListener('DOMContentLoaded', loadCharacters);

function kickLayout() {
    document.body.style.paddingRight = '0.01px';
    setTimeout(() => {
        document.body.style.paddingRight = '0px';
    }, 10);

    if (window.characters && window.characters.characters) {
        const char = localStorage.getItem('selectedCharacter');
        const variant = localStorage.getItem('selectedVariant') || "Default";
        if (char) {
            const mainImg = document.getElementById('main-image');
            if (mainImg) {
                mainImg.style.opacity = '1';
            }
        }
    }
}

window.addEventListener('focus', kickLayout);
window.addEventListener('resize', kickLayout);

if (window.wallpaperPropertyListener) {
    const originalSetPaused = window.wallpaperPropertyListener.setPaused;
    window.wallpaperPropertyListener.setPaused = function (paused) {
        if (originalSetPaused) originalSetPaused(paused);
        if (!paused) {
            kickLayout();
        }
    };
}
