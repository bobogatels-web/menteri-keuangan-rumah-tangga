import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const COLORS = ['#00d4ff', '#8b00ff', '#00ff88', '#ff3366', '#ffdd00', '#ff6600', '#00ffcc', '#ff00ff'];

interface PieData {
  category: string;
  total: number;
}

interface Props {
  data: PieData[];
  title?: string;
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export function ChartPie({ data, title, size = 120 }: Props) {
  const total = data.reduce((s, d) => s + d.total, 0);
  if (total === 0) return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.noData}><Text style={styles.noDataText}>Tidak ada data</Text></View>
    </View>
  );

  const cx = size / 2;
  const r = size / 2 - 6;

  let startAngle = 0;
  const slices = data.map((d, i) => {
    const angle = (d.total / total) * 360;
    const path = angle >= 359.9
      ? undefined
      : describeArc(cx, cx, r, startAngle, startAngle + angle);
    const start = startAngle;
    startAngle += angle;
    return { ...d, angle, path, startAngle: start, color: COLORS[i % COLORS.length] };
  });

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.row}>
        <Svg width={size} height={size}>
          {slices.map((s, i) =>
            s.path ? (
              <Path key={i} d={s.path} fill={s.color} opacity={0.85} />
            ) : (
              <Circle key={i} cx={cx} cy={cx} r={r} fill={s.color} opacity={0.85} />
            )
          )}
          <Circle cx={cx} cy={cx} r={r * 0.55} fill="#0d0d2b" />
        </Svg>
        <View style={styles.legend}>
          {slices.slice(0, 6).map((s, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {s.category}
              </Text>
              <Text style={styles.legendPct}>
                {((s.total / total) * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { color: '#6b9bb8', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  legendLabel: { color: '#e0f7ff', fontSize: 11, flex: 1 },
  legendPct: { color: '#6b9bb8', fontSize: 11 },
  noData: { alignItems: 'center', paddingVertical: 20 },
  noDataText: { color: '#6b9bb8', fontSize: 12 },
});
