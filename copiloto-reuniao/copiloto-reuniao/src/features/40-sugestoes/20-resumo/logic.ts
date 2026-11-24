/**
 * DMC:    CPR-40-20-00-200A
 * Título: Sugestões › Resumo contínuo › Prompt
 * BREX:   CPR-00-00-00-022A
 *
 * O resumo contínuo mantém o prompt de sugestões com tamanho limitado
 * em reuniões longas: o trecho antigo vira resumo, só o recente vai literal.
 */

export const LIMITE_RESUMO_PALAVRAS = 250;

export function montarPromptResumo(resumoAtual: string, trechoNovo: string): string {
  if (trechoNovo.trim() === '') throw new Error('Trecho vazio não precisa de resumo.');
  return `Atualize o resumo de uma reunião com cliente. Mantenha fatos, números, preferências, decisões e dúvidas em aberto, em tópicos curtos, em português, no máximo ${LIMITE_RESUMO_PALAVRAS} palavras.

Resumo atual:
${resumoAtual.trim() === '' ? '(vazio)' : resumoAtual}

Novo trecho da transcrição:
${trechoNovo}

Responda só com o resumo atualizado.`;
}
