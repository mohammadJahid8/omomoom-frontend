import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPublicProfile } from "@/lib/api/profile";
import { siteConfig } from "@/lib/site-config";
import { formatMiami } from "@/lib/miami-time";

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const TABS = ["reviews", "photos", "tried", "want-to-try"];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const joined = (iso: string) =>
  formatMiami(iso, { month: "long", year: "numeric" });

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) return { title: "Profile not found" };

  const { user, counts } = profile;
  const description = `${counts.reviews} ${counts.reviews === 1 ? "review" : "reviews"} and ${counts.placesTried} ${counts.placesTried === 1 ? "place" : "places"} tried around ${siteConfig.city}.`;

  return {
    title: `${user.name} (@${user.username})`,
    description,
    alternates: { canonical: `/u/${user.username}` },
    openGraph: {
      type: "profile",
      title: `${user.name} on ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/u/${user.username}`,
      ...(user.avatarUrl
        ? { images: [{ url: user.avatarUrl, alt: user.name }] }
        : {}),
    },
  };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PageProps) {
  const [{ username }, { tab }] = await Promise.all([params, searchParams]);
  const profile = await getPublicProfile(username);

  if (!profile) notFound();

  const { user, counts } = profile;
  const current = tab && TABS.includes(tab) ? tab : "reviews";

  return (
    <div className="container-page section-y">
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
          <Avatar className="size-20 shrink-0 sm:size-28">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback className="bg-tint-rose text-tint-rose-ink text-2xl font-bold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
              {user.name}
            </h1>
            <p className="text-muted-foreground mt-1">@{user.username}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {counts.reviews > 0
                ? `Eating around ${siteConfig.city} since ${joined(user.joinedAt)}.`
                : `Joined ${joined(user.joinedAt)}.`}
            </p>
          </div>
        </header>

        <ProfileTabs profile={profile} tab={current} />
      </div>
    </div>
  );
}
