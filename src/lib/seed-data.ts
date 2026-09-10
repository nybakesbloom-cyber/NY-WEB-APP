import { PROCESS as PROCESS_STEPS } from "./process.ts";

/**
 * The original static catalogue, kept here purely as seed input. The live
 * catalogue is in MongoDB — edit it in the admin, not in this file.
 */
export type SeedCategory = { slug: string; name: string; blurb: string; art: string; hues: [string, string] };
export type SeedOccasion = { slug: string; name: string; blurb: string };
export type SeedProduct = {
  slug: string; name: string; tagline: string; category: string; occasions: string[];
  price: number; mrp?: number; rating: number; reviews: number;
  art: string; hues: [string, string];
  variants: { label: string; delta: number }[];
  flavours?: string[]; contains: string[]; description: string; care: string;
  bestseller?: boolean; eggless?: boolean; sameDay?: boolean;
};

const CAKE_FLAVOURS = [
  "Belgian Chocolate",
  "Red Velvet",
  "Butterscotch",
  "Pineapple",
  "Black Forest",
  "Vanilla Bean",
];

export const CATEGORIES: SeedCategory[] = [
  {
    slug: "cakes",
    name: "Cakes",
    blurb: "Baked to order, iced by hand, delivered chilled.",
    art: "cake",
    hues: ["#C9A227", "#F0E1B4"],
  },
  {
    slug: "flowers",
    name: "Flowers",
    blurb: "Cut the same morning, wrapped the same hour.",
    art: "bouquet",
    hues: ["#C2185B", "#F8BBD0"],
  },
  {
    slug: "combos",
    name: "Cake & Flower Combos",
    blurb: "One order, two gifts, a single doorbell.",
    art: "combo",
    hues: ["#14684A", "#EBD489"],
  },
  {
    slug: "plants",
    name: "Plants",
    blurb: "A gift with a longer memory than a bouquet.",
    art: "plant",
    hues: ["#1C8560", "#B9DCC9"],
  },
  {
    slug: "hampers",
    name: "Gift Hampers",
    blurb: "Chocolate, dry fruit and something that blooms.",
    art: "hamper",
    hues: ["#8A6A16", "#F7EFD6"],
  },
];

export const OCCASIONS: SeedOccasion[] = [
  { slug: "birthday", name: "Birthday", blurb: "Candles, cream and a name piped on top." },
  { slug: "anniversary", name: "Anniversary", blurb: "Roses that count the years." },
  { slug: "love", name: "Love & Romance", blurb: "Say it before you lose the nerve." },
  { slug: "congratulations", name: "Congratulations", blurb: "For promotions, results and new keys." },
  { slug: "wedding", name: "Wedding", blurb: "Bigger arrangements, longer stems." },
  { slug: "thank-you", name: "Thank You", blurb: "Small gestures, properly made." },
  { slug: "new-baby", name: "New Baby", blurb: "Soft colours and softer sponge." },
  { slug: "sympathy", name: "Sympathy", blurb: "White, quiet and delivered on time." },
];



