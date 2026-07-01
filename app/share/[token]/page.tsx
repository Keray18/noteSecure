"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);

  const [requiresPassword, setRequiresPassword] = useState(false);

  const [password, setPassword] = useState("");

  const [note, setNote] = useState<{
    title: string;
    content: string;
  } | null>(null);

  async function loadNote() {
    try {
      const res = await fetch(`/api/share/${token}`);

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      if (data.requiresPassword) {
        setRequiresPassword(true);
        return;
      }

      setNote(data.data);
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    loadNote();
  }, []);


  async function unlockNote() {
    try {
      const res = await fetch(`/api/share/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setNote(data.data);

      setRequiresPassword(false);
    } catch {
      alert("Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        Loading...
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="max-w-md mx-auto mt-20 space-y-5">

        <h1 className="text-2xl font-bold">
          Password Protected Note
        </h1>

        <input
          type="password"
          className="border w-full rounded p-2"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={unlockNote}
          className="bg-black text-white px-5 py-2 rounded"
        >
          Unlock
        </button>

      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-20">

      <div className="border rounded-lg p-6 shadow">

        <h1 className="text-3xl font-bold">
          {note?.title}
        </h1>

        <p className="mt-5 whitespace-pre-wrap">
          {note?.content}
        </p>

      </div>

    </div>
  );
}