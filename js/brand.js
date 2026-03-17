function updateBrandDate() {
    const now = new Date();
    const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const monthNumEl = document.getElementById('brand-month-num');
    const monthNumMobileEl = document.getElementById('brand-month-num-mobile');
    const monthNameEl = document.getElementById('brand-month-name');
    const yearEl = document.getElementById('brand-year');

    const headerMonthNameEl = document.getElementById('header-month-name');
    const headerYearEl = document.getElementById('header-year');

    if (monthNumEl) monthNumEl.textContent = monthNum;
    if (monthNumMobileEl) monthNumMobileEl.textContent = monthNum;
    if (monthNameEl) monthNameEl.textContent = monthName;
    if (yearEl) yearEl.textContent = year;

    if (headerMonthNameEl) headerMonthNameEl.textContent = monthName;
    if (headerYearEl) headerYearEl.textContent = year;
}
updateBrandDate();

function scheduleMidnightUpdate(fn) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const msUntilMidnight = midnight - now;
    setTimeout(() => {
        fn();
        setInterval(fn, 1000 * 60 * 60 * 24);
    }, msUntilMidnight);
}
scheduleMidnightUpdate(updateBrandDate);