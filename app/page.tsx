"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

type Note = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export default function Home() {
  const { user, loading, session } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = useCallback((): HeadersInit | null => {
    const token = session?.access_token;
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [session?.access_token]);

  const fetchNotes = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;

    setNotesLoading(true);
    setNotesError(null);

    const response = await fetch("/api/notes", { headers });
    const data = await response.json();

    setNotesLoading(false);

    if (!response.ok) {
      setNotesError(data.error ?? "Failed to load notes");
      return;
    }

    setNotes(data.notes);
  }, [authHeaders]);

  useEffect(() => {
    if (user && session) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [user, session, fetchNotes]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const headers = authHeaders();
    if (!headers) return;

    setSubmitting(true);
    setNotesError(null);

    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newNote }),
    });

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setNotesError(data.error ?? "Failed to create note");
      return;
    }

    setNewNote("");
    setNotes((current) => [data.note, ...current]);
  }

  return (
    <main className="space-y-6 p-8">
      <p>API available at /api/health</p>

      {loading ? (
        <p className="text-sm text-gray-500">Checking auth status...</p>
      ) : user ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm">
              Logged in as{" "}
              <span className="font-medium">{user.email}</span>
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Log out
            </button>
          </div>

          <section className="max-w-md space-y-3">
            <h2 className="text-lg font-semibold">Notes</h2>

            {notesError && (
              <p className="text-sm text-red-600">{notesError}</p>
            )}

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                placeholder="New note"
                required
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </form>

            {notesLoading ? (
              <p className="text-sm text-gray-500">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-gray-500">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded border border-gray-200 px-3 py-2 text-sm"
                  >
                    {note.content}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="flex gap-4 text-sm">
          <Link href="/login" className="underline">
            Log in
          </Link>
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}
