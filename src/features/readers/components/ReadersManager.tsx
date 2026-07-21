"use client";

import { Clock3, Mail, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteReaderDialog } from "@/features/dashboard/components/InviteReaderDialog";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { TagBadge } from "@/features/dashboard/components/TagBadge";
import { readers } from "@/features/dashboard/data/mock-dashboard";
import type { Reader } from "@/features/dashboard/types";

const statusStyles = {
  finished: "border-success/25 bg-success/10 text-success",
  reading: "border-sky-800/25 bg-sky-800/10 text-sky-900",
  inactive: "border-warning/25 bg-warning/10 text-warning",
};

export function ReadersManager() {
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const totalAnnotations = readers.reduce((total, reader) => total + reader.annotations, 0);

  return (
    <div className="min-h-full">
      <PageHeader
        eyebrow="Readers"
        title="Beta readers"
        actions={<InviteReaderDialog triggerVariant="default" />}
      />

      <div className="max-w-[1100px] space-y-6 p-5 sm:p-8">
        <section className="grid gap-3 sm:grid-cols-3">
          {[
            ["Total readers", "5"],
            ["Finished", "1 / 5"],
            ["Total annotations", String(totalAnnotations)],
          ].map(([label, value]) => (
            <div key={label} className="border border-foreground/10 bg-card p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
              <p className="mt-3 text-3xl font-normal">{value}</p>
            </div>
          ))}
        </section>

        <Card className="overflow-hidden border-foreground/10">
          <Table>
            <TableHeader className="bg-sidebar/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Reader</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Progress</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Annotations</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Last active</TableHead>
                <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readers.map((reader) => {
                const progress = Math.round((reader.chapter / 9) * 100);
                return (
                  <TableRow key={reader.id} className="cursor-pointer" onClick={() => setSelectedReader(reader)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full text-xs text-white" style={{ backgroundColor: reader.color }}>
                          {reader.initials}
                        </span>
                        <span>
                          <span className="block text-xs font-medium">{reader.name}</span>
                          <span className="block text-[10px] text-muted-foreground">{reader.email}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-none font-mono text-[8px] uppercase ${statusStyles[reader.status]}`}>
                        {reader.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-36">
                      <div className="flex items-center gap-3">
                        <Progress value={progress} className="h-1.5 w-24" />
                        <span className="font-mono text-[9px] text-muted-foreground">Ch {reader.chapter} / 9</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{reader.annotations}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{reader.lastActive}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label={`View ${reader.name}`} onClick={(event) => { event.stopPropagation(); setSelectedReader(reader); }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Alert className="border-warning/25 bg-warning/5">
          <Clock3 className="h-4 w-4 text-warning" />
          <AlertDescription>
            Tom W. has been inactive for 9 days. Consider sending a reminder or removing them from this round.
          </AlertDescription>
        </Alert>
      </div>

      <Sheet open={selectedReader !== null} onOpenChange={(open) => { if (!open) setSelectedReader(null); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedReader ? (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center text-sm text-white" style={{ backgroundColor: selectedReader.color }}>
                    {selectedReader.initials}
                  </span>
                  <div>
                    <SheetTitle className="text-[28px] font-medium">{selectedReader.name}</SheetTitle>
                    <SheetDescription>{selectedReader.email}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-8 grid grid-cols-3 gap-px border bg-border">
                {[
                  ["Annotations", selectedReader.annotations],
                  ["Chapter", `${selectedReader.chapter}/9`],
                  ["Last active", selectedReader.lastActive],
                ].map(([label, value]) => (
                  <div key={label} className="bg-card p-3 text-center">
                    <p className="font-mono text-[8px] uppercase text-muted-foreground">{label}</p>
                    <p className="mt-2 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Reading progress</span>
                  <span className="font-mono text-[9px] text-muted-foreground">{Math.round((selectedReader.chapter / 9) * 100)}%</span>
                </div>
                <Progress value={(selectedReader.chapter / 9) * 100} className="h-2" />
              </div>
              <div className="mt-7">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Most used tags</p>
                <div className="mt-3 flex gap-2">
                  <TagBadge tag="Strong line" />
                  <TagBadge tag="Emotional impact" />
                </div>
              </div>
              <blockquote className="mt-7 border-l-2 border-primary/40 pl-4 font-display text-lg italic leading-7 text-muted-foreground">
                “Finished this chapter in one sitting. The tension between the personal and political finally clicks.”
              </blockquote>
              <Button className="mt-8 w-full">
                <Mail className="h-4 w-4" />
                Send reminder
              </Button>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
