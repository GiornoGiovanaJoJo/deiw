import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, Search, Settings, FileText, HelpCircle, ChevronRight, Check } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "../utils";
import './Home.css';

const MOCK_ORDERS = [
    { id: 1, title: "Название заказа", category: "Сантехника", number: "001 100 0001", status: "Завершен", date: "05.01.2026" },
    { id: 2, title: "Название заказа", category: "Малярные работы", number: "001 100 0002", status: "Активен", date: "12.01.2026" },
    { id: 3, title: "Название заказа", category: "Электрика", number: "001 100 0003", status: "Активен", date: "20.01.2026" },
];

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
                Загрузка профиля...
            </div>
        );
    }

    // Standard Admin Profile Redirect
    if (user.is_superuser) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <User className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{user.vorname} {user.nachname}</h1>
                    <p className="text-slate-500 mb-6">Администратор</p>
                    <div className="space-y-3">
                        <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="w-full btn--primary">
                            Панель управления
                        </Button>
                        <Button variant="outline" onClick={logout} className="w-full">
                            Выйти
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- CLIENT PROFILE VIEW (Light Components) ---

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === id
                    ? 'bg-white border-2 border-[#7C3AED] text-[#7C3AED] shadow-sm font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">
            <div className="container mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">

                {/* Sidebar */}
                <aside className="w-full lg:w-80 shrink-0 space-y-8">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left pl-4">
                        <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 overflow-hidden relative group">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user.vorname || "Имя"} {user.nachname || "Фамилия"}</h2>
                        <p className="text-slate-400 text-sm mt-1">ID {user.id || "0000000000"}</p>
                    </div>

                    <nav className="space-y-2">
                        <SidebarItem id="orders" icon={FileText} label="Заказы" />
                        <SidebarItem id="requests" icon={FileText} label="Заявки" />
                        <SidebarItem id="profile" icon={Settings} label="Управление профилем" />
                        <SidebarItem id="support" icon={HelpCircle} label="Поддержка" />
                    </nav>

                    <div className="pt-8 border-t border-slate-100">
                        <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 pl-4 text-sm font-medium">
                            <LogOut className="w-4 h-4" /> Выйти
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {activeTab === 'orders' && (
                        <div className="space-y-8">
                            <h1 className="text-3xl font-bold text-slate-900">Заказы</h1>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select className="h-12 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 focus:outline-none focus:border-[#7C3AED]">
                                    <option>Статус заказа</option>
                                    <option>Активен</option>
                                    <option>Завершен</option>
                                </select>
                                <select className="h-12 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 focus:outline-none focus:border-[#7C3AED]">
                                    <option>Категория услуги</option>
                                    <option>Сантехника</option>
                                    <option>Ремонт</option>
                                </select>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Поиск по номеру заказа"
                                        className="w-full h-12 pl-12 pr-4 rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-[#7C3AED]"
                                    />
                                </div>
                            </div>

                            {/* Order List */}
                            <div className="space-y-4">
                                {MOCK_ORDERS.map((order) => (
                                    <div key={order.id} className="bg-[#F8F7FF] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="space-y-4 flex-1">
                                            <div className="font-bold text-slate-900 text-lg">{order.status}</div>
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-900 mb-2">{order.title}</h3>
                                                <div className="text-slate-500 text-sm space-y-1">
                                                    <p>Категория заказа: {order.category}</p>
                                                    <p>Номер заказа: {order.number}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-32 h-24 bg-slate-200 rounded-xl shrink-0"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl">
                            <h1 className="text-3xl font-bold text-slate-900">Управление профилем</h1>

                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User className="w-10 h-10" />
                                    </div>
                                    <button className="text-[#7C3AED] hover:underline text-sm font-medium">
                                        Изменить фото
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="font-medium text-slate-900 w-1/3">Изменить имя</span>
                                        <span className="text-slate-600 text-right flex-1">{user.vorname} {user.nachname}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="font-medium text-slate-900 w-1/3">Изменить номер</span>
                                        <span className="text-slate-600 text-right flex-1">+49 (900) 000 000 000</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="font-medium text-slate-900 w-1/3">Изменить почту</span>
                                        <span className="text-slate-600 text-right flex-1">{user.email}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="text-slate-400 text-sm">ID {user.id || "000000000"}</span>
                                    </div>
                                </div>

                                <button className="w-full h-12 rounded-xl border border-[#7C3AED] text-[#7C3AED] font-medium hover:bg-violet-50 transition-colors">
                                    Готово
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">История заявок</h2>
                            <p className="text-slate-500">У вас пока нет активных заявок.</p>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Поддержка</h2>
                            <p className="text-slate-500">Свяжитесь с нами: support@empire-premium.de</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
