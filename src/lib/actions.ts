'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const data = Object.fromEntries(formData);

        // Get user from database to check role BEFORE signing in
        const user = await prisma.user.findUnique({
            where: { email: data.email as string }
        });

        if (!user) {
            return 'Credenciales inválidas.';
        }

        // Redirect based on role
        const redirectTo = user.role === 'ADMIN' ? '/admin' : '/client';

        // Sign in with proper redirect
        await signIn('credentials', {
            ...data,
            redirectTo
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciales inválidas.'
                default:
                    return 'Algo salió mal.'
            }
        }
        throw error;
    }
}
