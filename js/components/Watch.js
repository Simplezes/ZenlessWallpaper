import Component from './Component.js';
import store from '../store.js';

export default class Watch extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        this.useStore(store, (s) => ({
            monthNum: s.monthNum
        }));
    }

    render() {
        const { hours, minutes, seconds, monthNum } = this.state;
        const secondDegrees = (seconds / 60) * 360;
        const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
        const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

        return `
        <div class="circle-month watch-face">
            <div class="watch-hands">
                <div class="watch-notch notch-main n12"></div>
                <div class="watch-notch notch-hour n1"></div>
                <div class="watch-notch notch-hour n2"></div>
                <div class="watch-notch notch-main n3"></div>
                <div class="watch-notch notch-hour n4"></div>
                <div class="watch-notch notch-hour n5"></div>
                <div class="watch-notch notch-main n6"></div>
                <div class="watch-notch notch-hour n7"></div>
                <div class="watch-notch notch-hour n8"></div>
                <div class="watch-notch notch-main n9"></div>
                <div class="watch-notch notch-hour n10"></div>
                <div class="watch-notch notch-hour n11"></div>
                
                <div class="watch-hand watch-hour" style="transform: rotate(${hourDegrees}deg)"></div>
                <div class="watch-hand watch-minute" style="transform: rotate(${minuteDegrees}deg)"></div>
                <div class="watch-hand watch-second" style="transform: rotate(${secondDegrees}deg)"></div>
                <div class="watch-center"></div>
            </div>
            <span id="watch-month-num">${monthNum || '--'}</span>
        </div>
        `;
    }

    onMounted() {
        this.updateTime();
        this.timer = setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        this.setState({
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds()
        });
    }

    onUnmounted() {
        if (this.timer) clearInterval(this.timer);
    }
}
