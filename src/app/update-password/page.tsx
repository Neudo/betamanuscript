import { UpdatePasswordScreen } from "@/features/account/components/UpdatePasswordScreen";
import { createNoIndexMetadata } from "@/shared/config/seo";

export const metadata = createNoIndexMetadata("Update password | BetaManuscript");

export default function UpdatePasswordPage() {
  return <UpdatePasswordScreen />;
}
