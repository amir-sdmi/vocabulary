"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => void signIn("google")}
      className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
    >
      Continue with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-emerald-900/20 bg-white px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
    >
      Sign out
    </button>
  );
}
