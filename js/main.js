document.addEventListener('DOMContentLoaded', () => {
    // Мобильное меню (бургер)
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.querySelector('.nav-menu');

    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });

        // Закрывать меню при клике на любую ссылку
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
            });
        });
    }
});