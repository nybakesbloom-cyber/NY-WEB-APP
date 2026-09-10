/**
 * Describes each editable content block field by field, so the admin can render
 * a real form — headings, descriptions, images, colours — instead of asking
 * someone to hand-edit JSON. Anything without a schema still falls back to the
 * JSON editor, so a new block is usable before it is described here.
 */

export type Field =
  | { type: "text"; key: string; label: string; hint?: string; placeholder?: string }
  | { type: "textarea"; key: string; label: string; hint?: string; rows?: number }
  | { type: "number"; key: string; label: string; hint?: string; min?: number; max?: number }
  | { type: "color"; key: string; label: string; hint?: string }
  | { type: "image"; key: string; label: string; hint?: string }
  | { type: "boolean"; key: string; label: string; hint?: string }
  | { type: "select"; key: string; label: string; options: string[]; hint?: string }
  | { type: "strings"; key: string; label: string; hint?: string }
  | { type: "list"; key: string; label: string; hint?: string; itemLabel: string; fields: Field[] };

export type BlockSchema = {
  label: string;
  where: string;
  fields: Field[];
};

const ART_KINDS = ["cake", "bouquet", "basket", "combo", "plant", "hamper"];
const ICONS = ["leaf", "oven", "box", "camera"];

/** The eyebrow / heading / sub-heading trio that most sections share. */
const heading = (prefix: string, label: string): Field[] => [
  { type: "text", key: `${prefix}Eyebrow`, label: `${label} — small label above` },
  { type: "text", key: `${prefix}Title`, label: `${label} — heading` },
  { type: "textarea", key: `${prefix}Sub`, label: `${label} — description`, rows: 2 },
];

