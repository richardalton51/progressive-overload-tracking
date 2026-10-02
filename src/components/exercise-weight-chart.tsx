import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutSession } from '@/lib/types';

const ACCENT = '#3c87f7';
const IMPROVED_COLOR = '#34c759';
const REGRESSED_COLOR = '#e0453c';
const POINT_SPACING = 64;
const CHART_HEIGHT = 200;
const TOP_PADDING = 28;
const BOTTOM_PADDING = 28;
const SIDE_PADDING = 32;
const AXIS_WIDTH = 40;

type RepsMetric = 'average' | 'highest' | 'lowest';
// 'all' combines every set in a session via the chosen metric; a number drills into that one set index.
type SetFilter = 'all' | number;

const REPS_METRICS: { key: RepsMetric; label: string }[] = [
  { key: 'average', label: 'Avg' },
  { key: 'highest', label: 'High' },
  { key: 'lowest', label: 'Low' },
];

type Point = { date: number; weight: number; reps: number };

function buildPoints(sessions: WorkoutSession[], setFilter: SetFilter, metric: RepsMetric): Point[] {
  const sorted = [...sessions].sort((a, b) => a.date - b.date);

  if (setFilter === 'all') {
    return sorted.map((session) => {
      const repsList = session.sets.map((s) => s.reps);
      const reps =
        metric === 'highest'
          ? Math.max(...repsList)
          : metric === 'lowest'
            ? Math.min(...repsList)
            : Math.round(repsList.reduce((sum, r) => sum + r, 0) / repsList.length);
      return { date: session.date, weight: Math.max(...session.sets.map((s) => s.weight)), reps };
    });
  }

  return sorted
    .filter((session) => session.sets.length > setFilter)
    .map((session) => {
      const set = session.sets[setFilter];
      return { date: session.date, weight: set.weight, reps: set.reps };
    });
}

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function ExerciseWeightChart({ sessions, unit }: { sessions: WorkoutSession[]; unit: string }) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [metric, setMetric] = useState<RepsMetric>('average');
  const [setFilter, setSetFilter] = useState<SetFilter>('all');

  if (sessions.length === 0) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText themeColor="textSecondary">No workouts logged yet.</ThemedText>
      </ThemedView>
    );
  }

  const maxSets = Math.max(...sessions.map((s) => s.sets.length));
  const points = buildPoints(sessions, setFilter, metric);

  if (points.length === 0) {
    return (
      <View style={styles.container}>
        <SetFilterControl maxSets={maxSets} setFilter={setFilter} onChange={setSetFilter} theme={theme} />
        <ThemedView style={styles.empty}>
          <ThemedText themeColor="textSecondary">No sessions logged that many sets.</ThemedText>
        </ThemedView>
      </View>
    );
  }

  // Only compare reps against the previous point when the weight is unchanged —
  // a weight change on its own isn't a rep regression/improvement.
  const colorFor = (index: number) => {
    const previous = points[index - 1];
    if (!previous || previous.weight !== points[index].weight) return theme.text;
    if (points[index].reps > previous.reps) return IMPROVED_COLOR;
    if (points[index].reps < previous.reps) return REGRESSED_COLOR;
    return theme.text;
  };

  const weights = points.map((p) => p.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  // Pad the range so a flat line of identical weights still has room to render.
  const range = maxWeight - minWeight || 1;
  const domainMin = minWeight - range * 0.2;
  const domainMax = maxWeight + range * 0.2;

  const plotWidth = Math.max(points.length - 1, 0) * POINT_SPACING + SIDE_PADDING * 2;
  const plotHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING;

  const xFor = (index: number) => SIDE_PADDING + index * POINT_SPACING;
  const yFor = (weight: number) =>
    TOP_PADDING + plotHeight - ((weight - domainMin) / (domainMax - domainMin)) * plotHeight;

  const gridLines = [domainMin, (domainMin + domainMax) / 2, domainMax];

  return (
    <View style={styles.container}>
      <SetFilterControl maxSets={maxSets} setFilter={setFilter} onChange={setSetFilter} theme={theme} />

      {setFilter === 'all' && (
        <ThemedView type="backgroundElement" style={styles.metricControl}>
          {REPS_METRICS.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setMetric(key)}
              style={[styles.metricSegment, metric === key && { backgroundColor: theme.background }]}>
              <ThemedText type="small">{label}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}

      <View style={styles.chartRow}>
        <Svg width={AXIS_WIDTH} height={CHART_HEIGHT}>
          {gridLines.map((weight) => (
            <SvgText
              key={`label-${weight}`}
              x={0}
              y={yFor(weight) - 4}
              fontSize={11}
              fill={theme.textSecondary}>
              {Math.round(weight)}
              {unit}
            </SvgText>
          ))}
        </Svg>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ minWidth: plotWidth }}>
          <Svg width={plotWidth} height={CHART_HEIGHT}>
            {gridLines.map((weight) => (
              <Line
                key={weight}
                x1={0}
                x2={plotWidth}
                y1={yFor(weight)}
                y2={yFor(weight)}
                stroke={theme.backgroundSelected}
                strokeWidth={1}
              />
            ))}

            <Polyline
              points={points.map((p, i) => `${xFor(i)},${yFor(p.weight)}`).join(' ')}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2}
            />

            {points.map((p, i) => (
              <Circle key={i} cx={xFor(i)} cy={yFor(p.weight)} r={4} fill={colorFor(i)} />
            ))}

            {points.map((p, i) => (
              <SvgText
                key={`reps-${i}`}
                x={xFor(i)}
                y={yFor(p.weight) - 12}
                fontSize={12}
                fontWeight="700"
                textAnchor="middle"
                fill={colorFor(i)}>
                {p.reps}
              </SvgText>
            ))}

            {points.map((p, i) => (
              <SvgText
                key={`date-${i}`}
                x={xFor(i)}
                y={CHART_HEIGHT - 8}
                fontSize={11}
                textAnchor="middle"
                fill={theme.textSecondary}>
                {formatDate(p.date)}
              </SvgText>
            ))}
          </Svg>
        </ScrollView>
      </View>
    </View>
  );
}

function SetFilterControl({
  maxSets,
  setFilter,
  onChange,
  theme,
}: {
  maxSets: number;
  setFilter: SetFilter;
  onChange: (filter: SetFilter) => void;
  theme: ReturnType<typeof useTheme>;
}) {
  const options: { key: SetFilter; label: string }[] = [
    { key: 'all', label: 'All sets' },
    ...Array.from({ length: maxSets }, (_, i) => ({ key: i, label: `Set ${i + 1}` })),
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <ThemedView type="backgroundElement" style={styles.setControl}>
        {options.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.setSegment, setFilter === key && { backgroundColor: theme.background }]}>
            <ThemedText type="small">{label}</ThemedText>
          </Pressable>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  container: {
    gap: Spacing.two,
  },
  chartRow: {
    flexDirection: 'row',
  },
  setControl: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.half,
  },
  setSegment: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
  },
  metricControl: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: Spacing.two,
    padding: Spacing.half,
  },
  metricSegment: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
  },
});
