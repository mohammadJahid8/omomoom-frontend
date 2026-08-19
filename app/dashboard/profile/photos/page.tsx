import type { Metadata } from "next";

import { MyPhotos } from "@/components/dashboard/my-photos";

export const metadata: Metadata = { title: "Photos" };

export default function ProfilePhotosPage() {
  return <MyPhotos />;
}
