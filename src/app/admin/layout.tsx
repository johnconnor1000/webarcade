import { auth, signOut } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    async function handleSignOut() {
        'use server';
        await signOut({ redirectTo: "/login" });
    }

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
            <AdminSidebar
                user={session?.user}
                signOutAction={handleSignOut}
            />

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 lg:ml-0 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}



