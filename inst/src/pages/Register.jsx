import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { createPageUrl } from "../utils";
import api from '@/lib/api';
import './Home.css';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        vorname: '',
        nachname: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                vorname: formData.vorname,
                nachname: formData.nachname,
                is_active: true,
                is_superuser: false
            });
            // Auto login or redirect to login? Redirect for safety.
            navigate(createPageUrl("Login"));
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <div className="landing-page min-h-screen flex text-slate-900 bg-slate-50">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placehold.co/1200x1200/0f172a/ffffff?text=Join+Us')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-10 p-12 text-white max-w-lg text-center">
                    <h1 className="text-4xl font-bold mb-6">Присоединяйтесь к Empire Premium</h1>
                    <p className="text-xl text-slate-300">
                        Создайте аккаунт, чтобы получить доступ к эксклюзивным функциям и управлению.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md space-y-8 py-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">Регистрация</h2>
                        <p className="mt-2 text-slate-500">Заполните форму ниже для создания аккаунта</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vorname">Имя</Label>
                                <Input id="vorname" placeholder="Иван" className="h-11" onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nachname">Фамилия</Label>
                                <Input id="nachname" placeholder="Иванов" className="h-11" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Имя пользователя</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input id="username" placeholder="ivan_user" className="pl-10 h-11" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input id="email" type="email" placeholder="ivan@example.com" className="pl-10 h-11" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Повторите пароль</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-10 h-11" onChange={handleChange} required />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base btn--primary" disabled={loading}>
                            {loading ? "Регистрация..." : "Создать аккаунт"} <UserPlus className="ml-2 w-4 h-4" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Уже есть аккаунт?{" "}
                        <Link to={createPageUrl("Login")} className="font-semibold text-accent-purple hover:underline">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
