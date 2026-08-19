"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { ImageViewer } from "@/components/shared/image-viewer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/api/auth";
import { checkImage, IMAGE_ACCEPT, uploadImage } from "@/lib/api/uploads";
import type { SessionUser } from "@/types/auth";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AvatarUpload({ user }: { user: SessionUser }) {
  const router = useRouter();
  const { setUser } = useSession();
  const input = useRef<HTMLInputElement>(null);

  /**
   * The chosen file is shown immediately from a local object URL, so the photo
   * appears the moment it is picked rather than after a round trip to storage.
   */
  const [preview, setPreview] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [busy, start] = useTransition();

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const shown = preview ?? user.avatarUrl;

  const choose = (file: File) => {
    const problem = checkImage(file);
    if (problem) {
      setFailed(problem);
      return;
    }

    const local = URL.createObjectURL(file);
    setPreview(local);
    setFailed(null);

    start(async () => {
      try {
        const { key } = await uploadImage(file, "AVATAR");
        setUser(await updateProfile({ avatarKey: key }));
        router.refresh();
      } catch (error) {
        setPreview(null);
        URL.revokeObjectURL(local);
        setFailed(
          error instanceof Error ? error.message : "That did not save.",
        );
      }
    });
  };

  const clear = () =>
    start(async () => {
      try {
        setUser(await updateProfile({ avatarKey: null }));
        setPreview(null);
        setFailed(null);
        router.refresh();
      } catch (error) {
        setFailed(
          error instanceof Error ? error.message : "That did not save.",
        );
      }
    });

  return (
    <div className="shrink-0">
      <div className="relative">
        {shown ? (
          <button
            type="button"
            onClick={() => setViewing(0)}
            aria-label="View your photo full size"
            className="focus-visible:ring-ring block cursor-zoom-in rounded-full outline-none focus-visible:ring-3"
          >
            <Avatar className="size-20 sm:size-24">
              <AvatarImage src={shown} alt="" />
              <AvatarFallback className="bg-tint-rose text-tint-rose-ink text-xl font-bold">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <Avatar className="size-20 sm:size-24">
            <AvatarFallback className="bg-tint-rose text-tint-rose-ink text-xl font-bold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        )}

        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) choose(file);
          }}
        />

        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          aria-label={user.avatarUrl ? "Change your photo" : "Add a photo"}
          className="bg-brand-ink text-brand-ink-foreground ring-background hover:bg-brand-ink/90 focus-visible:ring-ring absolute -end-1 -bottom-1 flex size-9 items-center justify-center rounded-full ring-4 transition-colors outline-none focus-visible:ring-3 disabled:opacity-70"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
        </button>
      </div>

      {user.avatarUrl && !busy ? (
        <button
          type="button"
          onClick={clear}
          className="text-muted-foreground hover:text-destructive mx-auto mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <Trash2 className="size-3.5" />
          Remove
        </button>
      ) : null}

      {failed ? (
        <p role="alert" className="text-destructive mt-2 max-w-40 text-xs">
          {failed}
        </p>
      ) : null}

      <ImageViewer
        images={shown ? [{ url: shown, caption: user.name }] : []}
        index={viewing}
        onIndexChange={setViewing}
        label="Your photo"
      />
    </div>
  );
}
