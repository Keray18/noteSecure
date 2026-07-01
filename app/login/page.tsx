"use client";
import Link from "next/link";
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Login Successful");

      router.push("/notes");
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg space-y-5"
      >

        <h1 className="text-3xl font-bold text-center">
          Login
        </h1>

        <div>
          <label className="block mb-1 font-medium">
            Email
          </label>

          <input
            type="email"
            className="w-full rounded border p-2"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Password
          </label>

          <input
            type="password"
            className="w-full rounded border p-2"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white hover:bg-gray-800"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-5 text-center">
        <span className="text-gray-600">
          Don't have an account?
        </span>

        <Link
          href="/register"
          className="ml-2 text-blue-600 hover:underline font-medium"
        >
          Register
        </Link>
      </div>

      </form>

    </div>
  );
}