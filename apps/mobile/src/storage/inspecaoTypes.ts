export type StatusSync = 'pendente' | 'sincronizado' | 'erro';

export type InspecaoRecord = {
  id: string;
  nomeImovel: string;
  endereco: string;
  areaM2: number;
  observacoes?: string;
  statusSync: StatusSync;
  createdAt: number;
  syncedAt?: number;
};