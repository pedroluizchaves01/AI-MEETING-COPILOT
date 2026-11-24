# Programa do produto

## Problema
Em reuniões presenciais com clientes, quem conduz precisa ouvir, conduzir e lembrar da pauta ao mesmo tempo. Perguntas importantes (orçamento, prazo, quem decide) ficam para trás e a ata é escrita depois, de memória.

## Objetivo
Um assistente que ouve a reunião, sugere em tempo real as perguntas que faltam e entrega a ata pronta no fim.

## Como saberemos que deu certo
- **Taxa de aproveitamento:** % de sugestões marcadas "Já perguntei" (meta proposta para validar: 30% ou mais).
- **Tempo para enviar a ata:** de horas para minutos depois da reunião.

## Perfis
| Perfil | Uso | Dispositivo |
|---|---|---|
| Quem conduz (consultor, arquiteto, vendedor, gestor) | Reuniões presenciais semanais com clientes | Notebook na mesa ou celular Android |
| Participantes | Não usam a ferramenta; precisam ser avisados da transcrição | — |

## Jornada principal
1. Preencher contexto (empresa, autor, objetivo, participantes, pauta).
2. Ligar o microfone e conduzir a reunião.
3. Ver sugestões, perguntar, marcar "Já perguntei" ou "Descartar".
4. Gerar a ata, revisar, baixar o PDF e enviar ao cliente.

## Entidades
Reunião, Contexto, Segmento (fala), Sugestão, Resumo, Ata, Pendência.

## Restrições
- Rodar dentro do Claude, sem servidor (decisão do dono do produto).
- Uso por várias empresas: empresa e autor personalizáveis.
- LGPD: avisar participantes; dados só no navegador e nas chamadas ao Claude.

## Fora do escopo (v1)
Identificação de quem fala, reuniões remotas, integração com sistemas de gestão, contas de usuário.
