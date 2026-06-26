import { View, Text, StyleSheet } from 'react-native';

interface Step {
  label: string;
  done: boolean;
  active: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.stepContent}>
            <View
              style={[
                styles.circle,
                step.done && styles.circleDone,
                step.active && styles.circleActive,
              ]}
            >
              <Text
                style={[styles.circleText, (step.done || step.active) && styles.circleTextActive]}
              >
                {step.done ? '✓' : index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.label,
                step.active && styles.labelActive,
                step.done && styles.labelDone,
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && <View style={[styles.line, step.done && styles.lineDone]} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  circleDone: {
    backgroundColor: '#22c55e',
  },
  circleActive: {
    backgroundColor: '#2563eb',
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  circleTextActive: {
    color: '#ffffff',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  labelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  labelDone: {
    color: '#22c55e',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginLeft: 13,
    marginVertical: 2,
  },
  lineDone: {
    backgroundColor: '#22c55e',
  },
});
