window.characters = [];
let loadingComplete = false;

function safeGet(key, fallback = null) {
    if (window.safeStorage) return window.safeStorage.get(key, fallback);
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
}

function safeSet(key, value) {
    if (window.safeStorage) return window.safeStorage.set(key, value);
    localStorage.setItem(key, value);
    return true;
}

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
        }, 800);
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
            window.charactersFetch = fetch('assets/characters.json').then(r => {
                if (!r.ok) throw new Error(`characters.json request failed: ${r.status}`);
                return r.json();
            });
        }

        updateLoading(30, 'DECRYPTING ARCHIVES...');
        window.characters = await window.charactersFetch;
        updateLoading(50, 'CALIBRATING SIGNAL...');

        const savedChar = safeGet('selectedCharacter', "Burnice White");
        const savedVariant = safeGet('selectedVariant', "Full");

        const savedCharData = window.getCharacterData(savedChar);
        if (savedCharData && savedCharData.baseColor) {
            document.documentElement.style.setProperty('--accent-color', savedCharData.baseColor);
            safeSet('--accent-color', savedCharData.baseColor);
            if (window.CMYKManager) {
                window.CMYKManager.updateVariables(savedCharData.baseColor);
            }
        }

        setWallpaper(savedChar, savedVariant, false, () => {
            updateLoading(100, 'SIGNAL ESTABLISHED');
        });

    } catch (e) {
        console.error("Failed to load characters.json", e);
    }
}

window.adjustColorForLightMode = function (rgbStr) {
    const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgbStr;
    let r = parseInt(match[1]);
    let g = parseInt(match[2]);
    let b = parseInt(match[3]);

    let luma = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luma > 145) {
        let factor = 145 / luma;
        r = Math.round(r * factor);
        g = Math.round(g * factor);
        b = Math.round(b * factor);
    }

    return `rgb(${r}, ${g}, ${b})`;
};

window.getCharacterData = function (name) {
    if (!window.characters || !window.characters.characters) return null;
    for (const faction in window.characters.characters) {
        const characters = window.characters.characters[faction];
        if (characters[name]) {
            let baseColor = characters[name];
            const isLight = (window.store && window.store.state.footerTheme === 'white') || safeGet('footerTheme', 'dark') === 'white';
            if (isLight) {
                baseColor = window.adjustColorForLightMode(baseColor);
            }

            return {
                name: name,
                nickname: name.split(' ')[0],
                faction: faction,
                baseColor: baseColor,
                idName: name.replace(/ /g, '_')
            };
        }
    }
    return null;
}

let lastTargetImg = null;
let isCharacterChanging = false;

