"use client";

import { useState } from "react";
import { FaUser, FaSignOutAlt, FaCogs, FaLanguage, FaKeyboard, FaGlobe, FaMoon, FaCheckCircle } from "react-icons/fa";
import { MdSwitchAccount, MdDataUsage, MdHelpOutline, MdAddHome } from "react-icons/md";
import { SiYoutubestudio } from "react-icons/si";
import { TbPremiumRights } from "react-icons/tb";
import styles from "../styles/UserAccount.module.css";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

// Wait for the globally-loaded SDK; inject it on demand if missing (e.g. blocked first load).
function ensureSdk(timeoutMs = 8000) {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    if (!existing) {
      const s = document.createElement("script");
      s.src = CHECKOUT_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
    const start = Date.now();
    const tick = () => {
      if (window.Razorpay) return resolve(true);
      if (Date.now() - start > timeoutMs) return resolve(false);
      setTimeout(tick, 150);
    };
    tick();
  });
}

const UserAccount = ({ onClose, user, onSignOut }) => {
  const [isPremium, setIsPremium] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("isPremiumUser") === "true"
  );
  const [busy, setBusy] = useState(false);

  const handlePremiumClick = async () => {
    if (busy) return;
    if (isPremium) {
      if (window.confirm("Cancel premium and go back to 1 free download per day?")) {
        localStorage.setItem("isPremiumUser", "false");
        setIsPremium(false);
      }
      return;
    }

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
    if (!key) {
      alert("Razorpay key missing. Add NEXT_PUBLIC_RAZORPAY_KEY to .env.local and restart.");
      return;
    }

    setBusy(true);
    const ready = await ensureSdk();
    setBusy(false);
    if (!ready) {
      alert(
        "Couldn't load the Razorpay payment window (checkout.js). Check your connection or ad-blocker and try again."
      );
      return;
    }

    const rzp = new window.Razorpay({
      key,
      amount: 19900, // Rs.199 in paise
      currency: "INR",
      name: "YourTube Premium",
      description: "Unlimited downloads for 1 month",
      // NOTE: production apps create an order_id on the server and pass it here.
      // Without one, Razorpay runs a standalone test checkout — fine for test keys.
      prefill: {
        name: "Ethan Carter",
        email: "ethancarter@gmail.com",
        contact: "9999999999",
      },
      notes: { plan: "premium_monthly" },
      theme: { color: "#ff0000" },
      retry: { enabled: true, max_count: 3 },
      handler: function (response) {
        localStorage.setItem("isPremiumUser", "true");
        setIsPremium(true);
        alert(
          `Payment successful!${response?.razorpay_payment_id ? `\nPayment ID: ${response.razorpay_payment_id}` : ""}\nUnlimited downloads unlocked.`
        );
        onClose?.();
      },
      modal: {
        // Silent dismiss — no nag alert when the user just closes the window.
        ondismiss: function () {},
      },
    });

    rzp.on("payment.failed", function (resp) {
      const reason =
        resp?.error?.description ||
        resp?.error?.reason ||
        "Payment failed. No charge was made.";
      alert(`Payment failed: ${reason}\n(This test key may be deactivated — use your own key from dashboard.razorpay.com.)`);
    });

    rzp.open();
  };

  return (
    <div className={styles.userAccount}>
      <div className={styles.userInfo}>
        <FaUser className={styles.icon} />
        <div style={{ flex: 1 }}>
          <p className={styles.userName}>
            {user ? user.email?.split("@")[0] : "Ethan Carter"}{" "}
            {isPremium && (
              <span className={styles.premiumBadge}>
                <FaCheckCircle size={12} /> PREMIUM
              </span>
            )}
          </p>
          <p className={styles.userEmail}>{user ? user.email : "ethancarter@gmail.com"}</p>
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose}>
              Close ✕
            </button>
          )}
        </div>
      </div>

      <hr className={styles.divider} />

      <ul className={styles.options}>
        <li onClick={handlePremiumClick} style={{ opacity: busy ? 0.6 : 1 }}>
          <TbPremiumRights className={styles.icon} />
          <span>
            {busy
              ? "Loading payment…"
              : isPremium
                ? "Premium active — tap to cancel"
                : "Premium Package (at Rs.199/month)"}
          </span>
        </li>
        <li>
          <SiYoutubestudio className={styles.icon} />
          <span>YouTube Studio</span>
        </li>
        <li>
          <MdSwitchAccount className={styles.icon} />
          <span>Switch account</span>
        </li>
        <li onClick={() => (onSignOut ? onSignOut() : alert("Signed out (demo account)."))}>
          <FaSignOutAlt className={styles.icon} />
          <span>{user ? "Sign out" : "Sign out"}</span>
        </li>
      </ul>

      <hr className={styles.divider} />

      <ul className={styles.options}>
        <li>
          <MdAddHome className={styles.icon} />
          <span>Purchases and memberships</span>
        </li>
        <li>
          <MdDataUsage className={styles.icon} />
          <span>Your data in YouTube</span>
        </li>
        <li>
          <FaCogs className={styles.icon} />
          <span>Settings</span>
        </li>
        <li>
          <FaMoon className={styles.icon} />
          <span>Appearance: Device theme</span>
        </li>
        <li>
          <FaLanguage className={styles.icon} />
          <span>Language: English (India)</span>
        </li>
        <li>
          <FaGlobe className={styles.icon} />
          <span>Location: India</span>
        </li>
        <li>
          <FaKeyboard className={styles.icon} />
          <span>Keyboard shortcuts</span>
        </li>
        <li>
          <MdHelpOutline className={styles.icon} />
          <span>Help</span>
        </li>
      </ul>
    </div>
  );
};

export default UserAccount;
