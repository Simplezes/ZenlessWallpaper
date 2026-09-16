import Component from './Component.js';

const RARITY_LETTER = { 4: 'S', 3: 'A' };
function tabs() {
    const t = (k) => (window.i18n ? window.i18n.t(k) : k);
    return [
        { id: 'profile', label: t('tabProfile') },
        { id: 'combat', label: t('tabCombat') },
        { id: 'wengine', label: t('tabWEngine') }
    ];
}

let dossierFetch = null;
function loadDossierData() {
    if (!dossierFetch) {
        dossierFetch = fetch('assets/agent_dossier.json')
            .then(r => r.ok ? r.json() : {})
            .catch(() => ({}));
    }
    return dossierFetch;
}

export default class AgentDossier extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            isOpen: false,
            expanded: false,
            activeTab: 'profile',
            currentAgent: (window.store && window.store.state.currentAgent) || 'Burnice White'
        };
        this.dossierData = null;

        this._onOpen = () => {
            this.setState({ isOpen: true });
            if (!this.dossierData) {
                loadDossierData().then(data => {
                    this.dossierData = data;
                    this.update();
                });
            }
        };
        this._onClose = () => this.setState({ isOpen: false, expanded: false, activeTab: 'profile' });
        this._onToggleExpand = () => this.setState({ expanded: !this.state.expanded });
        this._onWindowClick = (e) => {
            if (e.target.closest('.dossier-trigger')) {
                e.preventDefault();
                e.stopPropagation();
                this._onOpen();
                return;
            }
            const tab = e.target.closest('.dossier-tab');
            if (tab) {
                this.setState({ activeTab: tab.dataset.tab });
                return;
            }
            if (e.target.closest('#dossier-expand-toggle')) {
                this._onToggleExpand();
                return;
            }
            if (this.state.isOpen && !e.target.closest('.dossier-card') && !e.target.closest('.dossier-expanded')) {
                this._onClose();
            }
        };
        this._onKeyDown = (e) => {
            if (e.key === 'Escape') this._onClose();
        };
        this._onCharacterChanged = () => this.update();
        this._onLanguageChanged = () => this.update();

        if (window.store) {
            this.useStore(window.store, (s) => ({ currentAgent: s.currentAgent }));
        }
    }

    render() {
        const t = (k) => (window.i18n ? window.i18n.t(k) : k);
        const data = window.getCharacterData ? window.getCharacterData(this.state.currentAgent) : null;
        const raw = data && window.characters ? findRawEntry(data.name) : null;
        const enDossier = this.dossierData ? this.dossierData[data ? data.name : ''] : null;
        const i18nDossier = (window.i18n && data) ? window.i18n.dossier(data.name) : null;
        const dossier = mergeDossier(enDossier, i18nDossier);

        const avatarFile = `assets/avatars/Avatar_${data ? data.idName : 'Burnice_White'}.webp`;
        const faction = data ? (window.i18n ? window.i18n.faction(data.faction) : data.faction) : '';
        const nickname = data ? (window.i18n ? window.i18n.charNickname(data.name, data.nickname) : data.nickname) : '';
        const quote = (dossier && dossier.quote) || (raw && raw.quote) || '';
        const tags = raw ? [raw.attribute, raw.specialty, raw.damageType].filter(Boolean) : [];
        const rankLetter = raw ? RARITY_LETTER[raw.rarity] : null;
        const accent = data ? data.baseColor : 'rgb(252, 91, 144)';

        return `
        <div class="dossier-overlay ${this.state.isOpen ? 'active' : ''}"></div>
        <div class="dossier-wrap ${this.state.isOpen ? 'active' : ''}">
            <div class="dossier-card" style="--accent:${accent};">
                <div class="dossier-wave"></div>
                ${rankLetter ? `<div class="dossier-rank">${rankLetter}</div>` : ''}
                <div class="dossier-head">
                    <span class="dossier-eyebrow">${escapeHtml(t('agentFile'))}</span>
                    <div class="dossier-name-wrap"><h1 class="dossier-faction">${escapeHtml(faction)}</h1></div>
                </div>
                <div class="dossier-circle-wrap">
                    <div class="dossier-circle">
                        <img src="${avatarFile}" alt="${escapeHtml(nickname)}">
                    </div>
                    <div class="dossier-nametag">${escapeHtml(nickname.toUpperCase())}</div>
                </div>
                <div class="dossier-plates">
                    ${tags.map((tag, i) => `<div class="plate${i % 2 ? ' alt' : ''}">${escapeHtml(tag.toUpperCase())}</div>`).join('')}
                </div>
                <button class="dossier-expand-toggle" id="dossier-expand-toggle">
                    <span>${escapeHtml(this.state.expanded ? t('hideFullDossier') : t('viewFullDossier'))}</span>
                    <span class="dossier-chev ${this.state.expanded ? 'up' : ''}"></span>
                </button>
            </div>
            ${this.state.expanded ? this.renderExpanded(dossier, accent, quote) : ''}
        </div>
        `;
    }

    renderExpanded(dossier, accent, quote) {
        const t = (k) => (window.i18n ? window.i18n.t(k) : k);
        return `
        <div class="dossier-expanded" style="--accent-live:${accent};">
            <div class="dossier-tabs">
                ${tabs().map(tab => `<button class="dossier-tab ${this.state.activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">${escapeHtml(tab.label)}</button>`).join('')}
            </div>
            <div class="dossier-scroll-wrap">
                <div class="dossier-scroll" id="dossier-scroll">
                    ${quote ? `<p class="dossier-quote">&ldquo;${escapeHtml(quote)}&rdquo;</p>` : ''}
                    ${!dossier ? `<p class="dossier-empty">${escapeHtml(t('loadingDossier'))}</p>` : ''}
                    ${dossier && this.state.activeTab === 'profile' ? this.renderProfile(dossier.bio) : ''}
                    ${dossier && this.state.activeTab === 'combat' ? this.renderCombat(dossier.skills) : ''}
                    ${dossier && this.state.activeTab === 'wengine' ? this.renderWEngine(dossier.wEngine) : ''}
                </div>
                <div class="dossier-scroll-track" id="dossier-scroll-track">
                    <div class="dossier-scroll-thumb" id="dossier-scroll-thumb"></div>
                </div>
            </div>
        </div>
        `;
    }

    renderProfile(bio) {
        const t = (k) => (window.i18n ? window.i18n.t(k) : k);
        if (!bio) return `<p class="dossier-empty">${escapeHtml(t('noProfileData'))}</p>`;
        const rows = [
            [t('realName'), bio.realName],
            [t('gender'), bio.gender],
            [t('height'), bio.height],
            [t('birthday'), bio.birthday],
            [t('species'), bio.species],
            [t('relatives'), bio.relatives]
        ].filter(([, v]) => v);

        return `
        <dl class="dossier-facts">
            ${rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('')}
        </dl>
        `;
    }

    renderCombat(skills) {
        const t = (k) => (window.i18n ? window.i18n.t(k) : k);
        if (!skills || !skills.length) return `<p class="dossier-empty">${escapeHtml(t('noCombatData'))}</p>`;
        return `
        <div class="dossier-skills">
            ${skills.map(s => `
                <div class="dossier-skill">
                    <span class="dossier-skill-type">${escapeHtml(s.type)}</span>
                    <span class="dossier-skill-name">${escapeHtml(s.name || '')}</span>
                    <p>${escapeHtml(s.description || '')}</p>
                </div>
            `).join('')}
        </div>
        `;
    }

    renderWEngine(we) {
        const t = (k) => (window.i18n ? window.i18n.t(k) : k);
        if (!we) return `<p class="dossier-empty">${escapeHtml(t('noWEngineData'))}</p>`;
        const tags = [we.specialty, we.attribute].filter(Boolean);
        return `
        <div class="dossier-wengine-head">
            ${we.icon ? `<img class="dossier-wengine-icon" src="assets/wengines/${we.icon}" alt="">` : ''}
            <div class="dossier-wengine-title">
                <h3>${escapeHtml(we.name || '')}</h3>
                ${we.rarity ? `<span class="dossier-rank small">${escapeHtml(we.rarity)}</span>` : ''}
            </div>
        </div>
        <div class="dossier-plates">
            ${tags.map((tag, i) => `<div class="plate${i % 2 ? ' alt' : ''}">${escapeHtml(tag.toUpperCase())}</div>`).join('')}
        </div>
        <dl class="dossier-facts">
            ${we.baseStat ? `<dt>${escapeHtml(t('baseStat'))}</dt><dd>${escapeHtml(we.baseStat)}</dd>` : ''}
            ${we.advancedStat ? `<dt>${escapeHtml(t('advancedStat'))}</dt><dd>${escapeHtml(we.advancedStat)}</dd>` : ''}
        </dl>
        ${we.passiveName ? `
        <div class="dossier-skill">
            <span class="dossier-skill-name">${escapeHtml(we.passiveName)}</span>
            <p>${escapeHtml(we.passiveEffect || '')}</p>
        </div>` : ''}
        `;
    }

    onMounted() {
        this.attachListeners();
        window.addEventListener('click', this._onWindowClick);
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('character-changed', this._onCharacterChanged);
        window.addEventListener('language-changed', this._onLanguageChanged);
    }

    onUpdated() {
        this.attachListeners();
    }

    attachListeners() {
        this.initDragScroll();
    }

    initDragScroll() {
        const panel = this.container.querySelector('#dossier-scroll');
        const thumb = this.container.querySelector('#dossier-scroll-thumb');
        const track = this.container.querySelector('#dossier-scroll-track');
        if (this._scrollCleanup) this._scrollCleanup();
        if (!panel || !thumb || !track) return;

        const updateThumb = () => {
            const ratio = panel.clientHeight / panel.scrollHeight;
            if (ratio >= 1) {
                track.style.display = 'none';
                return;
            }
            track.style.display = 'block';
            const thumbHeightPct = Math.max(12, ratio * 100);
            const maxScroll = panel.scrollHeight - panel.clientHeight;
            const scrollPct = maxScroll > 0 ? panel.scrollTop / maxScroll : 0;
            thumb.style.height = thumbHeightPct + '%';
            thumb.style.top = scrollPct * (100 - thumbHeightPct) + '%';
        };

        let isDown = false, startY = 0, scrollStart = 0;
        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            isDown = true;
            panel.classList.add('grabbing');
            startY = e.clientY;
            scrollStart = panel.scrollTop;
        };
        const onMouseMove = (e) => {
            if (!isDown) return;
            panel.scrollTop = scrollStart - (e.clientY - startY) * 1.6;
        };
        const onMouseUp = () => {
            isDown = false;
            panel.classList.remove('grabbing');
        };

        panel.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        panel.addEventListener('scroll', updateThumb);
        window.addEventListener('resize', updateThumb);

        this._scrollCleanup = () => {
            panel.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            panel.removeEventListener('scroll', updateThumb);
            window.removeEventListener('resize', updateThumb);
        };

        updateThumb();
    }

    onUnmounted() {
        window.removeEventListener('click', this._onWindowClick);
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('character-changed', this._onCharacterChanged);
        window.removeEventListener('language-changed', this._onLanguageChanged);
        if (this._scrollCleanup) this._scrollCleanup();
    }
}

function mergeDossier(en, translated) {
    if (!en) return null;
    if (!translated) return en;
    return {
        quote: translated.quote || en.quote,
        bio: en.bio ? { ...en.bio, ...(translated.bio || {}) } : en.bio,
        skills: Array.isArray(en.skills)
            ? en.skills.map((s, i) => ({ ...s, ...((translated.skills && translated.skills[i]) || {}) }))
            : en.skills,
        wEngine: en.wEngine ? { ...en.wEngine, ...(translated.wEngine || {}) } : en.wEngine
    };
}

function findRawEntry(name) {
    for (const faction in window.characters.characters) {
        const members = window.characters.characters[faction];
        if (members[name]) return members[name];
    }
    return null;
}

function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
