"use client";

import { type HTMLAttributes, type CSSProperties, useCallback, useEffect, useRef } from "react";

type RevealTag = "article" | "div" | "li" | "section";
type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  delay?: number;
};

const targets = new WeakSet<Element>();
let revealObserver: IntersectionObserver | undefined;

function observeReveal(node: HTMLElement) {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  revealObserver ??= new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || !targets.has(entry.target)) continue;
      (entry.target as HTMLElement).dataset.editorialEntered = "true";
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -24px 0px" });

  targets.add(node);
  revealObserver.observe(node);
  return () => {
    targets.delete(node);
    revealObserver?.unobserve(node);
  };
}

function Reveal({
  as,
  children,
  className,
  delay = 0,
  style,
  ...props
}: RevealProps) {
  const Tag = as ?? "div";
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || node.dataset.editorialEntered) return;
    return observeReveal(node);
  }, [Tag]);

  return (
    <Tag
      {...props}
      ref={setRef}
      data-editorial-reveal=""
      className={className}
      style={{ ...style, "--editorial-delay": `${Math.max(0, Math.min(delay, 0.16))}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

function Lift({ className, delay, ...props }: Omit<RevealProps, "as">) {
  const classes = `${className ?? ""} editorial-lift`;
  return delay === undefined
    ? <div {...props} className={classes} />
    : <Reveal {...props} className={classes} delay={delay} />;
}

export { Lift, Reveal };
