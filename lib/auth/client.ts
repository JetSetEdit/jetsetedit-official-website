"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null;
  } | null;
} | null;

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function useSession() {
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
    // Verify session on mount
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setStatus("authenticated");
          setSession(data);
        } else {
          setStatus("unauthenticated");
          setSession(null);
        }
      })
      .catch(() => {
        setStatus("unauthenticated");
        setSession(null);
      });
  }, [router]);

  return {
    status,
    data: session,
  };
} 