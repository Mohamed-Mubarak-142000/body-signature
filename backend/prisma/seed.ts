import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

const ADMIN_EMAIL = "admin@bodysignature.nl";
const ADMIN_PASSWORD = "ChangeMe123!";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: "Admin",
      role: "admin",
      emailVerified: true,
    },
  });

  console.log(`Seeded admin user: ${admin.email} (id: ${admin.id})`);
  console.log(`Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} — change this password once you're in.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
