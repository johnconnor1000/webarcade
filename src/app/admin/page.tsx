import { auth } from "@/auth";

export default async function AdminDashboardPage() {
    const session = await auth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Hola, {session?.user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-400 mt-2">
                    Aquí tienes un resumen de la actividad de tu negocio hoy.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Pedidos Pendientes" value="12" change="+2 nuevos" intent="alert" />
                <StatCard title="En Producción" value="5" change="A tiempo" intent="neutral" />
                <StatCard title="Ingresos del Mes" value="$1.2M" change="+15% vs mes anterior" intent="success" />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h2>
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-white/5 rounded-lg">
                    No hay actividad reciente para mostrar.
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, intent }: { title: string, value: string, change: string, intent: 'neutral' | 'success' | 'alert' }) {
    const intentColors = {
        neutral: "text-slate-400",
        success: "text-green-400",
        alert: "text-amber-400"
    }

    return (
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/20 transition-colors">
            <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className={`text-sm mt-2 ${intentColors[intent]}`}>{change}</div>
        </div>
    )
}
