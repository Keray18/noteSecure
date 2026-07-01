"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotes() {
    try {
      const res = await fetch("/api/notes");

      const data = await res.json();

      if (res.ok) {
        setNotes(data.notes);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Failed to fetch notes.");
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchNotes();
  }, []);


  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;

    const res = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    alert(data.message);

    fetchNotes();
  }

  async function logout() {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (res.ok) {
      router.replace("/login");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          My Notes
        </h1>

        <button
          onClick={() => router.push("/notes/new")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Create Note
        </button>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>

      {loading && <p>Loading...</p>}

      {!loading && notes.length === 0 && (
        <p>No Notes Found</p>
      )}

      <div className="grid md:grid-cols-2 gap-5">

        {notes.map((note) => (

          <div
            key={note.id}
            className="border rounded-lg p-5 shadow"
          >

            <h2 className="text-xl font-bold">
              {note.title}
            </h2>

            <p className="mt-3 line-clamp-3">
              {note.content}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              {new Date(note.createdAt).toLocaleString()}
            </p>

            <div className="flex gap-3 mt-5">

              <button
                onClick={() =>
                  router.push(`/notes/${note.id}`)
                }
                className="bg-blue-600 text-white px-3 py-2 rounded"
              >
                Share
              </button>

              <button
                onClick={() => deleteNote(note.id)}
                className="bg-red-600 text-white px-3 py-2 rounded"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}