window.characters = [];

async function loadCharacters() {
    try {
        const response = await fetch('assets/characters.json');
        window.characters = await response.json();

        const savedChar = localStorage.getItem('selectedCharacter') || "Ellen Joe";
        const savedVariant = localStorage.getItem('selectedVariant') || "Full";
        setWallpaper(savedChar, savedVariant);

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

window.setWallpaper = function (characterName, variant = 'Default', textOnly = false) {
    const charData = window.getCharacterData(characterName);
    if (!charData) {
        console.warn("Character data not found for:", characterName);
        return;
    }

    const backdrop = document.getElementById('backdrop');
    const transBackdrop = document.getElementById('transition-backdrop');
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

        const textGlow = `0 0 30px ${baseColor}66`;
        const isAmbientEnabled = localStorage.getItem('showAmbient') !== 'false';
        const factionOpacity = isAmbientEnabled ? 0.4 : 0;
        const nicknameOpacity = isAmbientEnabled ? 0.9 : 0;

        updateText(factionText, charData.faction, baseColor, -30, factionOpacity, textGlow);
        updateText(nicknameText, charData.name, baseColor, 30, nicknameOpacity, textGlow);
        localStorage.setItem('selectedCharacter', charData.name);
    };

    if (!textOnly) {
        const tempImg = new Image();
        tempImg.src = imgPath;
        tempImg.onload = () => {
            const hasOld = mainImg.src && mainImg.src.indexOf('webp') !== -1;

            if (hasOld) {
                window.MangaWipe.run(mainImg, tempImg, {
                    accent: charData.baseColor || '#FC5B90',
                    oldBgColor: oldBgColor,
                    oldAccent: oldAccent,
                    duration: 900,
                    onStart: applyColorsAndText,
                    onDone: () => {
                        mainImg.src = imgPath;
                        mainImg.style.opacity = '1';
                        mainImg.style.transform = 'none';
                        transImg.style.opacity = '0';
                    }
                });
            } else {
                applyColorsAndText();
                mainImg.src = imgPath;
                mainImg.style.opacity = '1';
                mainImg.style.transform = 'none';
                transImg.style.opacity = '0';
            }
        };
    } else {
        applyColorsAndText();
    }
};


function updateText(el, text, color, offset, targetOpacity, glow) {
    if (!el) return;

    anime({
        targets: el,
        opacity: 0,
        translateX: offset,
        duration: 400,
        easing: 'easeInCubic',
        complete: () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            let content = text;
            if (isPortrait && text.includes(' ') && el.id === 'nickname-text') {
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
                translateX: [offset * -1, 0],
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    });
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
