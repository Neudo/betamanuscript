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
      className={`rounded-none font-mono text-[9px] uppercase ${className ?? ""}`}
      style={{ borderColor: tag.color, color: tag.color }}
    >
      {tag.label}
    </Badge>
  );
}
