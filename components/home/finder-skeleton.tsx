export function FinderSkeleton() {
  return (
    <section className="bg-surface section-y border-b" aria-hidden="true">
      <div className="container-page">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <div className="bg-muted mx-auto h-3 w-32 animate-pulse rounded-full" />
          <div className="bg-muted mx-auto h-9 w-80 max-w-full animate-pulse rounded-lg" />
          <div className="bg-muted mx-auto h-4 w-96 max-w-full animate-pulse rounded-full" />
        </div>

        <div className="bg-card mx-auto mt-10 max-w-4xl space-y-5 rounded-2xl border p-4 sm:p-6">
          <div className="bg-muted h-12 animate-pulse rounded-xl" />
          {[10, 8, 4].map((count, row) => (
            <div key={row} className="space-y-2.5">
              <div className="bg-muted h-2.5 w-24 animate-pulse rounded-full" />
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: count }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-muted h-8 animate-pulse rounded-full"
                    style={{ width: `${70 + ((index * 23) % 60)}px` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-card overflow-hidden rounded-2xl border"
            >
              <div className="bg-muted aspect-4/3 animate-pulse" />
              <div className="space-y-3 p-5">
                <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-full animate-pulse rounded" />
                <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
