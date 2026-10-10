/**
 * Resets the database to the demo restaurants: `npm run db:seed`.
 * Deletes every row first, so never run it against a database with real data.
 */
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { generatePassword, hashPassword } from "@/auth/password";
import { addDays } from "@/lib/utils";
import { getDb, schema } from "./index";
import { seedAdmin, seedRestaurants } from "./seed-data";

/** Where the generated demo passwords are written. Git-ignored: never commit it. */
const CREDENTIALS_FILE = "seed-credentials.txt";

const DAY_MS = 24 * 60 * 60 * 1000;

async function seed() {
  const db = getDb();
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);

  // Fresh random passwords on every seed: nothing guessable is ever committed to the repository.
  const credentials: { email: string; password: string; access: string }[] = [];
  const account = async (email: string, access: string) => {
    const password = generatePassword();
    credentials.push({ email, password, access });
    return hashPassword(password);
  };

  await db.transaction(async (tx) => {
    // Deleting restaurants cascades to every table that references them; admins are removed separately.
    await tx.delete(schema.loginAttempts);
    await tx.delete(schema.users);
    await tx.delete(schema.restaurants);

    await tx.insert(schema.users).values({
      id: randomUUID(), ...seedAdmin, role: "admin", passwordHash: await account(seedAdmin.email, "Fidelity Wallet admin"),
    });

    for (const s of seedRestaurants) {
      const restaurantId = s.restaurant.id;
      await tx.insert(schema.restaurants).values(s.restaurant);
      await tx.insert(schema.loyaltyCards).values({ id: `card_${restaurantId}`, restaurantId, ...s.design });
      await tx.insert(schema.loyaltyPrograms).values({
        id: `prog_${restaurantId}`, restaurantId, ...s.program, editableFields: s.editableFields,
      });
      await tx.insert(schema.restaurantProfiles).values({ restaurantId, ...s.profile });
      await tx.insert(schema.users).values({
        id: randomUUID(), ...s.account, role: "restaurant", restaurantId,
        passwordHash: await account(s.account.email, s.restaurant.name),
      });

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

  writeFileSync(
    CREDENTIALS_FILE,
    [
      "Demo accounts created by npm run db:seed. Keep this file private; it is not committed.",
      "",
      ...credentials.map((c) => `${c.access.padEnd(24)} ${c.email.padEnd(34)} ${c.password}`),
      "",
    ].join("\n"),
    { mode: 0o600 },
  );
  console.log(`Seeded ${seedRestaurants.length} demo restaurants and ${credentials.length} accounts.`);
  console.log(`Demo logins written to ${CREDENTIALS_FILE} (git-ignored).`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
