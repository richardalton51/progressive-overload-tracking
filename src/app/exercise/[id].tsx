import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ExerciseWeightChart } from '@/components/exercise-weight-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isBelowRange, isTopOfRange } from '@/lib/progressive-overload';
import { SetLog } from '@/lib/types';
import { useWorkoutStore } from '@/lib/workout-store';

export default function LogWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercises, logSession, deleteExercise, sessionsFor } = useWorkoutStore();
  const theme = useTheme();
  const exercise = exercises.find((e) => e.id === id);

  const [view, setView] = useState<'log' | 'graph'>('log');
  const [repInputs, setRepInputs] = useState<string[]>([]);

  if (!exercise) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Exercise not found.</ThemedText>
      </ThemedView>
    );
  }

  const reps = Array.from({ length: exercise.targetSets }, (_, i) => repInputs[i] ?? '');

  const parsedSets: SetLog[] = reps.map((value) => ({
    reps: Number(value) || 0,
    weight: exercise.currentWeight,
  }));

  const allFilled = reps.every((value) => value.trim().length > 0);

  const submit = () => {
    const session = logSession(exercise.id, parsedSets);
    if (session.weightIncreased) {
      Alert.alert(
        'Nice work! 💪',
        exercise.assisted
          ? `You hit ${exercise.repRangeMax} reps on every set. Assistance drops to ${Math.max(0, exercise.currentWeight - exercise.weightIncrement)}${exercise.unit} next time.`
          : `You hit ${exercise.repRangeMax} reps on every set. Weight goes up to ${exercise.currentWeight + exercise.weightIncrement}${exercise.unit} next time.`
      );
    } else if (isBelowRange(exercise, parsedSets)) {
      Alert.alert('Logged', `Stay at ${exercise.currentWeight}${exercise.unit} and aim for ${exercise.repRangeMin}+ reps next time.`);
    } else {
      Alert.alert('Logged', `Keep at ${exercise.currentWeight}${exercise.unit} until every set hits ${exercise.repRangeMax} reps.`);
    }
    router.back();
  };

  const confirmDelete = () => {
    Alert.alert('Delete exercise?', `This removes "${exercise.name}" and its history.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteExercise(exercise.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}>
      <ThemedView style={styles.summary}>
        <ThemedText type="title">{exercise.name}</ThemedText>
        <ThemedText themeColor="textSecondary">
          Target: {exercise.repRangeMin}-{exercise.repRangeMax} reps × {exercise.targetSets} sets
        </ThemedText>
        <ThemedText type="subtitle">
          {exercise.currentWeight}
          <ThemedText type="small" themeColor="textSecondary">
            {' '}
            {exercise.unit}
            {exercise.assisted ? ' assist' : ''}
          </ThemedText>
        </ThemedText>
        {isTopOfRange(exercise, parsedSets) && allFilled && (
          <ThemedText type="small" style={styles.hint}>
            All sets at {exercise.repRangeMax}+ reps — {exercise.assisted ? 'assistance will decrease' : 'weight will increase'} on submit.
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.segmentedControl}>
        <Pressable
          onPress={() => setView('log')}
          style={[styles.segment, view === 'log' && { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold">Log</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setView('graph')}
          style={[styles.segment, view === 'graph' && { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold">Graph</ThemedText>
        </Pressable>
      </ThemedView>

      {view === 'log' ? (
        <>
          <ThemedView style={styles.sets}>
            {reps.map((value, index) => (
              <ThemedView key={index} type="backgroundElement" style={styles.setRow}>
                <ThemedText type="smallBold">Set {index + 1}</ThemedText>
                <TextInput
                  value={value}
                  onChangeText={(text) =>
                    setRepInputs(reps.map((r, i) => (i === index ? text : r)))
                  }
                  keyboardType="numeric"
                  placeholder="reps"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  reps @ {exercise.currentWeight}{exercise.unit}{exercise.assisted ? ' assist' : ''}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          <Pressable
            disabled={!allFilled}
            onPress={submit}
            style={[styles.saveButton, { opacity: allFilled ? 1 : 0.5 }]}>
            <ThemedText type="smallBold" style={styles.saveButtonText}>
              Log workout
            </ThemedText>
          </Pressable>
        </>
      ) : (
        <ExerciseWeightChart sessions={sessionsFor(exercise.id)} unit={exercise.unit} />
      )}

      <Pressable
        onPress={() => router.push({ pathname: '/exercise/new', params: { id: exercise.id } })}
        style={styles.deleteButton}>
        <ThemedText type="small" style={styles.hint}>
          Edit exercise
        </ThemedText>
      </Pressable>

      <Pressable onPress={confirmDelete} style={styles.deleteButton}>
        <ThemedText type="small" style={styles.deleteButtonText}>
          Delete exercise
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    gap: Spacing.one,
  },
  hint: {
    color: '#3c87f7',
    marginTop: Spacing.one,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.half,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  sets: {
    gap: Spacing.two,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  input: {
    width: 64,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#60646C',
  },
  saveButton: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  deleteButtonText: {
    color: '#e0453c',
  },
});
