import Link from "next/link";
import { auth, signOut } from "@/auth";
import { CartProvider } from "@/contexts/CartContext";
import CartButton from "@/components/client/CartButton";

export default async function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <CartProvider>
            <div className="min-h-screen bg-background">
                {/* Top Navigation Bar */}
                <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <Link href="/client" className="text-xl font-bold tracking-tight text-white">
                                    Arcade
                                </Link>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 font-mono leading-none">v1.0.7-visible</span>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden md:flex items-center space-x-1">
                                <NavLink href="/client" label="Inicio" />
                                <NavLink href="/client/catalog" label="Catálogo" />
                                <NavLink href="/client/orders" label="Mis Pedidos" />
                                <NavLink href="/client/stats" label="Mis Estadísticas" />
                                <NavLink href="/client/statement" label="Estado de Cuenta" />
                                <NavLink href="/client/payments" label="Mis Pagos" />
                            </div>

                            {/* User Menu */}
                            <div className="flex items-center gap-4">
                                {/* Cart Button */}
                                <CartButton />

                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                                    <p className="text-xs text-slate-500">{session?.user?.email}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-primary font-bold">
                                    {session?.user?.name?.[0] || "C"}
                                </div>
                                <form action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: "/login" });
                                }}>
                                    <button
                                        type="submit"
                                        className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/5"
                                    >
                                        Salir
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Mobile Navigation */}
                        <div className="md:hidden flex items-center space-x-1 py-1 overflow-x-auto no-scrollbar border-t border-white/5 mt-1">
                            <NavLink href="/client" label="Inicio" />
                            <NavLink href="/client/catalog" label="Catálogo" />
                            <NavLink href="/client/orders" label="Pedidos" />
                            <NavLink href="/client/stats" label="Estadísticas" />
                            <NavLink href="/client/statement" label="Cuenta" />
                            <NavLink href="/client/payments" label="Pagos" />
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-white/5 mt-20 py-6 text-center text-sm text-slate-600">
                    &copy; {new Date().getFullYear()} GestiónPedidos. Todos los derechos reservados.
                </footer>
            </div>
        </CartProvider>
    );
}

function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
        >
            {label}
        </Link>
    );
}
