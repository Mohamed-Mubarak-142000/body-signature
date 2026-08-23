import { auth } from "@/lib/auth";
import { Placeholder } from "@/components/placeholder";

export default async function TeamPage() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return <Placeholder title="Team" note="Admins only." />;
  }

  return (
    <Placeholder
      title="Team"
      note="Waiting on the backend's staff management endpoints (BACKEND_PRD.md §4.2)."
    />
  );
}
