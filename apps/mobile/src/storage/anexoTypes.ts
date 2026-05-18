import type { InspecaoRecord, StatusSync } from './inspecaoTypes';

export type TipoOrigem = 'camera' | 'galeria' | 'pdf';

export type AnexoRecord = {
  /** UUID gerado no app (mesmo id que o servidor vai usar). */
  id: string;
  /** Inspeção à qual este anexo pertence — chave estrangeira lógica. */
  inspecaoId: string;
  /** Caminho permanente no disco: documentDirectory/anexos/{id}.jpg */
  localUri: string;
  /** Ex.: image/jpeg, application/pdf — o servidor e o multipart precisam disso. */
  mimeType: string;
  /** Nome amigável na lista ("foto_fachada.jpg", "laudo.pdf"). */
  fileName: string;
  tipoOrigem: TipoOrigem;
  statusSync: StatusSync;
  /** Quando o usuário anexou (Date.now(), igual à inspeção). */
  createdAt: number;
  /** Preenchido quando statusSync vira 'sincronizado'. */
  syncedAt?: number;
  /** Mensagem curta se statusSync === 'erro' (opcional). */
  errorMessage?: string;
};