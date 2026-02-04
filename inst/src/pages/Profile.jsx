import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Briefcase, Phone } from "lucide-react";
import './Home.css';

export default function Profile() {
    const { user, logout } = useAuth();

    if (!user) {
        return <div className="p-8">Загрузка профиля...</div>;
    }

    return (
        <div className="landing-page p-6 max-w-4xl mx-auto">
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
                                    @{user.username} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {user.position || "Пользователь"}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                            <LogOut className="w-4 h-4 mr-2" /> Выйти
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Личная информация</h3>

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
                                    <p className="text-slate-900">{user.position || "Не указана"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Статус аккаунта</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.is_active ? "Активен" : "Неактивен"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Безопасность</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
                                    <div>
                                        <p className="font-medium text-slate-900">Пароль</p>
                                        <p className="text-sm text-slate-500">Последнее изменение 30 дней назад</p>
                                    </div>
                                    <Button variant="outline" size="sm">Изменить</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
