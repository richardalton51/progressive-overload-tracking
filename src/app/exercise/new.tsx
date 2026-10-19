import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorkoutStore } from '@/lib/workout-store';

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'numeric' | 'default';
}) {
  const theme = useTheme();
  return (
    <ThemedView style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        placeholderTextColor={theme.textSecondary}
      />
    </ThemedView>
  );
}

export default function NewExerciseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { categories, exercises, addExercise, updateExercise } = useWorkoutStore();
  const theme = useTheme();
  const existing = id ? exercises.find((e) => e.id === id) : undefined;

  const [categoryId, setCategoryId] = useState<string | undefined>(existing?.categoryId);
  const [subcategory, setSubcategory] = useState(existing?.subcategory ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [repRangeMin, setRepRangeMin] = useState(String(existing?.repRangeMin ?? 8));
  const [repRangeMax, setRepRangeMax] = useState(String(existing?.repRangeMax ?? 12));
  const [targetSets, setTargetSets] = useState(String(existing?.targetSets ?? 3));
  const [startingWeight, setStartingWeight] = useState(String(existing?.currentWeight ?? 10));
  const [weightIncrement, setWeightIncrement] = useState(String(existing?.weightIncrement ?? 2.5));

  const subcategorySuggestions = [
    ...new Set(
      exercises
        .filter((e) => categoryId && e.categoryId === categoryId && e.subcategory)
        .map((e) => e.subcategory as string)
    ),
  ];

  const canSave = name.trim().length > 0;

  const save = () => {
    const values = {
      name: name.trim(),
      categoryId,
      subcategory: categoryId ? subcategory.trim() || undefined : undefined,
      repRangeMin: Number(repRangeMin) || 0,
      repRangeMax: Number(repRangeMax) || 0,
      targetSets: Number(targetSets) || 1,
      currentWeight: Number(startingWeight) || 0,
      weightIncrement: Number(weightIncrement) || 0,
      unit: existing?.unit ?? ('kg' as const),
    };
    if (existing) updateExercise(existing.id, values);
    else addExercise(values);
    router.back();
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: existing ? 'Edit Exercise' : 'New Exercise' }} />
      <Field label="Name" value={name} onChangeText={setName} />
      <ThemedView style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Category
        </ThemedText>
        <ThemedView style={styles.chips}>
          {[{ id: undefined, name: 'None' }, ...categories].map((c) => (
            <Pressable
              key={c.id ?? 'none'}
              onPress={() => setCategoryId(c.id)}
              style={[
                styles.chip,
                { backgroundColor: categoryId === c.id ? '#3c87f7' : theme.backgroundElement },
              ]}>
              <ThemedText
                type="small"
                style={categoryId === c.id ? styles.saveButtonText : undefined}>
                {c.name}
              </ThemedText>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push('/categories')}
            style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small">Manage…</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      {categoryId && (
        <ThemedView style={styles.field}>
          <Field label="Subcategory (optional)" value={subcategory} onChangeText={setSubcategory} />
          {subcategorySuggestions.length > 0 && (
            <ThemedView style={styles.chips}>
              {subcategorySuggestions.map((name) => (
                <Pressable
                  key={name}
                  onPress={() => setSubcategory(name)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        subcategory.trim() === name ? '#3c87f7' : theme.backgroundElement,
                    },
                  ]}>
                  <ThemedText
                    type="small"
                    style={subcategory.trim() === name ? styles.saveButtonText : undefined}>
                    {name}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      )}
      <ThemedView style={styles.row}>
        <Field label="Rep range min" value={repRangeMin} onChangeText={setRepRangeMin} keyboardType="numeric" />
        <Field label="Rep range max" value={repRangeMax} onChangeText={setRepRangeMax} keyboardType="numeric" />
      </ThemedView>
      <Field label="Target sets" value={targetSets} onChangeText={setTargetSets} keyboardType="numeric" />
      <ThemedView style={styles.row}>
        <Field label={existing ? `Current weight (${existing.unit})` : 'Starting weight (kg)'} value={startingWeight} onChangeText={setStartingWeight} keyboardType="numeric" />
        <Field label="Weight increment (kg)" value={weightIncrement} onChangeText={setWeightIncrement} keyboardType="numeric" />
      </ThemedView>

      <Pressable
        disabled={!canSave}
        onPress={save}
        style={[styles.saveButton, { opacity: canSave ? 1 : 0.5 }]}>
        <ThemedText type="smallBold" style={styles.saveButtonText}>
          {existing ? 'Save changes' : 'Save exercise'}
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
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  field: {
    flex: 1,
    gap: Spacing.one,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
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
