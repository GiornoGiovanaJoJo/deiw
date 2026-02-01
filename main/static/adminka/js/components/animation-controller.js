// animation-controller.js - Управление анимациями
document.addEventListener('DOMContentLoaded', () => {
    const animationToggle = document.getElementById('animation-toggle'); // Предполагаем кнопку/чекбокс

    // Функция для включения/выключения анимаций
    function toggleAnimations(enable) {
        if (enable) {
            document.body.classList.remove('animations-disabled');
            localStorage.setItem('animations', 'enabled');
        } else {
            document.body.classList.add('animations-disabled');
            localStorage.setItem('animations', 'disabled');
        }
    }

    // Загрузка состояния анимаций из localStorage
    const savedAnimationState = localStorage.getItem('animations') || 'enabled';
    if (savedAnimationState === 'disabled') {
        toggleAnimations(false);
        if (animationToggle) {
            animationToggle.checked = false; // Если это чекбокс
        }
    } else {
        if (animationToggle) {
            animationToggle.checked = true;
        }
    }

    // Обработчик переключения
    if (animationToggle) {
        animationToggle.addEventListener('change', (e) => {
            toggleAnimations(e.target.checked);
        });
    }
});