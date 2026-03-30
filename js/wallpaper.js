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
    window.CMYKManager.updateVariables(baseColor);

    const imgPath = `assets/wallpaper/Mindscape_${charData.idName}_${variant}.webp`;

    if (!textOnly) {

        const tempImg = new Image();
        tempImg.src = imgPath;
        tempImg.onload = () => {
            if (mainImg.src && mainImg.src.indexOf('webp') !== -1) {
                transImg.src = mainImg.src;
                transImg.style.opacity = 1;
                transImg.style.translateX = '0px';
                transImg.style.scale = '1';

                anime({
                    targets: transImg,
                    opacity: 0,
                    translateX: -100,
                    scale: 1.05,
                    duration: 800,
                    easing: 'easeInCubic'
                });
            } else {
                transImg.style.opacity = 0;
            }

            mainImg.src = imgPath;

            anime({
                targets: mainImg,
                opacity: [0, 1],
                translateX: [100, 0],
                scale: [0.98, 1],
                duration: 1200,
            });
        };
    }

    const textGlow = `0 0 30px ${charData.baseColor}66`;
    const isAmbientEnabled = localStorage.getItem('showAmbient') !== 'false';
    const factionOpacity = isAmbientEnabled ? 0.4 : 0;
    const nicknameOpacity = isAmbientEnabled ? 0.9 : 0;

    updateText(factionText, charData.faction, charData.baseColor, -30, factionOpacity, textGlow);
    updateText(nicknameText, charData.name, charData.baseColor, 30, nicknameOpacity, textGlow);

    document.documentElement.style.setProperty('--accent-color', charData.baseColor);
    localStorage.setItem('selectedCharacter', charData.name);
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

// Fix for CEF rendering issue: Kick the layout when focused or resized
function kickLayout() {
    // A tiny change to trigger a redraw
    document.body.style.paddingRight = '0.01px';
    setTimeout(() => {
        document.body.style.paddingRight = '0px';
    }, 10);

    // Refresh current wallpaper if needed
    if (window.characters && window.characters.characters) {
        const char = localStorage.getItem('selectedCharacter');
        const variant = localStorage.getItem('selectedVariant') || "Default";
        if (char) {
            // Re-apply current state without full re-load if preferred, 
            // but for now just kick opacity
            const mainImg = document.getElementById('main-image');
            if (mainImg) {
                mainImg.style.opacity = '1';
            }
        }
    }
}

window.addEventListener('focus', kickLayout);
window.addEventListener('resize', kickLayout);

// Wallpaper Engine specific: check for visibility
if (window.wallpaperPropertyListener) {
    const originalSetPaused = window.wallpaperPropertyListener.setPaused;
    window.wallpaperPropertyListener.setPaused = function (paused) {
        if (originalSetPaused) originalSetPaused(paused);
        if (!paused) {
            kickLayout();
        }
    };
}
