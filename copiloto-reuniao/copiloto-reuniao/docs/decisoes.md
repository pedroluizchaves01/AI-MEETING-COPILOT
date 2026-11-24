# Diário de decisões

| Data | Decisão | Alternativas descartadas | Motivo |
|---|---|---|---|
| 23/11/2026 | Rodar como artifact do Claude, sem servidor | VPS com Coolify + STT externo + API do Claude | Pedido do dono do produto; zero infraestrutura e zero chave de API para validar a ideia |
| 23/11/2026 | Transcrição pela capacidade `dictation` | Web Speech API do navegador | O artifact bloqueia o microfone direto; `dictation` é o caminho suportado |
| 23/11/2026 | Gatilho: 3 s de silêncio ou 60 s, mín. 30 caracteres novos | A cada 20–30 s fixos | Pedido do dono do produto; sugestões chegam quando a pessoa para de falar |
| 23/11/2026 | Lote novo no topo, em destaque; antigos descem e esmaecem | Lista cronológica simples | Pedido do dono do produto; a pergunta útil é sempre a mais recente |
| 23/11/2026 | Resumo contínuo + janela literal de ~2.800 caracteres | Enviar a transcrição inteira | Prompt estável (~7 mil caracteres) em qualquer duração; ver eficiência |
| 23/11/2026 | Respostas do Claude em JSON validado | Texto livre | Interface previsível; resposta malformada é descartada sem quebrar a tela |
| 23/11/2026 | PDF gerado na página com jsPDF e Poppins embutida | Imprimir HTML; html2canvas | `print` é bloqueado no artifact; texto continua selecionável e leve |
| 23/11/2026 | Empresa e autor como campos do contexto | Nome fixo do escritório | Uso por várias empresas |
| 24/11/2026 | Código em TypeScript modular + build para HTML único | Manter um único HTML editado à mão | Testes, revisão e evolução; o artifact continua sendo um arquivo só |
| 24/11/2026 | jsPDF 4.2.1 empacotado no build | jsPDF 2.5.1 via CDN | Versão atual sem vulnerabilidades conhecidas (`npm audit` limpo); funciona sem rede |
| 24/11/2026 | `dist/index.html` versionado no repositório | Gerar só no CI | Quem só quer publicar o artifact não precisa instalar nada |
| 24/11/2026 | Chaves `cr_*` do contexto mantidas | Renomear para `cpr_*` | Preservar o que os usuários da versão 0 já preencheram |
| 24/11/2026 | Licença MIT | Sem licença; licença restritiva | Projeto aberto para estudo e reaproveitamento (a confirmar pelo dono) |