export const CONTENT_SCHEMA: Record<string, BlockSchema> = {
  announcements: {
    label: "Announcement strip",
    where: "The scrolling gold strip at the very top of every page",
    fields: [{ type: "strings", key: "items", label: "Lines", hint: "They scroll on a loop." }],
  },

  header: {
    label: "Header",
    where: "Logo bar, search box, city picker and the delivery note in the nav",
    fields: [
      { type: "text", key: "searchPlaceholder", label: "Search box placeholder" },
      { type: "strings", key: "cities", label: "Cities in the picker" },
      { type: "text", key: "cutoffLabel", label: "Text before the countdown" },
      { type: "text", key: "cutoffRolledLabel", label: "Text once today's cut-off has passed" },
      { type: "text", key: "cartLabel", label: "Cart button label" },
    ],
  },

  hero: {
    label: "Hero title sequence",
    where: "The scroll-driven film at the top of the home page",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label above the headline" },
      {
        type: "list", key: "words", label: "Headline lines", itemLabel: "Line",
        hint: "Each appears as you scroll. from/to are positions between 0 and 1.",
        fields: [
          { type: "text", key: "text", label: "Text" },
          { type: "boolean", key: "gold", label: "Gold" },
          { type: "number", key: "from", label: "Appears at", min: -1, max: 1 },
          { type: "number", key: "to", label: "Fully in by", min: -1, max: 1 },
        ],
      },
      {
        type: "list", key: "chapters", label: "Chapters", itemLabel: "Chapter",
        fields: [
          { type: "text", key: "clock", label: "Time" },
          { type: "text", key: "label", label: "Caption" },
          { type: "textarea", key: "line", label: "Description", rows: 2 },
          { type: "number", key: "at", label: "Starts at", min: -1, max: 2 },
          { type: "number", key: "to", label: "Ends at", min: -1, max: 2 },
        ],
      },
      { type: "text", key: "primary.label", label: "Main button — label" },
      { type: "text", key: "primary.href", label: "Main button — link" },
      { type: "text", key: "secondary.label", label: "Second button — label" },
      { type: "text", key: "secondary.href", label: "Second button — link" },
    ],
  },

  sections: {
    label: "Section headings",
    where: "Every heading down the home page, in order",
    fields: [
      ...heading("categories", "Categories"),
      { type: "text", key: "categoriesLink", label: "Categories — button label" },
      ...heading("flow", "Image ribbon"),
      ...heading("bestsellers", "Bestsellers"),
      ...heading("occasions", "Occasions"),
      ...heading("cakes", "Cakes"),
      ...heading("flowers", "Flowers"),
      ...heading("reviews", "Reviews"),
      ...heading("process", "How it is made"),
    ],
  },

  categories: {
    label: "Categories",
    where: "The five cards under the hero, and both nav menus",
    fields: [
      {
        type: "list", key: "items", label: "Categories", itemLabel: "Category",
        fields: [
          { type: "text", key: "slug", label: "URL slug" },
          { type: "text", key: "name", label: "Name" },
          { type: "textarea", key: "blurb", label: "Description", rows: 2 },
          { type: "select", key: "art", label: "Artwork style", options: ART_KINDS },
          { type: "image", key: "image", label: "Photo (optional)", hint: "Replaces the drawn artwork." },
          { type: "color", key: "hue1", label: "Subject colour" },
          { type: "color", key: "hue2", label: "Background colour" },
        ],
      },
    ],
  },

  occasions: {
    label: "Occasions",
    where: "The eight tiles on the emerald band, and the occasion menu",
    fields: [
      {
        type: "list", key: "items", label: "Occasions", itemLabel: "Occasion",
        fields: [
          { type: "text", key: "slug", label: "URL slug" },
          { type: "text", key: "name", label: "Name" },
          { type: "textarea", key: "blurb", label: "Description", rows: 2 },
        ],
      },
    ],
  },

  promises: {
    label: "Why us",
    where: "The four cards under the image ribbon",
    fields: [
      {
        type: "list", key: "items", label: "Promises", itemLabel: "Promise",
        fields: [
          { type: "select", key: "icon", label: "Icon", options: ICONS },
          { type: "text", key: "title", label: "Heading" },
          { type: "textarea", key: "body", label: "Description", rows: 3 },
        ],
      },
    ],
  },

  reviews: {
    label: "Customer reviews",
    where: "The three quotes near the bottom of the home page",
    fields: [
      {
        type: "list", key: "items", label: "Reviews", itemLabel: "Review",
        fields: [
          { type: "text", key: "name", label: "Name" },
          { type: "text", key: "city", label: "City" },
          { type: "number", key: "rating", label: "Stars", min: 1, max: 5 },
          { type: "textarea", key: "text", label: "Quote", rows: 4 },
        ],
      },
    ],
  },

  cta: {
    label: "Reminder band",
    where: "The dark panel at the foot of the home page",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label above" },
      { type: "text", key: "title", label: "Heading" },
      { type: "textarea", key: "body", label: "Description", rows: 3 },
      { type: "text", key: "placeholder", label: "Email box placeholder" },
      { type: "text", key: "button", label: "Button label" },
      { type: "text", key: "note", label: "Small print underneath" },
    ],
  },

  process: {
    label: "How it is made",
    where: "The pinned scroll section and its five detail pages",
    fields: [
      {
        type: "list", key: "items", label: "Stages", itemLabel: "Stage",
        fields: [
          { type: "text", key: "slug", label: "URL slug" },
          { type: "text", key: "phase", label: "Phase label" },
          { type: "text", key: "title", label: "Title" },
          { type: "text", key: "clock", label: "Time" },
          { type: "textarea", key: "standfirst", label: "Short version", rows: 3 },
          { type: "textarea", key: "intro", label: "Opening paragraph", rows: 4 },
          { type: "textarea", key: "goesWrong", label: "What goes wrong here", rows: 4 },
        ],
      },
    ],
  },

  blog: {
    label: "Journal",
    where: "The heading on /blog",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label above" },
      { type: "text", key: "title", label: "Heading" },
      { type: "textarea", key: "sub", label: "Description", rows: 2 },
    ],
  },

  footer: {
    label: "Footer",
    where: "Everything below the last section",
    fields: [
      { type: "textarea", key: "blurb", label: "About paragraph", rows: 3 },
      { type: "strings", key: "cities", label: "Delivery cities" },
      { type: "strings", key: "help", label: "Help links" },
      { type: "strings", key: "socials", label: "Social links" },
      { type: "text", key: "legal", label: "Legal line" },
    ],
  },

  theme: {
    label: "Colours",
    where: "The palette used across the whole site",
    fields: [
      { type: "color", key: "brand", label: "Emerald — main" },
      { type: "color", key: "brandDeep", label: "Emerald — dark" },
      { type: "color", key: "gold", label: "Gold" },
      { type: "color", key: "goldLight", label: "Gold — light" },
      { type: "color", key: "cream", label: "Page background" },
      { type: "color", key: "ink", label: "Body text" },
    ],
  },

  settings: {
    label: "Store settings",
    where: "Delivery thresholds, fees and order numbering",
    fields: [
      {
        type: "boolean", key: "demoMode", label: "Demo mode — do not save real orders",
        hint: "On: checkout shows a confirmation but writes nothing. Turn off when you are ready to take real orders.",
      },
      { type: "number", key: "freeDeliveryOver", label: "Free delivery over (₹)", min: 0 },
      { type: "number", key: "deliveryFee", label: "Delivery fee (₹)", min: 0 },
      { type: "number", key: "codFee", label: "Cash-on-delivery fee (₹)", min: 0 },
      { type: "number", key: "sameDayCutoffHour", label: "Same-day cut-off hour", min: 0, max: 23 },
      { type: "number", key: "midnightCutoffHour", label: "Midnight cut-off hour", min: 0, max: 23 },
      { type: "text", key: "currency", label: "Currency code" },
      { type: "text", key: "orderPrefix", label: "Order number prefix" },
    ],
  },
};

/** Order the admin lists blocks in — roughly top of the page to bottom. */
export const BLOCK_ORDER = [
  "theme", "announcements", "header", "hero", "sections", "categories",
  "promises", "process", "occasions", "reviews", "cta", "blog", "footer", "settings",
];
