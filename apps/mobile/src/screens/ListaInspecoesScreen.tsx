import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { loadInspecoes } from '../storage/inspecaoStorage';
import type { InspecaoRecord } from '../storage/inspecaoTypes';
import { StatusBadge } from '../components/StatusBadge'

type Props = {
    refreshKey?: number;
  };
  
  export function ListaInspecoesScreen({ refreshKey = 0 }: Props)  {
    const [inspecoes, setInspecoes] = useState<InspecaoRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const reload = useCallback(async () => {
        const data = await loadInspecoes();
        setInspecoes(data);
    }, []);

    async function handleRefresh(){
        setRefreshing(true);
        await reload();
        setRefreshing(false);
    };

    React.useEffect(() => {
        reload();
    }, [reload, refreshKey]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Inspeções</Text>
      <FlatList
       style={styles.list}

        data={inspecoes}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma inspeção cadastrada.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.nomeImovel}</Text>
            <Text style={styles.meta}>{item.endereco}</Text>
            <Text style={styles.meta}>{item.areaM2} m²</Text>
            <StatusBadge status={item.statusSync} />
          </View>
        )}
      />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 12, marginTop: 80},
    empty: { textAlign: 'center', color: '#666', marginTop: 24 },
    card: {
      borderWidth: 1,
      borderColor: '#e5e5e5',
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      gap: 4,
    },
    name: { fontSize: 16, fontWeight: '600' },
    meta: { fontSize: 14, color: '#444' },
    list: { flex: 1 },
  });