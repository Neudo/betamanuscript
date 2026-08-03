import type { AdminFeatureRequest } from "@/features/admin/server/get-feature-requests";
import { Heading } from "@/shared/ui/Heading";

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function FeatureRequests({ featureRequests }: { featureRequests: AdminFeatureRequest[] }) {
  return (
    <section className="mt-5 border border-foreground/15 bg-card" aria-labelledby="feature-requests-heading">
      <div className="flex items-start justify-between gap-4 border-b border-foreground/15 px-4 py-3 sm:px-5">
        <div>
          <Heading level={2} size="label" id="feature-requests-heading">
            Feature requests
          </Heading>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Submitted from the author dashboard.
          </p>
        </div>
        <p className="shrink-0 pt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {featureRequests.length} received
        </p>
      </div>

      {featureRequests.length === 0 ? (
        <p className="px-4 py-3 text-xs text-muted-foreground sm:px-5">No feature requests yet.</p>
      ) : (
        <ul className="divide-y divide-foreground/15">
          {featureRequests.map((featureRequest) => (
            <li key={featureRequest.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-semibold text-foreground">{featureRequest.authorName}</p>
                <time
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  dateTime={featureRequest.createdAt}
                >
                  {dateFormat.format(new Date(featureRequest.createdAt))}
                </time>
              </div>
              {featureRequest.manuscriptTitle ? (
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {featureRequest.manuscriptTitle}
                </p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{featureRequest.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