window.setWallpaper = function (characterName, variant = 'Default', textOnly = false, onComplete = null, transitionType = null) {
    let charData = window.getCharacterData(characterName);
    if (!charData) {
        console.warn("Character data not found for:", characterName, "- falling back to Burnice White");
        charData = window.getCharacterData("Burnice White");
        if (!charData) return;
        characterName = "Burnice White";
    }

    const baseColor = charData.baseColor;
    const oldBgColor = document.body.style.backgroundColor || getComputedStyle(document.body).backgroundColor;
    const oldAccent = document.documentElement.style.getPropertyValue('--accent-color') || getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    const imgPath = `assets/wallpaper/Mindscape_${charData.idName}_${variant}.webp`;

    const applyColorsAndText = () => {
        const duration = (window.CharacterTransition && window.CharacterTransition.COLOR_DURATION) || 800;
        const colorObj = {
            accent: oldAccent || 'rgb(252, 91, 144)'
        };

        anime({
            targets: colorObj,
            accent: baseColor,
            duration: duration,
            easing: 'linear',
            update: () => {
                document.documentElement.style.setProperty('--accent-color', colorObj.accent);
                safeSet('--accent-color', colorObj.accent);
                if (window.CMYKManager) {
                    window.CMYKManager.updateVariables(colorObj.accent);
                }
            }
        });

        const isAmbientEnabled = localStorage.getItem('showAmbient') !== 'false';
        document.documentElement.style.setProperty('--filter-opacity', isAmbientEnabled ? '0.3' : '0');

        const factionOpacity = 0.4;
        const nicknameOpacity = 0.9;

        const factionText = document.getElementById('faction-text');
        const nicknameText = document.getElementById('nickname-text');
        updateText(factionText, charData.faction, -30, factionOpacity);
        updateText(nicknameText, charData.name, 30, nicknameOpacity);

        const calName = document.querySelector('.calendar-agent-name');
        if (calName) {
            updateText(calName, charData.name, 0, 1);
        }

        safeSet('selectedCharacter', charData.name);
        safeSet('selectedVariant', variant);
        safeSet('selectedFaction', charData.faction);
        safeSet('selectedNickname', charData.nickname);

        window.dispatchEvent(new CustomEvent('character-changed', {
            detail: {
                character: charData.name,
                faction: charData.faction,
                nickname: charData.nickname
            }
        }));
    };

    const mainImg = document.getElementById('main-image');
    const transImg = document.getElementById('transition-image');

    if (textOnly || !mainImg) {
        applyColorsAndText();
        if (onComplete) onComplete();
        return;
    }


    const tempImg = new Image();
    tempImg.src = imgPath;

    tempImg.onload = () => {
        const currentMainImg = document.getElementById('main-image');
        const outgoingImg = (currentMainImg && currentMainImg.src && currentMainImg.src.includes('webp'))
            ? currentMainImg
            : lastTargetImg;

        const hasOld = outgoingImg && outgoingImg.src && outgoingImg.src.includes('webp');

        lastTargetImg = tempImg;

        if (hasOld && window.CharacterTransition) {
            isCharacterChanging = true;
            window.CharacterTransition.run(outgoingImg, tempImg, {
                type: transitionType,
                accent: charData.baseColor || 'rgb(252, 91, 144)',
                oldAccent: oldAccent,
                onStart: () => {
                    const isAmbientEnabled = localStorage.getItem('showAmbient') !== 'false';
                    document.documentElement.style.setProperty('--filter-opacity', isAmbientEnabled ? '0.22' : '0');

                    const factionOpacity = 0.4;
                    const nicknameOpacity = 0.9;

                    const factionText = document.getElementById('faction-text');
                    const nicknameText = document.getElementById('nickname-text');
                    updateText(factionText, charData.faction, -30, factionOpacity);
                    updateText(nicknameText, charData.name, 30, nicknameOpacity);

                    const calName = document.querySelector('.calendar-agent-name');
                    if (calName) {
                        updateText(calName, charData.name, 0, 1);
                    }

                    const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || oldAccent || 'rgb(252, 91, 144)';
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
                            safeSet('--accent-color', colorObj.accent);
                            if (window.CMYKManager) {
                                window.CMYKManager.updateVariables(colorObj.accent);
                            }
                        }
                    });
                },
                onDone: () => {
                    safeSet('selectedCharacter', charData.name);
                    safeSet('selectedVariant', variant);
                    safeSet('selectedFaction', charData.faction);
                    safeSet('selectedNickname', charData.nickname);

                    window.dispatchEvent(new CustomEvent('character-changed', {
                        detail: {
                            character: charData.name,
                            faction: charData.faction,
                            nickname: charData.nickname
                        }
                    }));

                    const mainImg = document.getElementById('main-image');
                    mainImg.src = imgPath;
                    return mainImg.decode().then(() => {
                        isCharacterChanging = false;
                        mainImg.style.visibility = '';
                        mainImg.style.opacity = '1';

                        document.documentElement.style.setProperty('--accent-color', baseColor);
                        safeSet('--accent-color', baseColor);
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
            if (mainImg) {
                mainImg.src = imgPath;
                mainImg.style.opacity = '1';
                mainImg.style.visibility = '';
            }
            if (onComplete) onComplete();
        }
    };


    tempImg.onerror = () => {
        console.error("Failed to load wallpaper image:", imgPath);
        applyColorsAndText();
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
    const isNickname = el.id === 'nickname-text' || el.classList.contains('nickname');
    const isFaction = el.id === 'faction-text' || el.classList.contains('faction');
    const isPortraitAmbient = isNickname || isFaction;
    let targetContent = text;
    if (isPortrait && text.includes(' ') && isPortraitAmbient) {
        targetContent = formatPortraitNickname(text);
    }

    const currentContent = el.innerHTML;
    anime.remove(el);

    if (currentContent === targetContent) {
        fitPortraitNickname(el);
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
        el.innerHTML = targetContent;
        el.setAttribute('data-text', text);
        fitPortraitNickname(el);

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

function fitPortraitNickname(el) {
    if (!el) return;
    const isNickname = el.id === 'nickname-text' || el.classList.contains('nickname');
    const isFaction = el.id === 'faction-text' || el.classList.contains('faction');
    const isPortrait = window.innerHeight > window.innerWidth;
    // Only ambient nickname/faction text should be auto-fit.
    // Keep other elements (like .calendar-agent-name) untouched.
    if (!isNickname && !isFaction) {
        return;
    }

    if (!isPortrait) {
        el.style.removeProperty('font-size');
        return;
    }

    const computed = window.getComputedStyle(el);
    const baseFontPx = parseFloat(computed.fontSize);
    if (!Number.isFinite(baseFontPx) || baseFontPx <= 0) return;

    const maxWidthPx = isNickname
        ? Math.min(window.innerWidth * 0.68, window.innerHeight * 0.52)
        : Math.min(window.innerWidth * 0.62, window.innerHeight * 0.5);
    const minFontPx = Math.max(18, window.innerHeight * 0.03);
    let fontPx = baseFontPx;

    el.style.fontSize = `${fontPx}px`;

    // Step down font-size until both lines fit within portrait bounds.
    for (let i = 0; i < 30; i += 1) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= maxWidthPx + 1) {
            break;
        }

        fontPx -= 1;
        if (fontPx <= minFontPx) {
            fontPx = minFontPx;
            break;
        }
        el.style.fontSize = `${fontPx}px`;
    }
}

function formatPortraitNickname(text) {
    const normalized = (text || '').trim().replace(/\s+/g, ' ');
    if (!normalized.includes(' ')) {
        return escapeHtml(normalized);
    }

    const words = normalized.split(' ');
    let splitAt = 1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 1; i < words.length; i += 1) {
        const lineA = words.slice(0, i).join(' ');
        const lineB = words.slice(i).join(' ');
        const balanceScore = Math.abs(lineA.length - lineB.length);

        if (balanceScore < bestScore) {
            bestScore = balanceScore;
            splitAt = i;
        }
    }

    const firstLine = words.slice(0, splitAt).join(' ');
    const secondLine = words.slice(splitAt).join(' ');
    return `${escapeHtml(firstLine)}<br>${escapeHtml(secondLine)}`;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


document.addEventListener('DOMContentLoaded', () => {
    if (window.app) {
        window.addEventListener('app-ready', () => {
            loadCharacters();
            if (window.store) {
                window.store.subscribe((s) => {
                    const char = safeGet('selectedCharacter');
                    if (char && window.getCharacterData) {
                        const charData = window.getCharacterData(char);
                        if (charData) {
                            document.documentElement.style.setProperty('--accent-color', charData.baseColor);
                            safeSet('--accent-color', charData.baseColor);
                            if (window.CMYKManager) window.CMYKManager.updateVariables(charData.baseColor);
                        }
                    }
                });
            }
        });
    } else {
        loadCharacters();
    }
});

window.addEventListener('layout-changed', () => {
    if (window.CharacterTransition) window.CharacterTransition.cancel();
    isCharacterChanging = false;

    const _char = safeGet('selectedCharacter');
    const _variant = safeGet('selectedVariant', 'Full');
    const _charData = _char && window.getCharacterData ? window.getCharacterData(_char) : null;
    if (_charData) {
        const _img = new Image();
        _img.src = `assets/wallpaper/Mindscape_${_charData.idName}_${_variant}.webp`;
        lastTargetImg = _img;
    } else {
        lastTargetImg = null;
    }
});

function kickLayout() {
    document.body.style.paddingRight = '0.01px';
    setTimeout(() => {
        document.body.style.paddingRight = '0px';
    }, 10);

    const char = safeGet('selectedCharacter');
    const variant = safeGet('selectedVariant', "Default");
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
