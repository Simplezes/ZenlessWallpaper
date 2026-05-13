import Component from './Component.js';
import store from '../store.js';

export default class Calendar extends Component {
    constructor(props = {}) {
        super(props);

        const now = new Date();
        this._realToday = now.getDate();
        this._realMonth = now.getMonth();
        this._realYear = now.getFullYear();

        const s = store.state;
        this._state = {
            viewOffset: s.viewOffset || 0,
            month: this._offsetToDate(s.viewOffset || 0).getMonth(),
            year: this._offsetToDate(s.viewOffset || 0).getFullYear()
        };

        this._dragStartX = null;
        this._dragStartOff = 0;
        this._isDragging = false;
        this._wasDrag = false;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
    }

    _offsetToDate(offset) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + offset, 1);
    }

    setState(newState) {
        if ('viewOffset' in newState) {
            const target = this._offsetToDate(newState.viewOffset);
            newState = { ...newState, month: target.getMonth(), year: target.getFullYear() };
        }
        super.setState(newState);
    }

    render() {
        const { year, month, viewOffset } = this.state;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        const isPortrait = window.innerHeight > window.innerWidth;
        const midPoint = isPortrait ? daysInMonth : 15;

        let row1Html = '';
        let row2Html = '';

        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            const dayIdx = dateObj.getDay();
            const dayName = dayNames[dayIdx];
            const isWeekend = (dayIdx === 0 || dayIdx === 6);

            const isToday = (viewOffset === 0)
                && (i === this._realToday)
                && (month === this._realMonth)
                && (year === this._realYear);

            const dayClass = `day ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`;

            const dayHtml = `
                <div class="${dayClass}">
                    <span class="day-name">${dayName}</span>
                    <span class="day-num">${i.toString().padStart(2, '0')}</span>
                </div>
            `;

            if (i <= midPoint) {
                row1Html += dayHtml;
            } else {
                row2Html += dayHtml;
            }
        }

        if (isPortrait) {
            return `
                <div class="calendar-bar row-single d-flex justify-content-center align-items-center w-100">
                    ${row1Html}
                </div>
            `;
        }

        return `
            <div class="calendar-bar row1 d-flex justify-content-center align-items-center w-100">
                ${row1Html}
            </div>
            <div class="calendar-bar row2 d-flex justify-content-center align-items-center w-100 mt-1">
                ${row2Html}
            </div>
        `;
    }

    onMounted() {
        this.useStore(store, (s) => ({ viewOffset: s.viewOffset }));
        this.container.addEventListener('click', (e) => {
            if (this._wasDrag) return;
            if (window.innerHeight > window.innerWidth) {
                this.container.classList.toggle('show-names');
            }
        });

        this.container.addEventListener('pointerdown', this._onPointerDown);
        window.addEventListener('pointermove', this._onPointerMove);
        window.addEventListener('pointerup', this._onPointerUp);

        window.addEventListener('resize', () => this.update());

        this.scheduleMidnightUpdate();
    }

    onUnmounted() {
        if (this.timeout) clearTimeout(this.timeout);
        this.container?.removeEventListener('pointerdown', this._onPointerDown);
        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);
    }

    _onPointerDown(e) {
        this._dragStartX = e.clientX;
        this._dragStartOff = this.state.viewOffset;
        this._isDragging = false;
        this._wasDrag = false;
        this.container.setPointerCapture(e.pointerId);
        this.container.classList.add('calendar-dragging');
    }

    _onPointerMove(e) {
        if (this._dragStartX === null) return;

        const dx = e.clientX - this._dragStartX;

        if (Math.abs(dx) > 8) {
            this._isDragging = true;
            this._wasDrag = true;
        }

        if (!this._isDragging) return;

        const pxPerMonth = window.innerWidth * 0.18;
        const deltaMonths = Math.round(-dx / pxPerMonth);
        const newOffset = this._dragStartOff + deltaMonths;

        if (newOffset !== this.state.viewOffset) {
            this.setState({ viewOffset: newOffset });
            store.setViewOffset(newOffset);
        }
    }

    _onPointerUp(e) {
        if (this._dragStartX === null) return;
        this._dragStartX = null;
        this._isDragging = false;
        this.container.classList.remove('calendar-dragging');
    }

    scheduleMidnightUpdate() {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const msUntilMidnight = midnight - now;
        this.timeout = setTimeout(() => {
            const d = new Date();
            this._realToday = d.getDate();
            this._realMonth = d.getMonth();
            this._realYear = d.getFullYear();
            this.update();
            this.scheduleMidnightUpdate();
        }, msUntilMidnight);
    }
}
