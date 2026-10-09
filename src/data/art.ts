// Finished illustrations, keyed by chapter id. A world listed here renders its
// artwork instead of the grey-box diorama. Every coordinate is in % of the
// scene image (x from the left, y from the top), traced from the artwork.
import type { ImageMetadata } from 'astro';
import type { Route } from '../lib/iso';
import shandyShack from '../assets/worlds/shandy-shack/scene.webp';
import accenture from '../assets/worlds/accenture/scene.webp';
import zeti from '../assets/worlds/zeti/scene.webp';
import today from '../assets/worlds/today/scene.webp';
import theHutGroup from '../assets/worlds/the-hut-group/scene.webp';
import yearAbroad from '../assets/worlds/year-abroad/scene.webp';
import durham from '../assets/worlds/durham/scene.webp';
import whereNext from '../assets/worlds/where-next/scene.webp';

const NEWS = 'https://www.shandyshack.co.uk/blogs/news-and-views/';
const GROCER = 'https://www.thegrocer.co.uk/news/';

type P = { x: number; y: number };

export type Link = { label: string; href: string };

export type Hotspot = {
  label: string;
  body: string;
  /** What Ed personally did: the CV line. */
  role?: string;
  /** Sources and coverage. */
  links?: Link[];
  /** Where the numbered dot sits, on the object itself. */
  dot: P;
  /** Clickable area. */
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * A logo placed flat on a blank panel in the art. Panels in an isometric
 * scene are parallelograms, so three corners define the placement.
 */
export type Sign = {
  tl: P;
  tr: P;
  bl: P;
  /** Wordmark drawn as text; also the fallback when there are no logos. */
  text: string;
  font?: 'serif' | 'sans';
  color?: string;
  label: string;
  /** Logo files in public/logos, shown in place of `text`. Several logos
   *  take turns on the panel, fading from one to the next.
   *  `ratio` is width ÷ height, so each can be sized without loading it. */
  logos?: Logo[];
  /** Logos are printed in one colour to sit on the flat panel: white by
   *  default, `ink` on light panels, or `color` as supplied (badges and
   *  roundels, which flatten into a blob). */
  tone?: 'white' | 'ink' | 'color';
  /** How much of the panel's height a logo may fill (default 0.56): higher
   *  for thin bands like fascias and hull stripes. */
  fit?: number;
  /** Overall size of the logo or wordmark on the panel (default 1). */
  size?: number;
  /** Outline of anything standing in front of the panel, in scene %, so the
   *  sign is cut away behind it. */
  infront?: P[];
};

/** `scale` evens out optical size between wordmarks of different weights. */
export type Logo = { src: string; ratio: number; scale?: number };

const logo = {
  accenture: { src: '/logos/accenture.svg', ratio: 3.79 },
  bulb: { src: '/logos/bulb.svg', ratio: 2.46, scale: 1.25 },
  eveningStandard: { src: '/logos/evening-standard.webp', ratio: 7.69 },
  hycap: { src: '/logos/hycap.svg', ratio: 3.57 },
  monzo: { src: '/logos/monzo.svg', ratio: 5.33 },
  octopus: { src: '/logos/octopus-group.svg', ratio: 4.12 },
  paragon: { src: '/logos/paragon.svg', ratio: 2.66 },
  telegraph: { src: '/logos/telegraph.svg', ratio: 6.11 },
  times: { src: '/logos/the-times.svg', ratio: 8.42 },
  toyotaVentures: { src: '/logos/toyota-ventures.svg', ratio: 9.09 },
  vitl: { src: '/logos/vitl.svg', ratio: 2.35, scale: 1.15 },
  aldi: { src: '/logos/aldi.webp', ratio: 2.5 },
  gsk: { src: '/logos/gsk.webp', ratio: 3.28 },
  thg: { src: '/logos/thg.svg', ratio: 3.14 },
  zavvi: { src: '/logos/zavvi.webp', ratio: 2.8 },
  emaar: { src: '/logos/emaar.svg', ratio: 5.03 },
  greatTaste: { src: '/logos/great-taste.svg', ratio: 1 },
  herneHill: { src: '/logos/herne-hill-velodrome.webp', ratio: 4.2 },
  qatar: { src: '/logos/qatar.webp', ratio: 1.01 },
  sainsburys: { src: '/logos/sainsburys.svg', ratio: 5.26 },
  shs: { src: '/logos/shs-group.svg', ratio: 1 },
  sse: { src: '/logos/sse.svg', ratio: 2.06 },
  thisMorning: { src: '/logos/this-morning.webp', ratio: 2.81 },
  uberBoat: { src: '/logos/uber-boat.webp', ratio: 2.81 },
  wychwood: { src: '/logos/wychwood.webp', ratio: 10.53 },
  zeti: { src: '/logos/zeti.webp', ratio: 3.16 },
} satisfies Record<string, Logo>;

export type WorldArt = {
  src: ImageMetadata;
  alt: string;
  route: Route;
  hotspots: Hotspot[];
  signs?: Sign[];
};

export const art: Record<string, WorldArt> = {
  'shandy-shack': {
    src: shandyShack,
    alt: 'Isometric diorama of the Shandy Shack world: the trailer bar, brewery, canning line, pallets of cans, press billboards, supermarkets, a pub, a festival stage, a velodrome, a TV studio, a river boat and the acquisition lorry.',
    route: {
      enter: [
        { x: -3, y: 34 },
        { x: 10, y: 42.5 },
        { x: 20, y: 48 },
        { x: 27, y: 51 },
        { x: 27.5, y: 47.5 },
      ],
      seat: { x: 27.8, y: 44 },
      exit: [
        { x: 27.5, y: 47.5 },
        { x: 28, y: 52 },
        { x: 40, y: 58.5 },
        { x: 52, y: 64.5 },
        { x: 66, y: 70 },
        { x: 72, y: 68 },
        { x: 85, y: 58.5 },
        { x: 98, y: 49.5 },
        { x: 103, y: 46 },
      ],
    },
    // In story order: the dots are numbered and the panel steps through them.
    hotspots: [
      {
        label: 'Origins',
        body: 'In the summer of 2018, I joined Tom and Fred in launching Shandy Shack for three main reasons: a deep-seated personal motivation to help people drink less, the allure of a fading ancestral involvement in the international brewing industry and a conviction that shandy was a sleeping giant of a drinks format that deserved a renaissance.\n\nWith ‘Lean Startup’ theory in mind, we knocked up a pop-up bar, entered the festival circuit and started gathering feedback to inform our proposition.',
        dot: { x: 29.5, y: 34 },
        x: 18.5, y: 32, w: 17, h: 19,
      },
      {
        label: 'Building the Product',
        body: 'I spotted a gap for a craft beer shandy and took it from test brews to an award-winning range in four flavours (elderflower, raspberry, lemon and ginger beer), first in bottles and then in cans.',
        dot: { x: 26, y: 15 },
        x: 14, y: 7, w: 20, h: 20,
      },
      {
        label: 'National Retail',
        body: 'I won and managed our national grocery accounts, from a debut Sainsbury’s listing in 2020 to Aldi (a lead that came through my own LinkedIn) and Midcounties Co-op. We grew from 52 listings in 2021 to 3,400 in 2023, stocked from Edinburgh to Exeter.',
        links: [
          { label: 'Sainsbury’s debut, Oxford Mail · Nov 2020', href: `${NEWS}shandy-shack-to-sell-ipa-shandy-at-sainsbury-s` },
          { label: 'Midcounties Co-op · Nov 2023', href: `${NEWS}were-now-co-operating-with-midcounties-co-operative` },
        ],
        dot: { x: 54, y: 31 },
        x: 46, y: 26, w: 34, h: 18,
      },
      {
        label: 'Pubs and Bars',
        body: 'Alongside supermarkets, I sold into pub groups, starting with draught and cans across 11 City Pub Group pubs in 2021.',
        links: [
          { label: 'City Pub Group, 11 pubs · Jul 2021', href: `${NEWS}shandies-pouring-across-city-pub-group` },
        ],
        dot: { x: 64, y: 47 },
        x: 57, y: 42, w: 17, h: 20,
      },
      {
        label: 'Collaborations',
        body: 'Partnerships put the brand in front of new audiences, starting with our first collaboration range, with Diddly Squat Farm Shop, in April 2022.',
        links: [{ label: 'Diddly Squat Farm Shop · Apr 2022', href: `${NEWS}our-first-collab-shandy-range-diddly-squat-farm-shop` }],
        dot: { x: 39, y: 29 },
        x: 32.5, y: 26, w: 11, h: 15,
      },
      {
        label: 'Events and Partnerships',
        body: 'Festivals stayed at the heart of the brand: the headline bar at Wychwood Festival, Herne Hill Velodrome, and shandies on the Thames with Uber Boat by Thames Clippers. Online, we built a verified Instagram account with around 10,000 followers.',
        links: [
          { label: 'Instagram, @shandy.shack', href: 'https://www.instagram.com/shandy.shack/' },
          { label: 'Wychwood Festival · Jun 2023', href: `${NEWS}wychwood-festival-shandies` },
          { label: 'Herne Hill Velodrome · Jul 2023', href: `${NEWS}wheel-love-herne-hill-velodrome` },
          { label: 'Uber Boat by Thames Clippers · Aug 2024', href: `${NEWS}shandies-upon-thames-with-uber-boat` },
        ],
        dot: { x: 89, y: 33 },
        x: 81, y: 30, w: 15, h: 19,
      },
      {
        label: 'Earned Press',
        body: 'We grew awareness through PR rather than paid media, earning millions of editorial views: ITV1 twice, BBC Radio 4, The Guardian, The Times, The Telegraph and the Evening Standard.',
        links: [
          { label: 'ITV1, This Morning · Jul 2023', href: `${NEWS}mid-strength-takes-on-this-morning` },
          { label: 'BBC Radio 4, You & Yours · May 2021', href: `${NEWS}discussing-the-shandy-revival-with-you-yours-on-bbc-radio-4` },
          { label: 'The Guardian · Apr 2021', href: `${NEWS}shandy-poised-for-a-revival-says-the-guardian` },
          { label: 'The Times · Aug 2023', href: `${NEWS}its-shandy-oclock-in-the-times` },
          { label: 'The Telegraph · Feb 2024', href: `${NEWS}proper-shandy-telegraph-selects-shack-as-real-deal` },
          { label: 'Evening Standard · May 2023', href: 'https://www.standard.co.uk/lifestyle/what-to-drink-this-summer-cocktail-trends-london-b1080298.html' },
          { label: 'All news and press', href: NEWS },
        ],
        dot: { x: 77.5, y: 23 },
        x: 70, y: 8, w: 24, h: 20,
      },
      {
        label: 'Great Taste Award',
        body: 'In 2023 we became a Great Taste award-winning producer, independent recognition for the product.',
        links: [{ label: 'Great Taste · Sep 2023', href: `${NEWS}producer-of-great-taste-officially` }],
        dot: { x: 57.6, y: 68 },
        x: 55, y: 65, w: 6, h: 14,
      },
      {
        label: 'Funding and Exit',
        body: 'I raised equity rounds in 2021 and 2022, then grew revenue by +132% a year, compounded over four financial years. In November 2024 we sold to SHS Drinks, the decades-old group behind WKD and Shloer.',
        links: [
          { label: 'Six-figure raise, The Grocer · 2021', href: `${GROCER}craft-beer-startup-shandy-shack-raises-six-figure-investment/653278.article` },
          { label: 'Second round, The Grocer · 2022', href: `${GROCER}shandy-shack-closes-second-funding-round-as-revenues-accelerate-towards-1m/668044.article` },
          { label: 'Sale to SHS Drinks, The Grocer · Nov 2024', href: `${GROCER}shs-group-buys-mid-strength-alcohol-brand-shandy-shack/698549.article` },
        ],
        dot: { x: 84, y: 64.5 },
        x: 74, y: 65, w: 17, h: 17,
      },
    ],
    // Panel corners measured from the artwork's pixels.
    signs: [
      {
        label: 'The Telegraph',
        logos: [logo.telegraph],
        font: 'serif',
        text: 'The Telegraph',
        tl: { x: 66.99, y: 6.06 },
        tr: { x: 74.4, y: 8.4 },
        bl: { x: 66.99, y: 14.6 },
      },
      {
        label: 'The Times',
        logos: [logo.times],
        font: 'serif',
        text: 'THE TIMES',
        tl: { x: 75.96, y: 9.03 },
        tr: { x: 84.33, y: 11.9 },
        bl: { x: 75.96, y: 18.28 },
      },
      {
        label: 'Evening Standard',
        logos: [logo.eveningStandard],
        tone: 'ink',
        text: 'Evening Standard',
        tl: { x: 85.89, y: 12.75 },
        tr: { x: 94.56, y: 16.15 },
        bl: { x: 85.89, y: 23.17 },
      },
      {
        label: 'Sainsbury’s',
        logos: [logo.sainsburys],
        fit: 0.7,
        text: 'Sainsbury’s',
        tl: { x: 46.53, y: 31.56 },
        tr: { x: 54.9, y: 36.66 },
        bl: { x: 46.53, y: 34.54 },
      },
      {
        label: 'Aldi',
        logos: [logo.aldi],
        tone: 'color',
        fit: 0.92,
        text: 'ALDI',
        tl: { x: 63.46, y: 25.61 },
        tr: { x: 72.61, y: 31.14 },
        bl: { x: 63.46, y: 28.48 },
      },
      {
        label: 'SHS Drinks',
        logos: [logo.shs],
        tone: 'color',
        fit: 0.62,
        text: 'SHS',
        // Right-hand end of the trailer, clear of the two figures in front.
        tl: { x: 82.5, y: 70.09 },
        tr: { x: 88.04, y: 73.65 },
        bl: { x: 82.5, y: 76.6 },
      },
      {
        label: 'Wychwood Festival',
        logos: [logo.wychwood],
        tone: 'color',
        text: 'Wychwood',
        tl: { x: 85.11, y: 34.43 },
        tr: { x: 91.81, y: 36.88 },
        bl: { x: 85.11, y: 36.34 },
      },
      {
        label: 'Herne Hill Velodrome',
        logos: [logo.herneHill],
        tone: 'color',
        text: 'Herne Hill Velodrome',
        fit: 0.4,
        // Follows the wall’s slope; kept small so the wall's curve doesn't show it up.
        tl: { x: 86.72, y: 52.61 },
        tr: { x: 93.3, y: 49.76 },
        bl: { x: 86.72, y: 55.99 },
      },
      {
        label: 'Uber Boat by Thames Clippers',
        logos: [logo.uberBoat],
        tone: 'ink',
        fit: 0.92,
        text: 'Uber Boat',
        tl: { x: 23.54, y: 72.22 },
        tr: { x: 29.86, y: 76.61 },
        bl: { x: 23.54, y: 73.37 },
      },
      {
        label: 'This Morning',
        logos: [logo.thisMorning],
        tone: 'color',
        text: 'This Morning',
        fit: 0.58,
        tl: { x: 39.6, y: 61.5 },
        tr: { x: 46.2, y: 65.4 },
        bl: { x: 39.6, y: 65.6 },
      },
      {
        label: 'Great Taste',
        logos: [logo.greatTaste],
        tone: 'color',
        fit: 0.9,
        text: 'Great Taste',
        tl: { x: 55.16, y: 75.64 },
        tr: { x: 57.24, y: 77.24 },
        bl: { x: 55.16, y: 78.07 },
      },
    ],
  },
  accenture: {
    src: accenture,
    alt: 'Isometric diorama of Accenture client work: the stepped glass Accenture office at the centre, SSE’s Havant office with a giant bill, the twin towers of La Défense and the Grande Arche, the Burj Khalifa and Palace Downtown, the MOTC tower in Doha with a dhow and TASMU sector icons, GSK House with a phone and watch launching, a brand-incubator greenhouse, and a Startup Sessions talk.',
    route: {
      enter: [
        { x: -3, y: 33 },
        { x: 5, y: 39.5 },
        { x: 12, y: 43.5 },
        { x: 18, y: 42.5 },
        { x: 24, y: 44 },
        { x: 30, y: 47.5 },
        { x: 36, y: 53 },
        { x: 40.5, y: 57 },
        { x: 44.5, y: 62.5 },
        { x: 48, y: 62.5 },
      ],
      seat: { x: 51.5, y: 61.5 },
      exit: [
        { x: 48, y: 62.5 },
        { x: 46, y: 64.5 },
        { x: 52, y: 66.5 },
        { x: 58, y: 66 },
        { x: 63, y: 60 },
        { x: 66, y: 53 },
        { x: 72, y: 49.5 },
        { x: 80, y: 48 },
        { x: 86, y: 47.5 },
        { x: 94, y: 45 },
        { x: 103, y: 42 },
      ],
    },
    // Roughly in date order.
    hotspots: [
      {
        label: 'Accenture',
        body: 'Three years as a digital strategy consultant, working inside client organisations across four countries and five sectors. In the Open Innovation team I also built go-to-market materials for a FinTech joint venture with the CEO of a mobile engagement startup.',
        role: 'Embedded with each client to learn their users, systems and stakeholders, then turned what I found into a plan their own teams could deliver: the core of forward-deployed work today.',
        dot: { x: 54, y: 45 },
        x: 39, y: 38, w: 19, h: 26,
      },
      {
        label: 'SSE',
        body: 'Transforming the billing systems behind an energy challenger brand.',
        role: 'Worked inside the client’s transformation programme, leading a team of four on the billing and payments UX.',
        links: [
          { label: 'SSE selects Accenture for retail transformation · 2013', href: 'https://www.tdworld.com/smart-utility/article/20963140/sse-selects-accenture-for-major-transformation-projects' },
        ],
        dot: { x: 23.5, y: 31 },
        x: 13, y: 25, w: 20, h: 15,
      },
      {
        label: 'Startup Sessions',
        body: 'I organised Startup Sessions, a speaker series bringing the CEOs of Monzo, Bulb and Vitl to talk to Accenture audiences.',
        dot: { x: 42.5, y: 70 },
        x: 33, y: 62, w: 19, h: 20,
      },
      {
        label: 'French Bank · La Défense',
        body: 'A major French bank, La Défense, Paris (2017): a blockchain opportunity assessment.',
        dot: { x: 32, y: 26 },
        x: 27, y: 8, w: 15, h: 22,
      },
      {
        label: 'MOTC Qatar · TASMU',
        body: 'Qatar’s Ministry of Transport and Communications (MOTC), 2017: TASMU, the Smart Qatar programme, with priority sectors in transport, logistics, environment, healthcare and sport.',
        role: 'Delivered the digital cluster strategy for a government client, bringing startups, incubators and universities together around TASMU’s priority sectors.',
        links: [
          { label: 'Accenture and MOTC sign TASMU MOU · 2017', href: 'https://newsroom.accenture.com/news/2017/motc-and-accenture-sign-mou-to-power-smart-qatar-program-tasmu-with-digital-innovation' },
        ],
        dot: { x: 75, y: 26 },
        x: 69, y: 17, w: 30, h: 26,
      },
      {
        label: 'Emaar Hospitality Group',
        body: 'Dubai, 2017–18: the group behind the Armani Hotel Dubai in the Burj Khalifa and Palace Downtown.',
        role: 'Worked directly with the C-suite to produce a roadmap to digitise the guest experience and operating model, and ran a design-thinking workshop for 25.',
        links: [
          { label: 'Emaar Hospitality Group', href: 'https://www.emaarhospitality.com/en/' },
          { label: 'Emaar Hospitality and Accenture digital transformation · Dec 2017', href: 'https://www.gdnonline.com/Details/299370/Emaar-Hospitality-to-embark-on-digital-transformation-' },
        ],
        dot: { x: 62.5, y: 28.5 },
        x: 44, y: 3, w: 24, h: 33,
      },
      {
        label: 'GSK Digital Accelerator',
        body: 'GSK, 2018: helping set up health innovation centres to develop new digital health apps and services.',
        dot: { x: 28, y: 60 },
        x: 14, y: 46, w: 21, h: 22,
      },
      {
        label: 'GSK Brand Incubator',
        body: 'Reimagining tail brands in GSK’s consumer health portfolio, and working out how to rebrand and relaunch them.',
        dot: { x: 77, y: 57 },
        x: 66, y: 49, w: 25, h: 24,
      },
    ],
    signs: [
      {
        label: 'Accenture',
        logos: [logo.accenture],
        text: 'accenture',
        tl: { x: 55.32, y: 55.37 },
        tr: { x: 57.48, y: 54.3 },
        bl: { x: 55.32, y: 58.87 },
      },
      {
        label: 'Startup Sessions: Monzo, Bulb, Vitl',
        logos: [logo.monzo, logo.bulb, logo.vitl],
        size: 0.67,
        text: 'Monzo · Bulb · Vitl',
        tl: { x: 33.73, y: 65.25 },
        tr: { x: 38.82, y: 62.27 },
        bl: { x: 33.73, y: 70.46 },
      },
      {
        label: 'SSE',
        logos: [logo.sse],
        tone: 'color',
        fit: 0.85,
        text: 'SSE',
        tl: { x: 19.98, y: 32.81 },
        tr: { x: 26.73, y: 36.32 },
        bl: { x: 19.98, y: 34.94 },
      },
      {
        label: 'Emaar',
        logos: [logo.emaar],
        tone: 'color',
        text: 'EMAAR',
        tl: { x: 59.21, y: 37.83 },
        tr: { x: 62.68, y: 39.43 },
        bl: { x: 59.21, y: 41.34 },
      },
      {
        label: 'Qatar Ministry of Communications and IT',
        logos: [logo.qatar],
        tone: 'color',
        text: 'Qatar',
        tl: { x: 71.89, y: 24.12 },
        tr: { x: 74.7, y: 25.19 },
        bl: { x: 71.89, y: 30.18 },
      },
      {
        label: 'GSK Brand Incubator',
        logos: [logo.gsk],
        text: 'GSK',
        tl: { x: 85.17, y: 51.43 },
        tr: { x: 89.77, y: 54.2 },
        bl: { x: 85.17, y: 55.9 },
      },
    ],
  },
  zeti: {
    src: zeti,
    alt: 'Isometric diorama of the Zeti world: Albert House with its glass lantern tower and a cut-away atrium, an EV depot with rooftop solar, chargers and battery storage, electric black cabs charging, robotaxis and a red bus on the roads, a fleet of white electric cars, the ZetiOS data centre under a cloud, the funders’ and investors’ offices joined by a pipe of coins, and a demo stage with UK and US flags and a trophy.',
    route: {
      enter: [
        { x: -3, y: 34 },
        { x: 3, y: 39 },
        { x: 12, y: 47 },
        { x: 22, y: 56.5 },
        { x: 32, y: 66 },
        { x: 42, y: 75.5 },
        { x: 50, y: 82 },
        { x: 55, y: 82.5 },
        { x: 62, y: 78 },
        { x: 70, y: 70.5 },
        { x: 76, y: 64.5 },
        { x: 79.5, y: 61 },
        { x: 77.5, y: 57.5 },
        { x: 74.5, y: 54 },
      ],
      seat: { x: 74.2, y: 50.5 },
      exit: [
        { x: 74.5, y: 54 },
        { x: 77.5, y: 57.5 },
        { x: 80, y: 60.5 },
        { x: 86, y: 56 },
        { x: 90, y: 50.5 },
        { x: 94, y: 45 },
        { x: 97, y: 41 },
        { x: 100, y: 39 },
        { x: 103, y: 38 },
      ],
    },
    hotspots: [
      {
        label: 'Incubated at Octopus Investments',
        body: 'Zeti was incubated inside Octopus Investments, a leading UK investment manager with £10bn AUM as of June 2025. I delivered and operated the MVP between 2018 and 2020 through which the first ~£8m of capital was deployed to fund around 155 electric vehicles on a pay-per-mile basis. After incubation, Octopus Investments became and still are a customer of Zeti’s.',
        links: [
          { label: 'Fulham Cab Company, Octopus · Oct 2019', href: 'https://octopusgroup.com/newsroom/latest-news/octopus-helps-fulham-cab-company-become-uks-largest-electric-taxi-fleet/' },
        ],
        dot: { x: 60, y: 15.5 },
        x: 52, y: 12, w: 14, h: 20,
      },
      {
        label: 'ZetiOS',
        body: 'Today, Zeti’s main product is ZetiOS, an integrated, cloud-based platform for asset finance and management. Alongside the CTO, I led the team that designed and built it as the next iteration of Zeti Hub, the platform that replaced my original MVP. ZetiOS combines origination, servicing and asset intelligence modules to execute different types of loan and lease contracts for customers in the UK and the US. It boasts integrations to payment processing services (e.g. Stripe), market value data providers (e.g. Glass’s) and multiple telematics providers (e.g. GeoTab, Samsara) to unlock greater efficiency, risk awareness and innovation for customers.',
        dot: { x: 55, y: 36 },
        x: 37, y: 32, w: 26, h: 24,
      },
      {
        label: 'Widening Asset Classes',
        body: 'While Zeti started out specialising in electric vehicle finance and management, we have since expanded to wider asset classes. For example, we help to finance solar arrays through the automatic apportionment of PPA receivables to service debt. We have also developed custom telematics for a hydrogen refueller company, and will soon monitor the impact of electric semi-trucks in California for an NGO responsible for deploying US federal grant funding.',
        dot: { x: 27, y: 19 },
        x: 10, y: 14, w: 38, h: 26,
      },
      {
        label: 'Three-Statement Modelling for Robotaxis',
        body: 'With the advent of autonomous passenger transport, I have designed and developed a three-statement model feature to track performance at the individual asset level, which allows for a significantly more intricate and precise approach to asset management. This has been co-developed with early market entrants in both the UK and the US.',
        dot: { x: 31, y: 62.5 },
        x: 26, y: 60, w: 10, h: 12,
      },
      {
        label: 'Paragon Bank Partnership',
        body: 'Since late 2023, I have helped to nurture Zeti’s significant partnership with Paragon Bank, a UK FTSE 250 bank with £1.2bn turnover in 2025. As part of this partnership, we facilitate both pay-per-mile loans to vehicle fleet operators and an energy receivable financing proposition that intelligently fulfils developers’ debt obligations to the bank from their Power Purchase Agreement revenues. I oversee this relationship with a product and operations lens, with a Senior Product Manager driving solution delivery.',
        links: [
          { label: 'Paragon expands partnership, Development Finance Today · Feb 2026', href: 'https://developmentfinancetoday.co.uk/paragon-expands-green-partnership-with-zeti' },
        ],
        dot: { x: 49, y: 10 },
        x: 43, y: 7, w: 9, h: 21,
      },
      {
        label: 'Fundraising & Programme Success',
        body: 'I supported pre-seed, seed (e.g. Toyota Ventures) and Series A (e.g. HYCAP Group) fundraising activity by delivering product demos and completing detailed due diligence requests. Furthermore, at pre-seed stage after spinning out from Octopus Investments, I was pivotal in securing Zeti a place on the prestigious Accenture FinTech Innovation Lab.',
        links: [
          { label: 'Toyota Ventures investment, Finance Connect · Nov 2022', href: 'https://finance-connect.com/toyota-ventures-investment-in-zeti-enabling-fleet-electrification-through-pay-as-you-drive-financing/' },
          { label: 'HYCAP Group investment, UKTN · Jun 2024', href: 'https://www.uktech.news/mobility/jcb-heir-investment-firm-zeti-20240627' },
          { label: 'FinTech Innovation Lab London · Jan 2021', href: 'https://www.fintechinnovationlab.com/news/london/london-cohort-news-january-2021/' },
          { label: 'Startups 100 · 2025', href: 'https://startups.co.uk/startups-100/2025/zeti/' },
          { label: 'Innovation Zero Awards shortlist · 2026', href: 'https://www.innovationzero.com/awards/finalists' },
        ],
        dot: { x: 70, y: 20 },
        x: 66, y: 12, w: 10, h: 19,
      },
    ],
    signs: [
      {
        label: 'Paragon Bank',
        logos: [logo.paragon],
        text: 'Paragon',
        tl: { x: 44.32, y: 12.86 },
        tr: { x: 49.58, y: 15.83 },
        bl: { x: 44.32, y: 15.3 },
      },
      {
        label: 'Octopus Investments',
        logos: [logo.octopus],
        text: 'Octopus',
        tl: { x: 58.43, y: 17.75 },
        tr: { x: 61.48, y: 19.55 },
        bl: { x: 58.43, y: 20.19 },
      },
      {
        label: 'Toyota Ventures · HYCAP',
        logos: [logo.toyotaVentures, logo.hycap],
        text: 'Toyota Ventures · HYCAP',
        tl: { x: 67.94, y: 22.64 },
        tr: { x: 71.41, y: 24.55 },
        bl: { x: 67.94, y: 25.82 },
      },
      {
        label: 'Zeti',
        logos: [logo.zeti],
        tone: 'color',
        text: 'ZETI',
        fit: 0.4,
        // The demo stage screen, with the speaker standing in front of it.
        tl: { x: 61.41, y: 54.52 },
        tr: { x: 66.57, y: 56.35 },
        bl: { x: 61.41, y: 59.73 },
        infront: [
          { x: 63.88, y: 58.61 }, { x: 64.04, y: 58.42 }, { x: 64.22, y: 58.58 }, { x: 64.25, y: 58.95 },
          { x: 64.19, y: 59.27 }, { x: 64.44, y: 59.51 }, { x: 64.52, y: 60.47 }, { x: 64.47, y: 61.26 },
          { x: 64.41, y: 63.55 }, { x: 63.67, y: 63.55 }, { x: 63.64, y: 61.13 }, { x: 63.4, y: 60.47 },
          { x: 63.35, y: 60.2 }, { x: 63.58, y: 59.67 }, { x: 63.86, y: 59.35 }, { x: 63.85, y: 58.95 },
        ],
      },
    ],
  },

  today: {
    src: today,
    alt: 'Isometric diorama of Herne Hill today: red-brick estate blocks around a garden walk with a white cupola, a cut-away home studio with two monitors, a projects quarter of a small hotel with sound waves, a glass phone-shaped kiosk with a piggy bank and a maker’s workshop, a five-a-side cage with players in mustard yellow, a blue finish arch in front of a small Colosseum, and a lawn with a bench and a red post box.',
    route: {
      enter: [
        { x: -3, y: 35.5 },
        { x: 5, y: 39.5 },
        { x: 15, y: 45 },
        { x: 25, y: 51 },
        { x: 35, y: 57.5 },
        { x: 44, y: 63 },
        { x: 49, y: 62 },
        { x: 51, y: 57 },
        { x: 52.5, y: 52 },
      ],
      seat: { x: 53.5, y: 49.5 },
      exit: [
        { x: 52.5, y: 52 },
        { x: 51, y: 57 },
        { x: 53, y: 62 },
        { x: 58, y: 59 },
        { x: 65, y: 54 },
        { x: 72, y: 50 },
        { x: 80, y: 46.5 },
        { x: 90, y: 42.5 },
        { x: 98, y: 38.5 },
        { x: 103, y: 36.5 },
      ],
    },
    hotspots: [
      {
        label: 'Place',
        body: 'Alongside my main role with Zeti, I’m working on Place, an agentic, screen-free tour guide that allows travel and tourism organisations to deliver personalised experiences to their customers beyond the usual realm of their service.',
        dot: { x: 65, y: 14 },
        x: 59, y: 4, w: 13, h: 27,
      },
      {
        label: 'Personal Finance',
        body: 'I run a personal finance application that visualises an income statement and balance sheet according to Robert Kiyosaki’s principles. This uses a React/Tailwind front-end, a Supabase Postgres database and an integration to TrueLayer for open banking feeds.',
        dot: { x: 76, y: 22 },
        x: 72, y: 15, w: 8, h: 20,
      },
      {
        label: 'Other Projects',
        body: 'I love making digital products whenever I get the chance, and aside from Place and my personal finance application, I have also built a wedding website for my wife and me with an RSVP feature, and of course this website, using a mixture of integrations and tools.',
        dot: { x: 87, y: 28 },
        x: 80, y: 19, w: 15, h: 21,
      },
    ],
  },
  'the-hut-group': {
    src: theHutGroup,
    alt: 'Isometric diorama of the Zavvi eCommerce world: a giant laptop that is also a shop window, a fulfilment warehouse with a mountain of parcels and a forklift, a conveyor of steelbooks, games, figures and mugs, a converted red-brick mill with a cut-away trading floor of dashboards, a marketing garden of 3D charts, a coin funnel, a cursor billboard and flying envelopes, a giant search bar with a magnifying glass, influencers filming on ring lights, a green scoreboard, and delivery vans with Spanish, French and German flags.',
    route: {
      enter: [
        { x: -3, y: 39 },
        { x: 5, y: 42.5 },
        { x: 15, y: 50 },
        { x: 25, y: 58.5 },
        { x: 35, y: 67 },
        { x: 42, y: 74 },
        { x: 48, y: 79 },
        { x: 53, y: 78 },
        { x: 56, y: 71 },
        { x: 58, y: 64 },
        { x: 61, y: 60.5 },
        { x: 65, y: 61.5 },
      ],
      seat: { x: 68, y: 62 },
      exit: [
        { x: 65, y: 61.5 },
        { x: 61, y: 60.5 },
        { x: 58, y: 64 },
        { x: 58, y: 72 },
        { x: 62, y: 78.5 },
        { x: 70, y: 73 },
        { x: 80, y: 64.5 },
        { x: 90, y: 56 },
        { x: 97, y: 50.5 },
        { x: 103, y: 46 },
      ],
    },
    hotspots: [
      {
        label: 'Zavvi.es',
        body: 'Zavvi.es, the Spanish store I ran: about £5m a year in games, film, TV and pop culture.',
        dot: { x: 52, y: 10 },
        x: 45, y: 3, w: 16, h: 33,
      },
      {
        label: 'Warehouse',
        body: 'The THG fulfilment machine, shipping parcels across Europe.',
        dot: { x: 22, y: 17 },
        x: 10, y: 10, w: 28, h: 35,
      },
      {
        label: 'Collector’s Editions',
        body: 'Collector’s-edition Blu-ray steelbooks, the crown jewels of the catalogue.',
        dot: { x: 33, y: 31 },
        x: 28, y: 27, w: 9, h: 13,
      },
      {
        label: 'Games & Memorabilia',
        body: 'Video games, figures, statues and memorabilia.',
        dot: { x: 41, y: 35 },
        x: 37, y: 30, w: 8, h: 14,
      },
      {
        label: 'Merch',
        body: 'T-shirts, hoodies and mugs: the long tail of fandom.',
        dot: { x: 48, y: 40 },
        x: 45, y: 36, w: 7, h: 10,
      },
      {
        label: 'Performance Marketing',
        body: 'I growth-hacked the Spanish store: optimising organic and paid search and social from Google Analytics data.',
        dot: { x: 69, y: 12 },
        x: 62, y: 7, w: 26, h: 28,
      },
      {
        label: 'Search',
        body: 'Organic and paid search: most shoppers found the store on Google, so every keyword, bid and landing page counted.',
        dot: { x: 45, y: 61 },
        x: 33, y: 54, w: 19, h: 20,
      },
      {
        label: 'Influencers and Affiliates',
        body: 'I managed international influencer and affiliate partners.',
        dot: { x: 79, y: 63 },
        x: 66, y: 58, w: 20, h: 18,
      },
      {
        label: '35% Above Target',
        body: 'The result: sales 35% above target.',
        dot: { x: 93, y: 34 },
        x: 89, y: 22, w: 8, h: 18,
      },
    ],
    signs: [
      {
        label: 'Zavvi',
        logos: [logo.zavvi],
        text: 'Zavvi',
        fit: 0.5,
        // Upper part of the purple billboard, clear of the cursor.
        tl: { x: 71.05, y: 8.2 },
        tr: { x: 77.2, y: 11.4 },
        bl: { x: 71.05, y: 13.2 },
      },
      {
        label: 'THG',
        logos: [logo.thg],
        text: 'THG',
        tl: { x: 89.83, y: 23.49 },
        tr: { x: 95.57, y: 26.57 },
        bl: { x: 89.83, y: 29.44 },
      },
    ],
  },
  'year-abroad': {
    src: yearAbroad,
    alt: 'Isometric diorama of a year abroad: on the left, Barcelona, with a cut-away modernista sales office, postcards flying out of the window, an Ibiza villa with a pool, a Tuscan farmhouse and vineyard, Sagrada Família spires and a pool villa with sun loungers; on the right, Paris, with a cut-away Haussmann hotel with chat bubbles, Sacré-Cœur, a glass hotel-tech expo hall with a tablet demo, a green newspaper kiosk, a Morris column and a café; a high-speed train links the two.',
    route: {
      enter: [
        { x: -3, y: 35.5 },
        { x: 5, y: 38.5 },
        { x: 15, y: 44 },
        { x: 24, y: 50 },
        { x: 30, y: 55.5 },
        { x: 34, y: 57.5 },
      ],
      seat: { x: 35.5, y: 54 },
      exit: [
        { x: 34, y: 57.5 },
        { x: 40, y: 61.5 },
        { x: 46, y: 63 },
        { x: 52, y: 60 },
        { x: 58, y: 60 },
        { x: 65, y: 65 },
        { x: 72, y: 65 },
        { x: 78, y: 57 },
        { x: 83, y: 49 },
        { x: 89, y: 45 },
        { x: 95, y: 42 },
        { x: 103, y: 40 },
      ],
    },
    // Walking back in time: Barcelona (2013) first, then Paris (2012).
    hotspots: [
      {
        label: 'Divino Villas, Barcelona',
        body: 'Divino Villas, Barcelona, spring and summer 2013: business development intern, working across four languages. The CEO’s reference: “Edward is very responsible, smart, timely and hard working.”',
        dot: { x: 35, y: 38 },
        x: 26, y: 29, w: 16, h: 30,
      },
      {
        label: 'Pool Villa',
        body: 'Phone and email sales: I matched guests to the right villa, down to the number of bedrooms and the pool, and every call ended in a shortlist and, with luck, a booking.',
        dot: { x: 15, y: 47 },
        x: 6, y: 39, w: 20, h: 24,
      },
      {
        label: 'Ibiza Villa',
        body: 'I wrote listings for villas in Ibiza (Cala Conta, Cala Vadella) and Mallorca, and got them online.',
        dot: { x: 16, y: 22 },
        x: 10, y: 18, w: 14, h: 16,
      },
      {
        label: 'Tuscan Farmhouse',
        body: 'Tuscany too: Greve in Chianti, Arezzo, Camaiore. I translated and edited every listing in English, French and Spanish.',
        dot: { x: 29, y: 15 },
        x: 22, y: 10, w: 14, h: 12,
      },
      {
        label: 'LoungeUp',
        body: 'LoungeUp, Paris, September 2012 to March 2013: an app for hotels to talk to their guests, with room service, concierge chat and local tips on the guest’s phone. It’s now part of D-EDGE CRM.',
        dot: { x: 70, y: 17 },
        x: 56, y: 8, w: 24, h: 34,
      },
      {
        label: 'Conference',
        body: 'Hotel-tech conferences and trade shows: I regularly represented LoungeUp on the stand, in French and English.',
        dot: { x: 70, y: 47 },
        x: 59, y: 38, w: 23, h: 27,
      },
      {
        label: 'Kiosque',
        body: 'I wrote the blog: “High-tech hotels around the world”, covering digital keys, iPads in rooms and smart lighting.',
        dot: { x: 86, y: 55 },
        x: 80, y: 50, w: 14, h: 22,
      },
    ],
  },
  durham: {
    src: durham,
    alt: 'Isometric diorama of Durham: the cathedral and castle keep on a wooded peninsula above the River Wear with a stone bridge, a rowing eight and a single scull, Elvet Riverside on the bank, a finance society room with charts, a cricket ground with a white pavilion, Collingwood College with its cut-away study room and brick accommodation block, a graduation lawn with caps in the air, an art-house cinema and a small station with a train.',
    route: {
      enter: [
        { x: -3, y: 42 },
        { x: 3, y: 44 },
        { x: 10, y: 48.5 },
        { x: 20, y: 54 },
        { x: 30, y: 59.5 },
        { x: 37, y: 63 },
        { x: 43, y: 60 },
        { x: 50, y: 58 },
        { x: 57, y: 58.5 },
        { x: 61, y: 55 },
      ],
      seat: { x: 67.5, y: 57.5 },
      exit: [
        { x: 61, y: 55 },
        { x: 62, y: 59 },
        { x: 70, y: 60 },
        { x: 78, y: 58 },
        { x: 85, y: 58.5 },
        { x: 92, y: 57 },
        { x: 97, y: 55 },
        { x: 103, y: 53 },
      ],
    },
    hotspots: [
      {
        label: 'Cathedral',
        body: 'Durham Cathedral and Castle on the peninsula above the River Wear.',
        dot: { x: 29, y: 12 },
        x: 20, y: 3, w: 35, h: 29,
      },
      {
        label: 'Elvet Riverside',
        body: 'Elvet Riverside, on the banks of the Wear: where we had our language lectures and seminars.',
        dot: { x: 34, y: 38 },
        x: 27, y: 35, w: 15, h: 15,
      },
      {
        label: 'Collingwood College',
        body: 'Collingwood College: my college for four years, up the hill in the woods.',
        dot: { x: 66, y: 40 },
        x: 57, y: 37, w: 23, h: 23,
      },
      {
        label: 'Investment & Finance Society',
        body: 'Investment & Finance Society: my first taste of markets, and of the finance world I’d later build products for.',
        dot: { x: 50, y: 36 },
        x: 44, y: 33, w: 12, h: 15,
      },
      {
        label: 'Cricket',
        body: 'Cricket in whites every summer.',
        dot: { x: 69, y: 25 },
        x: 56, y: 17, w: 22, h: 20,
      },
      {
        label: 'Graduation',
        body: 'Graduated in 2014 with Upper Second-Class Honours (2:1) in Modern Languages (French, Spanish and Catalan).',
        dot: { x: 50, y: 64 },
        x: 39, y: 59, w: 21, h: 21,
      },
      {
        label: 'Cine español',
        body: 'Spanish cinema is a long-running obsession, especially Almodóvar: Todo sobre mi madre and Volver are the two I keep going back to.',
        dot: { x: 79, y: 64 },
        x: 68, y: 55, w: 14, h: 18,
      },
      {
        label: 'Year Abroad',
        body: 'The Erasmus year abroad: Paris, then Barcelona. Those placements became my first two jobs.',
        dot: { x: 88, y: 46 },
        x: 80, y: 40, w: 18, h: 20,
      },
    ],
  },
  'where-next': {
    src: whereNext,
    alt: 'Isometric diorama of an open invitation: a small bright studio, cut away to show two empty armchairs facing each other across a coffee table, beside a freshly levelled building plot marked out with pegs and string, a small yellow digger by a mound of soil, and a sign board on two posts.',
    route: {
      enter: [
        { x: -3, y: 41 },
        { x: 5, y: 44 },
        { x: 15, y: 49.5 },
        { x: 25, y: 55 },
        { x: 35, y: 61 },
        { x: 42, y: 65 },
        { x: 47, y: 66 },
        { x: 49, y: 63 },
        { x: 48.5, y: 60 },
      ],
      seat: { x: 47.4, y: 55.6 },
      exit: [
        { x: 48.5, y: 60 },
        { x: 49, y: 63 },
        { x: 52, y: 67 },
        { x: 58, y: 72 },
        { x: 65, y: 70 },
        { x: 75, y: 64 },
        { x: 85, y: 56 },
        { x: 95, y: 48 },
        { x: 103, y: 43 },
      ],
    },
    hotspots: [
      {
        label: 'Your Project Here',
        body: 'This plot is free. Email edwardstapleton@me.com.',
        dot: { x: 81.5, y: 53 },
        x: 77, y: 34, w: 9, h: 16,
      },
    ],
    signs: [
      {
        label: 'Your Project Here',
        text: 'Your Project Here',
        color: '#2f3441',
        tl: { x: 77.6, y: 39.1 },
        tr: { x: 85.6, y: 35.1 },
        bl: { x: 77.6, y: 48.7 },
      },
    ],
  },
};
