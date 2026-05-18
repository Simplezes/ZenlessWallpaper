import Component from './Component.js';
import store from '../store.js';

export default class Watch extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            hours: 0,
            minutes: 0,
            seconds: 0,
            monthNum: store.state.monthNum || '--'
        };
    }

    render() {
        const { monthNum } = this.state;

        return `
        <div class="circle-month watch-face">
            <div id="watch-month-num">${monthNum || '--'}</div>
        </div>
        `;
    }

    onMounted() {
        this.useStore(store, (s) => ({ monthNum: s.monthNum }));
        this.updateTime();
        this.timer = setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        this.setState({
            hours,
            minutes,
            seconds: now.getSeconds()
        });
    }

    onUnmounted() {
        if (this.timer) clearInterval(this.timer);
    }
}
