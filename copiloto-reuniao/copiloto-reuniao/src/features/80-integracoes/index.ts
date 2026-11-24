/**
 * DMC:    CPR-80-00-00-000A
 * Título: Integrações › Interface pública
 * BREX:   CPR-00-00-00-022A
 */
export type { Capacidades, CodigoErro, Ditado, Downloads, Sample, OpcoesSample } from './10-claude/schemas';
export { carregarCapacidades, pedirJSON, lerJSON, codigoErro } from './10-claude/api';
