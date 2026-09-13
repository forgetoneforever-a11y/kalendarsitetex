document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                formStatus.textContent = 'Пожалуйста, заполните все поля.';
                formStatus.className = 'form-status error';
                return;
            }

            // Имитация отправки формы
            formStatus.textContent = 'Отправка...';
            formStatus.className = 'form-status';

            setTimeout(() => {
                formStatus.textContent = 'Спасибо! Ваше сообщение успешно отправлено.';
                formStatus.className = 'form-status success';
                contactForm.reset();
            }, 1000);
        });
    }
});