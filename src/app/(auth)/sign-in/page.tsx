import { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | CampusNav",
  description: "Sign in to your CampusNav account.",
};

export default function SignInPage() {
  return <SignInForm />;
}
