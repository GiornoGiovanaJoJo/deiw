document.addEventListener('DOMContentLoaded', function() {
    // Инициализация AOS
    AOS.init({
        duration: 800,
        offset: 100,
        once: true
    });

 // Запуск волны при загрузке
    const letters = document.querySelectorAll('#brandPremium .wave-letter');
    letters.forEach((letter, i) => {
        setTimeout(() => {
            letter.classList.add('animate');
        }, i * 70 + 200);
        // Сбросить класс после анимации
        letter.addEventListener('animationend', () => {
            letter.classList.remove('animate');
        });
    });
   
});