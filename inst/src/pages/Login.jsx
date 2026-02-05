import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Check } from "lucide-react";
import { createPageUrl } from "../utils";
import './Home.css'; // Reuse design system

export default function Login() {
    const { login, isLoadingAuth } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const user = await login(formData.username, formData.password);
        setLoading(false);
        if (user) {
            // Check for admin/dashboard access roles
            const dashboardRoles = ["Admin", "Projektleiter", "Gruppenleiter", "Worker", "Büro", "Warehouse"];
            if (user.is_superuser || (user.position && dashboardRoles.includes(user.position))) {
                navigate(createPageUrl("Dashboard"));
            } else {
                navigate(createPageUrl("Profile"));
            }
        } else {
            setError('Неверное имя пользователя или пароль');
        }
    };

    return (
        <div className="landing-page min-h-screen flex text-slate-900 bg-slate-50">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placehold.co/1200x1200/1e1b4b/ffffff?text=Empire+Premium')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <h1 className="text-4xl font-bold mb-6">Empire Premium</h1>
                    <p className="text-xl text-slate-300 mb-8">
                        Строим будущее вместе. Управляйте своими проектами, заявками и клиентами в одном месте.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                                <Check className="w-5 h-5" />
                            </div>
                            <span>Удобное управление проектами</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                                <Check className="w-5 h-5" />
                            </div>
                            <span>Быстрая обработка заявок</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">Добро пожаловать</h2>
                        <p className="mt-2 text-slate-500">Войдите в свой аккаунт для продолжения</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Имя пользователя (Email)</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="name@example.com"
                                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-accent-purple focus:ring-accent-purple"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Пароль</Label>
                                <a href="#" className="text-sm font-medium text-accent-purple hover:underline">
                                    Забыли пароль?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-accent-purple focus:ring-accent-purple"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base btn--primary"
                            disabled={loading || isLoadingAuth}
                        >
                            {loading ? "Вход..." : "Войти"} <LogIn className="ml-2 w-4 h-4" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Нет аккаунта?{" "}
                        <Link to={createPageUrl("Register")} className="font-semibold text-accent-purple hover:underline">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
