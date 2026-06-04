import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser, getFirstPet } from "@/lib/app-data";

export default async function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/app");
  }

  const pet = await getFirstPet(user.id);

  if (!pet) {
    redirect("/onboarding");
  }

  return (
    <AppShell petName={pet.name} petAvatar={pet.avatar_url}>
      {children}
    </AppShell>
  );
}
