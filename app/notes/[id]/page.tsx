"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ShareLink = {
  id: string;
  token: string;
  shareType: "ONE_TIME" | "TIME_BASED";
  accessType: "PUBLIC" | "PASSWORD";
  viewCount: number;
  revoked: boolean;
  expiresAt: string | null;
};

export default function SharePage() {
  const { id } = useParams<{ id: string }>();

  const [links, setLinks] = useState<ShareLink[]>([]);
  const [shareType, setShareType] = useState("ONE_TIME");
  const [accessType, setAccessType] = useState("PUBLIC");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  async function fetchLinks() {
    const res = await fetch(`/api/share/create/${id}`);
    const data = await res.json();

    if (res.ok) {
      setLinks(data.links);
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function generateLink() {
    const body = {
      shareType,
      accessType,
      password: accessType === "PASSWORD" ? password : undefined,
      expiresAt:
        shareType === "TIME_BASED" && expiresAt
          ? new Date(expiresAt).toISOString()
          : undefined,
    };

    const res = await fetch(`/api/share/create/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setGeneratedLink(data.data.url);

    fetchLinks();

    alert("Share link created");
  }

  async function revokeLink(linkId: string) {
    const res = await fetch(`/api/share/revoke/${linkId}`, {
      method: "PATCH",
    });

    const data = await res.json();

    alert(data.message);

    fetchLinks();
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Share Note
      </h1>

      <div className="space-y-6">

        <div>
          <label className="font-semibold">
            Share Type
          </label>

          <select
            className="border p-2 rounded w-full"
            value={shareType}
            onChange={(e) => setShareType(e.target.value)}
          >
            <option value="ONE_TIME">One Time</option>
            <option value="TIME_BASED">Time Based</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">
            Access Type
          </label>

          <select
            className="border p-2 rounded w-full"
            value={accessType}
            onChange={(e) => setAccessType(e.target.value)}
          >
            <option value="PUBLIC">Public</option>
            <option value="PASSWORD">Password Protected</option>
          </select>
        </div>

        {accessType === "PASSWORD" && (
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {shareType === "TIME_BASED" && (
          <input
            type="datetime-local"
            className="border p-2 rounded w-full"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        )}

        <button
          onClick={generateLink}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Generate Link
        </button>

        {generatedLink && (
          <div className="border rounded p-4">

            <h3 className="font-bold mb-2">
              Generated Link
            </h3>

            <p className="break-all">
              {generatedLink}
            </p>

            <button
              className="mt-3 bg-green-600 text-white px-3 py-2 rounded"
              onClick={() => navigator.clipboard.writeText(generatedLink)}
            >
              Copy Link
            </button>

          </div>
        )}

        {links.length > 0 && (
          <div className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              Existing Share Links
            </h2>

            <table className="w-full border">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border p-2">Type</th>

                  <th className="border p-2">Access</th>

                  <th className="border p-2">Views</th>

                  <th className="border p-2">Status</th>

                  <th className="border p-2">Action</th>

                </tr>

              </thead>

              <tbody>

                {links.map((link) => (

                  <tr key={link.id}>

                    <td className="border p-2">
                      {link.shareType}
                    </td>

                    <td className="border p-2">
                      {link.accessType}
                    </td>

                    <td className="border p-2">
                      {link.viewCount}
                    </td>

                    <td className="border p-2">
                      {link.revoked ? "Revoked" : "Active"}
                    </td>

                    <td className="border p-2">

                      {!link.revoked ? (
                        <button
                          onClick={() => revokeLink(link.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Revoke
                        </button>
                      ) : (
                        "—"
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
}