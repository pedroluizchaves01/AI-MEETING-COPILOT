# Estudo de eficiência

Medições e simulações reproduzíveis com `npm run bench`. Os números abaixo vêm de [`eficiencia-dados.json`](eficiencia-dados.json) (Node 22, 5 sementes fixas por cenário).

**O que é medido:** tamanho do pacote, tempo de geração do PDF e custo do ciclo de 500 ms.
**O que é simulado:** reuniões de 60 minutos, para contar chamadas ao Claude e o tamanho dos prompts, usando o mesmo código do app (gatilho, janela, resumo e montagem do prompt).
**O que não é medido:** a latência real do Claude. Na simulação ela é fixada em 2 s por chamada.

## Resumo

| Indicador | Resultado | Leitura |
|---|---|---|
| Página completa | 483 KB (169 KB com gzip) | 84% é o jsPDF e suas dependências |
| PDF da ata (2 a 6 páginas) | 9 a 13 ms | Imperceptível para o usuário |
| Ciclo de verificação (500 ms) | 0,2 µs | Custo de CPU desprezível, mesmo com 2 mil falas |
| Chamadas ao Claude por hora | 70 a 123 | Depende de quanto a conversa pausa |
| Prompt de sugestão | ~6,8 mil caracteres (máx. ~7,3 mil) | Estável do 1º ao 60º minuto |
| Volume enviado por hora (conversa típica) | ~590 mil caracteres | ~3,8× menos que enviar a transcrição inteira |

## 1. Pacote

| Parte | KB (minificado) |
|---|---|
| jsPDF | 329 |
| Outras dependências do jsPDF | 72 |
| Fontes Poppins (base64) | 42 |
| Código do app | 28 |
| CSS | 6 |
| **Total `dist/index.html`** | **483 (169 com gzip)** |

O código do app é pequeno (28 KB). O peso está no gerador de PDF, que só é usado no fim da reunião. Ver o item A1 em [aprimoramentos](aprimoramentos.md).

## 2. Geração do PDF

Mediana de 15 execuções:

| Ata | Páginas | Tempo | Tamanho do arquivo |
|---|---|---|---|
| Curta (2 itens por seção) | 2 | 9,5 ms | 35 KB |
| Longa (25 itens por seção) | 6 | 12,9 ms | 132 KB |

As fontes são embutidas só com o subconjunto latino (16 KB cada), o que mantém o PDF leve e com acentuação correta.

## 3. Ciclo de 500 ms

A cada 500 ms o app decide se deve chamar o Claude (`decidirGatilho` + `contarNovos`). O custo medido foi de **0,2 µs por ciclo**, igual com 100 ou 2.000 falas, porque a contagem só percorre as falas ainda não analisadas.

## 4. Simulação de reuniões de 60 minutos

**Modelo da reunião:** frases de 40 a 180 caracteres, faladas a ~14 caracteres por segundo. Entre frases há pausas curtas (0,3 a 2 s) ou longas (3 a 8 s). Três perfis variam a chance de pausa longa: 5% (conversa fluida), 15% (típica) e 35% (pausada).

**Regra atual:** pedir sugestões após **3 s de silêncio** com pelo menos 30 caracteres novos, ou a cada **60 s** no máximo enquanto houver fala nova. Nunca com uma chamada em andamento.

| Perfil | Chamadas/h | Por pausa | Por ciclo de 60 s | Intervalo médio |
|---|---|---|---|---|
| Fluida (5%) | 69,6 | 19,0 | 50,6 | 51,8 s |
| Típica (15%) | 87,0 | 53,4 | 33,6 | 41,6 s |
| Pausada (35%) | 123,4 | 110,6 | 12,8 | 29,3 s |

Em todos os perfis, a **maior espera entre sugestões foi de 60 s**. O ciclo garante sugestões mesmo quando ninguém faz pausas.

### Variantes avaliadas

Chamadas por hora (média de 5 reuniões):

| Variante | Fluida | Típica | Pausada |
|---|---|---|---|
| **Atual** (pausa 3 s · ciclo 60 s · mín. 30 caracteres) | 69,6 | 87,0 | 123,4 |
| Mínimo de 150 caracteres novos | 66,6 | 78,2 | 96,8 |
| Intervalo mínimo de 15 s entre chamadas | 66,2 | 79,6 | 104,4 |
| Pausa de 5 s | 65,4 | 73,2 | 88,8 |

**Leitura:** a regra atual é a mais responsiva, e o custo cresce em conversas com muitas pausas. Exigir 150 caracteres novos corta ~22% das chamadas na conversa pausada sem aumentar a espera máxima. É o ajuste recomendado se o limite de uso do Claude for atingido com frequência (item B2 em [aprimoramentos](aprimoramentos.md)).

## 5. Tamanho do prompt e resumo contínuo

Sem resumo, cada chamada precisaria levar a transcrição inteira. Numa conversa típica:

| Minuto da reunião | Transcrição inteira | Prompt do Copiloto |
|---|---|---|
| 5 | 3,8 mil caracteres | ~5 mil (ainda sem resumo) |
| 15 | 11,1 mil | ~6,8 mil |
| 30 | 22,0 mil | ~6,8 mil |
| 60 | 44,3 mil | ~6,8 mil (máx. 7,3 mil) |

O prompt do Copiloto tem uma parte fixa (instruções, contexto, histórico de perguntas), um resumo de até 250 palavras e só os últimos ~2.800 caracteres literais. O resumo é atualizado ~9 vezes por hora.

**Volume total por hora** (conversa típica):

- Copiloto: 87 chamadas × ~6,8 mil = **~590 mil caracteres**.
- Abordagem ingênua (transcrição inteira a cada chamada): **~2,3 milhões de caracteres**.

A economia é de ~3,8× em 1 hora e cresce com a duração: numa reunião de 2 horas a abordagem ingênua dobraria o tamanho de cada prompt, enquanto o Copiloto continua em ~7 mil caracteres. Prompts menores também respondem mais rápido.

## Limitações do estudo

- A latência real do Claude não foi medida (fixada em 2 s). O item C1 em [aprimoramentos](aprimoramentos.md) propõe medir em uso real.
- O modelo de fala é sintético. Reuniões reais têm sobreposição de vozes, ruído e erros de reconhecimento.
- O histórico de perguntas no prompt foi fixado em 25 itens (o máximo do app), o que superestima um pouco o início da reunião.
- A contagem é em caracteres. A conversão para tokens depende do idioma e não foi estimada.
