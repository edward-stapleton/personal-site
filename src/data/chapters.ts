// The timeline, newest first. Each chapter is one full-screen "world".
//
// Until the illustrated artwork lands, every world is rendered as a grey-box
// isometric diorama from `blocks` (see src/components/timeline/IsoScene.astro).
// Blocks with a `body` become hotspots. When a world's artwork arrives, set
// `scene` and replace block-derived hotspots / route with hand-tuned
// coordinates (all in % of the 16:9 scene).
//
// Grid rules for grey-box blocks, [x, y, w, d, h] in tile units on an 11×11
// slab — the shared path runs along x + y = 11:
//   back of the path:  x + w + y + d ≤ 10
//   front of the path: x + y ≥ 12, x + w ≤ 11, y + d ≤ 11

export type Link = { label: string; href: string };

export type Block = {
  at: [number, number, number, number, number];
  /** How the grey-box draws it; defaults to a plain box. */
  kind?: 'box' | 'billboard' | 'pallets' | 'tank';
  color: string;
  label: string;
  /** Hotspot copy. Blocks without a body are scenery. */
  body?: string;
  /** Sources and coverage, shown under the hotspot copy. */
  links?: Link[];
  /** Placeholder for a logo sign on the block's front-left face. */
  sign?: string;
};

export type OfficeStyle =
  | 'estate'
  | 'glass'
  | 'shack'
  | 'tower'
  | 'trading'
  | 'modernista'
  | 'loft'
  | 'library'
  | 'studio';

// Office slots along the path (door at ~30%, ~50%, ~68% across the scene),
// matching the L / C / R position codes in docs/art/brief.md.
const L: [number, number, number, number] = [0.2, 6.4, 1.8, 1.6];
const C: [number, number, number, number] = [3.2, 3.4, 1.8, 1.6];
const R: [number, number, number, number] = [5.9, 0.7, 1.8, 1.6];

export type Chapter = {
  id: string;
  /** Short name for the year rail. */
  short: string;
  company: string;
  role: string;
  period: string;
  year: number;
  location: string;
  summary: string;
  /** Skills shown as tags on the caption card, drawn from Ed's CV. */
  skills?: string[];
  quote?: { text: string; cite: string };
  /** Background the diorama floats on; interpolated between pages. */
  eraBg: string;
  ground: string;
  /** Cut-away office Ed walks into: [x, y, w, d] on the back edge of the path. */
  office: [number, number, number, number];
  officeStyle: OfficeStyle;
  officeLabel: string;
  blocks: Block[];
  trees?: [number, number][];
  /** Extra content rendered in the caption card (e.g. contact list). */
  kind?: 'intro' | 'end';
};

const clay = {
  cream: '#efe6d6',
  sand: '#e3cfa8',
  terracotta: '#d9825b',
  brick: '#b8573f',
  sage: '#9fb88c',
  moss: '#7d9c6a',
  sky: '#8fb4d9',
  cobalt: '#5a74e0',
  ink: '#4a4a52',
  mustard: '#e0a93a',
  rose: '#e39a9a',
  lilac: '#a99bd6',
  stone: '#cfc9bd',
  white: '#f7f5f0',
  teal: '#6fb3a8',
  green: '#4f8f5b',
};

