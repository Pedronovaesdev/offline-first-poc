import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { addAnexo } from '../storage/anexoStorage';
import type { AnexoRecord, TipoOrigem } from '../storage/anexoTypes';

const ANEXOS_DIR = `${FileSystem.documentDirectory}anexos/`;

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/jpg': '.jpg',
  'application/pdf': '.pdf',
};

type PickResult = {
    tempUri: string;
    mimeType: string;
    fileName: string;
    tipoOrigem: TipoOrigem;
  };
  /** Copia da URI temporária para pasta permanente do app. */
  async function persistFile(
    tempUri: string,
    id: string,
    mimeType: string,
  ): Promise<string> {
    await FileSystem.makeDirectoryAsync(ANEXOS_DIR, { intermediates: true });
    const ext = EXT_BY_MIME[mimeType] ?? '';
    const localUri = `${ANEXOS_DIR}${id}${ext}`;
    await FileSystem.copyAsync({ from: tempUri, to: localUri });
    return localUri;
  }
  async function createAnexoRecord(
    inspecaoId: string,
    pick: PickResult,
  ): Promise<AnexoRecord> {
    const id = Crypto.randomUUID();
    const localUri = await persistFile(pick.tempUri, id, pick.mimeType);
    return {
      id,
      inspecaoId,
      localUri,
      mimeType: pick.mimeType,
      fileName: pick.fileName,
      tipoOrigem: pick.tipoOrigem,
      statusSync: 'pendente',
      createdAt: Date.now(),
    };
  }
  export async function saveAnexoFromPick(
    inspecaoId: string,
    pick: PickResult,
  ): Promise<void> {
    const record = await createAnexoRecord(inspecaoId, pick);
    await addAnexo(record);
  }
  // --- Pickers públicos ---
  export async function pickFromCamera(inspecaoId: string): Promise<void> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permissão da câmera negada.');
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await saveAnexoFromPick(inspecaoId, {
      tempUri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName ?? `camera-${Date.now()}.jpg`,
      tipoOrigem: 'camera',
    });
  }
  export async function pickFromGallery(inspecaoId: string): Promise<void> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permissão da galeria negada.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await saveAnexoFromPick(inspecaoId, {
      tempUri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName ?? `galeria-${Date.now()}.jpg`,
      tipoOrigem: 'galeria',
    });
  }
  export async function pickPdf(inspecaoId: string): Promise<void> {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true, // Android: URI acessível para copyAsync
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    await saveAnexoFromPick(inspecaoId, {
      tempUri: asset.uri,
      mimeType: asset.mimeType ?? 'application/pdf',
      fileName: asset.name ?? `documento-${Date.now()}.pdf`,
      tipoOrigem: 'pdf',
    });
  }