window.characters = [];
let loadingComplete = false;

function updateLoading(percent, status) {
    if (percent >= 100) {
        setTimeout(() => {
            if (window.app && window.app.loadingScreen) {
                const screen = document.getElementById('loading-screen');
                if (screen) screen.classList.add('fade-out');
            } else {
                const screen = document.getElementById('loading-screen');
                if (screen) screen.classList.add('fade-out');
            }
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

        const savedCharData = window.getCharacterData(savedChar);
        if (savedCharData && savedCharData.baseColor) {
            document.documentElement.style.setProperty('--accent-color', savedCharData.baseColor);
            localStorage.setItem('--accent-color', savedCharData.baseColor);
            if (window.CMYKManager) {
                window.CMYKManager.updateVariables(savedCharData.baseColor);
            }
        }

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
let isCharacterChanging = false;

window.setWallpaper = function (characterName, variant = 'Default', textOnly = false, onComplete = null, transitionType = null) {
    const charData = window.getCharacterData(characterName);
    if (!charData) {
        console.warn("Character data not found for:", characterName);
        return;
    }

    const mainImg = document.getElementById('main-image');
    const transImg = document.getElementById('transition-image');
    if (!mainImg) return;

    const baseColor = charData.baseColor;
    const oldBgColor = document.body.style.backgroundColor || getComputedStyle(document.body).backgroundColor;
    const oldAccent = document.documentElement.style.getPropertyValue('--accent-color') || getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    const imgPath = `assets/wallpaper/Mindscape_${charData.idName}_${variant}.webp`;

    const applyColorsAndText = () => {
        const duration = (window.CharacterTransition && window.CharacterTransition.COLOR_DURATION) || 800;
        const colorObj = {
            accent: oldAccent || '#FC5B90'
        };

        anime({
            targets: colorObj,
            accent: baseColor,
            duration: duration,
            easing: 'linear',
            update: () => {
                document.documentElement.style.setProperty('--accent-color', colorObj.accent);
                localStorage.setItem('--accent-color', colorObj.accent);
                if (window.CMYKManager) {
                    window.CMYKManager.updateVariables(colorObj.accent);
                }
            }
        });

        const isAmbientEnabled = localStorage.getItem('showAmbient') !== 'false';
        const factionOpacity = isAmbientEnabled ? 0.4 : 0;
        const nicknameOpacity = isAmbientEnabled ? 0.9 : 0;

        const factionText = document.getElementById('faction-text');
        const nicknameText = document.getElementById('nickname-text');
        updateText(factionText, charData.faction, -30, factionOpacity);
        updateText(nicknameText, charData.name, 30, nicknameOpacity);

        localStorage.setItem('selectedCharacter', charData.name);
        localStorage.setItem('selectedVariant', variant);
    };

    if (textOnly) {
        applyColorsAndText();
        if (onComplete) onComplete();
        return;
    }

    const tempImg = new Image();
    tempImg.src = imgPath;

    tempImg.onload = () => {
        const outgoingImg = lastTargetImg || mainImg;
        const hasOld = outgoingImg.src && outgoingImg.src.includes('webp');

        lastTargetImg = tempImg;

        if (hasOld && window.CharacterTransition) {
            if (window.anime) window.anime.remove([mainImg, transImg]);
            mainImg.style.opacity = '0';
            mainImg.style.visibility = 'hidden';
            if (transImg) {
                transImg.style.opacity = '0';
                transImg.style.visibility = 'hidden';
            }

            isCharacterChanging = true;
            window.CharacterTransition.run(outgoingImg, tempImg, {
                type: transitionType,
                accent: charData.baseColor || '#FC5B90',
                oldAccent: oldAccent,
                onStart: () => {
                    const isAmbientEnabled = localStorage.getItem('showAmbient') !== 'false';
                    const factionOpacity = isAmbientEnabled ? 0.4 : 0;
                    const nicknameOpacity = isAmbientEnabled ? 0.9 : 0;

                    const factionText = document.getElementById('faction-text');
                    const nicknameText = document.getElementById('nickname-text');
                    updateText(factionText, charData.faction, -30, factionOpacity);
                    updateText(nicknameText, charData.name, 30, nicknameOpacity);

                    const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || oldAccent || '#FC5B90';
                    const colorObj = { accent: currentAccent };
                    const colorDuration = (window.CharacterTransition && window.CharacterTransition.COLOR_DURATION) || 320;

                    if (window._uiColorAnim) window._uiColorAnim.pause();
                    window._uiColorAnim = anime({
                        targets: colorObj,
                        accent: baseColor,
                        duration: colorDuration,
                        easing: 'easeInOutQuad',
                        update: () => {
                            document.documentElement.style.setProperty('--accent-color', colorObj.accent);
                            localStorage.setItem('--accent-color', colorObj.accent);
                            if (window.CMYKManager) {
                                window.CMYKManager.updateVariables(colorObj.accent);
                            }
                        }
                    });
                },
                onDone: () => {
                    localStorage.setItem('selectedCharacter', charData.name);
                    localStorage.setItem('selectedVariant', variant);

                    mainImg.src = imgPath;
                    return mainImg.decode().then(() => {
                        isCharacterChanging = false;
                        mainImg.style.visibility = '';
                        mainImg.style.opacity = '1';

                        document.documentElement.style.setProperty('--accent-color', baseColor);
                        localStorage.setItem('--accent-color', baseColor);
                        if (window.CMYKManager) window.CMYKManager.updateVariables(baseColor);

                        if (transImg) {
                            transImg.style.visibility = 'hidden';
                            transImg.style.opacity = '0';
                        }
                        if (onComplete) onComplete();
                    }).catch(() => {
                        isCharacterChanging = false;
                        mainImg.style.visibility = '';
                        mainImg.style.opacity = '1';
                        if (onComplete) onComplete();
                    });
                }
            });
        } else {
            applyColorsAndText();
            mainImg.src = imgPath;
            mainImg.style.opacity = '1';
            mainImg.style.transform = '';
            if (onComplete) onComplete();
        }
    };

    tempImg.onerror = () => {
        console.error("Failed to load wallpaper image:", imgPath);
        if (onComplete) onComplete();
    };
};

window.triggerRandomCharacter = function () {
    if (!window.characters || !window.characters.characters) return;

    const factions = Object.keys(window.characters.characters);
    const randomFaction = factions[Math.floor(Math.random() * factions.length)];
    const charactersInFaction = Object.keys(window.characters.characters[randomFaction]);
    const randomChar = charactersInFaction[Math.floor(Math.random() * charactersInFaction.length)];

    const variants = ['Default', 'Partial', 'Full'];
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];


    window.setWallpaper(randomChar, randomVariant);
};



function updateText(el, text, offset, targetOpacity) {
    if (!el) return;
    const motionEnabled = localStorage.getItem('kineticSway') !== 'false';

    const isPortrait = window.innerHeight > window.innerWidth;
    let targetContent = text;
    if (isPortrait && text.includes(' ') && (el.id === 'nickname-text' || el.classList.contains('nickname'))) {
        targetContent = text.replace(/ /g, '<br>');
    }

    const regex = /<div class="halftone-local">.*?<\/div>/i;
    const currentContent = el.innerHTML.replace(regex, '');
    anime.remove(el);

    if (currentContent === targetContent) {
        if (window.CMYKManager) window.CMYKManager.apply(el);
        anime({
            targets: el,
            opacity: targetOpacity,
            ...(motionEnabled ? {} : { translateY: 0, scale: 1 }),
            filter: 'blur(0rem)',
            duration: 450,
            easing: 'easeOutExpo'
        });
        return;
    }

    const applyContent = () => {
        const halftone = el.querySelector('.halftone-local');
        el.innerHTML = targetContent;
        el.setAttribute('data-text', text);

        if (halftone) el.appendChild(halftone);

        if (window.CMYKManager) window.CMYKManager.apply(el);

        const enterOffset = offset * 0.65;
        if (!motionEnabled) {
            el.style.transform = `translateY(${enterOffset}px) scale(0.985)`;
        }
        el.style.filter = 'blur(0.35rem)';
        el.style.opacity = '0';

        anime.timeline({
            targets: el,
            easing: 'easeOutCubic'
        }).add({
            opacity: targetOpacity,
            ...(motionEnabled ? {} : { translateY: 0, scale: 1 }),
            filter: 'blur(0rem)',
            duration: 760
        }).add({
            ...(motionEnabled ? {} : { translateY: 0 }),
            duration: 120,
            easing: 'easeOutQuad'
        });
    };

    if (el.innerHTML === '') {
        applyContent();
    } else {
        const exitOffset = offset * -0.35;
        anime.timeline({
            targets: el,
            easing: 'easeInCubic',
            complete: applyContent
        }).add({
            opacity: 0,
            ...(motionEnabled ? {} : { translateY: exitOffset, scale: 1.02 }),
            filter: 'blur(0.3rem)',
            duration: 280
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

document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.addEventListener('app-ready', loadCharacters);
    } else {
        loadCharacters();
    }
});

function kickLayout() {
    document.body.style.paddingRight = '0.01px';
    setTimeout(() => {
        document.body.style.paddingRight = '0px';
    }, 10);

    const char = localStorage.getItem('selectedCharacter');
    const variant = localStorage.getItem('selectedVariant') || "Default";
    if (char && window.setWallpaper) {
        window.setWallpaper(char, variant, true);
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
