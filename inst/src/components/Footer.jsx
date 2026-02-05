import React, { useState } from 'react';
import { Instagram, Mail, Phone, Clock } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import '../pages/Home.css';

const TikTokIcon = () => (
    <svg viewBox="0 0 18 22" width="20" height="20" fill="currentColor">
        <path d="M18 9.01453C16.1936 9.05746 14.5076 8.45649 13.0624 7.3404V15.0242C13.0624 17.9432 11.3764 20.5188 8.80724 21.549C6.27823 22.5793 3.38793 21.8066 1.62164 19.6173C-0.1848 17.3852 -0.505945 14.2515 0.778633 11.676C2.06321 9.14331 4.71265 7.72674 7.44238 8.11308V11.9764C6.19794 11.5472 4.83308 12.0194 4.07036 13.1355C3.34779 14.2945 3.34779 15.7969 4.11051 16.913C4.87322 18.0291 6.23809 18.5012 7.44238 18.072C8.68681 17.6427 9.52982 16.3979 9.52982 15.0242V0H13.0624C13.0624 0.343411 13.0624 0.643895 13.1427 0.987306C13.3836 2.40387 14.1463 3.64874 15.3104 4.42141C16.0731 4.97945 17.0366 5.27994 18 5.27994V9.01453Z" />
    </svg>
);

export default function Footer() {
    const [activeTab, setActiveTab] = useState('Заявка');
    const [formMessage, setFormMessage] = useState({ text: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            message: formData.get('message'),
            type: activeTab
        };

        if (!data.name || !data.phone || !data.email) {
            setFormMessage({ text: 'Пожалуйста, заполните все поля.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setFormMessage({ text: '', type: '' });

        try {
            await base44.public.submitInquiry(data);
            setFormMessage({ text: 'Спасибо! Мы свяжемся с вами в течение 15 минут.', type: 'success' });
            e.target.reset();
        } catch (error) {
            console.error("Form submission error:", error);
            setFormMessage({ text: 'Произошла ошибка при отправке. Попробуйте позже.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback if not on home page
            window.location.href = `/#${id}`;
        }
    };

    return (
        <footer className="footer">
            <section className="footer__contact">
                <div className="container footer__contact-inner">
                    <div className="hidden lg:block absolute left-0 top-10 text-white opacity-20 text-9xl font-bold -z-10">EMPIRE</div>

                    <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
                        <div className="text-white pt-20 pb-12 hidden lg:block">
                            <h2 className="text-4xl font-bold mb-4">Empire Premium — Ваш<br />партнёр по строительству</h2>
                        </div>

                        <div className="footer__form-box w-full lg:w-auto lg:min-w-[480px]" id="footer-form">
                            <h3 className="footer__form-title">Заполните форму, и мы свяжемся с вами в течение 15 минут</h3>
                            <div className="footer__form-tabs">
                                {['Заявка', 'Каталог', 'Отзыв'].map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`footer__form-tab ${activeTab === tab ? 'is-active' : ''}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <form className="footer__form" onSubmit={handleFormSubmit}>
                                <input type="text" className="footer__input" name="name" placeholder="Имя" required />
                                <input type="tel" className="footer__input" name="phone" placeholder="Телефон" required />
                                <input type="email" className="footer__input" name="email" placeholder="Email" required />
                                <textarea className="footer__input" name="message" placeholder="Сообщение" rows="3"></textarea>
                                <button
                                    type="submit"
                                    className="footer__form-submit btn--primary w-full justify-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Отправка...' : 'Оставить заявку'}
                                </button>
                                {formMessage.text && (
                                    <p className={`mt-2 text-sm ${formMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                        {formMessage.text}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <div className="footer__bottom-wrap">
                <div className="container">
                    <div className="footer__top">
                        <div className="footer__brand">
                            <a href="#" className="footer__logo">Empire <span>Premium</span></a>
                            <p className="mb-4 text-slate-500">С 2024 года мы создаем исключительные строительные проекты.</p>
                            <div className="footer__social">
                                <a href="#" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram /></a>
                                {/* TikTok icon handling */}
                                <a href="#" aria-label="TikTok" target="_blank" rel="noreferrer">
                                    <svg viewBox="0 0 18 22" width="20" height="20" fill="currentColor">
                                        <path d="M18 9.01453C16.1936 9.05746 14.5076 8.45649 13.0624 7.3404V15.0242C13.0624 17.9432 11.3764 20.5188 8.80724 21.549C6.27823 22.5793 3.38793 21.8066 1.62164 19.6173C-0.1848 17.3852 -0.505945 14.2515 0.778633 11.676C2.06321 9.14331 4.71265 7.72674 7.44238 8.11308V11.9764C6.19794 11.5472 4.83308 12.0194 4.07036 13.1355C3.34779 14.2945 3.34779 15.7969 4.11051 16.913C4.87322 18.0291 6.23809 18.5012 7.44238 18.072C8.68681 17.6427 9.52982 16.3979 9.52982 15.0242V0H13.0624C13.0624 0.343411 13.0624 0.643895 13.1427 0.987306C13.3836 2.40387 14.1463 3.64874 15.3104 4.42141C16.0731 4.97945 17.0366 5.27994 18 5.27994V9.01453Z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="footer__col">
                            <h4>О нас</h4>
                            <ul>
                                <li><button onClick={() => scrollToSection('contact')}>Карьера</button></li>
                                <li><button onClick={() => scrollToSection('about')}>Сотрудники</button></li>
                            </ul>
                        </div>

                        <div className="footer__col">
                            <h4>Связаться с нами</h4>
                            <ul className="text-sm space-y-2">
                                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@empire-premium-bau.de</li>
                                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +49 17661951823</li>
                                <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Пн-Пт 8:00-18:00</li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer__bottom">
                        <p className="footer__copy">© 2026 Empire Premium. Все права защищены.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
