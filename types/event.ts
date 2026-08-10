export type EventStatus = "DRAFT" | "PUBLISHED";

export type CommunityEvent = {
  id: string;
  slug: string;
  title: string;
  organiser: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  venue: string;
  neighborhood: string | null;
  ticketUrl: string | null;
  restaurant: { slug: string; name: string } | null;
};

export type AdminEvent = CommunityEvent & {
  status: EventStatus;
  restaurantId: string | null;
  createdAt: string;
  updatedAt: string;
};
