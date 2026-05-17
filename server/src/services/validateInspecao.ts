import type { InspecaoSyncInput } from '../types/inspecao';

export function validateInspecao(item: InspecaoSyncInput): string | null  {
    if (!item.id) return 'ID é obrigatório';
    if (!item.nome_imovel) return 'Nome do imóvel é obrigatório';
    if (!item.endereco) return 'Endereço é obrigatório';
    if (!item.area_m2) return 'Área é obrigatória';
    if (!item.status_sync) return 'Status de sincronização é obrigatório';
    if (!item.created_at) return 'Data de criação é obrigatória';
    return null;
}