import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseRow } from '@/components/exercise-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutStore } from '@/lib/workout-store';

export default function WorkoutDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts, exercises, deleteWorkout, finishWorkout } = useWorkoutStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const workout = workouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Workout not found.</ThemedText>
      </ThemedView>
    );
  }

  const workoutExercises = workout.exerciseIds
    .map((exerciseId) => exercises.find((e) => e.id === exerciseId))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  const confirmDelete = () => {
    Alert.alert('Delete workout?', `This removes "${workout.name}". Your exercises are kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteWorkout(workout.id);
          router.back();
        },
      },
    ]);
  };

  const done = () => {
    finishWorkout(workout.id);
    router.back();
  };

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: workout.name }} />
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.container}>
        <ThemedText themeColor="textSecondary">
          {workout.completedExerciseIds.length} of {workoutExercises.length} done
        </ThemedText>

        <ThemedView style={styles.list}>
          {workoutExercises.map((exercise) => (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              workoutId={workout.id}
              done={workout.completedExerciseIds.includes(exercise.id)}
            />
          ))}
        </ThemedView>

        <Pressable
          onPress={() => router.push({ pathname: '/workout/new', params: { id: workout.id } })}
          style={styles.linkButton}>
          <ThemedText type="small" style={styles.editText}>
            Edit workout
          </ThemedText>
        </Pressable>
        <Pressable onPress={confirmDelete} style={styles.linkButton}>
          <ThemedText type="small" style={styles.deleteText}>
            Delete workout
          </ThemedText>
        </Pressable>
      </ScrollView>

      <ThemedView style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        <Pressable onPress={done} style={styles.doneButton}>
          <ThemedText type="smallBold" style={styles.doneButtonText}>
            Workout done
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  editText: {
    color: '#3c87f7',
  },
  deleteText: {
    color: '#e0453c',
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  doneButton: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
  },
});