export const PRODUCTS: SeedProduct[] = [
  {
    slug: "midnight-truffle-cake",
    name: "Midnight Truffle Cake",
    tagline: "Dark chocolate ganache, cocoa dust, no shortcuts",
    category: "cakes",
    occasions: ["birthday", "anniversary", "love"],
    price: 899,
    mrp: 1099,
    rating: 4.8,
    reviews: 2143,
    art: "cake",
    hues: ["#3E2417", "#7B4A2C"],
    variants: [
      { label: "500 g", delta: 0 },
      { label: "1 kg", delta: 550 },
      { label: "1.5 kg", delta: 1100 },
    ],
    flavours: CAKE_FLAVOURS,
    contains: ["Chocolate sponge", "Truffle ganache", "Cocoa nib crown", "Wooden knife & candles"],
    description:
      "Three layers of chocolate sponge soaked in cocoa syrup, sealed with a truffle ganache that sets firm at the edge and stays soft in the middle. Finished with a cocoa dusting and a ring of nibs.",
    care: "Keep refrigerated. Bring to room temperature for 20 minutes before cutting.",
    bestseller: true,
    eggless: true,
    sameDay: true,
  },
  {
    slug: "red-velvet-crown",
    name: "Red Velvet Crown",
    tagline: "Cream cheese frosting with a gold leaf finish",
    category: "cakes",
    occasions: ["anniversary", "love", "congratulations"],
    price: 1049,
    mrp: 1249,
    rating: 4.7,
    reviews: 1388,
    art: "cake",
    hues: ["#8E1B2E", "#E8C9CF"],
    variants: [
      { label: "500 g", delta: 0 },
      { label: "1 kg", delta: 600 },
    ],
    flavours: CAKE_FLAVOURS,
    contains: ["Red velvet sponge", "Cream cheese frosting", "Edible gold leaf", "Candles"],
    description:
      "A proper red velvet — buttermilk in the batter, a whisper of cocoa, and a cream cheese frosting whipped cold. Crowned with hand-laid edible gold leaf.",
    care: "Refrigerate on arrival. Best eaten within 48 hours.",
    bestseller: true,
    sameDay: true,
  },
  {
    slug: "pistachio-rose-gateau",
    name: "Pistachio Rose Gâteau",
    tagline: "Ground pistachio sponge, rose water cream",
    category: "cakes",
    occasions: ["anniversary", "wedding", "thank-you"],
    price: 1299,
    rating: 4.9,
    reviews: 612,
    art: "cake",
    hues: ["#5E7B3A", "#DCE8C4"],
    variants: [
      { label: "1 kg", delta: 0 },
      { label: "1.5 kg", delta: 620 },
      { label: "2 kg", delta: 1240 },
    ],
    flavours: ["Pistachio Rose", "Pistachio Cardamom"],
    contains: ["Pistachio sponge", "Rose water cream", "Candied petals", "Slivered pistachio"],
    description:
      "Pistachios ground fresh into the sponge, layered with a rose water cream that stops well short of perfume. Finished with candied petals and slivered nuts.",
    care: "Refrigerate. Contains tree nuts.",
    eggless: true,
  },
  {
    slug: "classic-black-forest",
    name: "Classic Black Forest",
    tagline: "Cherries, cream, chocolate curls",
    category: "cakes",
    occasions: ["birthday", "congratulations", "thank-you"],
    price: 749,
    mrp: 899,
    rating: 4.6,
    reviews: 3021,
    art: "cake",
    hues: ["#2B2B2B", "#B0413E"],
    variants: [
      { label: "500 g", delta: 0 },
      { label: "1 kg", delta: 480 },
      { label: "2 kg", delta: 1420 },
    ],
    flavours: CAKE_FLAVOURS,
    contains: ["Chocolate sponge", "Whipped cream", "Morello cherries", "Chocolate curls"],
    description:
      "The one everybody actually orders. Chocolate sponge, plenty of cream, real morello cherries and a heavy hand with the chocolate curls.",
    care: "Refrigerate on arrival.",
    eggless: true,
    sameDay: true,
  },
  {
    slug: "butterscotch-praline-cake",
    name: "Butterscotch Praline",
    tagline: "Caramel crunch through every layer",
    category: "cakes",
    occasions: ["birthday", "new-baby", "thank-you"],
    price: 799,
    rating: 4.5,
    reviews: 1470,
    art: "cake",
    hues: ["#B5701C", "#F2D9A8"],
    variants: [
      { label: "500 g", delta: 0 },
      { label: "1 kg", delta: 500 },
    ],
    flavours: CAKE_FLAVOURS,
    contains: ["Vanilla sponge", "Butterscotch cream", "Praline crunch", "Caramel drizzle"],
    description:
      "Vanilla sponge with butterscotch cream and a praline crunch that keeps its bite for two days. Caramel poured over the top just before boxing.",
    care: "Refrigerate. Contains nuts.",
    sameDay: true,
  },
  {
    slug: "photo-print-cake",
    name: "Photo Print Cake",
    tagline: "Your picture, edible ink, next-day",
    category: "cakes",
    occasions: ["birthday", "congratulations", "new-baby"],
    price: 1149,
    rating: 4.4,
    reviews: 892,
    art: "cake",
    hues: ["#1C6E8C", "#CFE7EF"],
    variants: [
      { label: "1 kg", delta: 0 },
      { label: "1.5 kg", delta: 520 },
    ],
    flavours: CAKE_FLAVOURS,
    contains: ["Vanilla or chocolate sponge", "Edible ink print", "Cream finish", "Candles"],
    description:
      "Upload a photo at checkout and we print it in edible ink on a fondant sheet. Faces come out best on a plain background.",
    care: "Refrigerate. Print is edible and food-safe.",
    eggless: true,
  },
  {
    slug: "hundred-red-roses",
    name: "100 Red Roses",
    tagline: "A hundred stems, one ribbon, no explanation needed",
    category: "flowers",
    occasions: ["love", "anniversary", "wedding"],
    price: 3499,
    mrp: 3999,
    rating: 4.9,
    reviews: 741,
    art: "bouquet",
    hues: ["#A6122B", "#E8607A"],
    variants: [
      { label: "100 stems", delta: 0 },
      { label: "150 stems", delta: 1500 },
    ],
    contains: ["100 red roses", "Green fillers", "Kraft & tissue wrap", "Satin ribbon"],
    description:
      "One hundred red roses, graded for head size, wrapped in kraft and tissue and tied with a satin ribbon wide enough to notice.",
    care: "Trim 2 cm off the stems at an angle and stand in fresh water daily.",
    bestseller: true,
    sameDay: true,
  },
  {
    slug: "emerald-lily-bunch",
    name: "Emerald Lily Bunch",
    tagline: "White oriental lilies with deep green foliage",
    category: "flowers",
    occasions: ["sympathy", "thank-you", "congratulations"],
    price: 1299,
    rating: 4.7,
    reviews: 508,
    art: "bouquet",
    hues: ["#F4F7F2", "#0F5138"],
    variants: [
      { label: "6 stems", delta: 0 },
      { label: "10 stems", delta: 600 },
    ],
    contains: ["Oriental lilies", "Eucalyptus", "Ruscus", "Jute wrap"],
    description:
      "Oriental lilies cut in tight bud so they open in the recipient's room, not in our van. Backed with eucalyptus and ruscus.",
    care: "Remove the pollen anthers to protect fabrics. Change water every second day.",
    sameDay: true,
  },
  {
    slug: "golden-sunflower-bunch",
    name: "Golden Sunflower Bunch",
    tagline: "Ten heads that face whoever walks in",
    category: "flowers",
    occasions: ["congratulations", "thank-you", "birthday"],
    price: 899,
    mrp: 1049,
    rating: 4.6,
    reviews: 1206,
    art: "bouquet",
    hues: ["#C9A227", "#F6E3A1"],
    variants: [
      { label: "6 stems", delta: 0 },
      { label: "10 stems", delta: 380 },
    ],
    contains: ["Sunflowers", "Green fillers", "Brown paper wrap", "Gold ribbon"],
    description:
      "Sunflowers with heads the size of a saucer, cut short enough to stand up on their own in a wide vase.",
    care: "Use a heavy vase — the heads are top-weighted.",
    sameDay: true,
  },
  {
    slug: "orchid-and-rose-basket",
    name: "Orchid & Rose Basket",
    tagline: "Purple orchids and blush roses in a cane basket",
    category: "flowers",
    occasions: ["anniversary", "wedding", "thank-you"],
    price: 2199,
    rating: 4.8,
    reviews: 394,
    art: "basket",
    hues: ["#6B3FA0", "#E7D4F0"],
    variants: [
      { label: "Standard", delta: 0 },
      { label: "Grand", delta: 900 },
    ],
    contains: ["Purple orchids", "Blush roses", "Cane basket", "Floral foam base"],
    description:
      "Arranged in soaked foam inside a cane basket, so it arrives finished — nothing for the recipient to cut, trim or arrange.",
    care: "Top up the foam with a little water every other day.",
  },
  {
    slug: "white-carnation-tribute",
    name: "White Carnation Tribute",
    tagline: "Quiet, formal, delivered on time",
    category: "flowers",
    occasions: ["sympathy"],
    price: 1499,
    rating: 4.8,
    reviews: 217,
    art: "basket",
    hues: ["#FAFBF8", "#7A8B85"],
    variants: [
      { label: "Standard", delta: 0 },
      { label: "Large", delta: 700 },
    ],
    contains: ["White carnations", "White chrysanthemums", "Green foliage", "Stand"],
    description:
      "A formal white arrangement on a stand. We deliver these first on any given route and our riders are briefed to be brief.",
    care: "Keep away from direct sun.",
    sameDay: true,
  },
  {
    slug: "tulip-dozen",
    name: "Dutch Tulip Dozen",
    tagline: "Twelve tulips, flown in weekly",
    category: "flowers",
    occasions: ["love", "birthday", "new-baby"],
    price: 1899,
    rating: 4.5,
    reviews: 286,
    art: "bouquet",
    hues: ["#D14A6A", "#FAD6DE"],
    variants: [
      { label: "12 stems", delta: 0 },
      { label: "24 stems", delta: 1700 },
    ],
    contains: ["Imported tulips", "Tissue wrap", "Water tube per stem", "Ribbon"],
    description:
      "Imported tulips arriving on a Wednesday shipment. Colours vary with the week's lot — tell us a preference in the note and we will do our best.",
    care: "Tulips keep growing in the vase. Recut and use cold water.",
  },
  {
    slug: "roses-and-truffle-combo",
    name: "Roses & Truffle Cake",
    tagline: "Twelve red roses with a half-kilo truffle cake",
    category: "combos",
    occasions: ["birthday", "anniversary", "love"],
    price: 1699,
    mrp: 1998,
    rating: 4.8,
    reviews: 1653,
    art: "combo",
    hues: ["#A6122B", "#3E2417"],
    variants: [
      { label: "500 g cake", delta: 0 },
      { label: "1 kg cake", delta: 550 },
    ],
    flavours: CAKE_FLAVOURS,
    contains: ["12 red roses", "500 g truffle cake", "Greeting card", "Candles & knife"],
    description:
      "The pairing that covers you on a forgotten date: a dozen red roses and a half-kilo truffle cake, delivered together in one slot.",
    care: "Refrigerate the cake. Recut the rose stems.",
    bestseller: true,
    eggless: true,
    sameDay: true,
  },
  {
    slug: "sunflower-butterscotch-combo",
    name: "Sunflowers & Butterscotch",
    tagline: "A bright bunch with a caramel cake",
    category: "combos",
    occasions: ["congratulations", "thank-you", "birthday"],
    price: 1549,
    rating: 4.6,
    reviews: 704,
    art: "combo",
    hues: ["#C9A227", "#B5701C"],
    variants: [
      { label: "500 g cake", delta: 0 },
      { label: "1 kg cake", delta: 500 },
    ],
    flavours: CAKE_FLAVOURS,
    contains: ["6 sunflowers", "500 g butterscotch cake", "Greeting card"],
    description:
      "Six sunflowers and a butterscotch cake — the combination we send most often for promotions and exam results.",
    care: "Refrigerate the cake on arrival.",
    sameDay: true,
  },
  {
    slug: "anniversary-gold-set",
    name: "Anniversary Gold Set",
    tagline: "Roses, a gold-leaf cake and a card you write",
    category: "combos",
    occasions: ["anniversary", "wedding", "love"],
    price: 2899,
    mrp: 3298,
    rating: 4.9,
    reviews: 428,
    art: "combo",
    hues: ["#A6122B", "#C9A227"],
    variants: [
      { label: "1 kg cake", delta: 0 },
      { label: "1.5 kg cake", delta: 620 },
    ],
    flavours: ["Belgian Chocolate", "Red Velvet", "Pistachio Rose"],
    contains: ["24 red roses", "1 kg gold-leaf cake", "Handwritten card", "Gold gift box"],
    description:
      "Twenty-four roses, a kilo of gold-leaf finished cake and a card our team writes out in ink from the message you type at checkout.",
    care: "Refrigerate the cake. Keep the roses out of direct sun.",
    bestseller: true,
  },
  {
    slug: "money-plant-brass-pot",
    name: "Money Plant in Brass",
    tagline: "Low light, low effort, long memory",
    category: "plants",
    occasions: ["congratulations", "thank-you", "new-baby"],
    price: 749,
    rating: 4.6,
    reviews: 933,
    art: "plant",
    hues: ["#1C8560", "#C9A227"],
    variants: [
      { label: "Small brass pot", delta: 0 },
      { label: "Large brass pot", delta: 350 },
    ],
    contains: ["Money plant", "Brass finish pot", "Potting mix", "Care card"],
    description:
      "A money plant potted in a brass-finished planter. Survives an office desk, a north-facing window and a fortnight of neglect.",
    care: "Water when the top inch of soil is dry. Indirect light.",
    sameDay: true,
  },
  {
    slug: "peace-lily-planter",
    name: "Peace Lily Planter",
    tagline: "White spathes, ceramic pot",
    category: "plants",
    occasions: ["sympathy", "thank-you", "new-baby"],
    price: 999,
    rating: 4.7,
    reviews: 421,
    art: "plant",
    hues: ["#0F5138", "#EDF3EE"],
    variants: [
      { label: "Standard", delta: 0 },
      { label: "Tall", delta: 400 },
    ],
    contains: ["Peace lily", "Ceramic pot", "Pebble top dressing", "Care card"],
    description:
      "A peace lily in a matte ceramic pot. It droops dramatically when thirsty and recovers within an hour of watering, which makes it forgiving.",
    care: "Water weekly. Keep out of direct sun.",
  },
  {
    slug: "bamboo-luck-tower",
    name: "Lucky Bamboo Tower",
    tagline: "Seven stalks in a glass vase",
    category: "plants",
    occasions: ["congratulations", "birthday", "thank-you"],
    price: 649,
    mrp: 799,
    rating: 4.4,
    reviews: 1112,
    art: "plant",
    hues: ["#14684A", "#B9DCC9"],
    variants: [
      { label: "7 stalks", delta: 0 },
      { label: "10 stalks", delta: 250 },
    ],
    contains: ["Lucky bamboo", "Glass vase", "River pebbles", "Care card"],
    description:
      "Seven stalks arranged in a tower in a clear glass vase with river pebbles. Grows in water alone — no soil, no repotting.",
    care: "Change the water fortnightly. Filtered water if your tap is hard.",
    sameDay: true,
  },
  {
    slug: "chocolate-indulgence-hamper",
    name: "Chocolate Indulgence Hamper",
    tagline: "Imported bars, truffles and a rose stem",
    category: "hampers",
    occasions: ["birthday", "love", "thank-you"],
    price: 1899,
    mrp: 2199,
    rating: 4.7,
    reviews: 587,
    art: "hamper",
    hues: ["#5C3317", "#C9A227"],
    variants: [
      { label: "Standard", delta: 0 },
      { label: "Deluxe", delta: 900 },
    ],
    contains: ["4 imported bars", "Box of 9 truffles", "Single rose stem", "Wooden crate"],
    description:
      "Four imported bars, nine hand-rolled truffles and a single rose, packed into a wooden crate with wood wool and a wax seal.",
    care: "Store below 22°C. Chocolate blooms in heat but is still fine to eat.",
    bestseller: true,
  },
  {
    slug: "dry-fruit-festive-hamper",
    name: "Dry Fruit Festive Hamper",
    tagline: "Almonds, cashews, pistachios, dates",
    category: "hampers",
    occasions: ["congratulations", "wedding", "thank-you"],
    price: 2399,
    rating: 4.6,
    reviews: 318,
    art: "hamper",
    hues: ["#8A6A16", "#F0E1B4"],
    variants: [
      { label: "1 kg assorted", delta: 0 },
      { label: "2 kg assorted", delta: 1300 },
    ],
    contains: ["Almonds", "Cashews", "Pistachios", "Medjool dates", "Brass tray"],
    description:
      "Graded dry fruit in four sealed jars on a brass tray. The tray is the part people keep.",
    care: "Reseal after opening. Keep dry.",
  },
  {
    slug: "new-baby-hamper",
    name: "New Baby Hamper",
    tagline: "Soft toy, vanilla cake and white blooms",
    category: "hampers",
    occasions: ["new-baby", "congratulations"],
    price: 2099,
    rating: 4.8,
    reviews: 246,
    art: "hamper",
    hues: ["#7FB3C8", "#F7EFD6"],
    variants: [
      { label: "Standard", delta: 0 },
      { label: "With 1 kg cake", delta: 450 },
    ],
    flavours: ["Vanilla Bean", "Pineapple", "Butterscotch"],
    contains: ["Plush toy", "500 g vanilla cake", "White carnations", "Gift box"],
    description:
      "A plush toy, a half-kilo vanilla cake and a small bunch of white carnations. Sized to fit on a hospital side table.",
    care: "Refrigerate the cake. Toy is machine washable.",
    sameDay: true,
  },
  {
    slug: "pineapple-cream-cake",
    name: "Pineapple Cream Cake",
    tagline: "Light sponge, tinned pineapple, no apology",
    category: "cakes",
    occasions: ["birthday", "thank-you", "new-baby"],
    price: 699,
    rating: 4.4,
    reviews: 1841,
    art: "cake",
    hues: ["#D9A404", "#FBEFC2"],
    variants: [
      { label: "500 g", delta: 0 },
      { label: "1 kg", delta: 450 },
    ],
    flavours: CAKE_FLAVOURS,
    contains: ["Vanilla sponge", "Whipped cream", "Pineapple chunks", "Glacé cherry"],
    description:
      "The lightest cake on the list and the one that disappears fastest at an office birthday.",
    care: "Refrigerate on arrival.",
    eggless: true,
    sameDay: true,
  },
  {
    slug: "mixed-gerbera-bunch",
    name: "Mixed Gerbera Bunch",
    tagline: "Twelve stems in five colours",
    category: "flowers",
    occasions: ["birthday", "thank-you", "congratulations"],
    price: 649,
    mrp: 799,
    rating: 4.3,
    reviews: 1590,
    art: "bouquet",
    hues: ["#E2643C", "#FBD9C4"],
    variants: [
      { label: "12 stems", delta: 0 },
      { label: "20 stems", delta: 420 },
    ],
    contains: ["Mixed gerberas", "Green fillers", "Cellophane wrap", "Ribbon"],
    description:
      "Twelve gerberas across five colours — the cheapest way to make a room look attended to.",
    care: "Gerbera stems soften. Use shallow water and recut every second day.",
    sameDay: true,
  },
  {
    slug: "emerald-bridal-bouquet",
    name: "Emerald Bridal Bouquet",
    tagline: "White roses, deep foliage, hand-tied",
    category: "flowers",
    occasions: ["wedding", "anniversary"],
    price: 4299,
    rating: 4.9,
    reviews: 132,
    art: "bouquet",
    hues: ["#F8F5EC", "#0B3D2E"],
    variants: [
      { label: "Bridal", delta: 0 },
      { label: "Bridal + 2 bridesmaid", delta: 2600 },
    ],
    contains: ["White roses", "Deep green foliage", "Satin-bound handle", "Pearl pins"],
    description:
      "Hand-tied white roses against deep foliage with a satin-bound handle. Made on the morning of the event, not the night before.",
    care: "Keep in 3 cm of water until an hour before the ceremony.",
  },
];


