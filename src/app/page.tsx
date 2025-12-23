import { Navbar } from "@/components/ui/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-radial-[at_50%_0%] from-indigo-950/20 to-transparent">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              Gestiona tus pedidos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                con elegancia
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              La plataforma integral para optimizar tus ventas, seguimiento de clientes y control de producción.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Comenzar ahora
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 border-t border-white/5 bg-slate-950/50">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Catálogo Digital"
              description="Muestra tus productos con un diseño impecable para que tus clientes elijan lo mejor."
            />
            <FeatureCard
              title="Control de Pagos"
              description="Gestiona señas, pagos parciales y totales con un historial claro por cliente."
            />
            <FeatureCard
              title="Segimiento en Tiempo Real"
              description="Visualiza el estado de cada pedido y optimiza tus tiempos de entrega."
            />
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-white/5 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} GestiónPedidos. Todos los derechos reservados.
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 transition-colors">
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
