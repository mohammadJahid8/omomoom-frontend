"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { EmptyState } from "@/components/dashboard/primitives";
import { SelectField } from "@/components/shared/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAdminUsers, updateUser } from "@/lib/api/admin";
import type { AdminUser } from "@/types/admin";
import type { ApiMeta } from "@/types/api";
import type { Role } from "@/types/auth";
import { cn } from "@/lib/utils";

const ROLE_FILTER = [
  { value: "ALL", label: "All roles" },
  { value: "USER", label: "Members" },
  { value: "ADMIN", label: "Admins" },
  { value: "SUPER_ADMIN", label: "Super admins" },
];

const STATE_FILTER = [
  { value: "ALL", label: "Active and disabled" },
  { value: "ACTIVE", label: "Active only" },
  { value: "DISABLED", label: "Disabled only" },
];

const ROLE_OPTIONS = [
  { value: "USER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super admin" },
];

const ROLE_LABEL: Record<Role, string> = {
  USER: "Member",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UsersManager() {
  const { user: me } = useSession();

  const [rows, setRows] = useState<AdminUser[] | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [state, setState] = useState("ALL");
  const [page, setPage] = useState(1);
  const [reloads, setReloads] = useState(0);

  const [failed, setFailed] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  useEffect(() => {
    let alive = true;

    listAdminUsers({ q: search, role, state, page })
      .then((result) => {
        if (!alive) return;
        setRows(result.users);
        setMeta(result.meta);
        setFailed(null);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setFailed(
          error instanceof Error ? error.message : "Could not load accounts",
        );
        setRows([]);
      });

    return () => {
      alive = false;
    };
  }, [search, role, state, page, reloads]);

  const reload = useCallback(() => setReloads((n) => n + 1), []);

  const change = (
    id: string,
    input: { role?: Role; isActive?: boolean },
  ) =>
    startBusy(async () => {
      setWorking(id);
      try {
        await updateUser(id, input);
        setFailed(null);
        reload();
      } catch (error) {
        setFailed(
          error instanceof Error ? error.message : "That change was refused",
        );
      } finally {
        setWorking(null);
      }
    });

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(query.trim());
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute inset-y-0 start-4 my-auto size-4.5"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or username"
              aria-label="Search accounts"
              className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-full rounded-xl border ps-11 pe-3.5 text-sm outline-none focus-visible:ring-3"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="h-12 shrink-0 rounded-xl px-4 font-semibold"
          >
            Search
          </Button>
        </form>

        <div className="sm:w-44">
          <SelectField
            name="roleFilter"
            label=""
            options={ROLE_FILTER}
            value={role}
            onChange={(event) => {
              setPage(1);
              setRole(event.target.value);
            }}
            aria-label="Filter by role"
          />
        </div>

        <div className="sm:w-52">
          <SelectField
            name="stateFilter"
            label=""
            options={STATE_FILTER}
            value={state}
            onChange={(event) => {
              setPage(1);
              setState(event.target.value);
            }}
            aria-label="Filter by state"
          />
        </div>
      </div>

      {failed ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive mb-4 rounded-xl px-4 py-3 text-sm"
        >
          {failed}
        </p>
      ) : null}

      {rows === null ? (
        <div className="grid gap-3">
          {[0, 1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-card h-24 animate-pulse rounded-2xl ring-1 ring-foreground/8"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nobody matched"
          body={
            search
              ? `No account matches "${search}". Try a shorter search or widen the filters.`
              : "No accounts match these filters yet."
          }
          tint="rose"
        />
      ) : (
        <ol className="grid gap-3">
          {rows.map((row) => {
            const isMe = me?.id === row.id;
            const pending = busy && working === row.id;

            return (
              <li
                key={row.id}
                className={cn(
                  "bg-card rounded-2xl p-4 ring-1 ring-foreground/8 sm:p-5",
                  !row.isActive && "opacity-70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3.5">
                    <Avatar className="size-10 shrink-0">
                      {row.avatarUrl ? (
                        <AvatarImage src={row.avatarUrl} alt="" />
                      ) : null}
                      <AvatarFallback className="bg-tint-rose text-tint-rose-ink text-xs font-bold">
                        {initials(row.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-base font-bold">
                          {row.name}
                        </h3>
                        {row.role !== "USER" ? (
                          <Badge variant="secondary">
                            <ShieldCheck className="size-3" />
                            {ROLE_LABEL[row.role]}
                          </Badge>
                        ) : null}
                        {isMe ? <Badge variant="outline">You</Badge> : null}
                        {!row.isActive ? (
                          <Badge variant="destructive">Disabled</Badge>
                        ) : null}
                      </div>

                      <p className="text-muted-foreground mt-1 truncate text-sm">
                        @{row.username} · {row.email}
                      </p>

                      <p className="text-muted-foreground mt-1.5 text-sm">
                        {row._count.recommendations} recommendation
                        {row._count.recommendations === 1 ? "" : "s"} ·{" "}
                        {row._count.saves} saved
                        {row._count.ownedRestaurants > 0
                          ? ` · owns ${row._count.ownedRestaurants}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {pending ? (
                      <Loader2 className="text-muted-foreground size-4 animate-spin" />
                    ) : null}

                    <select
                      value={row.role}
                      disabled={busy}
                      aria-label={`Role for ${row.name}`}
                      onChange={(event) =>
                        change(row.id, { role: event.target.value as Role })
                      }
                      className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-xl border px-3 text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        change(row.id, { isActive: !row.isActive })
                      }
                      className="h-10 rounded-xl font-semibold"
                    >
                      {row.isActive ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {meta && meta.totalPages > 1 ? (
        <nav
          aria-label="Pages"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-sm">
            Page {meta.page} of {meta.totalPages} · {meta.total.toLocaleString()}{" "}
            total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((n) => Math.max(1, n - 1))}
              className="h-10 rounded-xl"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((n) => n + 1)}
              className="h-10 rounded-xl"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </nav>
      ) : null}
    </>
  );
}
