import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/primitives";
import { UsersManager } from "@/components/dashboard/users-manager";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone with an Omomoom account, what they have contributed, and what they are allowed to do."
      />

      <UsersManager />
    </>
  );
}
