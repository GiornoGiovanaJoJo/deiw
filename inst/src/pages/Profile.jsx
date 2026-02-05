import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, Search, Settings, FileText, HelpCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "../utils";
import { base44 } from '@/api/base44Client';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import './Home.css';

export default function Profile() {
    const { user, logout, checkUserAuth } = useAuth(); // accessible checkUserAuth to refresh user data after update
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    // Data States
    const [orders, setOrders] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        vorname: '',
        nachname: '',
        email: ''
    });

    useEffect(() => {
        if (user && !user.is_superuser) {
            loadClientData();
            setProfileForm({
                vorname: user.vorname || user.first_name || '',
                nachname: user.nachname || user.last_name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const loadClientData = async () => {
        try {
            setLoading(true);
            const [myProjects, myRequests] = await Promise.all([
                base44.client.getMyProjects(),
                base44.client.getMyRequests()
            ]);
            setOrders(myProjects);
            setRequests(myRequests);
        } catch (error) {
            console.error("Failed to load client data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const payload = {
                first_name: profileForm.vorname,
                last_name: profileForm.nachname,
                email: profileForm.email
            };
            await base44.client.updateProfile(payload);
            await checkUserAuth(); // Refresh global user state
            setIsEditingProfile(false);
            // Optional: Show success toast
        } catch (error) {
            console.error("Profile update failed", error);
            // Optional: Show error
        }
    };

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

    // Client View Logic
    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter ? order.status === statusFilter : true;
        const matchesCategory = categoryFilter ? order.category?.name === categoryFilter : true;
        const matchesSearch = searchTerm ?
            (order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.project_code.toLowerCase().includes(searchTerm.toLowerCase())) : true;
        return matchesStatus && matchesCategory && matchesSearch;
    });

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
        <div className="landing-page min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">
            <Header />
            <div className="container mx-auto px-4 !pt-24 !pb-8 lg:!pt-32 lg:!pb-12 flex flex-col lg:flex-row gap-8 lg:gap-12">

                {/* Sidebar */}
                <aside className="w-full lg:w-80 shrink-0 space-y-8">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left pl-4">
                        <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 overflow-hidden relative group">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user.vorname || user.first_name || "Имя"} {user.nachname || user.last_name || "Фамилия"}</h2>
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
                                <select
                                    className="h-12 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 focus:outline-none focus:border-[#7C3AED]"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Статус заказа</option>
                                    <option value="In Bearbeitung">В работе</option>
                                    <option value="Abgeschlossen">Завершен</option>
                                    <option value="Geplant">Geplant</option>
                                </select>
                                <select
                                    className="h-12 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 focus:outline-none focus:border-[#7C3AED]"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">Категория услуги</option>
                                    <option value="Sanitaire">Сантехника</option>
                                    <option value="Renovation">Ремонт</option>
                                    {/* Ideally fetch categories dynamically too */}
                                </select>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Поиск по номеру заказа"
                                        className="w-full h-12 pl-12 pr-4 rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-[#7C3AED]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Order List */}
                            <div className="space-y-4">
                                {loading && <div className="text-center py-8 text-slate-500">Загрузка...</div>}
                                {!loading && filteredOrders.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">Заказов не найдено.</div>
                                )}
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="bg-[#F8F7FF] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="space-y-4 flex-1">
                                            <div className="font-bold text-slate-900 text-lg">{order.status}</div>
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-900 mb-2">{order.name}</h3>
                                                <div className="text-slate-500 text-sm space-y-1">
                                                    <p>Категория заказа: {order.category?.name || "Общее"}</p>
                                                    <p>Номер заказа: {order.project_code || order.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-32 h-24 bg-slate-200 rounded-xl shrink-0" style={{ backgroundColor: order.color || '#e2e8f0' }}></div>
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
                                        <span className="font-medium text-slate-900 w-1/3">Имя</span>
                                        {isEditingProfile ? (
                                            <Input
                                                value={profileForm.vorname}
                                                onChange={e => setProfileForm({ ...profileForm, vorname: e.target.value })}
                                                className="flex-1 h-8"
                                            />
                                        ) : (
                                            <span className="text-slate-600 text-right flex-1">{user.vorname || user.first_name}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="font-medium text-slate-900 w-1/3">Фамилия</span>
                                        {isEditingProfile ? (
                                            <Input
                                                value={profileForm.nachname}
                                                onChange={e => setProfileForm({ ...profileForm, nachname: e.target.value })}
                                                className="flex-1 h-8"
                                            />
                                        ) : (
                                            <span className="text-slate-600 text-right flex-1">{user.nachname || user.last_name}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="font-medium text-slate-900 w-1/3">Email</span>
                                        {isEditingProfile ? (
                                            <Input
                                                value={profileForm.email}
                                                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                                className="flex-1 h-8"
                                            />
                                        ) : (
                                            <span className="text-slate-600 text-right flex-1">{user.email}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                        <span className="text-slate-400 text-sm">ID {user.id || "000000000"}</span>
                                    </div>
                                </div>

                                {isEditingProfile ? (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="flex-1 h-12 rounded-xl bg-[#7C3AED] text-white font-medium hover:bg-[#6D28D9] transition-colors"
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            onClick={() => setIsEditingProfile(false)}
                                            className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="w-full h-12 rounded-xl border border-[#7C3AED] text-[#7C3AED] font-medium hover:bg-violet-50 transition-colors"
                                    >
                                        Редактировать
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">История заявок</h2>
                            {requests.length === 0 ? (
                                <p className="text-slate-500 text-center py-20">У вас пока нет активных заявок.</p>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => (
                                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-slate-900">{req.reason}</h3>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${req.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mb-4">{req.message}</p>
                                            <p className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Поддержка</h2>
                            <p className="text-slate-500">Свяжитесь с нами: support@empire-premium.de</p>
                            <a href="mailto:support@empire-premium.de" className="text-[#7C3AED] font-medium mt-4 inline-block">
                                Написать письмо
                            </a>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}
