import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { findCatalogIdByName } from '@/lib/exercise-catalog';
import { nextWeight } from '@/lib/progressive-overload';
import { Category, Exercise, SetLog, Workout, WorkoutSession } from '@/lib/types';

const STORAGE_KEY = 'progressive-overload/v1';
const CATALOG_LINK_KEY = 'progressive-overload/catalog-link-v1';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type StoredData = {
  categories: Category[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
  workouts: Workout[];
};

type WorkoutStore = StoredData & {
  isLoaded: boolean;
  addCategory: (name: string) => Category;
  renameCategory: (categoryId: string, name: string) => void;
  deleteCategory: (categoryId: string) => void;
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  updateExercise: (exerciseId: string, changes: Omit<Exercise, 'id' | 'createdAt'>) => void;
  deleteExercise: (exerciseId: string) => void;
  addWorkout: (name: string, exerciseIds: string[]) => void;
  updateWorkout: (workoutId: string, name: string, exerciseIds: string[]) => void;
  deleteWorkout: (workoutId: string) => void;
  finishWorkout: (workoutId: string) => void;
  logSession: (exerciseId: string, sets: SetLog[], workoutId?: string) => WorkoutSession;
  sessionsFor: (exerciseId: string) => WorkoutSession[];
};

const WorkoutStoreContext = createContext<WorkoutStore | null>(null);

export function WorkoutStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoredData>({
    categories: [],
    exercises: [],
    sessions: [],
    workouts: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(CATALOG_LINK_KEY),
    ]).then(([raw, linked]) => {
      if (raw) {
        const stored: StoredData = { categories: [], workouts: [], ...JSON.parse(raw) };
        if (!linked) {
          stored.exercises = stored.exercises.map((e) => {
            const catalogId = e.catalogId ?? findCatalogIdByName(e.name);
            return catalogId ? { ...e, catalogId } : e;
          });
        }
        setData(stored);
      }
      AsyncStorage.setItem(CATALOG_LINK_KEY, 'true');
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isLoaded]);

  const store = useMemo<WorkoutStore>(
    () => ({
      ...data,
      isLoaded,
      addCategory: (name) => {
        const category: Category = { id: generateId(), name };
        setData((prev) => ({ ...prev, categories: [...prev.categories, category] }));
        return category;
      },
      renameCategory: (categoryId, name) => {
        setData((prev) => ({
          ...prev,
          categories: prev.categories.map((c) => (c.id === categoryId ? { ...c, name } : c)),
        }));
      },
      deleteCategory: (categoryId) => {
        setData((prev) => ({
          ...prev,
          categories: prev.categories.filter((c) => c.id !== categoryId),
          exercises: prev.exercises.map((e) =>
            e.categoryId === categoryId ? { ...e, categoryId: undefined } : e
          ),
        }));
      },
      addExercise: (exercise) => {
        const newExercise: Exercise = {
          ...exercise,
          id: generateId(),
          createdAt: Date.now(),
        };
        setData((prev) => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
      },
      updateExercise: (exerciseId, changes) => {
        setData((prev) => ({
          ...prev,
          exercises: prev.exercises.map((e) => (e.id === exerciseId ? { ...e, ...changes } : e)),
        }));
      },
      deleteExercise: (exerciseId) => {
        setData((prev) => ({
          ...prev,
          exercises: prev.exercises.filter((e) => e.id !== exerciseId),
          sessions: prev.sessions.filter((s) => s.exerciseId !== exerciseId),
          workouts: prev.workouts.map((w) => ({
            ...w,
            exerciseIds: w.exerciseIds.filter((id) => id !== exerciseId),
            completedExerciseIds: w.completedExerciseIds.filter((id) => id !== exerciseId),
          })),
        }));
      },
      addWorkout: (name, exerciseIds) => {
        const workout: Workout = {
          id: generateId(),
          name,
          exerciseIds,
          completedExerciseIds: [],
          createdAt: Date.now(),
        };
        setData((prev) => ({ ...prev, workouts: [...prev.workouts, workout] }));
      },
      updateWorkout: (workoutId, name, exerciseIds) => {
        setData((prev) => ({
          ...prev,
          workouts: prev.workouts.map((w) =>
            w.id === workoutId
              ? {
                  ...w,
                  name,
                  exerciseIds,
                  completedExerciseIds: w.completedExerciseIds.filter((id) =>
                    exerciseIds.includes(id)
                  ),
                }
              : w
          ),
        }));
      },
      deleteWorkout: (workoutId) => {
        setData((prev) => ({
          ...prev,
          workouts: prev.workouts.filter((w) => w.id !== workoutId),
        }));
      },
      finishWorkout: (workoutId) => {
        setData((prev) => ({
          ...prev,
          workouts: prev.workouts.map((w) =>
            w.id === workoutId ? { ...w, completedExerciseIds: [] } : w
          ),
        }));
      },
      logSession: (exerciseId, sets, workoutId) => {
        const exercise = data.exercises.find((e) => e.id === exerciseId);
        if (!exercise) throw new Error(`Unknown exercise: ${exerciseId}`);

        const updatedWeight = nextWeight(exercise, sets);
        const session: WorkoutSession = {
          id: generateId(),
          exerciseId,
          date: Date.now(),
          sets,
          weightIncreased: updatedWeight !== exercise.currentWeight,
        };

        setData((prev) => ({
          ...prev,
          exercises: prev.exercises.map((e) =>
            e.id === exerciseId ? { ...e, currentWeight: updatedWeight } : e
          ),
          sessions: [...prev.sessions, session],
          workouts: workoutId
            ? prev.workouts.map((w) =>
                w.id === workoutId && !w.completedExerciseIds.includes(exerciseId)
                  ? { ...w, completedExerciseIds: [...w.completedExerciseIds, exerciseId] }
                  : w
              )
            : prev.workouts,
        }));

        return session;
      },
      sessionsFor: (exerciseId) => data.sessions.filter((s) => s.exerciseId === exerciseId),
    }),
    [data, isLoaded]
  );

  return <WorkoutStoreContext.Provider value={store}>{children}</WorkoutStoreContext.Provider>;
}

export function useWorkoutStore() {
  const store = useContext(WorkoutStoreContext);
  if (!store) throw new Error('useWorkoutStore must be used within a WorkoutStoreProvider');
  return store;
}
