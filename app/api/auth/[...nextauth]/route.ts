import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password || "";
        const requestedRole = (credentials?.role as "client" | "admin" | undefined) || undefined;

        if (!email || !password) return null;
        await connectDB();
        const user = await User.findOne({ email });
        if (!user) return null;

        if (requestedRole && user.role !== requestedRole) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).uid = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = (token as any).role;
      (session.user as any).id = (token as any).uid;
      return session;
    },
  },
  pages: {
    signIn: "/client/auth",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

