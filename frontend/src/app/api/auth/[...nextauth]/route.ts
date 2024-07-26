import { authOptions } from "@/app/lib/actions";
import axios from "axios";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import Credentials, { CredentialsProvider } from "next-auth/providers/credentials";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };