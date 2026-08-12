import { ProfileHeader } from "@/components/dashboard/profile-header";
import { getMyStats } from "@/lib/auth/contributions";
import { requireSession } from "@/lib/auth/session";

export default async function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, stats] = await Promise.all([
    requireSession("/dashboard/profile"),
    getMyStats(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <ProfileHeader user={user} stats={stats} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
