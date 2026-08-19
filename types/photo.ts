export type PhotoStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MyPhoto = {
  id: string;
  url: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  status: PhotoStatus;
  createdAt: string;
  restaurant: { id: string; slug: string; name: string };
};

export type QueuePhoto = MyPhoto & {
  storageKey: string | null;
  uploadedBy: {
    id: string;
    name: string;
    username: string;
    createdAt: string;
  } | null;
};
