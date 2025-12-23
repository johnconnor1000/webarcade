import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");
            const isOnClient = nextUrl.pathname.startsWith("/client");

            console.log("Middleware Auth Check:", { pathname: nextUrl.pathname, isLoggedIn });

            // Protect admin and client routes - require authentication
            // Role verification will happen at the page level
            if (isOnAdmin || isOnClient) {
                if (!isLoggedIn) return false; // Redirect to login
                return true; // Let the page verify the role
            }

            return true;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
