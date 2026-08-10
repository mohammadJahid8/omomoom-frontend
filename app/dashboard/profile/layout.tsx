import { ProfileHeader } from "@/components/dashboard/profile-header";
import { requireSession } from "@/lib/auth/session";

export default async function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession("/dashboard/profile");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <ProfileHeader user={user} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
