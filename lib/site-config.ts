export const siteConfig = {
  name: "Omomoom",
  tagline: "Discovery your next yummy bite",
  description:
    "The most powerful restaurant filter in Miami. Search by cuisine, neighborhood, price, dish, occasion and dietary needs. Nobody pays to appear here.",
  url: "https://omomoom.com",
  city: "Miami",
  links: {
    instagram: "https://instagram.com/omomoom",
    tiktok: "https://tiktok.com/@omomoom",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const mainNav: NavItem[] = [
  {
    label: "Explore",
    href: "/restaurants",
    description: "Browse every restaurant",
  },
  {
    label: "Guides",
    href: "/guides",
    description: "Curated lists worth trusting",
  },
  {
    label: "Asian Eats",
    href: "/asian-eats",
    description: "The Asian dining scene",
  },
  {
    label: "New & Noted",
    href: "/new-and-noted",
    description: "Just opened, already good",
  },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Discover",
    items: [
      { label: "All restaurants", href: "/restaurants" },
      { label: "Neighborhoods", href: "/neighborhoods" },
      { label: "Cuisines", href: "/cuisines" },
      { label: "Guides", href: "/guides" },
      { label: "New & Noted", href: "/new-and-noted" },
    ],
  },
  {
    title: "For restaurants",
    items: [
      { label: "Claim your listing", href: "/claim" },
      { label: "How claiming works", href: "/for-restaurants" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
