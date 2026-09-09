"use client";

import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Turnstile } from "@/features/account/components/Turnstile";
import { getSourceDocumentError, sourceDocumentAccept } from "../lib/source-document";
import { cn } from "@/lib/utils";

export function PublicManuscriptDropzone() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const running = useRef(false);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function selectFile(next: File) {
    if (running.current) return;
    const validation = getSourceDocumentError(next);
    setError(validation);
    if (validation) {
      setFile(null);
      return;
    }

    // A Turnstile token is single-use, so choosing a replacement must request
    // a fresh one before it can start an upload.
    setToken(null);
    setRefreshKey((value) => value + 1);
    setFile(next);
  }

  useEffect(() => {
    if (!file || !token || running.current) return;
    running.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    async function upload(selectedFile: File, captchaToken: string) {
      setError(null);
      setStatus("Preparing upload…");
      try {
        const response = await fetch("/api/manuscript-uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: selectedFile.name, size: selectedFile.size, captchaToken }), signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not prepare the upload.");
        if (controller.signal.aborted) return;
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;
          xhr.open("PUT", result.signedUrl);
          xhr.setRequestHeader("Content-Type", result.mimeType);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) setStatus(`Uploading manuscript… ${Math.round(event.loaded / event.total * 100)}%`);
          };
          xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed. Please try again."));
          xhr.onerror = () => reject(new Error("Connection lost. Please try again."));
          xhr.onabort = () => reject(new Error("Upload cancelled."));
          xhr.timeout = 180000;
          xhr.ontimeout = () => reject(new Error("The upload timed out. Please try again."));
          xhr.send(selectedFile);
        });
        setStatus("Checking manuscript…");
        const ready = await fetch(`/api/manuscript-uploads/${result.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "ready" }), signal: controller.signal });
        if (!ready.ok) throw new Error((await ready.json()).error ?? "Could not verify the upload.");
        router.push(`/signup?upload=${encodeURIComponent(result.id)}`);
      } catch (failure) {
        if (controller.signal.aborted) return;
        setError(failure instanceof Error ? failure.message : "Upload failed.");
        setStatus(null);
        setFile(null);
        setToken(null);
        setRefreshKey((value) => value + 1);
        running.current = false;
      }
    }
    void upload(file, token);
  }, [file, token, router]);

  useEffect(() => () => { requestRef.current?.abort(); xhrRef.current?.abort(); }, []);

  return (
    <div className="mt-7 space-y-3">
      <input ref={input} type="file" accept={sourceDocumentAccept} className="sr-only" aria-label="Choose your manuscript" disabled={!!status} onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ""; if (selected) selectFile(selected); }} />
      <button
        type="button"
        disabled={!!status || !siteKey}
        onClick={() => input.current?.click()}
        onDragOver={(event) => { event.preventDefault(); if (!status) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); const selected = event.dataTransfer.files[0]; if (selected && siteKey) selectFile(selected); }}
        className={cn("flex min-h-40 w-full flex-col items-center justify-center gap-3 border border-dashed border-foreground/30 bg-card/40 px-5 py-6 text-center transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait", dragging && "border-primary bg-primary/5")}
      >
        {status ? <Loader2 className="h-6 w-6 animate-spin" strokeWidth={1.5} /> : <FileText className="h-6 w-6" strokeWidth={1.5} />}
        <span className="text-sm font-medium">{status ?? (file ? "Complete verification to upload" : "Drop your manuscript here")}</span>
        <span className="max-w-full truncate text-xs text-muted-foreground">{file?.name ?? "or click to choose a file"}</span>
        <span className="font-mono text-[10px] text-muted-foreground">DOCX, PDF, TXT, Markdown · max 20 MB</span>
      </button>
      <p className="text-xs leading-5 text-muted-foreground">
        Your file is held for 4 hours while you create your account.
      </p>
      {siteKey && file ? <Turnstile siteKey={siteKey} onTokenChange={setToken} refreshKey={refreshKey} /> : null}
      {!siteKey ? <p className="text-xs text-destructive">Uploads are temporarily unavailable.</p> : null}
      <p role="status" aria-live="polite" className="sr-only">{status}</p>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
