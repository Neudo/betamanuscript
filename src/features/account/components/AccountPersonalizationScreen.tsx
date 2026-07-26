import { AuthScreen } from "./AuthScreen";
import { AccountPersonalizationForm } from "./AccountPersonalizationForm";
import type { UserRole } from "../domain/user-role";

export function AccountPersonalizationScreen({
  accountId,
  initialDisplayName,
  initialRole,
  next,
}: {
  accountId: string;
  initialDisplayName: string;
  initialRole: UserRole;
  next: string | null;
}) {
  return (
    <AuthScreen
      eyebrow="Welcome to BetaManuscript"
      title="Make this account yours"
      description="Choose how you’ll use BetaManuscript and set the name readers and writers will see."
      footer={<p>You can change these details later in account settings.</p>}
    >
      <AccountPersonalizationForm
        accountId={accountId}
        initialDisplayName={initialDisplayName}
        initialRole={initialRole}
        next={next}
      />
    </AuthScreen>
  );
}
