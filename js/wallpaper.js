window.characters = [];

async function loadCharacters() {
    try {
        const response = await fetch('assets/characters.json');
        window.characters = await response.json();

        const savedChar = localStorage.getItem('selectedCharacter') || "Ellen Joe";
        const savedVariant = localStorage.getItem('selectedVariant') || "Full";
        setWallpaper(savedChar, savedVariant);
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
    const hsl = parseHsl(baseColor);


    const bgL = Math.min(hsl.l, 20);
    const bgS = Math.min(hsl.s, 40);

    const color1 = hslToCss(hsl.h, bgS, bgL);
    const color2 = hslToCss(hsl.h - 15, bgS + 10, bgL - 5);
    const color3 = hslToCss(hsl.h + 25, bgS + 5, bgL - 2);

    const newBg = `
        radial-gradient(circle at 70% 20%, ${hslToCss(hsl.h + 10, bgS + 15, bgL + 5)} 0%, transparent 50%),
        radial-gradient(circle at 20% 80%, ${hslToCss(hsl.h - 10, bgS + 10, bgL + 2)} 0%, transparent 50%),
        linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)
    `.replace(/\n/g, ' ');


    const imgPath = `assets/wallpaper/Mindscape_${charData.idName}_${variant}.webp`;

    if (!textOnly) {
        transBackdrop.style.background = backdrop.style.background;
        transBackdrop.style.opacity = 0.8;
        backdrop.style.background = newBg;

        if (window.refreshAmbientFx) window.refreshAmbientFx();

        anime({
            targets: transBackdrop,
            opacity: 0,
            duration: 1000,
            easing: 'easeInOutQuad'
        });


        const tempImg = new Image();
        tempImg.src = imgPath;
        tempImg.onload = () => {
            transImg.src = mainImg.src;
            transImg.style.opacity = 1;

            mainImg.src = imgPath;

            anime({
                targets: transImg,
                opacity: 0,
                translateX: -100,
                scale: 1.05,
                duration: 800,
                //easing: 'easeInCubic'
            });

            anime({
                targets: mainImg,
                opacity: [0, 1],
                translateX: [100, 0],
                scale: [0.98, 1],
                duration: 1200,
                //easing: 'easeOutExpo'
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
            if (isPortrait && text.includes(' ') && el.id === 'nickname-text') {
                el.innerHTML = text.replace(/ /g, '<br>');
            } else {
                el.textContent = text;
            }
            
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

function hslToCss(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}


document.addEventListener('DOMContentLoaded', loadCharacters);
