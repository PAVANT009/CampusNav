import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Optional: Add password requirements
    // requireEmailVerification: true,
  },

  // Social authentication providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Optional: Request additional scopes
      // scope: ["openid", "email", "profile"],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // Optional: Request additional scopes
      // scope: ["user:email", "read:user"],
    },
  },

  // Session configuration with optimizations
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session age every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - reduces database lookups
    },
  },

  // Account linking configuration
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },

  // Security settings
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],

  // Optional: Add rate limiting for production
  // rateLimit: {
  //   window: 60, // 60 seconds
  //   max: 10, // 10 requests per window
  // },
});

// Export auth types for use in other files
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
