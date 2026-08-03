import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  ariaLabel?: string;
  className?: string;
  href?: string;
  imageClassName?: string;
  priority?: boolean;
  isSmall?: boolean;
};

export function BrandLogo({
  ariaLabel = "BetaManuscript home",
  className,
  href,
  imageClassName,
  priority = false,
  isSmall = false,
}: BrandLogoProps) {
  const logo = (
    <span className="brand-logo inline-flex shrink-0">
      <Image
        src={isSmall ? "/logo-small.svg" : "/logo-full.svg"}
        alt="BetaManuscript brand logo"
        width={220}
        height={110}
        priority={priority}
        className={cn("w-auto dark:hidden", imageClassName)}
      />
      <Image
        src={isSmall ? "/logo-dark-small.svg" : "/logo-dark.svg"}
        alt="BetaManuscript brand logo"
        width={220}
        height={110}
        priority={priority}
        className={cn("hidden h-14 w-auto dark:block", imageClassName)}
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
