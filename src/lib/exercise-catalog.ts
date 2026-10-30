export type CatalogExercise = {
  id: string;
  name: string;
  category: string;
  bodyPart: string;
  equipment: string;
  target: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  steps: string[];
};

type IndexedExercise = { exercise: CatalogExercise; haystack: string };

let index: IndexedExercise[] | null = null;

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getIndex(): IndexedExercise[] {
  if (!index) {
    const catalog: CatalogExercise[] = require('@/data/exercises.json');
    index = catalog.map((raw) => {
      const exercise = { ...raw, name: capitalize(raw.name) };
      return {
        exercise,
        haystack: normalize(
          [exercise.name, exercise.bodyPart, exercise.equipment, exercise.target].join(' ')
        ),
      };
    });
  }
  return index;
}

type SearchOptions = {
  limit?: number;
  excludeEquipment?: string[];
};

export function searchExercises(
  query: string,
  { limit = 50, excludeEquipment = [] }: SearchOptions = {}
): CatalogExercise[] {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { exercise: CatalogExercise; score: number }[] = [];
  for (const { exercise, haystack } of getIndex()) {
    if (excludeEquipment.includes(exercise.equipment)) continue;
    if (!terms.every((term) => haystack.includes(term))) continue;
    const name = normalize(exercise.name);
    let score = 0;
    if (name === terms.join(' ')) score += 100;
    if (name.startsWith(terms[0])) score += 10;
    score -= name.length / 100;
    scored.push({ exercise, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.exercise);
}

export function findCatalogIdByName(name: string): string | undefined {
  const target = name.trim().toLowerCase();
  const matches = getIndex().filter(({ exercise }) => exercise.name.toLowerCase() === target);
  return matches.length === 1 ? matches[0].exercise.id : undefined;
}

export function getCatalogExercise(id: string): CatalogExercise | undefined {
  return getIndex().find((e) => e.exercise.id === id)?.exercise;
}
