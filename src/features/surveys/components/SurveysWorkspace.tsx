"use client";

import { CheckSquare, ChevronUp, Copy, List, Plus, Star, ToggleLeft } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/features/dashboard/components/PageHeader";

type SurveyQuestion = {
  id: string;
  title: string;
  type: "Rating 1–5" | "Yes / No" | "Multiple choice" | "Open text";
  required: boolean;
};

const initialQuestions: SurveyQuestion[] = [
  { id: "q1", title: "Overall, how would you rate this manuscript?", type: "Rating 1–5", required: true },
  { id: "q2", title: "Would you read a sequel?", type: "Yes / No", required: true },
  { id: "q3", title: "What was the strongest element of the book?", type: "Multiple choice", required: false },
  { id: "q4", title: "Is there anything the author should know that you couldn't capture in annotations?", type: "Open text", required: false },
];

export function SurveysWorkspace() {
  const [questions, setQuestions] = useState(initialQuestions);

  function addQuestion() {
    setQuestions((current) => [...current, { id: `q${current.length + 1}`, title: "Untitled question", type: "Open text", required: false }]);
  }

  return (
    <div className="min-h-full">
      <PageHeader eyebrow="Surveys" title="Reader surveys" actions={<NewSurveyDialog />} />

      <div className="max-w-[1100px] p-5 sm:p-8">
        <p className="mb-6 max-w-4xl text-sm leading-6 text-muted-foreground">
          Surveys are shown to readers automatically — at the end of a chapter or after they finish the manuscript. Use them alongside annotations to collect structured, high-level feedback.
        </p>

        <section className="border border-foreground/10 bg-card">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base font-medium">End-of-book survey</h2>
                <span className="bg-emerald-900/10 px-2 py-1 font-mono text-[9px] uppercase text-emerald-900">Active</span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">End of book · {questions.length} questions · 3 responses</p>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </div>

          <Tabs defaultValue="questions">
            <div className="flex items-center justify-between border-y border-foreground/10 bg-sidebar/70 px-5">
              <TabsList className="h-11 rounded-none bg-transparent p-0">
                <TabsTrigger value="questions" className="h-11 rounded-none border-b-2 border-transparent px-0 pr-8 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Questions</TabsTrigger>
                <TabsTrigger value="responses" className="h-11 rounded-none border-b-2 border-transparent px-0 text-xs text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Responses (3)</TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="icon-sm" aria-label="Duplicate survey"><Copy className="h-3.5 w-3.5" strokeWidth={1.5} /></Button>
            </div>

            <TabsContent value="questions" className="m-0">
              <div className="border-b border-foreground/10 px-5 py-4">
                <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Send after</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">Full manuscript</Button>
                  <Button size="sm" variant="outline" className="border-foreground/15">Specific chapter</Button>
                </div>
              </div>

              <div className="divide-y divide-foreground/[0.08]">
                {questions.map((question) => <QuestionRow key={question.id} question={question} />)}
              </div>

              <Button variant="ghost" size="sm" className="m-4 text-muted-foreground" onClick={addQuestion}><Plus className="h-3.5 w-3.5" />Add question</Button>

              <div className="flex items-center justify-between gap-4 border-t border-foreground/10 bg-sidebar/60 px-5 py-4">
                <span className="font-mono text-[10px] text-emerald-900">Active — shown to readers at the right moment</span>
                <Button variant="ghost" size="sm" className="text-muted-foreground">Close survey</Button>
              </div>
            </TabsContent>

            <TabsContent value="responses" className="m-0 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {["Priya N.", "Sarah K.", "Marcus R."].map((name, index) => (
                  <div key={name} className="border border-foreground/10 p-4"><p className="text-xs font-medium">{name}</p><p className="mt-2 font-mono text-[9px] text-muted-foreground">Submitted {index + 1}d ago</p></div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

function QuestionRow({ question }: { question: SurveyQuestion }) {
  const Icon = question.type === "Rating 1–5" ? Star : question.type === "Yes / No" ? ToggleLeft : question.type === "Multiple choice" ? CheckSquare : List;

  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)_auto] gap-3 px-5 py-4">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
      <div>
        <p className="text-sm">{question.title}</p>
        {question.type === "Rating 1–5" ? <div className="mt-3 flex gap-1.5">{[1, 2, 3, 4, 5].map((value) => <span key={value} className="grid h-6 w-6 place-items-center border border-foreground/15 font-mono text-[9px] text-muted-foreground">{value}</span>)}</div> : null}
        {question.type === "Yes / No" ? <div className="mt-3 flex gap-2"><span className="border border-foreground/15 px-3 py-1 font-mono text-[9px] text-muted-foreground">Yes</span><span className="border border-foreground/15 px-3 py-1 font-mono text-[9px] text-muted-foreground">No</span></div> : null}
        {question.type === "Multiple choice" ? <div className="mt-3 flex flex-wrap gap-1.5">{["Characters", "Plot", "World-building", "Prose", "Pacing"].map((value) => <span key={value} className="border border-foreground/15 px-2 py-1 font-mono text-[9px] text-muted-foreground">{value}</span>)}</div> : null}
      </div>
      <div className="flex gap-3 font-mono text-[9px] text-muted-foreground">{question.required ? <span className="text-primary">required</span> : null}<span>{question.type}</span></div>
    </div>
  );
}

function NewSurveyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5" />New survey</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="text-2xl font-medium">New survey</DialogTitle><DialogDescription>Choose when readers should receive it.</DialogDescription></DialogHeader>
        <div className="space-y-4 pt-3">
          <div className="space-y-2"><Label htmlFor="survey-name">Name</Label><Input id="survey-name" placeholder="Chapter check-in" /></div>
          <div className="space-y-2"><Label>Send after</Label><Select defaultValue="book"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="book">Full manuscript</SelectItem><SelectItem value="chapter">Specific chapter</SelectItem></SelectContent></Select></div>
          <Button className="w-full">Create survey</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
