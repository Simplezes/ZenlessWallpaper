function generateCalendar() {
    const container = document.getElementById('dynamic-calendar');
    if (!container) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const midPoint = 15;
    container.innerHTML = '';
    const row1 = document.createElement('div');
    row1.className = 'calendar-bar row1 d-flex justify-content-center align-items-center w-100';
    const row2 = document.createElement('div');
    row2.className = 'calendar-bar row2 d-flex justify-content-center align-items-center w-100 mt-1';

    for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(year, month, i);
        const dayIdx = dateObj.getDay();
        const dayName = dayNames[dayIdx];
        const isWeekend = (dayIdx === 0 || dayIdx === 6);

        const dayDiv = document.createElement('div');
        dayDiv.className = 'day d-flex flex-column align-items-center' + (isWeekend ? ' weekend' : '') + (i === today ? ' today' : '');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'day-name' + (isWeekend ? ' pink' : '');
        nameSpan.textContent = dayName;

        const numSpan = document.createElement('span');
        numSpan.className = 'day-num' + (isWeekend ? ' pink' : '');
        numSpan.textContent = i.toString().padStart(2, '0');

        dayDiv.appendChild(nameSpan);
        dayDiv.appendChild(numSpan);

        if (i <= midPoint) {
            row1.appendChild(dayDiv);
        } else {
            row2.appendChild(dayDiv);
        }
    }
    container.appendChild(row1);
    container.appendChild(row2);
    container.onclick = (e) => {
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
            container.classList.toggle('show-names');
        }
    };
}
generateCalendar();
scheduleMidnightUpdate(generateCalendar);

