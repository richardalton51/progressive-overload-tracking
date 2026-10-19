import { Exercise, SetLog } from '@/lib/types';

export function isTopOfRange(exercise: Exercise, sets: SetLog[]) {
  return sets.length >= exercise.targetSets && sets.every((set) => set.reps >= exercise.repRangeMax);
}

export function isBelowRange(exercise: Exercise, sets: SetLog[]) {
  return sets.some((set) => set.reps < exercise.repRangeMin);
}

export function nextWeight(exercise: Exercise, sets: SetLog[]) {
  if (!isTopOfRange(exercise, sets)) return exercise.currentWeight;
  if (exercise.assisted) return Math.max(0, exercise.currentWeight - exercise.weightIncrement);
  return exercise.currentWeight + exercise.weightIncrement;
}
