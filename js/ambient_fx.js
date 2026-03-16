class AmbientFX {
    constructor() {
        this.container = document.querySelector('.bg-decorations');
        const getStored = (key, fallback) => {
            const val = localStorage.getItem(key);
            return (val !== null) ? parseInt(val) : fallback;
        };

        this.maxCubes = getStored('maxCubes', 12);
        this.maxRings = getStored('maxRings', 6);
        this.maxPlanes = getStored('maxPlanes', 8);
        this.maxParticles = getStored('maxParticles', 60);

        this.accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ffffff';

        this.init();
    }

    init() {
        if (!this.container) return;
        this.clear();
        this.createElements();
    }

    clear() {
        this.container.innerHTML = '';
    }

    refresh() {
        const getStored = (key, fallback) => {
            const val = localStorage.getItem(key);
            return (val !== null) ? parseInt(val) : fallback;
        };

        this.maxCubes = getStored('maxCubes', 12);
        this.maxRings = getStored('maxRings', 6);
        this.maxPlanes = getStored('maxPlanes', 8);
        this.maxParticles = getStored('maxParticles', 60);

        this.accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        this.init();
    }

    createElements() {
        for (let i = 0; i < this.maxCubes; i++) {
            this.createCube();
        }

        for (let i = 0; i < this.maxRings; i++) {
            this.createRing();
        }

        for (let i = 0; i < this.maxPlanes; i++) {
            this.createPlane();
        }

        const particleContainer = document.createElement('div');
        particleContainer.className = 'particles';
        this.container.appendChild(particleContainer);
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle(particleContainer);
        }
    }

    createCube() {
        const size = Math.random() * 80 + 40;
        const container = document.createElement('div');
        container.className = 'cube-container';

        container.style.top = Math.random() * 100 + 'vh';
        container.style.left = Math.random() * 100 + 'vw';
        container.style.width = size + 'px';
        container.style.height = size + 'px';
        container.style.opacity = Math.random() * 0.12 + 0.03;

        const cube = document.createElement('div');
        cube.className = 'cube';

        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * -60;
        cube.style.animation = `cubeRotate ${duration}s linear infinite ${delay}s`;

        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faces.forEach(f => {
            const face = document.createElement('div');
            face.className = `face ${f}`;
            face.style.width = (size / 2) + 'px';
            face.style.height = (size / 2) + 'px';

            const tz = (size / 4);
            if (f === 'front') face.style.transform = `rotateY(0deg) translateZ(${tz}px)`;
            if (f === 'back') face.style.transform = `rotateY(180deg) translateZ(${tz}px)`;
            if (f === 'right') face.style.transform = `rotateY(90deg) translateZ(${tz}px)`;
            if (f === 'left') face.style.transform = `rotateY(-90deg) translateZ(${tz}px)`;
            if (f === 'top') face.style.transform = `rotateX(90deg) translateZ(${tz}px)`;
            if (f === 'bottom') face.style.transform = `rotateX(-90deg) translateZ(${tz}px)`;

            cube.appendChild(face);
        });

        container.appendChild(cube);
        this.container.appendChild(container);
    }

    createRing() {
        const radius = Math.random() * 250 + 80;
        const ringContainer = document.createElement('div');
        ringContainer.className = 'rings-container';
        ringContainer.style.width = radius + 'px';
        ringContainer.style.height = radius + 'px';
        ringContainer.style.top = Math.random() * 100 + 'vh';
        ringContainer.style.left = Math.random() * 100 + 'vw';
        ringContainer.style.opacity = Math.random() * 0.08;

        const ring = document.createElement('div');
        ring.className = 'ring';
        const duration = Math.random() * 25 + 15;
        const delay = Math.random() * -40;
        ring.style.animation = `rotateRing ${duration}s linear infinite ${delay}s`;

        ringContainer.appendChild(ring);
        this.container.appendChild(ringContainer);
    }

    createPlane() {
        const width = Math.random() * 200 + 100;
        const height = width * 0.6;
        const container = document.createElement('div');
        container.className = 'plane-container';
        container.style.width = width + 'px';
        container.style.height = height + 'px';
        container.style.top = Math.random() * 100 + 'vh';
        container.style.left = Math.random() * 100 + 'vw';
        container.style.opacity = Math.random() * 0.06;

        const plane = document.createElement('div');
        plane.className = 'plane';
        const duration = Math.random() * 20 + 20;
        const delay = Math.random() * -40;
        plane.style.animation = `planeRotate ${duration}s ease-in-out infinite alternate ${delay}s`;

        container.appendChild(plane);
        this.container.appendChild(container);
    }

    createParticle(parent) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.top = Math.random() * 100 + '%';
        p.style.left = Math.random() * 100 + '%';

        const size = Math.random() * 3 + 1.5;
        p.style.width = size + 'px';
        p.style.height = size + 'px';

        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * -30;
        p.style.animation = `particleFloat ${duration}s infinite ease-in-out ${delay}s`;

        parent.appendChild(p);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ambientFx = new AmbientFX();
    window.refreshAmbientFx = () => window.ambientFx.refresh();
});
