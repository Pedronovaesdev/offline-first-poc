import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusSync } from '../storage/inspecaoTypes';

type Props = {
    status: StatusSync;
}

const LABELS: Record<StatusSync, string> = {
    pendente: 'Pendente',
    sincronizado: 'Sincronizado',
    erro: 'Erro',
}

const COLORS: Record<StatusSync, { bg: string; text: string }> = {
    pendente: { bg: '#FEF3C7', text: '#92400E' },
    sincronizado: { bg: '#D1FAE5', text: '#065F46' },
    erro: { bg: '#FEE2E2', text: '#991B1B' },
};

// componente funcional

export function StatusBadge({ status }: Props) {
    const style = COLORS[status];
  
    return (
      <View style={[styles.badge, { backgroundColor: style.bg }]}>
        <Text style={[styles.text, { color: style.text }]}>{LABELS[status]}</Text>
      </View>
    );
}
  
  const styles = StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    text: {
      fontSize: 12,
      fontWeight: '600',
    },
  });