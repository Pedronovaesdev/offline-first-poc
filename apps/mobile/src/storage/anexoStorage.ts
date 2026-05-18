import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AnexoRecord } from "./anexoTypes";

export const ANEXO_STORAGE_KEY = 'anexos_offline';

function dedupeAnexos(anexos: AnexoRecord[]): AnexoRecord[] {
    const byId = new Map<string, AnexoRecord>();
    for (const anexo of anexos) {
        const existing = byId.get(anexo.id);
        if (!existing) {
            byId.set(anexo.id, anexo);
            continue;
        }
        // Prefere sincronizado; senão mantém o mais recente
        if (anexo.statusSync === 'sincronizado' || existing.statusSync !== 'sincronizado') {
            byId.set(anexo.id, anexo);
        }
    }
    return Array.from(byId.values());
}

export async function loadAnexos(): Promise<AnexoRecord[]> {
    const raw = await AsyncStorage.getItem(ANEXO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnexoRecord[];
    const deduped = dedupeAnexos(parsed);
    if (deduped.length !== parsed.length) {
        await saveAnexos(deduped);
    }
    return deduped;
}

export function saveAnexos(anexos: AnexoRecord[]): Promise<void> {
    return AsyncStorage.setItem(ANEXO_STORAGE_KEY, JSON.stringify(anexos));
}

export async function addAnexo(item: AnexoRecord): Promise<void> {
    const list = await loadAnexos();
    const index = list.findIndex((a) => a.id === item.id);
    if (index === -1) {
        list.push(item);
    } else {
        list[index] = item;
    }
    return saveAnexos(list);
}

export async function updateAnexo(updated: AnexoRecord): Promise<void> {
    const list = await loadAnexos();
    const index = list.findIndex((a) => a.id === updated.id);
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