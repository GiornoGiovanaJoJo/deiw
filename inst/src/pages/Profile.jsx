import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Briefcase, Phone } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "../utils";
import './Home.css';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
                Загрузка профиля...
            </div>
        );
    }

    const isClient = !user.is_superuser;

    return (
        <div className={`min-h-screen ${isClient ? 'bg-slate-900 text-white' : 'landing-page p-6 max-w-4xl mx-auto'}`}>
            {isClient ? (
                // --- CLIENT PROFILE VIEW ---
                <div className="container mx-auto px-4 py-12 max-w-5xl">
                    <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#D4AF37]">Личный Кабинет</h1>
                            <p className="text-slate-400 mt-1">Добро пожаловать в Empire Premium</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={logout}
                            className="text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-900 bg-transparent transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Выйти
                        </Button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar / User Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center shadow-lg">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#D4AF37] to-[#B38F1D] rounded-full flex items-center justify-center text-slate-900 text-3xl font-bold mb-4 shadow-xl">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-white mb-1">{user.vorname} {user.nachname}</h2>
                                <div className="inline-block px-3 py-1 rounded-full bg-slate-900 text-[#D4AF37] text-xs font-medium border border-slate-700 mb-6">
                                    Premium Client
                                </div>

                                <div className="space-y-4 text-left border-t border-slate-700 pt-6">
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Mail className="w-4 h-4 text-[#D4AF37]" />
                                        <span className="text-sm truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                                        <span className="text-sm">+49 (0) 123 456 789</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <User className="w-4 h-4 text-[#D4AF37]" />
                                        <span className="text-sm">@{user.username}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#D4AF37] rounded-xl p-6 text-slate-900 shadow-lg">
                                <h3 className="font-bold mb-2 flex items-center gap-2">
                                    <Phone className="w-5 h-5" /> Личный Менеджер
                                </h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Есть вопросы по вашему проекту? Ваш менеджер всегда на связи.
                                </p>
                                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 border-none">
                                    Связаться
                                </Button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Projects Section Placeholder */}
                            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-[#D4AF37]" /> Мои Проекты
                                    </h3>
                                    <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-400 rounded border border-green-900/50">
                                        Активен
                                    </span>
                                </div>
                                <div className="p-8 text-center py-16">
                                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                                        <Briefcase className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-medium text-white mb-2">Проект "Вилла Грюнвальд"</h4>
                                    <p className="text-slate-400 max-w-md mx-auto mb-6">
                                        Статус: В работе. Этап: Внутренняя отделка и монтаж коммуникаций.
                                    </p>
                                    <Button variant="outline" className="text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-900 bg-transparent">
                                        Подробнее о проекте
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // --- ADMIN/STANDARD PROFILE VIEW ---
                <>
                    <h1 className="text-3xl font-bold mb-8 text-slate-900">Мой Профиль</h1>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800"></div>
                        <div className="px-8 pb-8">
                            <div className="relative flex justify-between items-end -mt-12 mb-6">
                                <div className="flex items-end gap-6">
                                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                                        <div className="w-full h-full rounded-full bg-accent-purple flex items-center justify-center text-white text-3xl font-bold">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="mb-1">
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            {user.vorname} {user.nachname}
                                        </h2>
                                        <p className="text-slate-500 flex items-center gap-2">
                                            @{user.username} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {user.position || "Администратор"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="btn--primary">
                                        <Briefcase className="w-4 h-4 mr-2" /> Панель управления
                                    </Button>
                                    <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                        <LogOut className="w-4 h-4 mr-2" /> Выйти
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Личная информация</h3>
                                    {/* ... standard admin info ... */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Email Address</p>
                                            <p className="text-slate-900">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Должность</p>
                                            <p className="text-slate-900">{user.position || "Администратор"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Управление</h3>
                                    <p className="text-slate-600 mb-4">Вы имеете доступ к панели администратора.</p>
                                    <Button onClick={() => navigate(createPageUrl("Dashboard"))} variant="outline" className="w-full">
                                        Перейти в Dashboard
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
