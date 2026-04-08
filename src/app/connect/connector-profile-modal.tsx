"use client";

import { useRef } from "react";
import { ConnectorProfileForm } from "@/app/connect/connector-profile-form";
import type { ConnectorMe } from "@/app/connect/types";

export function ConnectorProfileModal({ me }: { me: ConnectorMe }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-2 transition hover:text-amber-900 hover:decoration-amber-700/60"
      >
        Edit profile
      </button>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-[#faf8f5] p-0 shadow-2xl backdrop:bg-stone-900/40 open:flex open:flex-col"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="max-h-[min(90vh,640px)] overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-semibold text-stone-900">Edit profile</h2>
              <p className="mt-1 text-xs text-stone-500">What companies see on your referrals.</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200/80 hover:text-stone-700"
              aria-label="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          <ConnectorProfileForm me={me} onSaved={close} className="mt-5 grid gap-3" />

          <button
            type="button"
            onClick={close}
            className="mt-4 w-full rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      </dialog>
    </>
  );
}
