import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutStore } from '@/lib/workout-store';

export default function NewWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { categories, exercises, workouts, addWorkout, updateWorkout } = useWorkoutStore();
  const theme = useTheme();
  const existing = id ? workouts.find((w) => w.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>(existing?.exerciseIds ?? []);

  const canSave = name.trim().length > 0 && selectedIds.length > 0;

  const toggle = (exerciseId: string) => {
    setSelectedIds((current) =>
      current.includes(exerciseId)
        ? current.filter((x) => x !== exerciseId)
        : [...current, exerciseId]
    );
  };

  const save = () => {
    if (existing) updateWorkout(existing.id, name.trim(), selectedIds);
    else addWorkout(name.trim(), selectedIds);
    router.back();
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: existing ? 'Edit Workout' : 'New Workout' }} />
      <ThemedView style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Name
        </ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          placeholderTextColor={theme.textSecondary}
        />
      </ThemedView>

      <ThemedView style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Exercises ({selectedIds.length} selected)
        </ThemedText>
        {exercises.length === 0 && (
          <ThemedText themeColor="textSecondary">
            Add some exercises on the Exercises tab first.
          </ThemedText>
        )}
        {exercises.map((exercise) => {
          const selected = selectedIds.includes(exercise.id);
          const category = categories.find((c) => c.id === exercise.categoryId);
          return (
            <Pressable key={exercise.id} onPress={() => toggle(exercise.id)}>
              <ThemedView type="backgroundElement" style={styles.exerciseRow}>
                <ThemedView style={styles.exerciseText}>
                  <ThemedText type="smallBold">{exercise.name}</ThemedText>
                  {category && (
                    <ThemedText type="small" themeColor="textSecondary">
                      {category.name}
                    </ThemedText>
                  )}
                </ThemedView>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={selected ? '#3c87f7' : theme.textSecondary}
                />
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>

      <Pressable
        disabled={!canSave}
        onPress={save}
        style={[styles.saveButton, { opacity: canSave ? 1 : 0.5 }]}>
        <ThemedText type="smallBold" style={styles.saveButtonText}>
          {existing ? 'Save changes' : 'Save workout'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  exerciseText: {
    flex: 1,
    gap: Spacing.half,
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  saveButtonText: {
    color: '#ffffff',
  },
});
