// Progress maths: earned counts per grade and per roadmap stage, and PSN-style points.

import { GRADES } from './data.js';

const POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };

export function summarize(trophies, earned) {
  const byGrade = Object.fromEntries(GRADES.map((g) => [g, { done: 0, total: 0 }]));
  const byStage = { 1: { done: 0, total: 0 }, 2: { done: 0, total: 0 }, 3: { done: 0, total: 0 } };
  let done = 0;
  let points = 0;
  let maxPoints = 0;
  for (const t of trophies) {
    const has = Boolean(earned[t.name]);
    byGrade[t.grade].total += 1;
    byStage[t.stage].total += 1;
    maxPoints += POINTS[t.grade];
    if (has) {
      done += 1;
      points += POINTS[t.grade];
      byGrade[t.grade].done += 1;
      byStage[t.stage].done += 1;
    }
  }
  return { done, total: trophies.length, percent: Math.round((done / trophies.length) * 100), byGrade, byStage, points, maxPoints };
}
