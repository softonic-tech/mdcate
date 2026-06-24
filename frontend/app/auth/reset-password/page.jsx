"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { resetPasswordApi } from "@/api/auth.api";

const schema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

function ResetPasswordForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    if (!token) {
      return toast.error("Reset token is missing. Check your email link.");
    }

    try {
      setLoading(true);
      setSuccess("");
      await resetPasswordApi(token, data.password);
      setSuccess("Password reset successfully! You can now log in.");
      toast.success("Password reset! Redirecting to login...");
    } catch (err) {
      toast.error(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-video-bg">
        <video autoPlay muted loop playsInline poster="/images/hero-poster.jpg" className="auth-video">
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="auth-video-overlay" />
      </div>

      <div className="auth-particles">
        <div className="auth-particle auth-particle--1" />
        <div className="auth-particle auth-particle--2" />
        <div className="auth-particle auth-particle--3" />
        <div className="auth-particle auth-particle--4" />
      </div>

      <Link href="/" className="auth-back-home">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 10H5m0 0l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Home
      </Link>

      <div className="auth-theme-toggle">
        <ThemeToggle className="theme-toggle--navbar" size={18} />
      </div>

      <div className="auth-card">
        <div className="auth-card__left">
          <h2 className="auth-heading">Reset Password</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="auth-password-box">
              <input
                type={showPass ? "text" : "password"}
                className="auth-input"
                placeholder="New Password"
                {...register("password")}
              />
              <span className="auth-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </span>
            </div>
            {errors.password && <p className="auth-error">{errors.password.message}</p>}

            <div className="auth-password-box">
              <input
                type={showConfirmPass ? "text" : "password"}
                className="auth-input"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
              <span className="auth-eye" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </span>
            </div>
            {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword.message}</p>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {success && <p className="auth-success">{success}</p>}

          <p className="auth-link">
            <Link href="/auth/login">← Back to Login</Link>
          </p>
        </div>

        <div className="auth-card__right">
          <img src="/right-side.jpg" alt="medprep.study" className="auth-card__image" />
        </div>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__left">
          <h2 className="auth-heading">Reset Password</h2>
          <p className="auth-link">Loading...</p>
        </div>
        <div className="auth-card__right">
          <img src="/right-side.jpg" alt="medprep.study" className="auth-card__image" />
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
