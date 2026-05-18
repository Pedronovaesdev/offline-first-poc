import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  RefreshControl,
  Alert,
} from 'react-native';
import { getAnexosByInspecaoId } from '../storage/anexoStorage';
import type { AnexoRecord } from '../storage/anexoTypes';
import { StatusBadge } from '../components/StatusBadge';
import {
  pickFromCamera,
  pickFromGallery,
  pickPdf,
} from '../services/saveAnexoFromPicker';

type Props = {
  inspecaoId: string;
  nomeImovel: string;
  onBack: () => void;
  refreshKey?: number;
  /** Vem do useUploadQueue — qual anexo está subindo agora */
  currentAnexoId?: string | null;
  /** 0–100 do upload em andamento */
  uploadProgress?: number;
  uploadStatus?: 'idle' | 'uploading' | 'error' | 'offline';
  onAnexoAdded?: () => void;
};

export function AnexosInspecaoScreen({
  inspecaoId,
  nomeImovel,
  onBack,
  refreshKey = 0,
  currentAnexoId = null,
  uploadProgress = 0,
  uploadStatus = 'idle',
  onAnexoAdded,
}: Props) {
  const [anexos, setAnexos] = useState<AnexoRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const data = await getAnexosByInspecaoId(inspecaoId);
    setAnexos(data);
  }, [inspecaoId]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  async function handleRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  async function runPick(fn: () => Promise<void>) {
    try {
      setBusy(true);
      await fn();
      await reload();
      onAnexoAdded?.();
      Alert.alert('Sucesso', 'Anexo salvo no aparelho.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao anexar.';
      Alert.alert('Erro', msg);
    } finally {
      setBusy(false);
    }
  }

  const showBar =
    uploadStatus === 'uploading' && currentAnexoId != null;

  return (
    <View style={styles.container}>
      <Button title="← Voltar" onPress={onBack} />

      <Text style={styles.title}>Anexos</Text>
      <Text style={styles.subtitle}>{nomeImovel}</Text>

      {showBar && (
        <View style={styles.progressBox}>
          <Text style={styles.progressLabel}>
            Enviando… {uploadProgress}%
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${uploadProgress}%` }]}
            />
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Câmera"
          disabled={busy}
          onPress={() => runPick(() => pickFromCamera(inspecaoId))}
        />
        <Button
          title="Galeria"
          disabled={busy}
          onPress={() => runPick(() => pickFromGallery(inspecaoId))}
        />
        <Button
          title="PDF"
          disabled={busy}
          onPress={() => runPick(() => pickPdf(inspecaoId))}
        />
      </View>

      <FlatList
        style={styles.list}
        data={anexos}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum anexo nesta inspeção.</Text>
        }
        renderItem={({ item }) => {
          const isUploading =
            showBar && item.id === currentAnexoId;

          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.fileName}</Text>
              <Text style={styles.meta}>{item.tipoOrigem}</Text>
              <StatusBadge status={item.statusSync} />
              {isUploading && (
                <Text style={styles.meta}>↑ {uploadProgress}%</Text>
              )}
              {item.errorMessage ? (
                <Text style={styles.error}>{item.errorMessage}</Text>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: '600', marginTop: 8 },
  subtitle: { fontSize: 16, color: '#444', marginBottom: 12 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  empty: { textAlign: 'center', color: '#666', marginTop: 24 },
  list: { flex: 1 },
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
  error: { fontSize: 12, color: '#991B1B' },
  progressBox: { marginBottom: 12 },
  progressLabel: { fontSize: 14, marginBottom: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
});