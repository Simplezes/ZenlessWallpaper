export default class Component {
    constructor(props = {}) {
        this.props = props;
        this._state = {};
        this.container = null;
        this.mounted = false;
    }

    setState(newState) {
        const prev = this._state || {};
        const changed = Object.keys(newState).some(key => prev[key] !== newState[key]);

        if (changed) {
            this._state = { ...prev, ...newState };
            if (this.mounted) {
                this.update();
            }
        }
    }

    get state() {
        return this._state || {};
    }

    set state(value) {
        this._state = value;
    }

    mount(target) {
        if (this.mounted) {
            this.unmount();
        }

        this.container = typeof target === 'string' ? document.querySelector(target) : target;
        if (this.container) {
            this.container.innerHTML = this.render();
            this.mounted = true;
            this.onMounted();
        } else {
            console.warn(`Component target not found: ${target}`);
        }
    }

    unmount() {
        this.onUnmounted();
        this.mounted = false;
        if (this._unsubscribes) {
            this._unsubscribes.forEach(unsub => unsub());
            this._unsubscribes = [];
        }
    }

    update() {
        if (!this.container) return;

        const newHTML = this.render();
        if (this.container.innerHTML !== newHTML) {
            this.container.innerHTML = newHTML;
            this.onUpdated();
        }
    }

    render() {
        return `<div>Base Component</div>`;
    }

    useStore(store, selector = (s) => s) {
        if (!store || typeof store.subscribe !== 'function') return;

        let prevState = selector(store.state);
        this.setState(prevState);

        const unsubscribe = store.subscribe((newState) => {
            const selectedState = selector(newState);

            const changed = Object.keys(selectedState).some(key => prevState[key] !== selectedState[key]);
            if (changed) {
                prevState = selectedState;
                this.setState(selectedState);
            }
        });

        if (!this._unsubscribes) this._unsubscribes = [];
        this._unsubscribes.push(unsubscribe);
    }

    onMounted() { }
    onUpdated() { }
    onUnmounted() {
        if (this._unsubscribes) {
            this._unsubscribes.forEach(unsub => unsub());
        }
    }
}
