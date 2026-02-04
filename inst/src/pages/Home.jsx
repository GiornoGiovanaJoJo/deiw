import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ThumbsUp,
    Zap,
    Heart,
    ArrowRight,
    ArrowLeft,
    Instagram,
    Menu,
    X,
    Mail,
    Phone,
    Clock,
    MapPin,
    CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import './Home.css';
import { createPageUrl } from "../utils";

const TikTokIcon = () => (
    <svg viewBox="0 0 18 22" width="20" height="20" fill="currentColor">
        <path d="M18 9.01453C16.1936 9.05746 14.5076 8.45649 13.0624 7.3404V15.0242C13.0624 17.9432 11.3764 20.5188 8.80724 21.549C6.27823 22.5793 3.38793 21.8066 1.62164 19.6173C-0.1848 17.3852 -0.505945 14.2515 0.778633 11.676C2.06321 9.14331 4.71265 7.72674 7.44238 8.11308V11.9764C6.19794 11.5472 4.83308 12.0194 4.07036 13.1355C3.34779 14.2945 3.34779 15.7969 4.11051 16.913C4.87322 18.0291 6.23809 18.5012 7.44238 18.072C8.68681 17.6427 9.52982 16.3979 9.52982 15.0242V0H13.0624C13.0624 0.343411 13.0624 0.643895 13.1427 0.987306C13.3836 2.40387 14.1463 3.64874 15.3104 4.42141C16.0731 4.97945 17.0366 5.27994 18 5.27994V9.01453Z" />
    </svg>
);

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('question');
    const [currentService, setCurrentService] = useState(0);
    const [visibleServices, setVisibleServices] = useState(1);
    const [formMessage, setFormMessage] = useState({ text: '', type: '' });

    const servicesRef = useRef(null);
    const navigate = useNavigate();

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Resize listener for services carousel
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setVisibleServices(3);
            else if (window.innerWidth >= 768) setVisibleServices(2);
            else setVisibleServices(1);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    const handleNextService = () => {
        const max = Math.max(0, services.length - visibleServices);
        setCurrentService(curr => Math.min(curr + 1, max));
    };

    const handlePrevService = () => {
        setCurrentService(curr => Math.max(curr - 1, 0));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');

        if (!name || !phone || !email) {
            setFormMessage({ text: 'Пожалуйста, заполните все поля.', type: 'error' });
            return;
        }

        setFormMessage({ text: 'Спасибо! Мы свяжемся с вами в течение 15 минут.', type: 'success' });
        e.target.reset();
    };

    const services = [
        {
            title: "Малярные работы",
            img: "Малярные работы",
            items: ["Покраска стен и потолков", "Покраска фасадов", "Покраска дверей и окон", "Шпаклёвка стен", "Грунтовка поверхностей", "Удаление старой краски"]
        },
        {
            title: "Сантехника",
            img: "Сантехника",
            items: ["Разводка труб", "Замена труб", "Установка сантехники", "Установка душевой кабины", "Подключение техники", "Устранение протечек"]
        },
        {
            title: "Электрика",
            img: "Электрика",
            items: ["Внутренняя электрика", "Наружная электрика", "Прокладка кабеля", "Замена проводки", "Установка розеток", "Монтаж электрощита"]
        }
    ];

    const projects = [
        { title: "Установка солнечных панелей", desc: "Солнечные панели, реализованные с высокими требованиями.", img: "Солнечные панели" },
        { title: "Строительство под ключ", desc: "Полный цикл: от фундамента до отделки.", img: "Строительство" },
        { title: "Реконструкция фасада", desc: "Надёжные решения для фасада. Безопасность и вид.", img: "Фасад" }
    ];

    return (
        <div className="landing-page font-sans text-slate-900 bg-white">
            {/* Header */}
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header__inner">
                    <Link to="/" className="header__logo">
                        <span className="header__logo-abbr">EP</span>
                        Empire <span>Premium</span>
                    </Link>

                    <nav className="nav">
                        <button onClick={() => scrollToSection('about')} className="nav__link">О нас</button>
                        <button onClick={() => scrollToSection('services')} className="nav__link">Услуги</button>
                        <button onClick={() => scrollToSection('projects')} className="nav__link">Проекты</button>
                        <button onClick={() => scrollToSection('contact')} className="nav__link">Карьера</button>
                    </nav>

                    <div className="header__cta">
                        <Link to={createPageUrl("BenutzerLogin")} className="btn btn--gold">
                            Войти
                        </Link>
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--outline-purple">
                            Оставить заявку <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>

                    <button className="hamburger lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`}>
                <nav className="flex flex-col gap-4">
                    <button onClick={() => scrollToSection('about')} className="nav__link text-left">О нас</button>
                    <button onClick={() => scrollToSection('services')} className="nav__link text-left">Услуги</button>
                    <button onClick={() => scrollToSection('projects')} className="nav__link text-left">Проекты</button>
                    <button onClick={() => scrollToSection('contact')} className="nav__link text-left">Карьера</button>
                </nav>
                <div className="mt-8 flex flex-col gap-4">
                    <Link to={createPageUrl("BenutzerLogin")} className="btn btn--gold w-full">
                        Войти
                    </Link>
                </div>
            </div>

            <main>
                {/* Hero */}
                <section className="hero" id="hero">
                    <div className="container">
                        <div className="hero__content">
                            <h1 className="hero__title">
                                <span className="hero__brand">Empire Premium</span> — <span className="underline hero__title-small">строим ваше будущее!</span>
                            </h1>
                            <p className="hero__subtitle">
                                Empire Premium — это строительная компания премиум-класса с командой экспертов, воплощающих в жизнь даже самые смелые идеи.
                            </p>
                            <div className="hero__buttons">
                                <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary">
                                    Оставить заявку <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                            <div className="hero__stats">
                                <div className="hero__stat">
                                    <div className="hero__stat-num">2+</div>
                                    <div className="hero__stat-label">Многолетний опыт</div>
                                </div>
                                <div className="hero__stat">
                                    <div className="hero__stat-num">200+</div>
                                    <div className="hero__stat-label">Реализовали проектов</div>
                                </div>
                                <div className="hero__stat">
                                    <div className="hero__stat-num">5</div>
                                    <div className="hero__stat-label">Гарантия в годах</div>
                                </div>
                            </div>
                        </div>
                        <div className="hero__visual">
                            <div className="hero__visual-inner bg-slate-200 h-full w-full flex items-center justify-center text-slate-500">
                                Image Placeholder
                            </div>
                        </div>
                    </div>
                    <div className="hero__bottom-line"></div>
                </section>

                {/* Features */}
                <section className="section features" id="about">
                    <div className="container">
                        <div className="features__wrap">
                            <div className="features__text">
                                <h2 className="section__title animate-on-scroll">
                                    <span className="text-[#695EF9]">Мы поддерживаем наших клиентов на каждом этапе:</span> от концепции до сдачи «под ключ»
                                </h2>
                                <p className="section__subtitle animate-on-scroll">С нами вы выбираете надежность, комфорт и стиль.</p>
                                <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary animate-on-scroll">
                                    Связаться с нами <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                            <div className="features__grid">
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><ThumbsUp className="w-6 h-6" /></div>
                                    <h3 className="feature-card__title">Безупречное Качество</h3>
                                    <p className="feature-card__text">Мы используем только лучшие материалы и передовые технологии.</p>
                                </article>
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><Zap className="w-6 h-6" /></div>
                                    <h3 className="feature-card__title">Инновационные Решения</h3>
                                    <p className="feature-card__text">Наша команда постоянно ищет новые подходы.</p>
                                </article>
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><Heart className="w-6 h-6" /></div>
                                    <h3 className="feature-card__title">Клиентоориентированный Подход</h3>
                                    <p className="feature-card__text">Мы внимательно слушаем ваши потребности.</p>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services */}
                <section className="section services" id="services">
                    <div className="container">
                        <h2 className="section__title animate-on-scroll">Наши услуги</h2>
                        <div className="services__slider">
                            <div
                                className="services__track"
                                style={{ transform: `translateX(-${services.length > 0 ? (currentService / services.length) * 100 : 0}%)` }}
                            >
                                {services.map((service, idx) => (
                                    <article key={idx} className="service-card animate-on-scroll">
                                        <div className="service-card__img">{service.img}</div>
                                        <div className="service-card__body">
                                            <h3 className="service-card__title">{service.title}</h3>
                                            <ul className="service-card__list">
                                                {service.items.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                        <div className="services__arrows">
                            <button onClick={handlePrevService} className="services__arrow"><ArrowLeft /></button>
                            <button onClick={handleNextService} className="services__arrow"><ArrowRight /></button>
                        </div>
                    </div>
                </section>

                {/* Projects */}
                <section className="section projects" id="projects">
                    <div className="container">
                        <h2 className="section__title animate-on-scroll">Наши проекты</h2>
                        <div className="projects__grid">
                            {projects.map((project, idx) => (
                                <article key={idx} className="project-card animate-on-scroll">
                                    <div className="project-card__img">{project.img}</div>
                                    <div className="project-card__body">
                                        <h3 className="project-card__title">{project.title}</h3>
                                        <p className="project-card__desc">{project.desc}</p>
                                        <a href="#" className="project-card__link">Подробнее <ArrowRight className="w-4 h-4" /></a>
                                        <p className="project-card__address">Hastedter Heerstraße 63</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="cta-section" id="contact">
                    <div className="container">
                        <h2 className="section__title animate-on-scroll">У вас есть вопросы или нужна помощь?</h2>
                        <p className="section__subtitle animate-on-scroll">Команда Empire Premium всегда готова прийти на помощь.</p>
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary animate-on-scroll">
                            Связаться с нами <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer">
                    <section className="footer__contact">
                        <div className="footer__contact-bg"></div>
                        <div className="container footer__contact-inner">
                            <h2 className="footer__slogan">Empire Premium — Ваш партнёр по строительству</h2>
                            <div className="footer__form-box" id="footer-form">
                                <h3 className="footer__form-title">Заполните форму, и мы ответим на вопросы.</h3>
                                <div className="footer__form-tabs">
                                    {['question', 'career', 'review'].map(tab => (
                                        <button
                                            key={tab}
                                            type="button"
                                            className={`footer__form-tab ${activeTab === tab ? 'is-active' : ''}`}
                                            onClick={() => setActiveTab(tab)}
                                        >
                                            {tab === 'question' ? 'ЗАДАТЬ ВОПРОС' : tab === 'career' ? 'КАРЬЕРА' : 'ОТЗЫВ'}
                                        </button>
                                    ))}
                                </div>
                                <form className="footer__form" onSubmit={handleFormSubmit}>
                                    <input type="text" className="footer__input" name="name" placeholder="Ваше имя" required />
                                    <input type="tel" className="footer__input" name="phone" placeholder="Номер телефона" required />
                                    <input type="email" className="footer__input" name="email" placeholder="Email" required />
                                    <textarea className="footer__input" name="message" placeholder="Ваше сообщение"></textarea>
                                    <button type="submit" className="footer__form-submit btn--primary">ОТПРАВИТЬ ЗАЯВКУ</button>
                                    {formMessage.text && (
                                        <p className={`mt-2 text-sm ${formMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                            {formMessage.text}
                                        </p>
                                    )}
                                </form>
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
                                        <a href="#" aria-label="Instagram"><Instagram /></a>
                                        <a href="#" aria-label="TikTok"><TikTokIcon /></a>
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
            </main>
        </div>
    );
}
