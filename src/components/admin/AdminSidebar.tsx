'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';

interface NavItemProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

function NavItem({ href, label, icon, onClick }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <NextLink
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive
                ? 'bg-primary/10 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            {label}
        </NextLink>
    );
}

export function AdminSidebar({
    user,
    signOutAction
}: {
    user: any;
    signOutAction: () => Promise<void>
}) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden h-16 border-b border-white/5 bg-slate-950 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
                <div className="flex items-center gap-2">
                    <NextLink href="/admin" className="text-lg font-bold tracking-tight text-white">
                        Arcade
                    </NextLink>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-600 font-mono leading-none">v1.0.13-variants</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-slate-400 hover:text-white"
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    )}
                </button>
            </header>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-slate-950 flex flex-col transition-transform duration-300 transform
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:flex
            `}>
                <div className="p-6 h-16 hidden lg:flex items-center border-b border-white/5">
                    <NextLink href="/admin" className="text-xl font-bold tracking-tight text-white">
                        Arcade
                    </NextLink>
                    <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-600 font-mono leading-none">v1.0.12-fixed-db</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 lg:mt-0">
                    <NavItem href="/admin" label="Dashboard" icon={<HomeIcon />} onClick={closeSidebar} />
                    <NavItem href="/admin/stats" label="Estadísticas" icon={<ChartBarIcon />} onClick={closeSidebar} />
                    <NavItem href="/admin/orders" label="Pedidos" icon={<ClipboardIcon />} onClick={closeSidebar} />
                    <NavItem href="/admin/production" label="Producción" icon={<WrenchIcon />} onClick={closeSidebar} />
                    <NavItem href="/admin/products" label="Productos" icon={<CubeIcon />} onClick={closeSidebar} />
                    <NavItem href="/admin/clients" label="Clientes" icon={<UsersIcon />} onClick={closeSidebar} />
                    <NavItem href="/admin/payments" label="Pagos" icon={<CurrencyIcon />} onClick={closeSidebar} />
                </nav>

                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-primary font-bold">
                            {user?.name?.[0] || "A"}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <form action={async () => {
                        await signOutAction();
                    }}>
                        <button type="submit" className="w-full text-xs text-center py-2 text-slate-400 hover:text-white transition-colors border border-white/5 rounded-md hover:bg-white/5">
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}

// Icons (Moved from original layout)
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>;
const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.423 20.11l3.39-3.39a3 3 0 00-2.122-5.121H9.722a.75.75 0 00-.53.219L6.11 14.888a3 3 0 002.121 5.122h2.662a.75.75 0 00.53-.22zM12.357 16.94l3.39-3.39M15.357 13.94l3.39-3.39M18.357 10.94l3.39-3.39M4.357 18.94L7.747 15.55" /><circle cx="17.5" cy="6.5" r="2.5" stroke="currentColor" /></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v-.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const CurrencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
