"use client";

import { useFormStatus } from "react-dom";

export function SaveAccessSubmit() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex min-w-[10.5rem] items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-80"
      >
        {pending ? (
          <>
            <span
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden
            />
            Saving…
          </>
        ) : (
          "Save access"
        )}
      </button>
      {pending ? (
        <span className="text-sm text-slate-500" aria-live="polite">
          Updating permissions…
        </span>
      ) : null}
    </div>
  );
}
