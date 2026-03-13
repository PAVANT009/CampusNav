import { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up | Archway",
  description: "Create your Archway account and start designing.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