export const CONTENT: { key: string; label: string; data: unknown }[] = [
  {
    key: "announcements",
    label: "Announcement strip",
    data: {
      items: [
        "Same-day delivery in 7 cities — order before 6 PM",
        "Midnight delivery available for birthdays",
        "Free delivery over ₹1,499",
        "Flowers cut the morning they are delivered",
        "100% eggless options on every cake",
      ],
    },
  },
  {
    key: "hero",
    label: "Hero title sequence",
    data: {
      eyebrow: "Est. 2019 · 12 cities · 1.4 lakh deliveries",
      words: [
        { text: "Cakes and flowers,", gold: false, from: -0.2, to: 0 },
        { text: "made the day", gold: true, from: 0.3, to: 0.44 },
        { text: "they reach the door.", gold: false, from: 0.72, to: 0.86 },
      ],
      chapters: [
        { clock: "05:00", label: "The market opens", line: "Stems off the floor before the heat, graded by head size.", at: -0.3, to: 0.22 },
        { clock: "06:00", label: "The oven goes on", line: "Baked to your order, then two hours of doing nothing.", at: 0.22, to: 0.44 },
        { clock: "14:00", label: "Iced and sealed", line: "Gold leaf laid by hand. The box is photographed shut.", at: 0.44, to: 0.64 },
        { clock: "21:30", label: "On the late route", line: "One rider, one run, both halves of the order.", at: 0.64, to: 0.82 },
        { clock: "23:52", label: "At the door", line: "Median midnight drop. The handover reaches your phone.", at: 0.82, to: 1.01 },
      ],
      primary: { label: "Shop cakes", href: "/shop?category=cakes" },
      secondary: { label: "Shop flowers", href: "/shop?category=flowers" },
    },
  },
  {
    key: "promises",
    label: "Why us — four promises",
    data: {
      items: [
        { icon: "leaf", title: "Cut this morning", body: "Stems come off the market floor at 5 AM and are wrapped by 9. Nothing sits in cold storage for a week." },
        { icon: "oven", title: "Baked to the order", body: "The oven goes on after you check out. No trays of yesterday's sponge waiting for a buyer." },
        { icon: "box", title: "One slot, both gifts", body: "Order a cake and flowers together and they arrive on the same doorbell — not two, four hours apart." },
        { icon: "camera", title: "A photo before we leave", body: "The rider photographs the handover. You see what actually got delivered, not a status code." },
      ],
    },
  },
  {
    key: "reviews",
    label: "Customer reviews",
    data: {
      items: [
        { name: "Ananya R.", city: "Bengaluru", rating: 5, text: "Ordered the midnight truffle at 9 PM for a 12 AM delivery. It landed at 11:52 and the ganache was still sharp at the edges. My sister cried, which was the plan." },
        { name: "Vikram S.", city: "Pune", rating: 5, text: "The hundred roses actually had a hundred roses. I counted, because I have been burned before by a florist in Kothrud." },
        { name: "Meera J.", city: "Delhi NCR", rating: 4, text: "Tulips arrived tighter than I expected and I thought something was wrong. Two days later they were fully open and still going a week on. Fine, they knew better." },
      ],
    },
  },
  { key: "categories", label: "Categories", data: { items: CATEGORIES } },
  { key: "occasions", label: "Occasions", data: { items: OCCASIONS } },
  { key: "process", label: "How it is made — five stages", data: { items: PROCESS_STEPS } },
  {
    key: "header",
    label: "Header",
    data: {
      searchPlaceholder: "Search cakes, roses, hampers…",
      cities: ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Kolkata"],
      cutoffLabel: "Same-day cut-off in ",
      cutoffRolledLabel: "Next same-day slot in ",
      cartLabel: "Cart",
    },
  },
  {
    key: "sections",
    label: "Section headings",
    data: {
      categoriesEyebrow: "Start here",
      categoriesTitle: "Five things, done properly",
      categoriesSub: "We deliberately keep the list short. Everything below is made or arranged in our own kitchens and studios.",
      categoriesLink: "Browse everything",
      flowEyebrow: "Leaving the kitchen today",
      flowTitle: "A live look at what is being boxed right now",
      flowSub: "",
      bestsellersEyebrow: "Ordered most",
      bestsellersTitle: "What people keep coming back for",
      bestsellersSub: "Ranked by repeat orders, not by margin.",
      occasionsEyebrow: "Tell us the reason",
      occasionsTitle: "Shop by occasion",
      occasionsSub: "Each one filters to what we would actually send. Sympathy orders skip the ribbons and go out first on the route.",
      cakesEyebrow: "From the kitchen",
      cakesTitle: "Cakes",
      cakesSub: "Every one available eggless. Name piping is free; we just need it typed at checkout.",
      flowersEyebrow: "From the market",
      flowersTitle: "Flowers",
      flowersSub: "Graded by head size before wrapping. If a variety is short on the day we call you before substituting.",
      reviewsEyebrow: "Unedited",
      reviewsTitle: "What the reviews actually say",
      reviewsSub: "",
      processEyebrow: "One order, end to end",
      processTitle: "How it is actually made",
      processSub: "",
    },
  },
  {
    key: "cta",
    label: "Reminder band",
    data: {
      eyebrow: "Never miss one again",
      title: "We will remind you the week before the date.",
      body: "Add a birthday or anniversary once. We send one message seven days out and another on the morning of — nothing else, ever.",
      placeholder: "you@example.com",
      button: "Set a reminder",
      note: "Demo storefront — this form does not send anything.",
    },
  },
  {
    key: "theme",
    label: "Colours",
    data: {
      brand: "#14684A",
      brandDeep: "#06281D",
      gold: "#C9A227",
      goldLight: "#EBD489",
      cream: "#FBF8F1",
      ink: "#12211B",
    },
  },
  {
    key: "blog",
    label: "Journal",
    data: {
      eyebrow: "From the kitchen",
      title: "Journal",
      sub: "Notes from the kitchen and the flower market — what we bake, what we buy, and why.",
    },
  },
  {
    key: "footer",
    label: "Footer",
    data: {
      blurb: "We bake in our own kitchens and buy our stems at the morning market. Everything is made the day it is delivered — which is why we cap how many orders we take.",
      cities: ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Kochi", "Chandigarh", "Lucknow"],
      help: ["Track your order", "Delivery & slots", "Substitution policy", "Cancellations", "Corporate gifting", "Contact us"],
      socials: ["Instagram", "Facebook", "X", "WhatsApp"],
      legal: "A Felicet Technologies storefront.",
    },
  },
  {
    key: "settings",
    label: "Store settings",
    data: {
      demoMode: true,
      freeDeliveryOver: 1499,
      deliveryFee: 99,
      codFee: 40,
      sameDayCutoffHour: 18,
      midnightCutoffHour: 20,
      currency: "INR",
      orderPrefix: "NY",
    },
  },
];

