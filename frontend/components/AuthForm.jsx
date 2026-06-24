//AuthForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

// Validation Schema
const getSchema = (showUsername) =>
  Yup.object().shape({
    username: showUsername
      ? Yup.string()
        .required("Username is required")
      : Yup.string().notRequired(),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email address"),
    password: Yup.string().required("Password is required"),
  });

export default function AuthForm({
  mode = "login",
  title,
  showUsername,
  submitText,
  footerText,
  footerAction,
  onSubmit,
}) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getSchema(showUsername)),
  });

  const submitForm = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleFacebook = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
  };

  return (
    <div className="auth-page">
      <div className="auth-video-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          className="auth-video"
        >
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
          <h2 className="auth-heading">{title}</h2>

          <form onSubmit={handleSubmit(submitForm)}>
            {showUsername && (
              <>
                <input
                  className="auth-input"
                  placeholder="Username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="auth-error">{errors.username.message}</p>
                )}
              </>
            )}

            <input
              className="auth-input"
              placeholder="Email"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="auth-error">{errors.email.message}</p>
            )}

            <div className="auth-password-box">
              <input
                type={showPass ? "text" : "password"}
                className="auth-input"
                placeholder="Password"
                {...register("password")}
              />
              <span
                className="auth-eye"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </span>
            </div>
            {errors.password && (
              <p className="auth-error">{errors.password.message}</p>
            )}

            {mode === "login" && (
              <p
                className="auth-forgot"
                onClick={() => router.push("/auth/forgot-password")}
              >
                Forgot password?
              </p>
            )}

            <button type="submit" className="auth-button">
              {submitText}
            </button>
          </form>

          <div className="auth-divider">or continue with</div>

          <button type="button" className="auth-google-btn" onClick={handleGoogle}>
            <FcGoogle size={20} />
            Continue with Google
          </button>
          <button type="button" className="auth-fb-btn" onClick={handleFacebook}>
            <FaFacebookF size={20} style={{ color: "var(--oauth-facebook-icon)" }} />
            Continue with Facebook
          </button>

          <p className="auth-link" onClick={footerAction}>
            {footerText}
          </p>
        </div>

        <div className="auth-card__right">
          <img
            src="/right-side.jpg"
            alt="medprep.study"
            className="auth-card__image"
          />
        </div>
      </div>
    </div>
  );
}
