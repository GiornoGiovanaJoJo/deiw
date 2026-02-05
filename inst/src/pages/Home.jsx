import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ThumbsUp,
    Zap,
    Heart,
    ArrowRight,
    ArrowLeft,
} from 'lucide-react';
import './Home.css';
import { base44 } from "@/api/base44Client";
import ServiceCard from "@/components/ServiceCard";
import ProjectCard from "@/components/ProjectCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TikTokIcon = () => (
    <svg viewBox="0 0 18 22" width="20" height="20" fill="currentColor">
        <path d="M18 9.01453C16.1936 9.05746 14.5076 8.45649 13.0624 7.3404V15.0242C13.0624 17.9432 11.3764 20.5188 8.80724 21.549C6.27823 22.5793 3.38793 21.8066 1.62164 19.6173C-0.1848 17.3852 -0.505945 14.2515 0.778633 11.676C2.06321 9.14331 4.71265 7.72674 7.44238 8.11308V11.9764C6.19794 11.5472 4.83308 12.0194 4.07036 13.1355C3.34779 14.2945 3.34779 15.7969 4.11051 16.913C4.87322 18.0291 6.23809 18.5012 7.44238 18.072C8.68681 17.6427 9.52982 16.3979 9.52982 15.0242V0H13.0624C13.0624 0.343411 13.0624 0.643895 13.1427 0.987306C13.3836 2.40387 14.1463 3.64874 15.3104 4.42141C16.0731 4.97945 17.0366 5.27994 18 5.27994V9.01453Z" />
    </svg>
);

