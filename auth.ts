import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});


export const {handlers, auth, signIn, signOut} = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {}
            },
            authorize: async (credentials) => {
                const parsed = await loginSchema.safeParseAsync(credentials)
                if (!parsed.success) {
                    return null
                }
                const {email, password} = parsed.data
                const user = await prisma.user.findUnique({
                    where: {
                        email 
                    }
                })
                if (!user) {
                    return null
                }
                const isValid = await bcrypt.compare(password, user.passwordhash)
                if (!isValid) {
                    return null
                }    

                return {id: user.id, email: user.email, name: user.name, role: user.role}
            }
        })
    ],
    callbacks: {
        jwt ({token, user}) {
            if (user) token.role = user.role;
            return token;
        },
        session ({session, token}) {
            if (token.role) session.user.role = token.role;
            return session;
        }
    }
})