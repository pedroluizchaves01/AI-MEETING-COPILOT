/**
 * DMC:    CPR-60-00-00-000A
 * Título: Documentos › Interface pública
 * BREX:   CPR-00-00-00-022A
 */
export type { Ata, MetaAta, InformacaoAta, PendenciaAta } from './10-ata/schemas';
export { montarMeta, montarPromptAta, normalizarAta, ataTexto, tituloDaAta } from './10-ata/logic';
export { ataHTML } from './10-ata/components/ata';
export { gerarPDF } from './20-pdf/logic';
export type { Fontes } from './20-pdf/logic';
export { nomeArquivo, transcricaoTexto } from './30-exportacao/logic';
