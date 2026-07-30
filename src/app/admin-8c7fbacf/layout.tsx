import { BrandLogo } from "@/components/BrandLogo";
import { WorkspaceAccountMenu } from "@/features/account/components/WorkspaceAccountMenu";
import { requireSuperAdmin } from "@/features/account/server/require-super-admin";
import { adminConsolePath } from "@/shared/config/admin";
import { createNoIndexMetadata } from "@/shared/config/seo";

export const dynamic = "force-dynamic";
export const metadata = createNoIndexMetadata("Administration | BetaManuscript");

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const account = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-foreground bg-sidebar">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <BrandLogo href={adminConsolePath} ariaLabel="BetaManuscript administration" priority imageClassName="h-7" />
            <span className="border border-primary/35 bg-primary/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
              Admin
            </span>
          </div>
          <div className="w-[11.5rem] sm:w-56">
            <WorkspaceAccountMenu account={account} />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
