"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useAcceptInvite, useMe } from "@/lib/hooks";

function tokenFromParams(raw: string | string[] | undefined): string {
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw) && raw[0]) {
    return raw[0];
  }
  return "";
}

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = useMemo(() => tokenFromParams(params.token), [params.token]);

  const me = useMe();
  const accept = useAcceptInvite();

  const redirectPath =
    token.length > 0
      ? `/invite/${encodeURIComponent(token)}`
      : "/invite";

  if (!token) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-lg font-medium text-white">Invalid invite link</h1>
        <p className="max-w-md text-sm text-zinc-400">
          This URL is missing a token. Open the invite from your notification
          again.
        </p>
        <Button asChild variant="outline" className="border-zinc-700">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (me.isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (me.isError || !me.data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-lg font-medium text-white">Sign in to accept</h1>
        <p className="max-w-md text-sm text-zinc-400">
          Log in with the account that received the invite (same email as on the
          invitation).
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild className="bg-white text-zinc-950 hover:bg-zinc-200">
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            >
              Log in
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-700">
            <Link
              href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            >
              Create account
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <h1 className="text-lg font-medium text-white">Space invitation</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Accept to join the team space. You must use the same email this invite
          was sent to.
        </p>
      </div>
      <Button
        type="button"
        className="bg-white text-zinc-950 hover:bg-zinc-200"
        disabled={accept.isPending}
        onClick={() => accept.mutate({ token })}
      >
        {accept.isPending ? "Accepting…" : "Accept invitation"}
      </Button>
      <Button asChild variant="ghost" className="text-zinc-500">
        <Link href="/dashboard">Cancel</Link>
      </Button>
    </div>
  );
}
