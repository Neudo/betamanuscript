"use client";

import { FormEvent, useState } from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { submitWaitlist } from "../api/submit-waitlist";
import { CARD, INK, MONO, OXBLOOD, PAPER, SANS, premiumEase } from "../../../shared/config/design-tokens";

function WaitlistForm({ label = "Join the waitlist", dark = false }: { label?: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const reduceMotion = useReducedMotion();

  async function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await submitWaitlist({
        email: normalizedEmail,
        source: "betaquill-waitlist",
        submittedAt: new Date().toISOString(),
        formStartedAt,
        website,
      });

      setStatus("success");
      setMessage("You're on the list. Check your inbox for the discount note.");
      setEmail("");
      setWebsite("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something failed. Try again in a few seconds.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2.5 py-3" style={{ color: dark ? PAPER : OXBLOOD }}>
        <Check size={14} strokeWidth={2.5} />
        <span className="text-sm" style={{ fontFamily: MONO }}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleWaitlistSubmit}
      className="flex flex-col sm:flex-row"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="sr-only"
        aria-hidden="true"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status !== "loading") {
            setStatus("idle");
            setMessage("");
          }
        }}
        placeholder="your@email.com"
        className="flex-1 px-4 py-3 text-sm border-y border-l focus:outline-none transition-colors"
        style={{
          background: dark ? "rgba(253,250,244,0.06)" : CARD,
          borderColor: dark ? "rgba(245,240,232,0.18)" : "rgba(28,24,18,0.2)",
          color: dark ? PAPER : INK,
          fontFamily: SANS,
        }}
      />
      <motion.button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-3 text-sm font-medium transition-colors cursor-pointer border whitespace-nowrap"
        whileHover={reduceMotion ? undefined : { y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.24, ease: premiumEase }}
        style={{
          background: dark ? PAPER : OXBLOOD,
          color: dark ? OXBLOOD : PAPER,
          borderColor: dark ? PAPER : OXBLOOD,
          fontFamily: SANS,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = dark ? "#EDE8DC" : "#691919";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = dark ? PAPER : OXBLOOD;
        }}
      >
        {status === "loading" ? "Joining..." : label}
      </motion.button>
      {status === "error" && (
        <p
          className="sm:col-span-2 mt-2 text-[11px]"
          style={{ color: dark ? "#F5B7B1" : OXBLOOD, fontFamily: MONO }}
          role="alert"
        >
          {message}
        </p>
      )}
    </form>
  );
}



export { WaitlistForm };
