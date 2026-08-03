import { Badge } from "@/components/ui/badge";
import { getAnnotationTagColor } from "@/features/annotations/lib/tag-colors";

export function TagBadge({
  tag,
  className,
}: {
  tag: { color: string; label: string; slug?: string };
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-none font-mono text-[9px] uppercase ${className ?? ""}`}
      style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
    >
      <span className="h-1.5 w-1.5 shrink-0" style={{ backgroundColor: getAnnotationTagColor(tag) }} aria-hidden />
      {tag.label}
    </Badge>
  );
}
