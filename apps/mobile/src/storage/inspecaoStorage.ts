import AsyncStorage from "@react-native-async-storage/async-storage";
import type { InspecaoRecord } from "./inspecaoTypes";

const STORAGE_KEY = 'inspecoes_offline';

export async function loadInspecoes(): Promise<InspecaoRecord[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InspecaoRecord[];
}

export function saveInspecoes(inspecoes: InspecaoRecord[]): Promise<void> {
    return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inspecoes));
}

export async function addInspecao(item: InspecaoRecord): Promise<void> {
    const inspecoes = await loadInspecoes();
    inspecoes.push(item);
    return saveInspecoes(inspecoes);
}

export async function updateInspecao(updated: InspecaoRecord): Promise<void> {
    const list = await loadInspecoes();
    const index = list.findIndex((item) => item.id === updated.id);
    if (index === -1) return;
    list[index] = updated;
    await saveInspecoes(list);
}

export async function getPendingInspecoes(): Promise<InspecaoRecord[]> {
    const list = await loadInspecoes();
    return list.filter((item) => item.statusSync === 'pendente');
}