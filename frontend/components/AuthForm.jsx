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
import styles from "@/styles/auth.module.css";


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

  // Form submit
  const submitForm = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  // Google Login
  const handleGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  // Facebook Login
  const handleFacebook = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
  };

  return (
    <div className={styles.container}>
      {/* Background Video */}
      <div className={styles.videoBg}>
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          className={styles.video}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay} />
      </div>

      {/* Floating Particles */}
      <div className={styles.particles}>
        <div className={`${styles.particle} ${styles.particle1}`} />
        <div className={`${styles.particle} ${styles.particle2}`} />
        <div className={`${styles.particle} ${styles.particle3}`} />
        <div className={`${styles.particle} ${styles.particle4}`} />
      </div>

      {/* Back to Home Button */}
      <Link href="/" className={styles.backToHome}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 10H5m0 0l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Home
      </Link>

      <div className={styles.card}>
        {/* LEFT FORM */}
        <div className={styles.left}>
          <h2 className={styles.heading}>{title}</h2>

          <form onSubmit={handleSubmit(submitForm)}>
            {showUsername && (
              <>
                <input
                  className={styles.input}
                  placeholder="Username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className={styles.error}>{errors.username.message}</p>
                )}
              </>
            )}

            <input
              className={styles.input}
              placeholder="Email"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className={styles.error}>{errors.email.message}</p>
            )}

            <div className={styles.passwordBox}>
              <input
                type={showPass ? "text" : "password"}
                className={styles.input}
                placeholder="Password"
                {...register("password")}
              />
              <span
                className={styles.eye}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </span>
            </div>
            {errors.password && (
              <p className={styles.error}>{errors.password.message}</p>
            )}

            {mode === "login" && (
              <p
                className={styles.forgot}
                onClick={() => router.push("/auth/forgot-password")}
              >
                Forgot password?
              </p>
            )}

            <button type="submit" className={styles.button}>
              {submitText}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>or continue with</div>

          {/* Social buttons */}
          <button type="button" className={styles.googleBtn} onClick={handleGoogle}>
            <FcGoogle size={20} />
            Continue with Google
          </button>
          <button type="button" className={styles.fbBtn} onClick={handleFacebook}>
            <FaFacebookF size={20} color="#4267B2" />
            Continue with Facebook
          </button>

          <p className={styles.link} onClick={footerAction}>
            {footerText}
          </p>
        </div>

        {/* RIGHT INFO */}
        <div className={styles.right}>
          <img 
            src="/right-side.jpg" 
            alt="MedPrep Pro" 
            className={styles.rightImage}
          />
        </div>
      </div>
    </div>
  );
}