export default function Home() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Заявка');
    const [currentService, setCurrentService] = useState(0);
    const [visibleServices, setVisibleServices] = useState(1);
    const [formMessage, setFormMessage] = useState({ text: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Data State
    const [services, setServices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Project Pagination
    const [projectPage, setProjectPage] = useState(0);
    const projectsPerPage = 3;

    const navigate = useNavigate();

    // Data Fetching
    useEffect(() => {
        const loadPublicData = async () => {
            try {
                const [cats, projs] = await Promise.all([
                    base44.public.getCategories(50),
                    base44.public.getProjects(50)
                ]);
                if (cats && cats.length > 0) {
                    setServices(cats);
                } else {
                    setServices([
                        { id: 1, title: 'Жилое строительство', description: 'Строительство современных жилых комплексов и частных домов под ключ.', icon: 'home' },
                        { id: 2, title: 'Коммерческая недвижимость', description: 'Офисные здания, торговые центры и складские помещения.', icon: 'building' },
                        { id: 3, title: 'Реконструкция', description: 'Восстановление и модернизация существующих зданий.', icon: 'hammer' },
                        { id: 4, title: 'Проектирование', description: 'Разработка архитектурных и инженерных проектов любой сложности.', icon: 'pen-tool' },
                        { id: 5, title: 'Ландшафтный дизайн', description: 'Благоустройство территорий и создание уникальных ландшафтов.', icon: 'tree' }
                    ]);
                }
                // Filter logs or invalid projects if needed, for now use all
                setProjects(projs);
            } catch (error) {
                console.error("Failed to load public data:", error);
                // Fallback mock data on error too
                setServices([
                    { id: 1, title: 'Жилое строительство', description: 'Строительство современных жилых комплексов и частных домов под ключ.', icon: 'home' },
                    { id: 2, title: 'Коммерческая недвижимость', description: 'Офисные здания, торговые центры и складские помещения.', icon: 'building' },
                    { id: 3, title: 'Реконструкция', description: 'Восстановление и модернизация существующих зданий.', icon: 'hammer' },
                    { id: 4, title: 'Проектирование', description: 'Разработка архитектурных и инженерных проектов любой сложности.', icon: 'pen-tool' },
                    { id: 5, title: 'Ландшафтный дизайн', description: 'Благоустройство территорий и создание уникальных ландшафтов.', icon: 'tree' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        loadPublicData();
    }, []);

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

        // Small delay to allow DOM to populate
        setTimeout(() => {
            document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
        }, 500);

        return () => observer.disconnect();
    }, [services, projects]);

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

    // Project Pagination Handlers
    const handleNextProjectPage = () => {
        const maxPage = Math.ceil(projects.length / projectsPerPage) - 1;
        setProjectPage(curr => Math.min(curr + 1, maxPage));
    };

    const handlePrevProjectPage = () => {
        setProjectPage(curr => Math.max(curr - 1, 0));
    };

    const visibleProjects = projects.slice(
        projectPage * projectsPerPage,
        (projectPage + 1) * projectsPerPage
    );

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

    return (
        <div className="landing-page font-sans text-slate-900 bg-white">
            <Header />

            <main>
                {/* Hero */}
                <section className="hero" id="hero">
                    <div className="container">
                        <div className="hero__content">
                            <h1 className="hero__title">
                                <span className="hero__brand">Empire Premium</span> — <span className="hero__title-small">строим ваше будущее!</span>
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
                            <div className="hero__visual-inner">
                                <div className="hero__visual-placeholder">
                                    <img
                                        src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop"
                                        alt="Hero Building"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="section features" id="about">
                    <div className="container">
                        <div className="features__wrap">
                            <div className="features__text">
                                <h2 className="section__title animate-on-scroll section__title--split">
                                    <span className="section__title-accent">Мы поддерживаем наших клиентов на каждом этапе:</span> <span className="section__title-base">от концепции до сдачи «под ключ»</span>
                                </h2>
                                <p className="section__subtitle animate-on-scroll">С нами вы выбираете надежность, комфорт и стиль.</p>
                                <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary animate-on-scroll">
                                    Связаться с нами <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                            <div className="features__grid">
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><ThumbsUp /></div>
                                    <h3 className="feature-card__title">Безупречное Качество</h3>
                                    <p className="feature-card__text">Мы используем только лучшие материалы и передовые технологии.</p>
                                </article>
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><Zap /></div>
                                    <h3 className="feature-card__title">Инновационные Решения</h3>
                                    <p className="feature-card__text">Наша команда постоянно ищет новые подходы.</p>
                                </article>
                                <article className="feature-card animate-on-scroll">
                                    <div className="feature-card__icon"><Heart /></div>
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
                        <h2 className="section__title animate-on-scroll mb-8">Наши услуги</h2>

                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-empire-purple"></div></div>
                        ) : (
                            <div className="relative">
                                <div className="overflow-hidden p-2 -m-2">
                                    <div
                                        className="flex transition-transform duration-500 ease-in-out gap-6"
                                        style={{ transform: `translateX(calc(-${(currentService * (100 / visibleServices))}%)` }}
                                    >
                                        {services.map((service, idx) => (
                                            <div
                                                key={service.id || idx}
                                                className="flex-shrink-0 animate-on-scroll"
                                                style={{ width: `calc((100% - ${(visibleServices - 1) * 24}px) / ${visibleServices})` }}
                                            >
                                                <ServiceCard category={service} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={handlePrevService}
                                        className="services__arrow"
                                        disabled={currentService === 0}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNextService}
                                        className="services__arrow"
                                        disabled={currentService >= services.length - visibleServices}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {services.length === 0 && !loading && (
                            <p className="text-center text-slate-400 py-12">Услуги скоро появятся</p>
                        )}
                    </div>
                </section>

                {/* Projects */}
                <section className="section projects" id="projects">
                    <div className="container">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="section__title animate-on-scroll">Наши проекты</h2>
                            {/* Pagination Controls */}
                            {projects.length > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrevProjectPage}
                                        disabled={projectPage === 0}
                                        className="services__arrow w-10 h-10 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNextProjectPage}
                                        disabled={(projectPage + 1) * projectsPerPage >= projects.length}
                                        className="services__arrow w-10 h-10 disabled:opacity-50"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-empire-purple"></div></div>
                        ) : (
                            <div className="projects__grid">
                                {visibleProjects.map((project, idx) => (
                                    <div key={project.id || idx} className="h-full animate-on-scroll">
                                        <ProjectCard project={project} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {projects.length === 0 && !loading && (
                            <p className="text-center text-slate-400 py-12">Проекты скоро появятся</p>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="cta-section" id="contact">
                    <div className="container">
                        <h2 className="section__title animate-on-scroll">У вас есть вопросы, предложения или<br />нужна помощь с вашим проектом?</h2>
                        <p className="section__subtitle animate-on-scroll mb-8">Свяжитесь с нами — ответим в течение 15 минут и обсудим вашу задачу.</p>
                        <button onClick={() => scrollToSection('footer-form')} className="btn btn--primary animate-on-scroll">
                            Связаться с нами <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
