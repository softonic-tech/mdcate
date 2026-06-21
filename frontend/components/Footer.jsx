"use client";

import { memo } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dash-footer">
      <div className="dash-footer__inner">
        <p className="dash-footer__copyright">
          &copy; {year} MedPrep Pro. All rights reserved.
        </p>
        <div className="dash-footer__links">
          <Link href="/dashboard/contact">Support</Link>
          <span className="dash-footer__dot">&middot;</span>
          <a href="mailto:support@medpreppro.com">Email Us</a>
          <span className="dash-footer__dot">&middot;</span>
          <span className="dash-footer__made">
            Made with <Heart size={12} className="dash-footer__heart" /> for MDCAT aspirants
          </span>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
