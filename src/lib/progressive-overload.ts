import { Exercise, SetLog } from '@/lib/types';

export function isTopOfRange(exercise: Exercise, sets: SetLog[]) {
  return sets.length >= exercise.targetSets && sets.every((set) => set.reps >= exercise.repRangeMax);
}

export function isBelowRange(exercise: Exercise, sets: SetLog[]) {
  return sets.some((set) => set.reps < exercise.repRangeMin);
}

export function nextWeight(exercise: Exercise, sets: SetLog[]) {
  return isTopOfRange(exercise, sets) ? exercise.currentWeight + exercise.weightIncrement : exercise.currentWeight;
}
