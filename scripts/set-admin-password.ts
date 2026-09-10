/**
 * Creates a staff account, or resets the password on an existing one, against
 * whatever MONGODB_URI points at. Unlike make-admin — which only prints a
 * document — this one writes.
 *
 *   read -rs "?New password: " ADMIN_PASSWORD; echo
 *   ADMIN_EMAIL=you@shop.com ADMIN_PASSWORD="$ADMIN_PASSWORD" npm run set-admin-password
 */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AdminUser, ADMIN_ROLES, type AdminRole } from "../src/server/models/AdminUser.ts";

// .env.local is read by Next at runtime; a plain node script needs it too.
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* no .env.local — rely on the environment */
}

const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Store owner";
const role = (process.env.ADMIN_ROLE?.trim() || "owner") as AdminRole;

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD.");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Use a password of at least 10 characters.");
  process.exit(1);
}
if (!ADMIN_ROLES.includes(role)) {
  console.error(`ADMIN_ROLE must be one of ${ADMIN_ROLES.join(", ")}.`);
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

await mongoose.connect(uri);
console.log(`connected to ${mongoose.connection.name} on ${mongoose.connection.host}`);

const existing = await AdminUser.findOne({ email });
const passwordHash = await bcrypt.hash(password, 12);

if (existing) {
  await AdminUser.updateOne({ email }, { passwordHash, active: true });
  console.log(`password reset for ${email} (${existing.role})`);
} else {
  await AdminUser.create({ email, name, passwordHash, role, active: true });
  console.log(`created ${email} as ${role}`);
}

// Read it back and check the stored hash actually matches, so a silent write
// failure cannot look like success.
const saved = await AdminUser.findOne({ email });
const verified = saved ? await bcrypt.compare(password, saved.passwordHash) : false;
console.log(`verified against the stored hash: ${verified ? "yes" : "NO — something is wrong"}`);

const all = await AdminUser.find().select("email role active").lean();
console.log("\nstaff accounts in this database:");
for (const u of all) console.log(`  ${u.email.padEnd(30)} ${u.role}${u.active ? "" : "  (disabled)"}`);

await mongoose.disconnect();
if (!verified) process.exit(1);
