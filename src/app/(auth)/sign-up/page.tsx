import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up | CampusNav",
  description: "Create your CampusNav account and start designing.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
