/**
 * Language Switcher Component
 * Handles multilingual functionality without page reload
 * Поддерживает вложенные ключи, например data-i18n="seiten.home"
 */

class LanguageSwitcher {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'de';
        this.translations = {};
        this.isLoading = false;

        this.init();
    }

    async init() {
        this.initElements();
        await this.loadLanguage(this.currentLang);
        this.applyTranslations(this.translations[this.currentLang]); // <--- ВАЖНО!
        this.setupEventListeners();
        this.updateLanguageUI();
    }

    initElements() {
        this.langToggle = document.getElementById('lang-toggle');
        this.langDropdown = document.getElementById('lang-dropdown');
        this.currentLangSpan = document.getElementById('current-lang');
        this.langOptions = document.querySelectorAll('.lang-option');
        this.footerLangBtns = document.querySelectorAll('.footer-lang-btn');
        this.langArrow = this.langToggle?.querySelector('.lang-arrow');
    }

    setupEventListeners() {
        if (this.langToggle) {
            this.langToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        this.langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });

        this.footerLangBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });

        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }

    async loadLanguage(lang) {
        if (this.isLoading || this.translations[lang]) {
            return this.translations[lang];
        }

        this.isLoading = true;

        try {
            const response = await fetch(`library/lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load language: ${lang}`);
            }

            const translations = await response.json();
            this.translations[lang] = translations;

            return translations;
        } catch (error) {
            console.error('Error loading language:', error);

            if (lang !== 'de') {
                return await this.loadLanguage('de');
            }

            return {};
        } finally {
            this.isLoading = false;
        }
    }

    async setLanguage(lang) {
        if (lang === this.currentLang || this.isLoading) {
            return;
        }

        this.showLoadingState();

        try {
            const translations = await this.loadLanguage(lang);

            if (translations) {
                this.currentLang = lang;
                localStorage.setItem('lang', lang);  
                this.updateServerLanguage(lang);

                this.applyTranslations(translations);
                this.updateLanguageUI();
                this.closeDropdown();
                this.dispatchLanguageChangeEvent(lang);
                this.showSuccessFeedback();
            }
        } catch (error) {
            console.error('Error setting language:', error);
            this.showErrorFeedback();
        } finally {
            this.hideLoadingState();
        }
    }

    // Получение вложенного перевода по ключу вида "seiten.home"
    getNestedTranslation(obj, path) {
        if (!path) return null;
        return path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : null;
        }, obj);
    }

    applyTranslations(translations) {
        // data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(translations, key);

            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.type === 'submit' || element.type === 'button') {
                        element.value = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        });

        // data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getNestedTranslation(translations, key);

            if (translation) {
                element.placeholder = translation;
            }
        });

        // data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.getNestedTranslation(translations, key);

            if (translation) {
                element.title = translation;
            }
        });
    }

    updateLanguageUI() {
        if (this.currentLangSpan) {
            this.currentLangSpan.textContent = this.currentLang.toUpperCase();
        }

        this.langOptions.forEach(option => {
            const lang = option.getAttribute('data-lang');
            option.classList.toggle('active', lang === this.currentLang);
        });

        this.footerLangBtns.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            btn.classList.toggle('active', lang === this.currentLang);
        });

        document.documentElement.lang = this.currentLang;
    }

    toggleDropdown() {
        if (this.langDropdown) {
            const isActive = this.langDropdown.classList.contains('active');
            if (isActive) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        }
    }

    openDropdown() {
        if (this.langDropdown && this.langToggle) {
            this.langDropdown.classList.add('active');
            this.langToggle.classList.add('active');
            const firstOption = this.langDropdown.querySelector('.lang-option');
            if (firstOption) {
                firstOption.focus();
            }
        }
    }

    closeDropdown() {
        if (this.langDropdown && this.langToggle) {
            this.langDropdown.classList.remove('active');
            this.langToggle.classList.remove('active');
        }
    }

    showLoadingState() {
        if (this.langToggle) {
            this.langToggle.classList.add('loading');
            this.langToggle.style.pointerEvents = 'none';
        }
    }

    hideLoadingState() {
        if (this.langToggle) {
            this.langToggle.classList.remove('loading');
            this.langToggle.style.pointerEvents = '';
        }
    }

    showSuccessFeedback() {
        this.showToast('Language changed successfully', 'success');
    }

    showErrorFeedback() {
        this.showToast('Failed to change language', 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    dispatchLanguageChangeEvent(lang) {
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang, translations: this.translations[lang] }
        });
        document.dispatchEvent(event);
    }

    // Public methods
    getCurrentLanguage() {
        return this.currentLang;
    }

    getTranslations(lang = null) {
        return this.translations[lang || this.currentLang] || {};
    }

    translate(key, lang = null) {
        const translations = this.getTranslations(lang);
        return this.getNestedTranslation(translations, key) || key;
    }

    async updateServerLanguage(lang) {
        try {
            const response = await fetch('/library/php/core/set_language.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lang: lang })
            });
            
            if (!response.ok) throw new Error('Failed to update server language');
            
            // Если нужно перезагрузить страницу после смены языка
            // window.location.reload();
            
        } catch (error) {
            console.error('Error updating server language:', error);
        }
    }
}

// Глобальный экземпляр
let languageSwitcher;

document.addEventListener('DOMContentLoaded', () => {
    languageSwitcher = new LanguageSwitcher();

    window.setLanguage = (lang) => languageSwitcher.setLanguage(lang);
    window.getCurrentLanguage = () => languageSwitcher.getCurrentLanguage();
    window.translate = (key, lang) => languageSwitcher.translate(key, lang);
});

// Для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
}