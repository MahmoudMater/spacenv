"use client";

import Link from "next/link";
import { useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { useRegister } from "@/lib/hooks/use-auth";
import type { ApiError } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === "object" &&
    e !== null &&
    "statusCode" in e &&
    typeof (e as ApiError).statusCode === "number"
  );
}

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const register = useRegister();

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!name.trim()) {
      next.name = "Name is required";
    } else if (name.trim().length < 2) {
      next.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = "Enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      await register.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
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
          Create an account
        </CardTitle>
        <CardDescription className="text-sm text-zinc-400">
          Start managing your .env files securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-200">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              aria-invalid={!!errors.name}
            />
            {errors.name ? (
              <p className="text-destructive text-sm" role="alert">
                {errors.name}
              </p>
            ) : null}
          </div>
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
              aria-invalid={!!errors.email}
            />
            {errors.email ? (
              <p className="text-destructive text-sm" role="alert">
                {errors.email}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-200">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              aria-invalid={!!errors.password}
            />
            {errors.password ? (
              <p className="text-destructive text-sm" role="alert">
                {errors.password}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            className="w-full bg-white text-zinc-950 hover:bg-zinc-200"
            disabled={register.isPending}
          >
            {register.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
