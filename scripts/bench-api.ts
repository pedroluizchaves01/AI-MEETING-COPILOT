/**
 * DMC:    CPR-90-20-20-000A
 * Título: Infraestrutura › Estudo de eficiência › Acesso ao código do app
 * BREX:   CPR-00-00-00-022A
 */
export * from '../src/features/30-reuniao';
export { inicioDaCauda as inicioDaCaudaPublico } from '../src/features/30-reuniao/10-transcricao/logic';
export * from '../src/features/40-sugestoes/10-perguntas/logic';
export * from '../src/features/60-documentos/10-ata/logic';
export type { MetaAta } from '../src/features/60-documentos/10-ata/schemas';
export { gerarPDF } from '../src/features/60-documentos/20-pdf/logic';
