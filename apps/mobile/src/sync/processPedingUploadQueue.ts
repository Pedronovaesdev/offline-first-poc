import { getPendingAnexos } from "../storage/anexoStorage";
import { loadInspecoes } from "../storage/inspecaoStorage";
import type { AnexoRecord } from "../storage/anexoTypes";
import { updateAnexo } from "../storage/anexoStorage";

// Etapa 4: implementação real com XMLHttpRequest
/* Ideia: Busca pelos pendentes, enfileira por data, confere o id, chama a função de upload
sucesso atualiza, erro mantém pendente*/
async function uploadAnexo(
  _anexo: AnexoRecord,
  _onProgress: (percent: number) => void,
): Promise<void> {
  _onProgress(0);
  throw new Error('uploadAnexo: implementar na etapa 4');
}
export async function processPendingUploadQueue(
  onProgress: (anexoId: string, percent: number) => void,
): Promise<void> {
  const pendentes = await getPendingAnexos();
  if (pendentes.length === 0) return;
  // Ordem: mais antigo primeiro
  pendentes.sort((a, b) => a.createdAt - b.createdAt);
  const inspecoes = await loadInspecoes();
  for (const anexo of pendentes) {
    const inspecao = inspecoes.find((i) => i.id === anexo.inspecaoId);
    // Inspeção ainda não foi pro servidor → pula este anexo por agora
    if (!inspecao || inspecao.statusSync !== 'sincronizado') {
      continue;
    }
    try {
      await uploadAnexo(anexo, (percent) => onProgress(anexo.id, percent));
      await updateAnexo({
        ...anexo,
        statusSync: 'sincronizado',
        syncedAt: Date.now(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no upload';
      await updateAnexo({
        ...anexo,
        statusSync: 'erro',
        errorMessage: message,
      });
    }
  }
}