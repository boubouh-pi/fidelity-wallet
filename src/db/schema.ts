/**
 * Database schema. Every restaurant-owned table carries restaurant_id, and every
 * service query filters on it: that is how one restaurant never sees another's data.
 */
import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const restaurantStatus = pgEnum("restaurant_status", ["active", "onboarding", "paused"]);

export const restaurants = pgTable("restaurants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  status: restaurantStatus("status").notNull().default("onboarding"),
});

/** Card appearance. Configured by Fidelity Wallet. */
export const loyaltyCards = pgTable("loyalty_cards", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull().unique().references(() => restaurants.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  tagline: text("tagline").notNull(),
  brandColor: text("brand_color").notNull(),
  accentColor: text("accent_color").notNull(),
  logoUrl: text("logo_url"),
});

/** Program rules. Configured by Fidelity Wallet; `editableFields` lists what the restaurant may change. */
export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull().unique().references(() => restaurants.id, { onDelete: "cascade" }),
  stampsRequired: integer("stamps_required").notNull(),
  rewardTitle: text("reward_title").notNull(),
  rewardDescription: text("reward_description").notNull(),
  expiresInDays: integer("expires_in_days").notNull(),
  editableFields: text("editable_fields").array().notNull().default([]),
});

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  memberId: text("member_id").notNull(),
  stamps: integer("stamps").notNull().default(0),
  lastVisitAt: timestamp("last_visit_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("customers_restaurant_id_idx").on(t.restaurantId)]);

export const redemptions = pgTable("redemptions", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  /** Reward title at the time of redemption. */
  rewardTitle: text("reward_title").notNull(),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("redemptions_restaurant_id_redeemed_at_idx").on(t.restaurantId, t.redeemedAt)]);

export const promotions = pgTable("promotions", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  endedEarly: boolean("ended_early").notNull().default(false),
}, (t) => [index("promotions_restaurant_id_idx").on(t.restaurantId)]);

export const restaurantProfiles = pgTable("restaurant_profiles", {
  restaurantId: text("restaurant_id").primaryKey().references(() => restaurants.id, { onDelete: "cascade" }),
  contactEmail: text("contact_email").notNull(),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  website: text("website").notNull().default(""),
});

// ---------------------------------------------------------------------------
// Authentication

/** "admin" = Fidelity Wallet staff (all restaurants). "restaurant" = one restaurant's team. */
export const userRole = pgEnum("user_role", ["admin", "restaurant"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  /** Stored lowercased. */
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  /** scrypt hash, never the password itself. */
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull(),
  /** Required for restaurant users, empty for admins. */
  restaurantId: text("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  check("users_restaurant_matches_role", sql`(${t.role} = 'admin') = (${t.restaurantId} is null)`),
]);

/** Login sessions. The id is the SHA-256 of the cookie token, so a database leak exposes no usable session. */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("sessions_user_id_idx").on(t.userId)]);

/** Failed logins, used to slow down password guessing. */
export const loginAttempts = pgTable("login_attempts", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("login_attempts_email_attempted_at_idx").on(t.email, t.attemptedAt)]);
