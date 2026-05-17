export type InspecaoSyncInput = {
    id: string;
    nome_imovel: string;
    endereco: string;
    area_m2: number;
    observacoes?: string;
    status_sync: string;
    created_at: number;
    synced_at?: number;
}


export type SyncResponse = {
    sucesso: string[];
    erros: string[];
  };