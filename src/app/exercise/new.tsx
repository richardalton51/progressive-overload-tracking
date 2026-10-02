import { router } from 'expo-router';
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
  const { addExercise } = useWorkoutStore();
  const theme = useTheme();

  const [name, setName] = useState('');
  const [repRangeMin, setRepRangeMin] = useState('8');
  const [repRangeMax, setRepRangeMax] = useState('12');
  const [targetSets, setTargetSets] = useState('3');
  const [startingWeight, setStartingWeight] = useState('10');
  const [weightIncrement, setWeightIncrement] = useState('2.5');

  const canSave = name.trim().length > 0;

  const save = () => {
    addExercise({
      name: name.trim(),
      repRangeMin: Number(repRangeMin) || 0,
      repRangeMax: Number(repRangeMax) || 0,
      targetSets: Number(targetSets) || 1,
      currentWeight: Number(startingWeight) || 0,
      weightIncrement: Number(weightIncrement) || 0,
      unit: 'kg',
    });
    router.back();
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}>
      <Field label="Name" value={name} onChangeText={setName} />
      <ThemedView style={styles.row}>
        <Field label="Rep range min" value={repRangeMin} onChangeText={setRepRangeMin} keyboardType="numeric" />
        <Field label="Rep range max" value={repRangeMax} onChangeText={setRepRangeMax} keyboardType="numeric" />
      </ThemedView>
      <Field label="Target sets" value={targetSets} onChangeText={setTargetSets} keyboardType="numeric" />
      <ThemedView style={styles.row}>
        <Field label="Starting weight (kg)" value={startingWeight} onChangeText={setStartingWeight} keyboardType="numeric" />
        <Field label="Weight increment (kg)" value={weightIncrement} onChangeText={setWeightIncrement} keyboardType="numeric" />
      </ThemedView>

      <Pressable
        disabled={!canSave}
        onPress={save}
        style={[styles.saveButton, { opacity: canSave ? 1 : 0.5 }]}>
        <ThemedText type="smallBold" style={styles.saveButtonText}>
          Save exercise
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
