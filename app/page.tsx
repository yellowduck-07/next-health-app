"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      console.log("Supabase getSession:", result);
    });
  }, []);

  return (
    <main className="p-8">
      <p>API available at /api/health</p>
    </main>
  );
}
