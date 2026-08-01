import { Badge } from "@/components/ui/badge";

export function TagBadge({
  tag,
  className,
}: {
  tag: { color: string; label: string };
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-none font-mono text-[9px] uppercase ${className ?? ""}`}
      style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
    >
      <span className="h-1.5 w-1.5 shrink-0" style={{ backgroundColor: tag.color }} aria-hidden />
      {tag.label}
    </Badge>
  );
}
