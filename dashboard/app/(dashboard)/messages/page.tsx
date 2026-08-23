import { backendFetch } from "@/lib/backend";

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
};

async function getSubmissions(): Promise<ContactSubmission[]> {
  const res = await backendFetch("/api/contact");
  if (!res.ok) return [];
  return res.json();
}

export default async function MessagesPage() {
  const submissions = await getSubmissions();

  return (
    <div>
      <h1 className="text-xl font-semibold">Messages</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Live from the backend (GET /api/contact, staff-only). Marking as
        read/replied isn&apos;t built yet.
      </p>

      <ul className="mt-6 space-y-3">
        {submissions.length === 0 && (
          <li className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-400">
            No messages yet.
          </li>
        )}
        {submissions.map((submission) => (
          <li key={submission.id} className="rounded-md border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{submission.name}</span>
              <span className="text-neutral-400">{submission.status}</span>
            </div>
            <p className="text-sm text-neutral-500">{submission.email}</p>
            <p className="mt-2 text-sm">{submission.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
