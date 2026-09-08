export type ProcessStep = {
  slug: string;
  phase: string;
  title: string;
  /** Shown in the pinned scroll stage. */
  standfirst: string;
  clock: string;
  /** Detail-page content. */
  intro: string;
  detail: { heading: string; body: string }[];
  facts: [string, string][];
  /** The honest bit — what goes wrong at this stage and what we do about it. */
  goesWrong: string;
};

export const PROCESS: ProcessStep[] = [
  {
    slug: "you-order",
    phase: "Phase 01",
    title: "You place the order",
    standfirst:
      "Nothing is made in advance. The order lands in the kitchen queue with the flavour, the message and the slot attached to it.",
    clock: "T minus 18 hours",
    intro:
      "Most bakeries decide what to bake in the morning and hope it sells by evening. We do it the other way round: your order is the instruction, and it reaches the right kitchen within seconds of you paying.",
    detail: [
      {
        heading: "The order splits before it moves",
        body: "A combo separates into a cake docket and a flower docket the moment it is confirmed. They are made in two different places by two different teams and only meet again at the packing bench, which is why one order never arrives as two deliveries.",
      },
      {
        heading: "The message is transcribed, not printed",
        body: "Anything you type in the message field is written out by hand on the card by whoever packs the order. Piping on a cake is done last, after the icing has set, so the letters hold their edge.",
      },
      {
        heading: "Slots are capped, not oversold",
        body: "Each kitchen has a fixed number of cakes it can finish in a day and each city has a fixed number of midnight runs. When a slot is full it disappears from checkout rather than quietly becoming a late delivery.",
      },
    ],
    facts: [
      ["6:00 PM", "same-day cut-off"],
      ["8:00 PM", "midnight-slot cut-off"],
      ["< 40 s", "order to kitchen queue"],
    ],
    goesWrong:
      "Addresses. About one order in forty has a PIN code that does not match the area written above it. We call before dispatch rather than letting the rider discover it at 11 PM.",
  },
  {
    slug: "at-the-market",
    phase: "Phase 02",
    title: "5 AM at the market",
    standfirst:
      "Stems are bought the morning they are delivered, graded by head size on the floor, and rejected on the spot if they are soft.",
    clock: "05:00",
    intro:
      "Flowers are bought fresh every morning at the wholesale market, before the day's heat. Nothing in a Felicet Bloom bouquet has been sitting in a cold room for a week waiting for a buyer.",
    detail: [
      {
        heading: "Graded, not just counted",
        body: "Roses are sorted by head size before they are wrapped, so a bunch of fifty looks like one bunch rather than a mix of two grades. Anything with a soft neck goes back in the crate at the market, not into a bouquet.",
      },
      {
        heading: "Cut in bud, on purpose",
        body: "Lilies and tulips are bought tight so they open in the recipient's room over the following two days. If they arrive already open they have peaked in our van, which is a week of vase life we have wasted on your behalf.",
      },
      {
        heading: "Large bunches are counted twice",
        body: "Anything above fifty stems is counted by two people and the second count is initialled on the docket. It is a dull control and it is the reason nobody has ever opened a hundred-rose order and found ninety-four.",
      },
    ],
    facts: [
      ["05:00", "buying starts"],
      ["09:00", "wrapped and staged"],
      ["2×", "count on large bunches"],
    ],
    goesWrong:
      "Supply. Some mornings a variety simply is not on the floor at a quality we will buy. We call you and offer a swap or a refund — we do not substitute quietly and hope you will not notice.",
  },
  {
    slug: "in-the-kitchen",
    phase: "Phase 03",
    title: "The oven goes on",
    standfirst:
      "Sponge is baked to the order, cooled properly, then layered. The cooling is the slow part and it is the part everybody else skips.",
    clock: "06:00 – 13:00",
    intro:
      "Baking is quick. Cooling is not. A sponge that is layered warm weeps into the cream and collapses at the centre by the time it reaches a table, which is why our timeline is built around the wait rather than the bake.",
    detail: [
      {
        heading: "Two hours of doing nothing",
        body: "Sponges come out of the oven and sit for two hours before anything touches them. It is the least interesting step in this list and the single biggest difference between a cake that holds a clean slice and one that does not.",
      },
      {
        heading: "Ganache is made, not bought",
        body: "Truffle ganache is cooked the same morning and cooled to setting point, so it stays firm at the edge and soft in the middle. Tempering it is the difference between a cut edge that stands up and one that smears.",
      },
      {
        heading: "Eggless is a separate bench",
        body: "Eggless orders are made on their own bench with their own tools. It is not a swap in the recipe at the end — it is a different sponge, mixed separately, so there is no cross-contact.",
      },
    ],
    facts: [
      ["120 min", "minimum cooling"],
      ["0", "cakes baked in advance"],
      ["Separate", "eggless bench"],
    ],
    goesWrong:
      "Heat. Above about 34°C, buttercream stops behaving and we move finishing into the cold room, which adds an hour. In a May heatwave that is the reason a 2 PM slot becomes a 3 PM slot.",
  },
  {
    slug: "iced-and-boxed",
    phase: "Phase 04",
    title: "Iced, boxed, sealed",
    standfirst:
      "Icing, gold leaf and piping happen last. The box is sealed in front of a camera and the seal is not broken again until the door.",
    clock: "14:00 – 17:00",
    intro:
      "Everything decorative happens at the end, as close to dispatch as we can manage, so the cake that is photographed at the packing bench is the cake that arrives.",
    detail: [
      {
        heading: "Piping after the icing sets",
        body: "The message goes on once the surface is firm. Piping into soft icing is how you get letters that spread into each other by the time the box is opened.",
      },
      {
        heading: "Gold leaf by hand",
        body: "Edible gold leaf is laid with a brush, not sprinkled. It takes a few minutes per cake and it is the one step we will not rush for a late order.",
      },
      {
        heading: "Sealed and photographed",
        body: "Every box is photographed closed, with the order number visible, before it leaves the bench. If anything is disputed later, that photograph is the first thing we look at.",
      },
    ],
    facts: [
      ["Last", "decoration step"],
      ["1 photo", "per sealed box"],
      ["Cold", "boxed and chilled"],
    ],
    goesWrong:
      "Piping errors. A misspelt name is caught at the bench about half the time. When it is caught, the top is re-iced and re-piped, which costs us twenty minutes and costs you nothing.",
  },
  {
    slug: "at-the-door",
    phase: "Phase 05",
    title: "At the door, photographed",
    standfirst:
      "One rider, one route, both halves of the order. The handover is photographed and the photo reaches your phone before the rider leaves the building.",
    clock: "Your slot",
    intro:
      "The last two hundred metres are where most gift deliveries fail. Ours end with a photograph, because a status code that says delivered is not evidence that anything arrived.",
    detail: [
      {
        heading: "One doorbell, not two",
        body: "Cake and flowers travel together on the same run. A combo that arrives four hours apart is not a gift, it is two errands, and it is the complaint we built the packing bench to eliminate.",
      },
      {
        heading: "The midnight route is separate",
        body: "Birthday orders on the midnight slot ride a dedicated late route with fewer stops. Median drop time last month was 11:52 PM. If you have asked us not to ring the bell, we message instead.",
      },
      {
        heading: "Sympathy orders go first",
        body: "White arrangements are loaded first and dropped first on any route, and the riders are briefed to be brief. It is the one delivery where we do not want a conversation at the door.",
      },
    ],
    facts: [
      ["11:52 PM", "median midnight drop"],
      ["1 rider", "per combo order"],
      ["Photo", "sent on handover"],
    ],
    goesWrong:
      "Nobody home. We wait ten minutes, call twice, and then bring it back chilled rather than leaving a cake with a stranger. A second attempt the next day is free.",
  },
];

export const PROCESS_BY_SLUG = new Map(PROCESS.map((s) => [s.slug, s]));
