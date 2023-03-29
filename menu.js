function toggleRTL () {
    const mainEl = document.querySelector('main');
    mainEl.classList.toggle('is-rtl');
}

function setupMenu () {
    const link = document.querySelector('.menu a[href="#rtl"]');

    link.addEventListener('click', (ev) => {
        ev.preventDefault();
        toggleRTL();
    });
}

document.addEventListener('DOMContentLoaded', setupMenu);
