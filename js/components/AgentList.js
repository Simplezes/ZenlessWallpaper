import Component from './Component.js';

export default class AgentList extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            currentAgent: props.currentAgent || "Burnice White",
            selectedAvatarName: props.currentAgent || "Burnice White",
            isOpen: props.isOpen || false
        };
        
        this.savedScrollTop = 0;
    }

    render() {
        return `
        <div class="agent-list-radial ${this.state.isOpen ? 'active' : ''}" id="agent-list">
            <div class="agent-header">
                <h1 class="header-title">Edit Avatar</h1>
                <div class="header-close-btn" id="agent-list-close"></div>
            </div>

            <div class="agent-main-container">
                <div class="z-scrollbar" id="agent-scrollbar">
                    <div class="z-scrollbar__wrap agent-inner-panel">
                        <div class="z-scrollbar__view">
                            <div class="agent-avatar-grid" id="agent-grid">
                                ${this.renderAgentGrid()}
                            </div>
                        </div>
                    </div>
                    <div class="z-scrollbar__bar z-scrollbar__vertical">
                        <div class="z-icon up">
                            <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" fill="currentColor"/></svg>
                        </div>
                        <div class="z-scrollbar__thumb">
                            <div class="z-scrollbar__track"></div>
                        </div>
                        <div class="z-icon down">
                            <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>
                        </div>
                    </div>
                </div>

                <div class="agent-use-btn-wrapper">
                    <button class="agent-use-btn" id="agent-use-btn">
                        <span class="btn-close-icon">✕</span>
                        <span class="use-text">Use</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    renderAgentGrid() {
        if (!window.characters || !window.characters.characters) return '';
        let html = '';
        const factions = window.characters.characters;
        for (const faction in factions) {
            for (const name in factions[faction]) {
                const fileName = `Avatar_${name.replace(/\s+/g, '_')}.webp`;
                const isActive = name === this.state.currentAgent;
                const isSelected = name === this.state.selectedAvatarName;
                html += `
                    <div class="agent-avatar-item ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}" data-name="${name}">
                        <img src="assets/avatars/${fileName}" class="avatar-img" alt="${name}" loading="lazy">
                    </div>
                `;
            }
        }
        return html;
    }

    onMounted() {
        this.attachListeners();
        this.initZScrollbar();
        this.initDragScroll();
    }

    onUpdated() {
        this.attachListeners();
        this.initZScrollbar();
        this.initDragScroll();

        const panel = this.container.querySelector('.agent-inner-panel');
        if (panel && this.savedScrollTop) {
            panel.scrollTop = this.savedScrollTop;
            const el = this.container.querySelector('#agent-scrollbar');
            if (el && el.__updateScroll) el.__updateScroll();
        }
    }

    attachListeners() {
        const closeBtn = this.container.querySelector('#agent-list-close');
        if (closeBtn) closeBtn.onclick = () => this.props.onClose();

        const useBtn = this.container.querySelector('#agent-use-btn');
        if (useBtn) useBtn.onclick = () => this.confirmAgent();

        const grid = this.container.querySelector('#agent-grid');
        if (grid) {
            grid.onclick = (e) => {
                const item = e.target.closest('.agent-avatar-item');
                if (!item) return;
                const name = item.getAttribute('data-name');
                if (name === this._state.selectedAvatarName) return;

                const prev = grid.querySelector('.agent-avatar-item.selected');
                if (prev) prev.classList.remove('selected');
                item.classList.add('selected');

                this._state.selectedAvatarName = name;
            };
        }
    }

    confirmAgent() {
        if (this.props.onSelect) {
            this.props.onSelect(this.state.selectedAvatarName);
        }
    }

    initZScrollbar() {
        const el = this.container.querySelector('#agent-scrollbar');
        if (!el) return;
        const wrap = el.querySelector('.z-scrollbar__wrap');
        const track = el.querySelector('.z-scrollbar__track');
        track.style.display = 'block';

        const update = () => {
            const containerHeight = wrap.clientHeight;
            const scrollHeight = wrap.scrollHeight;
            const heightPercentage = Math.max(10, (containerHeight / scrollHeight) * 100);
            track.style.height = heightPercentage + '%';
            const scrollPercentage = (wrap.scrollTop / (scrollHeight - containerHeight)) * (100 - heightPercentage);
            track.style.top = scrollPercentage + '%';
            
            this.savedScrollTop = wrap.scrollTop;
        };

        el.__updateScroll = update;
        wrap.addEventListener('scroll', update);
        setTimeout(update, 100);
    }

    initDragScroll() {
        const panel = this.container.querySelector('.agent-inner-panel');
        if (!panel) return;

        if (this._mouseUpHandler) {
            window.removeEventListener('mouseup', this._mouseUpHandler);
        }

        let isDown = false, startY, scrollStart;

        panel.onmousedown = (e) => {
            if (e.button !== 0) return;
            isDown = true;
            panel.classList.add('grabbing');
            startY = e.pageY - panel.offsetTop;
            scrollStart = panel.scrollTop;
        };

        this._mouseUpHandler = () => {
            isDown = false;
            panel.classList.remove('grabbing');
        };
        window.addEventListener('mouseup', this._mouseUpHandler);

        panel.onmousemove = (e) => {
            if (!isDown) return;
            panel.scrollTop = scrollStart - (e.pageY - panel.offsetTop - startY) * 2;
        };
    }

    onUnmounted() {
        if (this._mouseUpHandler) {
            window.removeEventListener('mouseup', this._mouseUpHandler);
            this._mouseUpHandler = null;
        }
    }
}
