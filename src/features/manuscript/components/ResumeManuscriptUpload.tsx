"use client";

import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heading } from "@/shared/ui/Heading";
import { importSourceDocument } from "../lib/source-document";
import { getManuscriptReference } from "../lib/manuscript-url";
import { CreateManuscriptDialog } from "./CreateManuscriptDialog";

export function ResumeManuscriptUpload({ id }: { id: string }) {
  const router = useRouter();
  const created = useRef(false);
  const upload = useQuery({
    queryKey: ["pending-manuscript-upload", id],
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/manuscript-uploads/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resume" }), signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not retrieve your manuscript.");
      if (result.completed) return { completed: true as const, manuscriptId: result.manuscriptId as string };
      const download = await fetch(result.signedUrl, { signal, cache: "no-store" });
      if (!download.ok) throw new Error("Could not download your saved manuscript. Please try again.");
      const file = new File([await download.blob()], result.filename, { type: result.mimeType });
      const chapters = await importSourceDocument(file);
      return { completed: false as const, file, chapters };
    },
  });
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Heading level={1} size="workspace">Your manuscript</Heading>
      {upload.isPending ? <p role="status" className="mt-4 text-sm text-muted-foreground">Retrieving your manuscript and detecting chapters…</p> : null}
      {upload.isError ? (
        <div className="mt-4 space-y-4">
          <p role="alert" className="text-sm text-destructive">{upload.error.message}</p>
          <Button variant="outline" onClick={() => void upload.refetch()}>Try again</Button>
          <Button asChild variant="ghost"><Link href="/dashboard">Go to your workspace</Link></Button>
        </div>
      ) : null}
      {upload.data?.completed ? <Button asChild className="mt-4"><Link href={`/dashboard/manuscript?manuscriptId=${encodeURIComponent(upload.data.manuscriptId)}`}>Open manuscript</Link></Button> : null}
      {upload.data && !upload.data.completed ? (
        <CreateManuscriptDialog
          key={id}
          open
          initialSource={upload.data}
          pendingUploadId={id}
          onOpenChange={(open) => { if (!open && !created.current) router.replace("/dashboard"); }}
          onCreated={(manuscript) => {
            created.current = true;
            const params = new URLSearchParams({ manuscript: getManuscriptReference({ title: manuscript.manuscriptTitle, urlKey: manuscript.manuscriptUrlKey }), versionId: manuscript.manuscriptVersionId });
            router.replace(`/dashboard/manuscript?${params}`);
          }}
        />
      ) : null}
    </main>
  );
}
