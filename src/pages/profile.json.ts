// Machine-readable career profile, generated from the same chapter data as the
// timeline. Starford's job application tool reads this as its source of truth
// for Ed's history, so edit src/data/chapters.ts and both stay in step.
//
// Public by design: anything private (preferences, salary, what energises or
// drains Ed, confidential numbers) lives in Starford, never here.
import type { APIRoute } from 'astro';
import { chapters } from '../data/chapters';
import { art } from '../data/art';

export const GET: APIRoute = () => {
  const roles = chapters
    .filter((c) => c.kind !== 'end')
    .map((c) => ({
      id: c.id,
      company: c.company,
      role: c.role,
      period: c.period,
      year: c.year,
      location: c.location,
      summary: c.summary,
      skills: c.skills ?? [],
      quote: c.quote ?? null,
      // The hotspots visitors actually see: a world's artwork hotspots, or its
      // grey-box blocks until the artwork lands.
      stories: art[c.id]
        ? art[c.id].hotspots.map((h) => ({ title: h.label, text: h.body, role: h.role ?? null, links: h.links ?? [] }))
        : c.blocks
            .filter((b) => b.body)
            .map((b) => ({ title: b.label, text: b.body, role: null, links: b.links ?? [] })),
    }));

  const body = {
    version: 1,
    generated: new Date().toISOString(),
    source: 'https://edwardstapleton.co.uk',
    name: 'Ed Stapleton',
    headline: roles[0]?.role ?? '',
    summary: roles[0]?.summary ?? '',
    roles,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
