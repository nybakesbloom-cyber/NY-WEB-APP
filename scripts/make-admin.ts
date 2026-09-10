/**
 * Prints a ready-to-paste admin user document. Passwords are stored as a
 * bcrypt hash, so a document typed by hand in Atlas will never log in — this
 * produces the hash for you without the password touching the database tools,
 * your shell history or the network.
 *
 *   read -rs "?Password: " ADMIN_PASSWORD; echo
 *   ADMIN_EMAIL=you@shop.com ADMIN_PASSWORD="$ADMIN_PASSWORD" npm run make-admin
 */
import bcrypt from "bcryptjs";

const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Store owner";
const role = process.env.ADMIN_ROLE?.trim() || "owner";

if (!email || !password) {
  console.error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD.\n\n" +
      '  read -rs "?Password: " ADMIN_PASSWORD; echo\n' +
      '  ADMIN_EMAIL=you@shop.com ADMIN_PASSWORD="$ADMIN_PASSWORD" npm run make-admin\n',
  );
  process.exit(1);
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error(`"${email}" is not a valid email address.`);
  process.exit(1);
}
if (password.length < 10) {
  console.error("Use a password of at least 10 characters.");
  process.exit(1);
}
if (!["owner", "manager", "staff"].includes(role)) {
  console.error(`ADMIN_ROLE must be owner, manager or staff (got "${role}").`);
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, 12);
const now = new Date().toISOString();

const doc = {
  email,
  name,
  passwordHash,
  role,
  active: true,
  lastLoginAt: null,
  createdAt: { $date: now },
  updatedAt: { $date: now },
};

console.log(`
Collection:  adminusers
Database:    ny_bakes_bloom

── Paste this into Atlas → Browse Collections → adminusers → INSERT DOCUMENT ──
   (switch the editor to {} JSON view first)

${JSON.stringify(doc, null, 2)}

── or run this in mongosh ────────────────────────────────────────────────────

db.adminusers.insertOne(${JSON.stringify({ ...doc, createdAt: "NEW_DATE", updatedAt: "NEW_DATE" })
  .replace(/"NEW_DATE"/g, "new Date()")})

── or skip the database entirely and set these ───────────────────────────────

   In a .env file — every $ escaped, or dotenv eats the hash:

ADMIN_LOGIN_EMAIL=${email}
ADMIN_LOGIN_PASSWORD_HASH=${passwordHash.replace(/\$/g, "\\$")}

   In a hosting dashboard (Vercel, Railway…) — paste it unescaped:

${passwordHash}

──────────────────────────────────────────────────────────────────────────────
Sign in at /admin/login with ${email} and the password you just typed.
The hash is salted, so running this again gives a different string for the
same password — that is expected.
`);
