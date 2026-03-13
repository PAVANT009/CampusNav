"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { goeyToast } from "goey-toast";

type SocialProvider = "google" | "github";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
    null,
  );

  // Optimized social sign-up handler (uses same method as sign-in)
  const handleSocialSignUp = useCallback(async (provider: SocialProvider) => {
    setSocialLoading(provider);

    try {
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
        errorCallbackURL: "/sign-up?error=oauth_failed",
      });
    } catch (error) {
      console.error(`${provider} sign-up error:`, error);

      goeyToast.error("Sign-up failed", {
        description: `We couldn’t create your account using ${provider}. Please try again.`,
      });

      setSocialLoading(null);
    }
  }, []);

  // Email sign-up handler
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Client-side validation
    if (password.length < 8) {
      goeyToast.error("Weak password", {
        description: "Password must be at least 8 characters long.",
      });

      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        name,
        email,
        password,
        // TODO: change this 
        callbackURL: "/",
      });

      if (result.error) {
        goeyToast.error("Account creation failed", {
          description:
            result.error.message ||
            "We couldn&apos;t create your account. Please try again.",
        });

        setIsLoading(false);
        return;
      }

      goeyToast.success("Account created 🎉", {
        description: "Welcome! Your account has been successfully created.",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Sign-up error:", error);

      goeyToast.error("Something went wrong", {
        description: "Please try again in a moment.",
      });

      setIsLoading(false);
    }
  }

  const isDisabled = isLoading || socialLoading !== null;

  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto space-y-4 sm:w-sm"
    >
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="font-medium text-2xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/40">
          Create your account
        </h1>
        <p className="text-base text-muted-foreground">
          Start designing your system architecture
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Social Login Buttons */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignUp("google")}
            disabled={isDisabled}
          >
            {socialLoading === "google" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignUp("github")}
            disabled={isDisabled}
          >
            {socialLoading === "github" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GithubIcon className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
          </Button>
        </div>

        {/* Divider */}
        <div className="flex w-full items-center justify-center">
          <div className="h-px w-full bg-border" />
          <span className="px-2 text-muted-foreground text-xs whitespace-nowrap">
            OR
          </span>
          <div className="h-px w-full bg-border" />
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            required
            autoComplete="name"
            disabled={isDisabled}
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isDisabled}
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Min 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={isDisabled}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isDisabled}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Switch link */}
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="underline underline-offset-4 hover:text-primary transition-colors"
        >
          Sign in
        </Link>
      </p>

      {/* Terms */}
      <p className="text-muted-foreground text-sm">
        By clicking continue, you agree to our{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          href="/terms"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          href="/privacy"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </motion.div>
  );
}

// Reuse the same icons
const GoogleIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const GithubIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);
