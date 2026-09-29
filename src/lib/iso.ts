// Isometric geometry shared by the grey-box scene renderer and the chapter
// data. Every scene is authored on a 1600×900 (16:9) canvas; everything the
// page consumes (hotspots, walker path) is expressed in % of that canvas so it
// survives any rendered size — and so real artwork can drop in later with
// hand-tuned coordinates in the same units.

export const SCENE_W = 1600;
export const SCENE_H = 900;

/** Slab is an N×N grid of tiles. */
export const GRID = 11;
const UNIT = 62;
const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
const ORIGIN_X = SCENE_W / 2;
const ORIGIN_Y = 181;

/** Screen y of the path line that crosses every page (58% of the height). */
export const PATH_Y_PCT = ((ORIGIN_Y + GRID * SIN * UNIT) / SCENE_H) * 100;

export type Pt = { x: number; y: number };

/** Project grid coords (x, y, z in tile units) to scene pixels. */
export function project(x: number, y: number, z = 0): [number, number] {
  return [ORIGIN_X + (x - y) * COS * UNIT, ORIGIN_Y + (x + y) * SIN * UNIT - z * UNIT];
}

/** Project to % of the scene canvas. */
export function projectPct(x: number, y: number, z = 0): Pt {
  const [sx, sy] = project(x, y, z);
  return { x: round((sx / SCENE_W) * 100), y: round((sy / SCENE_H) * 100) };
}

/** Screen-space bounding box of a block, in % of the scene. */
export function blockBoxPct(x: number, y: number, w: number, d: number, h: number) {
  const pts = [
    project(x, y, h),
    project(x + w, y, h),
    project(x, y + d, h),
    project(x + w, y + d, 0),
    project(x + w, y, 0),
    project(x, y + d, 0),
  ];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: round((minX / SCENE_W) * 100),
    y: round((minY / SCENE_H) * 100),
    w: round(((Math.max(...xs) - minX) / SCENE_W) * 100),
    h: round(((Math.max(...ys) - minY) / SCENE_H) * 100),
  };
}

/**
 * Walker route through a scene, in % of the scene. `enter` runs from where Ed
 * arrives at the left edge to the office door, `seat` is where he sits, and
 * `exit` runs from the door to where he leaves at the right edge.
 */
export type Route = { enter: Pt[]; seat: Pt; exit: Pt[] };

/** Route for grey-box scenes: along the shared path line, in and out of the office. */
export function officeRoute(office: [number, number, number, number]): Route {
  const [x, y, w, d] = office;
  const door = projectPct(x + w, y + d);
  const seat = projectPct(x + w / 2, y + d / 2, 0.15);
  const kerb = { x: door.x, y: round(PATH_Y_PCT) };
  return {
    enter: [{ x: -4, y: round(PATH_Y_PCT) }, kerb, door],
    seat,
    exit: [door, kerb, { x: 104, y: round(PATH_Y_PCT) }],
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
