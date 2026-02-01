class ThemeSwitcher {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.toggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        // Установка начального состояния
        document.documentElement.setAttribute('data-theme', this.theme);
        this.toggle.checked = this.theme === 'dark';

        // Обработчик переключения
        this.toggle.addEventListener('change', () => this.switchTheme());
        
        // Добавляем плавный переход при загрузке
        setTimeout(() => {
            document.documentElement.style.transition = 'background-color 0.3s, color 0.3s';
        }, 100);
    }

    switchTheme() {
        const newTheme = this.toggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Анимация переключения
        this.animateThemeSwitch();
    }

    animateThemeSwitch() {
        const switcher = document.querySelector('.theme-switcher');
        switcher.style.transform = 'scale(0.95)';
        setTimeout(() => {
            switcher.style.transform = 'scale(1)';
        }, 100);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ThemeSwitcher();
});