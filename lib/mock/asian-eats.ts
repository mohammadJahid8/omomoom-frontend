export type CommunityPost = {
  id: string;
  author: string;
  authorHandle: string;
  restaurantName: string;
  restaurantSlug: string;
  dish: string;
  quote: string;
  postedAt: string;
  imageUrl: string | null;
};

export type CommunityEvent = {
  id: string;
  title: string;
  kind:
    | "Festival"
    | "Night market"
    | "Pop-up"
    | "Tasting"
    | "Community"
    | "Restaurant event";
  startsAt: string;
  endsAt: string | null;
  venue: string;
  neighborhood: string;
  organiser: string;
  description: string;
  ticketUrl: string | null;
};

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "p1",
    author: "Priya R.",
    authorHandle: "priyaeats",
    restaurantName: "Ghee Indian Kitchen",
    restaurantSlug: "ghee-indian-kitchen",
    dish: "Smoked Lamb Neck",
    quote:
      "Order the lamb neck and the malai corn together. The corn cuts the smoke and you end up mopping the plate with the last roti.",
    postedAt: "2026-08-06",
    imageUrl: null,
  },
  {
    id: "p2",
    author: "Marco T.",
    authorHandle: "marcochews",
    restaurantName: "1-800-Lucky Food Hall",
    restaurantSlug: "1-800-lucky-food-hall",
    dish: "Xiao Long Bao",
    quote:
      "Go on a weeknight, sit at the back counter. Six soup dumplings and a beer for under twenty and nobody rushes you.",
    postedAt: "2026-08-04",
    imageUrl: null,
  },
  {
    id: "p3",
    author: "Ana S.",
    authorHandle: "anaeatsmia",
    restaurantName: "Wayan",
    restaurantSlug: "wayan",
    dish: "Lobster Noodles",
    quote:
      "The lobster noodles are the whole reason to book. Rich but not heavy, and enough for two if you order satay first.",
    postedAt: "2026-08-02",
    imageUrl: null,
  },
  {
    id: "p4",
    author: "Kevin L.",
    authorHandle: "kevinlikes",
    restaurantName: "Sili Miami",
    restaurantSlug: "sili-miami",
    dish: "Crispy Pork Belly",
    quote:
      "Best Filipino food in the city right now and it is inside a food hall. The chicken inasal is the sleeper pick.",
    postedAt: "2026-07-30",
    imageUrl: null,
  },
  {
    id: "p5",
    author: "Yuki M.",
    authorHandle: "yukiinmiami",
    restaurantName: "Kaori",
    restaurantSlug: "kaori",
    dish: "Toro Tartare",
    quote:
      "Sit at the listening bar side. Toro tartare, crispy rice, one cocktail, and stay for the records.",
    postedAt: "2026-07-28",
    imageUrl: null,
  },
  {
    id: "p6",
    author: "Dani C.",
    authorHandle: "danichews",
    restaurantName: "Hiyakawa",
    restaurantSlug: "hiyakawa-miami",
    dish: "Omakase",
    quote:
      "Splurge, but do it at lunch. Same counter, same chef, noticeably calmer room.",
    postedAt: "2026-07-25",
    imageUrl: null,
  },
];

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: "e1",
    title: "Wynwood Night Market",
    kind: "Night market",
    startsAt: "2026-08-15T18:00:00-04:00",
    endsAt: "2026-08-15T23:00:00-04:00",
    venue: "Wynwood Marketplace",
    neighborhood: "Wynwood",
    organiser: "Miami Asian Night Market Co.",
    description:
      "Forty stalls of Taiwanese street food, Filipino barbecue and bubble tea, plus a live DJ until close.",
    ticketUrl: null,
  },
  {
    id: "e2",
    title: "Mid-Autumn Mooncake Festival",
    kind: "Festival",
    startsAt: "2026-08-23T12:00:00-04:00",
    endsAt: "2026-08-23T17:00:00-04:00",
    venue: "1-800-Lucky Food Hall",
    neighborhood: "Wynwood",
    organiser: "Miami Asians",
    description:
      "Mooncake tasting from six bakeries, lantern making for kids, and a Hong Kong style mahjong table running all afternoon.",
    ticketUrl: null,
  },
  {
    id: "e3",
    title: "Omakase 101 with Chef Shingo",
    kind: "Tasting",
    startsAt: "2026-09-05T19:00:00-04:00",
    endsAt: null,
    venue: "Shingo",
    neighborhood: "Coral Gables",
    organiser: "Omomoom",
    description:
      "Twelve seats, ten courses, and an explanation of every cut as it lands. Beginners genuinely welcome.",
    ticketUrl: null,
  },
  {
    id: "e4",
    title: "Sili Miami x Kamayan Feast",
    kind: "Pop-up",
    startsAt: "2026-09-12T18:30:00-04:00",
    endsAt: "2026-09-12T21:30:00-04:00",
    venue: "Sili Miami",
    neighborhood: "Wynwood",
    organiser: "Sili Miami",
    description:
      "A banana leaf spread eaten with your hands. Lechon, inasal, ensaymada, and no cutlery on the table.",
    ticketUrl: null,
  },
  {
    id: "e5",
    title: "Miami Ramen Week",
    kind: "Restaurant event",
    startsAt: "2026-09-21T11:00:00-04:00",
    endsAt: "2026-09-27T22:00:00-04:00",
    venue: "Across Miami",
    neighborhood: "Citywide",
    organiser: "Omomoom",
    description:
      "Fourteen kitchens, one bowl each, fixed price all week. Tickets are not needed, just turn up hungry.",
    ticketUrl: null,
  },
  {
    id: "e6",
    title: "Board Game Night at CHO",
    kind: "Community",
    startsAt: "2026-10-01T19:00:00-04:00",
    endsAt: null,
    venue: "CHO Funky Asian Bistro",
    neighborhood: "Coral Gables",
    organiser: "Miami Asians",
    description:
      "A casual night to meet people over dumplings and a stack of board games. No experience required.",
    ticketUrl: null,
  },
];
