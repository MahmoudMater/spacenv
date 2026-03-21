"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Github, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { useLogin } from "@/lib/hooks/use-auth";
import type { ApiError } from "@/types";

function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === "object" &&
    e !== null &&
    "statusCode" in e &&
    typeof (e as ApiError).statusCode === "number"
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credentialError, setCredentialError] = useState<string | null>(null);

  const login = useLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCredentialError(null);

    try {
      await login.mutateAsync({ email, password });
    } catch (err) {
      if (isApiError(err) && err.statusCode === 401) {
        setCredentialError("Invalid email or password");
        return;
      }
      const message = isApiError(err)
        ? err.message
        : err instanceof Error
          ? err.message
          : "Something went wrong";
      toast.error(message);
    }
  }

  return (
    <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-zinc-50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm text-zinc-400">
          Sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-200">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-200">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              aria-invalid={!!credentialError}
            />
            {credentialError ? (
              <p className="text-destructive text-sm" role="alert">
                {credentialError}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            className="w-full bg-white text-zinc-950 hover:bg-zinc-200"
            disabled={login.isPending}
          >
            {login.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-500">
              or continue with
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            onClick={() => {
              window.location.href = authApi.googleAuthUrl();
            }}
            aria-label="Continue with Google"
          >
            <span className="font-semibold">G</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            onClick={() => {
              window.location.href = authApi.githubAuthUrl();
            }}
            aria-label="Continue with GitHub"
          >
            <Github className="size-4" />
          </Button>
        </div>

        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
