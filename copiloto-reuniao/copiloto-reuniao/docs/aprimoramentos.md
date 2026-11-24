# Estudo de aprimoramento

Limitações conhecidas da versão 1 e caminhos de evolução, priorizados por **impacto** para quem usa e **esforço** de implementação. Os números citados vêm do [estudo de eficiência](eficiencia.md).

## Matriz de prioridade

| ID | Melhoria | Impacto | Esforço | Prioridade |
|---|---|---|---|---|
| B1 | Modelos de reunião (briefing, kickoff, visita, comercial) | Alto | Baixo | **Agora** |
| B2 | Gatilho adaptativo (mín. de caracteres e intervalo dinâmicos) | Médio | Baixo | **Agora** |
| B3 | Fixar uma sugestão e reordenar por relevância | Médio | Baixo | **Agora** |
| A1 | Carregar o jsPDF só ao exportar | Médio | Baixo | **Agora** |
| C1 | Medir latência e taxa de aproveitamento das sugestões | Alto | Baixo | **Agora** |
| B4 | Checklist da pauta: marcar automaticamente o que já foi coberto | Alto | Médio | Próximo |
| B5 | Exportar a ata em .docx e enviar por e-mail | Médio | Médio | Próximo |
| B6 | Máscara de dados sensíveis (CPF, telefone, e-mail) antes de enviar ao Claude | Alto | Médio | Próximo |
| D1 | Versão hospedada para empresas externas, com STT que identifica quem fala | Muito alto | Alto | Futuro |
| D2 | Integração com CRM ou sistema de gestão (criar pendências e tarefas) | Alto | Alto | Futuro |
| D3 | Modo remoto (áudio da aba do Meet/Teams) | Médio | Alto | Futuro |

## Agora

### B1. Modelos de reunião
Hoje a pauta é texto livre. Modelos prontos ("Briefing inicial", "Kickoff de projeto", "Visita técnica", "Reunião comercial") preencheriam a pauta e ajustariam o prompt com as lacunas típicas de cada tipo. É a melhoria de maior retorno pelo menor esforço: a qualidade das sugestões depende diretamente do contexto.

### B2. Gatilho adaptativo
A simulação mostrou 123 chamadas/hora em conversas com muitas pausas, contra 70 em conversas fluidas. Proposta: começar com o mínimo de 30 caracteres e subir para 150 quando a resposta anterior vier vazia, voltando a 30 quando surgirem sugestões. Na conversa pausada, o mínimo de 150 caracteres cortou ~22% das chamadas sem aumentar a espera máxima de 60 s.

### B3. Fixar e reordenar
Permitir "fixar" uma pergunta importante no topo e pedir ao Claude uma nota de relevância (1 a 3) para ordenar o lote, em vez de usar só a ordem de chegada.

### A1. jsPDF sob demanda
O jsPDF e suas dependências são 84% dos 483 KB da página e só são usados no fim da reunião. Carregá-los do cdnjs (permitido pelo artifact) no clique de "Baixar PDF" reduziria a página inicial para ~80 KB. Contraponto: a exportação passa a depender de rede naquele momento. Manter a versão embutida como alternativa.

### C1. Métricas de uso
Registrar localmente, sem enviar a lugar nenhum: latência de cada chamada, número de sugestões por lote e quantas foram marcadas "Já perguntei" ou "Descartar". A taxa de aproveitamento é a métrica de sucesso do produto e orienta o ajuste do prompt.

## Próximo

### B4. Checklist da pauta
Transformar os "pontos a esclarecer" em itens e pedir ao Claude, junto das sugestões, quais itens já foram cobertos. A tela mostra o progresso da pauta ("4 de 7 pontos cobertos") e as sugestões passam a focar no que falta.

### B5. Ata em .docx e envio por e-mail
Muitas empresas editam a ata antes de enviar. Um .docx (Word) resolve isso. O envio por e-mail pode usar o conector de Gmail do próprio Claude, se a conta tiver.

### B6. Dados sensíveis
Antes de enviar o texto ao Claude, mascarar CPF, CNPJ, telefones e e-mails detectados por expressões regulares. Reforça a conformidade com a LGPD em reuniões com clientes finais.

## Futuro

### D1. Versão hospedada
A limitação principal da versão 1 é que o ditado só funciona para pessoas da organização do dono do artifact, e não separa quem fala. Uma versão hospedada (front-end + pequeno servidor) usaria um serviço de transcrição em tempo real com separação de falantes e a API do Claude com chave própria. Custo: infraestrutura, chave de API paga por uso e responsabilidade pelos dados.

### D2. Integração com sistemas de gestão
Criar automaticamente as pendências da ata como tarefas, com responsável e prazo, no sistema de gestão da empresa.

### D3. Reuniões remotas
Capturar o áudio da aba (Meet, Teams) além do microfone. Exige a versão hospedada ou uma extensão de navegador, porque o artifact não acessa o áudio de outras abas.

## Riscos a acompanhar

- **Qualidade do reconhecimento de voz** em salas ruidosas: testar com reuniões reais antes de recomendar para clientes.
- **Limite de uso do Claude** em reuniões longas e com muitas pausas: B2 e C1 tratam disso.
- **Sugestões óbvias ou repetidas**: o prompt já envia o histórico, mas B3 e C1 permitem medir e ajustar.
