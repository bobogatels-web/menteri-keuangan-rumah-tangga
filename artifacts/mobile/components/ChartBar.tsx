import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

const W = Math.min(Dimensions.get('window').width - 64, 360);
const H = 140;

interface BarData {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  data: BarData[];
  title?: string;
}

export function ChartBar({ data, title }: Props) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
  const count = data.length;
  const barW = Math.max(6, (W - 50) / (count * 2.6));
  const gap = barW * 0.5;
  const groupW = barW * 2 + gap;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Svg width={W} height={H + 30}>
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <Line
            key={i}
            x1={30} x2={W}
            y1={H - H * f} y2={H - H * f}
            stroke="rgba(0,212,255,0.1)" strokeWidth={1}
          />
        ))}
        {data.map((d, i) => {
          const x = 32 + i * (groupW + gap);
          const ih = Math.max(2, (d.income / maxVal) * H);
          const eh = Math.max(2, (d.expense / maxVal) * H);
          const label = d.month.length >= 7 ? d.month.substr(5) : d.month;
          return (
            <React.Fragment key={i}>
              <Rect x={x} y={H - ih} width={barW} height={ih} fill="#00ff88" rx={3} opacity={0.85} />
              <Rect x={x + barW + 2} y={H - eh} width={barW} height={eh} fill="#ff3366" rx={3} opacity={0.85} />
              <SvgText x={x + barW} y={H + 18} fontSize={8} fill="#6b9bb8" textAnchor="middle">
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Line x1={30} x2={30} y1={0} y2={H} stroke="rgba(0,212,255,0.2)" strokeWidth={1} />
        <Line x1={30} x2={W} y1={H} y2={H} stroke="rgba(0,212,255,0.2)" strokeWidth={1} />
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#00ff88' }]} />
          <Text style={styles.legendText}>Pemasukan</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#ff3366' }]} />
          <Text style={styles.legendText}>Pengeluaran</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { color: '#6b9bb8', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#6b9bb8', fontSize: 11 },
});
