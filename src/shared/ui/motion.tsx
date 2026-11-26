"use client";

import { type HTMLAttributes, type CSSProperties, useCallback, useEffect, useRef } from "react";

type RevealTag = "article" | "div" | "li" | "h2";
type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  order?: number;
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
  order = 0,
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
      data-editorial-reveal={Tag === "h2" ? "heading" : ""}
      className={className}
      style={{ ...style, "--editorial-delay": `${Math.max(0, Math.min(order, 4)) * 110}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

function Lift({ className, ...props }: Omit<RevealProps, "as">) {
  return <Reveal {...props} className={`${className ?? ""} editorial-lift`} />;
}

export { Lift, Reveal };
