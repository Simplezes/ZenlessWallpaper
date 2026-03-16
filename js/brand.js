function updateBrandDate() {
    const now = new Date();
    const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const monthNumEl = document.getElementById('brand-month-num');
    const monthNameEl = document.getElementById('brand-month-name');
    const yearEl = document.getElementById('brand-year');
    if (monthNumEl) monthNumEl.textContent = monthNum;
    if (monthNameEl) monthNameEl.textContent = monthName;
    if (yearEl) yearEl.textContent = year;
}