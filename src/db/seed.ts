/**
 * Resets the database to the demo restaurants: `npm run db:seed`.
 * Deletes every row first, so never run it against a database with real data.
 */
import { randomUUID } from "node:crypto";
import { addDays } from "@/lib/utils";
import { getDb, schema } from "./index";
import { seedRestaurants } from "./seed-data";

const DAY_MS = 24 * 60 * 60 * 1000;

async function seed() {
  const db = getDb();
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);

  await db.transaction(async (tx) => {
    // Deleting restaurants cascades to every table that references them.
    await tx.delete(schema.restaurants);

    for (const s of seedRestaurants) {
      const restaurantId = s.restaurant.id;
      await tx.insert(schema.restaurants).values(s.restaurant);
      await tx.insert(schema.loyaltyCards).values({ id: `card_${restaurantId}`, restaurantId, ...s.design });
      await tx.insert(schema.loyaltyPrograms).values({
        id: `prog_${restaurantId}`, restaurantId, ...s.program, editableFields: s.editableFields,
      });
      await tx.insert(schema.restaurantProfiles).values({ restaurantId, ...s.profile });

      if (s.customers.length) {
        await tx.insert(schema.customers).values(
          s.customers.map(({ lastVisitDaysAgo, ...c }) => ({
            ...c, restaurantId, lastVisitAt: new Date(now - lastVisitDaysAgo * DAY_MS),
          })),
        );
      }
      if (s.redemptions.length) {
        await tx.insert(schema.redemptions).values(
          s.redemptions.map(({ customerId, daysAgo }) => ({
            id: randomUUID(),
            restaurantId,
            customerId,
            customerName: s.customers.find((c) => c.id === customerId)!.name,
            rewardTitle: s.program.rewardTitle,
            redeemedAt: new Date(now - daysAgo * DAY_MS),
          })),
        );
      }
      if (s.promotions.length) {
        await tx.insert(schema.promotions).values(
          s.promotions.map(({ startInDays, endInDays, ...p }) => ({
            ...p, id: randomUUID(), restaurantId,
            startDate: addDays(today, startInDays), endDate: addDays(today, endInDays),
          })),
        );
      }
    }
  });

  console.log(`Seeded ${seedRestaurants.length} demo restaurants.`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
