"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthForm from "@/components/AuthForm";
import { signupApi } from "@/api/auth.api";

export default function Signup() {
  const router = useRouter();

  const handleSignup = async (formData) => {
    try {
      await signupApi(formData);
      toast.success("Account created! Please log in.");
      router.push("/auth/login");
    } catch (err) {
      toast.error(err?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <AuthForm
      mode="signup"
      title="SIGN UP"
      showUsername={true}
      submitText="Create Account"
      footerText="Already have an account? Login"
      footerAction={() => router.push("/auth/login")}
      onSubmit={handleSignup}
    />
  );
}
