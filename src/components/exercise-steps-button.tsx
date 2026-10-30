import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCatalogExercise } from '@/lib/exercise-catalog';

export function ExerciseStepsButton({ catalogId }: { catalogId?: string }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const catalogExercise = catalogId ? getCatalogExercise(catalogId) : undefined;

  if (!catalogExercise) return null;

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={[styles.button, { backgroundColor: theme.backgroundElement }]}>
        <Ionicons name="list" size={18} color="#3c87f7" />
        <ThemedText type="smallBold" style={styles.buttonText}>
          View steps
        </ThemedText>
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={[styles.modal, { backgroundColor: theme.background }]}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {catalogExercise.name}
            </ThemedText>
            <Pressable onPress={() => setVisible(false)} hitSlop={8}>
              <Ionicons name="close-circle" size={32} color={theme.textSecondary} />
            </Pressable>
          </ThemedView>
          <ScrollView contentContainerStyle={styles.steps}>
            {catalogExercise.steps.map((step, index) => (
              <ThemedView key={index} style={styles.step}>
                <ThemedText type="smallBold" style={styles.stepNumber}>
                  {index + 1}.
                </ThemedText>
                <ThemedText style={styles.stepText}>{step}</ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  buttonText: {
    color: '#3c87f7',
  },
  modal: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  title: {
    flex: 1,
  },
  steps: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  step: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stepNumber: {
    width: 24,
  },
  stepText: {
    flex: 1,
  },
});
