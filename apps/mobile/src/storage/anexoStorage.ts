import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AnexoRecord } from "./anexoTypes";

export const ANEXO_STORAGE_KEY = 'anexos_offline';

export async function loadAnexos(): Promise<AnexoRecord[]> {
    const raw = await AsyncStorage.getItem(ANEXO_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnexoRecord[];
}

export function saveAnexos(anexos: AnexoRecord[]): Promise<void> {
    return AsyncStorage.setItem(ANEXO_STORAGE_KEY, JSON.stringify(anexos));
}

export async function addAnexo(item: AnexoRecord): Promise<void> {
    const list = await loadAnexos();
    list.push(item);
    return saveAnexos(list);
}

export async function updateAnexo(updated: AnexoRecord): Promise<void> {
    const list = await loadAnexos();
    const index = list.findIndex((item) => item.id === item.id);
    if (index === -1) return;
    list[index] = updated;
    await saveAnexos(list);
}

export async function getPendingAnexos(): Promise<AnexoRecord[]> {
    const list = await loadAnexos();
    return list.filter((item) => item.statusSync === 'pendente');
}

export async function getAnexosByInspecaoId(inspecaoId:string): Promise<AnexoRecord[]> {
    const list = await loadAnexos();
    return list.filter((item) => item.inspecaoId === inspecaoId);
}