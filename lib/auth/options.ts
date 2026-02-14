import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { config } from "@/lib/config";

export const authOptions: NextAuthOptions = {
  secret: config.NEXTAUTH_SECRET,
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
          sub: user._id.toString(), // Also set sub field
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial login - set all fields from user object
        const userId = (user as any).id || (user as any).sub || user.id;
        token.sub = userId; // User ID for NextAuth (required field)
        token.email = (user as any).email || user.email || token.email;
        token.name = (user as any).name || (user as any).fullName || user.name || token.name;
        (token as any).role = (user as any).role;
        (token as any).uid = userId; // User ID (custom field)
        (token as any).id = userId; // User ID (alternative)
      } else {
        // Subsequent requests - ensure sub is always set from any available source
        if (!token.sub) {
          // Try to get sub from other fields
          token.sub = (token as any).uid || (token as any).id || token.sub;
        }
        // Ensure uid and id are also set if they're missing
        if (!(token as any).uid && token.sub) {
          (token as any).uid = token.sub;
        }
        if (!(token as any).id && token.sub) {
          (token as any).id = token.sub;
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = (token as any).role;
      (session.user as any).id = (token as any).uid || token.sub;
      (session.user as any).sub = token.sub; // Ensure sub is in session
      return session;
    },
  },
  pages: {
    signIn: "/client/auth",
  },
};
