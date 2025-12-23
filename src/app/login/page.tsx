'use client';

import Link from "next/link";
import { useActionState } from "react";
import { authenticate } from "@/lib/actions";

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-white mb-2">
                        Gestión<span className="text-primary">Pedidos</span>
                    </Link>
                    <h2 className="text-slate-400">Inicia sesión en tu cuenta</h2>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-2xl shadow-xl">
                    <form action={dispatch} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@ejemplo.com"
                                className="w-full px-4 py-3 rounded-lg bg-slate-950/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                    Contraseña
                                </label>
                                <Link href="#" className="text-sm text-primary hover:text-primary-hover transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg bg-slate-950/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                required
                                minLength={6}
                            />
                        </div>

                        <LoginButton isPending={isPending} />

                        {errorMessage && (
                            <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 p-3 rounded-lg text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p>{errorMessage}</p>
                            </div>
                        )}
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    ¿No tienes una cuenta?{" "}
                    <Link href="#" className="font-medium text-slate-400 hover:text-white transition-colors">
                        Contacta al administrador
                    </Link>
                </p>
            </div>
        </div>
    );
}

function LoginButton({ isPending }: { isPending: boolean }) {
    const pending = isPending;

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? "Verificando..." : "Ingresar"}
        </button>
    );
}
