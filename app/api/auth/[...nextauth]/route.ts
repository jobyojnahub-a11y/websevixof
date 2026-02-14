import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { config } from "@/lib/config";

const authOptions: NextAuthOptions = {
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
        // Set all required fields explicitly
        token.sub = (user as any).id || (user as any).sub; // User ID for NextAuth
        token.email = (user as any).email || token.email; // Email
        token.name = (user as any).name || (user as any).fullName || token.name; // Name
        (token as any).role = (user as any).role; // Role
        (token as any).uid = (user as any).id || (user as any).sub; // User ID (custom field)
        (token as any).id = (user as any).id || (user as any).sub; // User ID (alternative)
      }
      // Ensure sub is always set, even on subsequent calls
      if (!token.sub && (token as any).uid) {
        token.sub = (token as any).uid;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

