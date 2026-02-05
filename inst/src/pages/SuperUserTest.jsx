import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User, ShieldAlert } from "lucide-react";
import { createPageUrl } from "../utils";
import api from '@/lib/api';
import './Home.css';
import { useAuth } from '@/lib/AuthContext';
import { toast } from "sonner";

export default function SuperUserTest() {
    const navigate = useNavigate();
    const { login } = useAuth();
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
                is_superuser: true, // Force superuser
                position: "Admin"   // Force Admin position
            });

            toast.success("Superuser created successfully!");

            // Auto login
            const user = await login(formData.username, formData.password);
            if (user) {
                navigate(createPageUrl("Dashboard"));
            } else {
                navigate(createPageUrl("Login"));
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка регистрации');
            toast.error("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-slate-100">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-red-200">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Create Superuser</h2>
                    <p className="mt-2 text-red-500 font-medium">TEST ONLY - INTERNAL USE</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="vorname">Имя</Label>
                            <Input id="vorname" placeholder="Admin" className="h-11" onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nachname">Фамилия</Label>
                            <Input id="nachname" placeholder="User" className="h-11" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Имя пользователя</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input id="username" placeholder="admin_god" className="pl-10 h-11" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input id="email" type="email" placeholder="admin@example.com" className="pl-10 h-11" onChange={handleChange} required />
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
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11 text-base bg-red-600 hover:bg-red-700" disabled={loading}>
                        {loading ? "Creating..." : "Create Superuser"} <UserPlus className="ml-2 w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
