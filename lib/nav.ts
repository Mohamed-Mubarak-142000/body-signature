export type NavItem = {
  href: string;
  label: string;
  minRole: "assistant" | "admin";
};

// Role split per BACKEND_PRD.md §4.2 — admin gets everything an assistant
// does, plus Team. There's no third dashboard role.
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", minRole: "assistant" },
  { href: "/categories", label: "Categories", minRole: "assistant" },
  { href: "/products", label: "Products", minRole: "assistant" },
  { href: "/orders", label: "Orders", minRole: "assistant" },
  { href: "/bookings", label: "Bookings", minRole: "assistant" },
  { href: "/services", label: "Services", minRole: "assistant" },
  { href: "/content", label: "Content", minRole: "assistant" },
  { href: "/messages", label: "Messages", minRole: "assistant" },
  { href: "/team", label: "Team", minRole: "admin" },
];

export function navForRole(role: "assistant" | "admin") {
  return NAV_ITEMS.filter((item) => item.minRole === "assistant" || role === "admin");
}
