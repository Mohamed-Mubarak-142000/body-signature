import Link from "next/link";

import { navForRole } from "@/lib/nav";

export function Sidebar({ role }: { role: "assistant" | "admin" }) {
  const items = navForRole(role);

  return (
    <nav className="w-56 shrink-0 border-r border-neutral-200 bg-white px-4 py-6">
      <p className="mb-6 px-2 text-sm font-semibold tracking-tight">Body Signature</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