export const chapters: Chapter[] = [
  {
    id: 'today',
    short: 'Today',
    company: 'Ed Stapleton',
    role: 'Product & Venture Builder · Forward-Deployed · Ships with AI',
    period: 'Today',
    year: 2026,
    location: 'Herne Hill, London',
    summary:
      'An entrepreneurial, AI-obsessed product leader with 10 years across FinTech, mobility, energy and FMCG. I create and scale ventures from pre-seed to exit, and ship the code myself.',
    skills: ['Product management', 'Venture creation', 'Design thinking', 'Growth strategy', 'Operational automation', 'Account management', 'Agile (PSM I)'],
    eraBg: '#efe4d3',
    ground: '#a9c18f',
    office: C,
    officeStyle: 'estate',
    officeLabel: 'The vibecoding desk',
    kind: 'intro',
    blocks: [
      {
        at: [0.3, 0.3, 2.6, 1.6, 1.9],
        color: clay.brick,
        label: 'Home',
        body: 'Home: a Victorian red-brick Peabody estate in Herne Hill, south London. Striped brick, sash windows, chimney stacks and a shared garden.',
      },
      { at: [0.3, 2.3, 1.6, 2.4, 1.6], color: '#a94f39', label: 'Estate' },
      { at: [0.3, 5.2, 1.2, 2, 1.3], color: '#b25a42', label: 'Estate' },
      {
        at: [3.4, 0.3, 1.8, 1.6, 1.4],
        color: clay.cobalt,
        label: 'Place',
        body: 'Place, the venture I’m building now: an ambient, AI-powered tour guide. It notices where you are and how fast you’re moving, tells you the story you most want to hear, and answers follow-up questions, with no screen required.',
        sign: 'Place',
      },
      {
        at: [6, 0.4, 0.7, 0.25, 1.4],
        color: clay.teal,
        label: 'Personal finance app',
        body: 'My personal finance app: a hosted, three-statement model of my own finances (P&L, cash flow and balance sheet), with open-banking feeds that refresh every few hours, auto-categorised transactions and a monthly review. Built for me, by me, on Cloud Run and Supabase.',
      },
      {
        at: [5.6, 1.4, 1.4, 1.2, 0.9],
        color: clay.mustard,
        label: 'The workshop',
        body: 'The workshop: small tools and automations I vibecode and ship myself.',
        sign: 'Tools',
      },
      {
        at: [8.4, 4.2, 2.2, 2, 0.1],
        color: clay.green,
        label: 'FC Lahore',
        body: 'Football for FC Lahore at Coram Fields, in yellow. Look closely at the shirt sponsor: that’s Shandy Shack.',
        sign: 'FC Lahore',
      },
      {
        at: [7, 6.6, 1.6, 0.2, 1.3],
        kind: 'billboard',
        color: clay.stone,
        label: 'Roma',
        body: 'Running: the Rome Marathon on 22 March 2026, in 3:59:32. Just under four hours.',
        sign: 'Roma',
      },
      {
        at: [9.6, 7, 0.4, 0.4, 0.6],
        color: '#c23b2f',
        label: 'Post box',
        body: 'Want to work together or just say hello? edwardstapleton@me.com, or head to the end of the timeline.',
      },
    ],
    trees: [[2.6, 2.6], [1.2, 10.2], [2.6, 9.6], [4.4, 9.2], [10.2, 2.4], [8.2, 0.6]],
  },
  {
    id: 'zeti',
    short: 'Zeti',
    company: 'Zeti',
    role: 'Product & Operations Director',
    period: '2018 — Now',
    year: 2018,
    location: 'London',
    summary:
      'Zeti finances zero-emission fleets pay-per-mile. I delivered the MVP during incubation at Octopus Investments in 2018 and now lead product and operations for ZetiOS, a Startups 100 FinTech backed by Toyota Ventures and HYCAP.',
    skills: ['Product strategy', 'IoT SaaS', 'User research', 'OKRs and roadmaps', 'AI-assisted delivery', 'Investor demos'],
    eraBg: '#eee3d2',
    ground: '#b7c7a2',
    office: R,
    officeStyle: 'glass',
    officeLabel: 'ZetiOS control room',
    blocks: [
      {
        at: [0.3, 2.4, 2.4, 3.4, 0.9],
        color: clay.stone,
        label: 'EV depot',
        body: 'Electric buses, trucks and taxis, financed pay-per-mile from live telematics data rather than fixed monthly payments.',
      },
      { at: [0.3, 6.2, 1.4, 1.6, 0.35], color: clay.mustard, label: 'Solar canopy' },
      {
        at: [2.2, 0.3, 1.4, 1.4, 3],
        color: clay.sky,
        label: 'Paragon Bank',
        body: 'Paragon Bank, a major customer, runs its vehicle finance on ZetiOS.',
        sign: 'Paragon',
      },
      {
        at: [3.9, 0.3, 1.4, 1.2, 2.4],
        color: clay.lilac,
        label: 'Octopus Investments',
        body: 'Zeti was incubated inside Octopus Investments, where I delivered the MVP in 2018. Octopus is also a customer: ZetiOS gives capital providers real-time reporting on how their assets perform.',
        sign: 'Octopus',
      },
      { at: [8.4, 0.3, 0.2, 0.2, 3.2], color: clay.white, label: 'Wind turbine' },
      {
        at: [5.6, 7, 0.9, 0.5, 0.45],
        color: '#2b2b30',
        label: 'Black cabs',
        body: 'Electric London black cabs charging up, financed by the mile.',
      },
      { at: [6.7, 6.2, 0.9, 0.5, 0.45], color: '#2b2b30', label: 'Black cab' },
      { at: [5.4, 8, 1.8, 0.2, 0.5], kind: 'pallets', color: '#4a4a52', label: 'Chargers' },
      {
        at: [4.2, 8.6, 1, 0.55, 0.5],
        color: clay.white,
        label: 'Otto Car',
        body: 'Otto Car: a customer.',
        sign: 'Otto',
      },
      {
        at: [9.2, 3.4, 1, 0.55, 0.55],
        color: clay.white,
        label: 'Robotaxi',
        body: 'Robotaxis are coming to London’s roads, and usage-based finance fits a car that never stops working.',
      },
      {
        at: [8, 6.4, 2.2, 1.8, 1.2],
        color: '#9aa3b5',
        label: 'ZetiOS',
        body: 'I designed and delivered ZetiOS, an IoT-enabled SaaS platform for hard-asset finance and operations, setting its principles, OKRs and roadmap from user interviews and data. I run the product team’s AI-assisted ways of working and lead demos to customers and investors in the UK and US.',
      },
      {
        at: [3.2, 2.2, 1.2, 1.2, 0.8],
        color: clay.rose,
        label: 'Investors and recognition',
        body: 'I helped close seed and Series A from Toyota Ventures and HYCAP Group, secured a place on Accenture’s FinTech Innovation Lab, and Zeti made the Startups 100 in 2025.',
        links: [
          { label: 'Toyota Ventures investment', href: 'https://assetfinanceconnect.com/toyota-ventures-investment-in-zeti-enabling-fleet-electrification-through-pay-as-you-drive-financing/' },
          { label: 'HYCAP Group investment, UKTN · Jun 2024', href: 'https://www.uktech.news/mobility/jcb-heir-investment-firm-zeti-20240627' },
          { label: 'FinTech Innovation Lab London · Jan 2021', href: 'https://www.fintechinnovationlab.com/news/london/london-cohort-news-january-2021/' },
          { label: 'Startups 100 · 2025', href: 'https://startups.co.uk/startups-100/2025/zeti/' },
        ],
      },
    ],
    trees: [[1.4, 9.8], [3, 9.6], [10.3, 1.6], [7.2, 9.6]],
  },
  {
    id: 'shandy-shack',
    short: 'Shandy Shack',
    company: 'Shandy Shack',
    role: 'Co-Founder & CEO',
    period: '2018 — 2025',
    year: 2018,
    location: 'London (remote)',
    summary:
      'An award-winning craft shandy I built from idea to acquisition: two equity rounds, +132% CAGR over four years, and 52 to 3,400 grocery distribution points, before selling to SHS Drinks (owners of WKD and Shloer) in November 2024.',
    skills: ['Venture creation', 'Key account management', 'Fundraising', 'Brand and PR', 'Growth strategy', 'Automation'],
    eraBg: '#efe2d0',
    ground: '#c9b98f',
    office: L,
    officeStyle: 'shack',
    officeLabel: 'The Shack (our only head office)',
    blocks: [
      {
        at: [0.4, 0.4, 0.8, 0.8, 2],
        kind: 'tank',
        color: '#d9dde2',
        label: 'Brewery',
        body: 'Brewing and canning: from one recipe to a range on national shelves.',
      },
      { at: [1.4, 0.4, 0.8, 0.8, 2], kind: 'tank', color: '#d9dde2', label: 'Tank' },
      { at: [0.4, 1.4, 0.8, 0.8, 2], kind: 'tank', color: '#d9dde2', label: 'Tank' },
      { at: [2.6, 0.4, 2.4, 0.8, 0.5], color: clay.white, label: 'Canning line' },
      { at: [2.6, 1.6, 1.6, 1.4, 0], kind: 'pallets', color: '#f2b34a', label: 'Pallets of cans' },
      {
        at: [5, 0.4, 1.6, 0.15, 1.9],
        kind: 'billboard',
        color: '#1f2a44',
        label: 'Press',
        body: 'The Telegraph called us proper shandy. We were in The Times and on This Morning, and the Evening Standard named us the hottest summer accessory.',
        sign: 'The Telegraph',
      },
      { at: [6.9, 0.4, 1.6, 0.15, 1.9], kind: 'billboard', color: '#8a1c2b', label: 'Press', sign: 'The Times' },
      { at: [4.7, 2.2, 1.6, 0.15, 1.9], kind: 'billboard', color: '#e2c044', label: 'Press', sign: 'Standard' },
      {
        at: [0.4, 3.4, 1.6, 2.4, 1.1],
        color: '#f07d2e',
        label: 'Supermarkets',
        body: 'On shelf nationally at Sainsbury’s and Aldi, and in Midcounties Co-op.',
        sign: 'Sainsbury’s',
      },
      { at: [2.4, 3.6, 1.6, 1.4, 1], color: '#1c3f94', label: 'Aldi', sign: 'ALDI' },
      {
        at: [7, 6, 1.8, 1.4, 1.2],
        color: clay.brick,
        label: 'Stonegate pub',
        body: 'Stonegate, the UK’s largest pub company, got Shack’d in August 2025.',
        sign: 'Stonegate',
      },
      {
        at: [8.6, 3.6, 1.8, 1.4, 0.6],
        color: clay.lilac,
        label: 'Wychwood Festival',
        body: 'Where it started: festivals. We headlined the bar at Wychwood in 2023 and did laps of Herne Hill Velodrome.',
      },
      { at: [5.2, 7.2, 1.3, 0.6, 0.7], color: '#f07d2e', label: 'Delivery lorry' },
      { at: [4.4, 8.2, 0.9, 0.7, 0], kind: 'pallets', color: '#f2b34a', label: 'Pallets' },
      {
        at: [4, 9.4, 0.5, 0.5, 0.8],
        color: clay.mustard,
        label: 'Great Taste',
        body: 'Great Taste award-winning producer, 2023.',
      },
      {
        at: [9, 7.8, 1.5, 0.6, 0.75],
        color: '#3c7fc0',
        label: 'SHS Drinks',
        body: 'Acquired by SHS Drinks, owners of WKD and Shloer, in a seven-figure deal in November 2024.',
        sign: 'SHS',
      },
      { at: [2, 10.2, 3.5, 0.75, 0.04], color: '#7fb4d6', label: 'River' },
    ],
    trees: [[2.4, 5.6], [10.3, 1.4], [6.6, 9.6], [9.8, 10]],
  },
  {
    id: 'accenture',
    short: 'Accenture',
    company: 'Accenture Song',
    role: 'Digital Strategy Consultant',
    period: '2015 — 2018',
    year: 2015,
    location: 'London · Paris · Dubai · Doha',
    summary:
      'Joined through the graduate scheme and specialised in innovation and venture development for clients across energy, hospitality, government, pharma and financial services.',
    skills: ['Innovation strategy', 'Design thinking', 'Venture development', 'Digital roadmaps', 'Go-to-market'],
    eraBg: '#ece3d6',
    ground: '#b9c0b4',
    office: C,
    officeStyle: 'tower',
    officeLabel: 'Accenture office',
    blocks: [
      { at: [3.2, 1.5, 1.8, 1.6, 3.6], color: clay.lilac, label: 'Accenture', sign: 'accenture' },
      {
        at: [0.3, 0.3, 1.6, 1.4, 1.2],
        color: clay.sky,
        label: 'SSE',
        body: 'SSE: transforming the billing systems behind an energy challenger brand. I led a team of four on the billing and payments UX.',
        links: [
          { label: 'SSE selects Accenture for retail transformation · 2013', href: 'https://www.tdworld.com/smart-utility/article/20963140/sse-selects-accenture-for-major-transformation-projects' },
        ],
        sign: 'SSE',
      },
      { at: [2.3, 0.3, 0.2, 0.2, 2.6], color: clay.white, label: 'Turbine' },
      { at: [0.3, 2.2, 1.2, 1.4, 0.8], color: '#6fa2d6', label: 'Energy shop' },
      {
        at: [0.3, 4.2, 0.7, 0.7, 2.6],
        color: '#c9d3dc',
        label: 'French bank · La Défense',
        body: 'A major French bank, La Défense, Paris (2017): a blockchain opportunity assessment.',
      },
      { at: [1.2, 4.9, 0.7, 0.7, 2.3], color: '#b9c4ce', label: 'La Défense tower' },
      {
        at: [6, 0.3, 0.6, 0.6, 3.8],
        color: clay.sand,
        label: 'Emaar Hospitality Group',
        body: 'Emaar Hospitality Group, Dubai, whose hotels include the Armani Hotel Dubai in the Burj Khalifa and Palace Downtown. Over the winter of 2017–18 I produced a roadmap for C-suite stakeholders to digitise the guest experience and operating model, and ran a design-thinking workshop for 25.',
        links: [
          { label: 'Emaar Hospitality Group', href: 'https://www.emaarhospitality.com/en/' },
          { label: 'Emaar Hospitality and Accenture digital transformation · Dec 2017', href: 'https://www.gdnonline.com/Details/299370/Emaar-Hospitality-to-embark-on-digital-transformation-' },
        ],
        sign: 'Armani',
      },
      { at: [7, 0.3, 1.2, 1, 1.4], color: '#e8d9b8', label: 'Palace Downtown', sign: 'Palace' },
      {
        at: [9, 3.4, 1.6, 1.4, 0.9],
        color: '#8a1538',
        label: 'MOTC Qatar · TASMU',
        body: 'Qatar’s Ministry of Transport and Communications (MOTC), 2017: I delivered the digital cluster strategy for TASMU, the Smart Qatar programme, bringing startups, incubators and universities together around its priority sectors: transport, logistics, environment, healthcare and sport.',
        links: [
          { label: 'Accenture and MOTC sign TASMU MOU · 2017', href: 'https://newsroom.accenture.com/news/2017/motc-and-accenture-sign-mou-to-power-smart-qatar-program-tasmu-with-digital-innovation' },
        ],
      },
      {
        at: [6.2, 6.4, 1.6, 1.4, 1],
        color: '#f36633',
        label: 'GSK accelerator',
        body: 'GSK digital accelerator (2018): helping set up health innovation centres to develop new digital health apps and services.',
        sign: 'GSK',
      },
      {
        at: [8.2, 5.6, 1.6, 1.2, 0.8],
        color: '#bfe3dc',
        label: 'GSK brand incubator',
        body: 'GSK brand incubator: reimagining tail brands in the consumer health portfolio and working out how to rebrand and relaunch them.',
      },
      {
        at: [9.2, 7.2, 1.6, 0.15, 1.6],
        kind: 'billboard',
        color: '#f36633',
        label: 'GSK brand incubator',
        sign: 'New look · Relaunch',
      },
      {
        at: [4.6, 8.4, 1.4, 1, 0.7],
        color: clay.stone,
        label: 'Startup Sessions',
        body: 'I organised Startup Sessions, a speaker series bringing the CEOs of Monzo, Bulb and Vitl to Accenture audiences. In the Open Innovation team I also built go-to-market materials for a FinTech joint venture with the CEO of a mobile engagement startup.',
      },
      {
        at: [3, 9.2, 1.6, 0.15, 1.6],
        kind: 'billboard',
        color: '#14233c',
        label: 'Startup Sessions speakers',
        sign: 'Monzo · Vitl · Bulb',
      },
    ],
    trees: [[2.4, 3.4], [1.6, 9.8], [10.2, 8.6], [6.6, 9.4]],
  },
  {
    id: 'the-hut-group',
    short: 'THG · Zavvi',
    company: 'The Hut Group · Zavvi',
    role: 'International Trading Manager',
    period: '2014 — 2015',
    year: 2014,
    location: 'Manchester',
    summary:
      'My first role out of university: running Zavvi.es, a ~£5m eCommerce store for games, collector’s-edition Blu-rays, memorabilia and merch. We beat sales targets by 35%.',
    skills: ['eCommerce', 'Growth hacking', 'Paid and organic search', 'Google Analytics', 'Affiliates and influencers'],
    eraBg: '#eee3d2',
    ground: '#c3c7c9',
    office: R,
    officeStyle: 'trading',
    officeLabel: 'Trading desk',
    blocks: [
      {
        at: [0.3, 1.6, 2.8, 3.6, 1.3],
        color: clay.stone,
        label: 'Warehouse',
        body: 'The THG fulfilment machine, shipping parcels across Europe.',
        sign: 'THG',
      },
      { at: [0.3, 5.6, 1.6, 1.6, 0], kind: 'pallets', color: '#c89a62', label: 'Parcels' },
      {
        at: [3.4, 0.3, 2, 0.3, 1.6],
        color: '#2f2f3a',
        label: 'Zavvi.es',
        body: 'Zavvi.es, the Spanish store I ran: about £5m a year in games, film, TV and pop culture.',
        sign: 'zavvi',
      },
      { at: [3.4, 0.6, 2, 1.2, 0.12], color: '#5a5a66', label: 'Keyboard' },
      {
        at: [8.3, 4, 0.35, 0.35, 0.8],
        color: clay.cobalt,
        label: 'Performance marketing',
        body: 'I growth-hacked the Spanish store: optimising organic and paid search and social from Google Analytics data, and managing international influencer and affiliate partners. Result: 35% above sales target.',
      },
      { at: [8.8, 4, 0.35, 0.35, 1.3], color: clay.cobalt, label: 'Chart' },
      { at: [9.3, 4, 0.35, 0.35, 1.8], color: clay.cobalt, label: 'Chart' },
      {
        at: [5.4, 7.2, 1.2, 0.8, 0.6],
        color: clay.lilac,
        label: 'Collector’s editions',
        body: 'Collector’s-edition Blu-ray steelbooks, the crown jewels of the catalogue.',
      },
      {
        at: [6.8, 6.2, 1, 1, 0.5],
        color: clay.mustard,
        label: 'Games & memorabilia',
        body: 'Video games, figures, statues and memorabilia.',
      },
      {
        at: [4.2, 8.6, 1.2, 0.8, 0.5],
        color: clay.rose,
        label: 'Merch',
        body: 'T-shirts, hoodies and mugs: the long tail of fandom.',
      },
      { at: [9, 6, 1.4, 0.15, 1.4], kind: 'billboard', color: '#1e7a4c', label: 'Scoreboard', sign: '+35%' },
      { at: [7.6, 8.4, 1, 0.5, 0.5], color: clay.white, label: 'Van' },
    ],
    trees: [[1.4, 9.8], [2.8, 9.6], [10.3, 1.2], [8.6, 0.6]],
  },
  {
    id: 'year-abroad',
    short: 'Year abroad',
    company: 'LoungeUp & Divino Villas',
    role: 'Product Marketing Intern, LoungeUp · Business Development Intern, Divino Villas',
    period: 'Sep 2012 — Summer 2013',
    year: 2012,
    location: 'Paris · Barcelona',
    summary:
      'My Erasmus year abroad, spent working: product marketing in French and English for a Paris hotel-tech startup (now D-EDGE CRM), then selling luxury villa rentals by phone and email in Barcelona, and writing the listings that sold them.',
    quote: {
      text: 'In just a few days he was up to speed, and after a couple of months we saw very good progress on most of our marketing KPIs.',
      cite: 'CEO, LoungeUp',
    },
    eraBg: '#eee3d2',
    ground: '#c2bf98',
    office: L,
    officeStyle: 'modernista',
    officeLabel: 'Barcelona sales office',
    // Walking back in time: Barcelona (2013) on the left, Paris (2012) on the right.
    blocks: [
      {
        at: [0.4, 0.4, 0.3, 0.3, 3],
        color: '#cdb58a',
        label: 'Divino Villas, Barcelona',
        body: 'Divino Villas, Barcelona, spring and summer 2013: business development intern, working across four languages. The CEO’s reference: “Edward is very responsible, smart, timely and hard working.”',
      },
      { at: [0.9, 0.4, 0.25, 0.25, 2.6], color: '#cdb58a', label: 'Spire' },
      { at: [0.4, 0.9, 0.25, 0.25, 2.4], color: '#cdb58a', label: 'Spire' },
      {
        at: [0.3, 3.2, 1.6, 1.4, 0.9],
        color: clay.white,
        label: 'Ibiza villa',
        body: 'I wrote listings for villas in Ibiza (Cala Conta, Cala Vadella) and Mallorca, and got them online.',
      },
      {
        at: [2.2, 2, 1.6, 1.4, 1.1],
        color: clay.terracotta,
        label: 'Tuscan farmhouse',
        body: 'Tuscany too: Greve in Chianti, Arezzo, Camaiore. I translated and edited every listing in English, French and Spanish.',
      },
      { at: [2.2, 4.6, 1.2, 0.8, 0.06], color: '#6ec3e0', label: 'Pool' },
      {
        at: [3.8, 8.4, 2, 1.4, 0.8],
        color: clay.white,
        label: 'Pool villa',
        body: 'Phone and email sales: I matched guests to the right villa, down to the number of bedrooms and the pool, and every call ended in a shortlist and, with luck, a booking.',
      },
      { at: [2.8, 9.8, 0.8, 0.1, 1.4], kind: 'billboard', color: clay.mustard, label: 'Booked!', sign: 'Booked!' },
      { at: [5.6, 7.2, 1.6, 0.5, 0.6], color: clay.white, label: 'Train to Paris' },
      {
        at: [4.4, 0.3, 2, 1.8, 2.4],
        color: clay.cream,
        label: 'LoungeUp',
        body: 'LoungeUp, Paris, September 2012 to March 2013: an app for hotels to talk to their guests, with room service, concierge chat and local tips on the guest’s phone. It’s now part of D-EDGE CRM.',
        sign: 'Hôtel',
      },
      { at: [6.6, 0.3, 0.7, 0.12, 1.6], color: '#29a0d8', label: 'The app', sign: 'LoungeUp' },
      { at: [7.4, 0.3, 1.1, 1, 1.6], color: clay.white, label: 'Sacré-Cœur' },
      {
        at: [7.4, 5.8, 0.8, 0.8, 1],
        color: '#2e6b4f',
        label: 'Kiosque',
        body: 'I wrote the blog: “High-tech hotels around the world”, covering digital keys, iPads in rooms and smart lighting.',
      },
      {
        at: [8.2, 4.6, 2, 1.4, 0.9],
        color: '#29a0d8',
        label: 'Conference',
        body: 'Hotel-tech conferences and trade shows: I regularly represented LoungeUp on the stand, in French and English.',
        sign: 'Salon',
      },
    ],
    trees: [[3.2, 6.2], [6.4, 2.6], [1.6, 9.8], [10.2, 9.4], [9.6, 1.8]],
  },
  {
    id: 'durham',
    short: 'Durham',
    company: 'Durham University',
    role: 'BA Modern Languages: French, Spanish & Catalan',
    period: '2010 — 2014',
    year: 2010,
    location: 'Durham',
    summary:
      'Four years of languages, cricket, Spanish cinema and the Investment & Finance Society, with a year abroad in Paris and Barcelona that became my first two jobs.',
    eraBg: '#eee3d2',
    ground: '#9fb592',
    office: R,
    officeStyle: 'library',
    officeLabel: 'The library',
    blocks: [
      {
        at: [0.3, 1.6, 1.4, 3.4, 1.8],
        color: '#bfae8a',
        label: 'Cathedral',
        body: 'Durham Cathedral and Castle on the peninsula above the River Wear.',
      },
      { at: [0.55, 2.6, 0.9, 0.9, 3.2], color: '#b3a17c', label: 'Tower' },
      { at: [2, 0.3, 1.8, 1.2, 1.4], color: '#c8b893', label: 'Castle' },
      { at: [0.3, 5.4, 3.2, 0.9, 0.04], color: '#7fb4d6', label: 'River Wear' },
      {
        at: [3.6, 1.8, 1.2, 1, 0.8],
        color: clay.stone,
        label: 'Investment & Finance Society',
        body: 'Investment & Finance Society: my first taste of markets, and of the finance world I’d later build products for.',
      },
      {
        at: [8, 4.4, 2.6, 2.6, 0.05],
        color: '#7fae62',
        label: 'Cricket',
        body: 'Cricket in whites every summer.',
      },
      { at: [9.4, 7.4, 1.2, 0.8, 0.6], color: clay.white, label: 'Pavilion' },
      {
        at: [5, 8, 1.8, 0.8, 0.7],
        color: clay.sky,
        label: 'Year abroad',
        body: 'The Erasmus year abroad: Paris, then Barcelona. Those placements became my first two jobs.',
      },
      {
        at: [3.4, 8.8, 1.4, 1, 1],
        color: clay.rose,
        label: 'Cine español',
        body: 'Spanish cinema is a long-running obsession, especially Almodóvar: Todo sobre mi madre and Volver are the two I keep going back to.',
        sign: 'Cine',
      },
      {
        at: [6.4, 6, 1, 1, 0.3],
        color: clay.ink,
        label: 'Graduation',
        body: 'Graduated in 2014 with a 2.1 in Modern Languages (French, Spanish and Catalan).',
      },
    ],
    trees: [[1.8, 1.8], [4.6, 3.8], [1.6, 9.8], [10.2, 9.6]],
  },
  {
    id: 'where-next',
    short: 'Next',
    company: 'Where next?',
    role: 'Your project here',
    period: 'Next',
    year: 2026,
    location: 'Anywhere',
    summary: 'Want to build something together, or just say hello?',
    eraBg: '#f0e1cd',
    ground: '#b7c7a2',
    office: C,
    officeStyle: 'studio',
    officeLabel: 'An empty desk',
    kind: 'end',
    blocks: [
      {
        at: [8.4, 4, 1.4, 0.12, 1.3],
        kind: 'billboard',
        color: clay.white,
        label: 'Your project here',
        body: 'This plot is free. Email edwardstapleton@me.com.',
        sign: 'Your project here',
      },
      { at: [5.6, 7.2, 0.8, 0.6, 0.5], color: clay.mustard, label: 'Digger' },
    ],
    trees: [[0.8, 0.8], [2.2, 0.6], [0.6, 2.4], [9.8, 9.8], [6.8, 8.6], [7.6, 1.2]],
  },
];

export const contact = [
  { label: 'Email', value: 'edwardstapleton@me.com', href: 'mailto:edwardstapleton@me.com' },
  { label: 'Phone', value: '+44 7761 752310', href: 'tel:+447761752310' },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/edwardstapleton',
    href: 'https://linkedin.com/in/edwardstapleton',
  },
];
