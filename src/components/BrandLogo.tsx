import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  ariaLabel?: string;
  className?: string;
  href?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  ariaLabel = "BetaManuscript home",
  className,
  href,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const logo = (
    <span className="brand-logo inline-flex shrink-0">
      <Image
        src="/logo-full.svg"
        alt="BetaManuscript"
        width={303}
        height={90}
        priority={priority}
        className={cn("h-8 w-auto", imageClassName)}
      />
    </span>
  );

  if (!href) {
    return <div className={cn("flex items-center", className)}>{logo}</div>;
  }

  return (
    <Link href={href} className={cn("flex items-center", className)} aria-label={ariaLabel}>
      {logo}
    </Link>
  );
}
