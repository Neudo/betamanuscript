import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tagColors } from "../data/mock-dashboard";
import type { AnnotationTag } from "../types";

export function TagBadge({ tag, className }: { tag: AnnotationTag; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-none font-mono text-[9px] uppercase", tagColors[tag], className)}>
      {tag}
    </Badge>
  );
}