export const POSTS = [
  {
    slug: "why-we-cool-the-sponge-for-two-hours",
    title: "Why we let the sponge sit for two hours",
    excerpt: "The least interesting step in the kitchen, and the one that decides whether your slice holds together.",
    author: "The kitchen",
    tags: ["Behind the scenes", "Cakes"],
    art: { kind: "cake", hues: ["#3E2417", "#7B4A2C"] },
    published: true,
    body: `Baking a sponge takes twenty-five minutes. Making it worth eating takes another two hours, and almost all of that is waiting.

## What happens if you skip it

Layer a warm sponge and the cream meets a surface that is still giving off steam. It thins, soaks in, and by the time the box reaches a table the middle has sunk. The cake looks fine when it leaves us and wrong when it is cut, which is the worst possible order.

## Why nobody talks about it

Because it is not a technique. There is nothing to photograph and nothing to claim. It is a gap in the schedule that costs money — an oven standing idle, a bench occupied, an order that cannot be finished early even when the shop is quiet.

That is also why it is the first thing to go when a kitchen is busy. We built the timeline around the wait instead, which is why our cut-off is 6 PM and not 9.`,
  },
  {
    slug: "what-five-in-the-morning-looks-like",
    title: "What five in the morning looks like at the flower market",
    excerpt: "Roses are graded by head size on the floor, and the ones with soft necks go back in the crate.",
    author: "The buying desk",
    tags: ["Flowers", "Behind the scenes"],
    art: { kind: "bouquet", hues: ["#A6122B", "#E8607A"] },
    published: true,
    body: `The market opens before the heat does. By six the good stems are gone, and by eight what is left has been standing in a warming room for two hours.

## Grading is the whole job

A bunch of fifty roses should look like one bunch, not two grades stapled together. That means sorting by head size on the floor, in the dark, before anything is wrapped — and putting back anything with a soft neck, however good the price.

## Buying tight on purpose

Lilies and tulips are bought in bud. They open in the recipient's room over the following two days rather than in our van. It looks less impressive at the point of handover and it is worth roughly a week of vase life, which is the trade we would make every time.`,
  },
  {
    slug: "the-midnight-route",
    title: "The midnight route",
    excerpt: "Birthday orders ride a separate late run with fewer stops. Median drop time last month was 11:52 PM.",
    author: "Dispatch",
    tags: ["Delivery"],
    art: { kind: "combo", hues: ["#A6122B", "#C9A227"] },
    published: true,
    body: `A midnight delivery is not a normal delivery done late. It is a different route, with a different loading order and far fewer stops.

## Why it is separate

A rider finishing a full evening round at half past eleven is not going to make a 11:55 drop. So the late run is loaded last, leaves at ten, and carries only orders booked for that window.

## The doorbell question

Plenty of people ask us not to ring. We message instead, wait, and hand over at the door. It is a small thing that turns a surprise into a surprise rather than a household waking up.`,
  },
];
