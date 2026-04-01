import Component from './Component.js';

export default class Calendar extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            today: new Date().getDate(),
            month: new Date().getMonth(),
            year: new Date().getFullYear()
        };
    }

    render() {
        const { year, month, today } = this.state;
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
            
            const dayClass = `day d-flex flex-column align-items-center ${isWeekend ? 'weekend' : ''} ${i === today ? 'today' : ''}`;
            const nameClass = `day-name ${isWeekend ? 'pink' : ''}`;
            const numClass = `day-num ${isWeekend ? 'pink' : ''}`;

            const dayHtml = `
                <div class="${dayClass}">
                    <span class="${nameClass}">${dayName}</span>
                    <span class="${numClass}">${i.toString().padStart(2, '0')}</span>
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
        this.container.addEventListener('click', (e) => {
            if (window.innerHeight > window.innerWidth) {
                this.container.classList.toggle('show-names');
            }
        });
        
        window.addEventListener('resize', () => this.update());

        this.scheduleMidnightUpdate();
    }

    onUnmounted() {
        if (this.timeout) clearTimeout(this.timeout);
    }

    scheduleMidnightUpdate() {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const msUntilMidnight = midnight - now;
        this.timeout = setTimeout(() => {
            this.setState({
                today: new Date().getDate(),
                month: new Date().getMonth(),
                year: new Date().getFullYear()
            });
            this.scheduleMidnightUpdate();
        }, msUntilMidnight);
    }
}
