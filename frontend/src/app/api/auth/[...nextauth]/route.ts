import axios from "axios";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import Credentials, { CredentialsProvider } from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                    placeholder: 'joendoe@gmail.com',
                },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;
                const { email, password } = credentials;
                try {
                    const res = await axios.post('http://localhost:5000/auth/login', {
                        email,
                        password
                    });
                    const user = res.data;
                    return user;

                } catch (error) {
                    console.error("Login failed: ", error);
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            console.log({ token, user });
            if (user) return {...token, ...user};

            return token;
        },

        async session({ token, session }) {
            session.user = token.user;
            session.backendTokens = token.backendTokens;

            return session;
        }
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };