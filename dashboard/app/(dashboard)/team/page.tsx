import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { Placeholder } from "@/components/placeholder";
import { TeamClient, type StaffMember } from "./team-client";

async function getStaff(): Promise<StaffMember[]> {
  const res = await backendFetch("/api/staff");
  if (!res.ok) return [];
  return res.json();
}

export default async function TeamPage() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return <Placeholder title="Team" note="Admins only." />;
  }

  const staff = await getStaff();

  return (
    <div>
      <h1 className="text-xl font-semibold">Team</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">
        Admin and Assistant accounts. No self-signup — you add people here.
      </p>
      <TeamClient staff={staff} currentUserId={session.user.id} />
    </div>
  );
}
