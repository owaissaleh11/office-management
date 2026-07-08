import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

/**
 * Full NextAuth configuration with providers.
 * This runs on the Node.js runtime (not Edge).
 *
 * TODO: Replace the mock authorize function with real database lookup + bcrypt
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        // Log login activity without awaiting to avoid blocking login
        import("@/actions/activity").then(({ logActivity }) => {
          logActivity(user.id, "تسجيل الدخول", "النظام", "تسجيل دخول ناجح");
        }).catch(console.error);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});
