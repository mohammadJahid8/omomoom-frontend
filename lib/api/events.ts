import { apiFetch } from "@/lib/api/client";
import type { AdminEvent, CommunityEvent, EventStatus } from "@/types/event";

export async function getUpcomingEvents(limit = 6): Promise<CommunityEvent[]> {
  try {
    const { data } = await apiFetch<CommunityEvent[]>(
      `/events?when=upcoming&limit=${limit}`,
      { revalidate: 300, tags: ["events"] },
    );
    return data;
  } catch {
    return [];
  }
}

export type EventInput = {
  title: string;
  organiser: string;
  description: string;
  startsAt: string;
  endsAt?: string | null;
  venue: string;
  neighborhood?: string | null;
  ticketUrl?: string | null;
  status: EventStatus;
};

export async function listAdminEvents(): Promise<AdminEvent[]> {
  const { data } = await apiFetch<AdminEvent[]>("/events/admin?limit=100", {
    session: true,
  });
  return data;
}

export async function createEvent(input: EventInput): Promise<AdminEvent> {
  const { data } = await apiFetch<AdminEvent>("/events", {
    method: "POST",
    body: input,
    session: true,
  });
  return data;
}

export async function updateEvent(
  id: string,
  input: Partial<EventInput>,
): Promise<AdminEvent> {
  const { data } = await apiFetch<AdminEvent>(`/events/${id}`, {
    method: "PATCH",
    body: input,
    session: true,
  });
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch<null>(`/events/${id}`, { method: "DELETE", session: true });
}
