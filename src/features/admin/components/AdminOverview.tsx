import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  ClipboardList,
  CreditCard,
  MessageSquare,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";

import type { AdminOverview as AdminOverviewData } from "@/features/admin/server/get-admin-overview";
import { Heading } from "@/shared/ui/Heading";

type Metric = {
  icon: LucideIcon;
  label: string;
  tone?: "accent" | "default" | "success";
  value: number;
};

const numberFormat = new Intl.NumberFormat("en-US");

export function AdminOverview({ overview }: { overview: AdminOverviewData }) {
  const coreMetrics: Metric[] = [
    { label: "Manuscripts", value: overview.manuscripts, icon: BookOpen, tone: "accent" },
    { label: "Customers", value: overview.customerAccounts, icon: UsersRound },
    { label: "Surveys", value: overview.surveys, icon: ClipboardList, tone: "accent" },
    {
      label: "Active · 7d",
      value: overview.activeCustomerAccountsLast7Days,
      icon: Activity,
      tone: "success",
    },
    { label: "Pro accounts", value: overview.paidCustomerAccounts, icon: CreditCard, tone: "accent" },
  ];

  const signalMetrics: Metric[] = [
    { label: "New · 30d", value: overview.newCustomerAccountsLast30Days, icon: UserPlus },
    { label: "Reader assignments", value: overview.readerAssignments, icon: Users, tone: "accent" },
    { label: "Annotations", value: overview.annotations, icon: MessageSquare, tone: "success" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
      <header className="flex items-end justify-between gap-5 border-b border-foreground/15 pb-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
            Product operations
          </p>
          <Heading level={1} size="page" className="mt-1.5">
            Control room
          </Heading>
        </div>
        <p className="pb-1 text-right font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">
          Live snapshot
        </p>
      </header>

      <section className="mt-5" aria-labelledby="core-metrics-heading">
        <div className="mb-2 flex items-center justify-between">
          <Heading level={2} size="label" id="core-metrics-heading">
            Product pulse
          </Heading>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">All time</p>
        </div>
        <MetricStrip metrics={coreMetrics} columns="five" />
      </section>

      <section className="mt-5" aria-labelledby="signal-metrics-heading">
        <div className="mb-2 flex items-center justify-between">
          <Heading level={2} size="label" id="signal-metrics-heading">
            Feedback signal
          </Heading>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Current base</p>
        </div>
        <MetricStrip metrics={signalMetrics} columns="three" />
      </section>
    </div>
  );
}

function MetricStrip({ metrics, columns }: { columns: "three" | "five"; metrics: Metric[] }) {
  const gridClass = columns === "five" ? "grid-cols-2 md:grid-cols-5" : "grid-cols-3";

  return (
    <dl className={`grid overflow-hidden border border-foreground/15 bg-foreground/15 ${gridClass}`}>
      {metrics.map((metric) => (
        <MetricCell key={metric.label} metric={metric} />
      ))}
    </dl>
  );
}

function MetricCell({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  const toneClass =
    metric.tone === "accent"
      ? "text-primary"
      : metric.tone === "success"
        ? "text-success"
        : "text-muted-foreground";

  return (
    <div className="min-h-[88px] border-b border-r border-foreground/15 bg-card px-3 py-2.5 last:border-r-0 md:min-h-[94px] md:px-4 md:py-3">
      <dt className="flex min-h-3 items-center justify-between gap-2 font-mono text-[9px] uppercase leading-3 tracking-[0.12em] text-muted-foreground">
        <span>{metric.label}</span>
        <Icon className={`h-3 w-3 shrink-0 ${toneClass}`} strokeWidth={1.7} aria-hidden="true" />
      </dt>
      <dd className="mt-3 font-serif text-[2rem] leading-none tracking-[-0.045em] text-foreground md:text-[2.25rem]">
        {numberFormat.format(metric.value)}
      </dd>
    </div>
  );
}
