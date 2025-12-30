import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.log("Authorize called with:", credentials);
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });
                console.log("DB User found:", user);

                if (!user) {
                    console.log("User not found in DB");
                    return null;
                }

                // Verify password with bcrypt
                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                console.log("Password valid:", isValid);

                if (isValid) {
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
                token.id = dbUser?.id
                token.role = dbUser?.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.id
                // @ts-ignore
                session.user.role = token.role
            }
            return session
        }
    }
});
