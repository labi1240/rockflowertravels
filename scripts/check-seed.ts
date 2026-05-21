import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const stops = await prisma.stop.count();
  const routes = await prisma.route.count();
  const templates = await prisma.scheduleTemplate.count();
  const legs = await prisma.legTemplate.count();
  const vehicles = await prisma.vehicle.count();
  const bookable = await prisma.legTemplate.count({ where: { bookable: true } });

  const sample = await prisma.scheduleTemplate.findMany({
    select: {
      label: true,
      route: { select: { kind: true, isPremium: true } },
      legs: {
        orderBy: { sequence: "asc" },
        select: {
          sequence: true,
          departMin: true,
          arriveMin: true,
          bookable: true,
          priceCents: true,
          fromStop: { select: { code: true } },
          toStop: { select: { code: true } },
        },
      },
    },
    orderBy: [{ route: { kind: "asc" } }, { sortOrder: "asc" }],
  });

  console.log({ stops, routes, templates, legs, bookable, vehicles });
  for (const t of sample) {
    console.log(`\n[${t.route.kind}${t.route.isPremium ? " ★" : ""}] ${t.label}`);
    for (const l of t.legs) {
      const dh = String(Math.floor(l.departMin / 60)).padStart(2, "0");
      const dm = String(l.departMin % 60).padStart(2, "0");
      const ah = String(Math.floor(l.arriveMin / 60)).padStart(2, "0");
      const am = String(l.arriveMin % 60).padStart(2, "0");
      console.log(
        `  ${l.sequence}. ${l.fromStop.code} → ${l.toStop.code}  ${dh}:${dm}-${ah}:${am}  ${l.bookable ? `$${(l.priceCents / 100).toFixed(2)}` : "positioning"}`,
      );
    }
  }
}

main().finally(() => prisma.$disconnect());