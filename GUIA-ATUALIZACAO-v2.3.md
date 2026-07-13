# Lais Imob v2.3 — Atendimento consultivo

Esta versão ajusta a demonstração para um atendimento parecido com uma consultora imobiliária humana: educado, objetivo e contextual.

## Comportamento da Lais

- Cumprimenta somente no começo; em mensagens seguintes, responde diretamente ao assunto.
- Faz uma pergunta por vez e mantém o contexto da resposta anterior.
- Antes de sugerir opções, prioriza finalidade, bairro/região, tipo de imóvel e faixa de valor.
- Envia no máximo três imóveis compatíveis, com valor, característica principal e link preservados.
- Não inventa disponibilidade, desconto, condição de financiamento, contrato ou documentação.
- Para dúvidas específicas de documentação, contrato, negociação ou condição do imóvel, explica com transparência e oferece o corretor; só confirma o encaminhamento depois que o cliente aceitar.
- Trata “no aguardo”, “ok” e “fico aguardando” como continuidade de conversa, sem reiniciar o atendimento ou repetir menu.
- Faz follow-up respeitoso e só depois do intervalo configurado, sem insistir quando o atendimento estiver com corretor, visita marcada ou opt-out.

## Uso na demonstração

O site foi configurado para abrir o WhatsApp diretamente. A pessoa escolhe um imóvel, clica em “Tenho interesse” e envia a mensagem pronta. A automação recebe a mensagem no WhatsApp e conduz a conversa.

## Cenários para testar antes de enviar o link

1. “Quero apartamento no Costa e Silva.”
2. “Apartamento.”
3. “Até 400 mil.”
4. “Como funciona a documentação e o contrato?”
5. “Quero falar com o corretor.”

Em cada teste, confira se a pergunta seguinte vem imediatamente, se apenas uma pergunta é feita por vez e se o corretor recebe contexto apenas quando existe intenção real.

## Antes de compartilhar a demonstração

- Confirme que o número aberto pelo site é o número conectado à instância do WhatsApp.
- Confirme que o workflow ativo é esta versão e que o webhook do provedor recebe a mensagem.
- Nunca envie o JSON com chaves/tokens reais a terceiros. Use uma cópia com variáveis de ambiente antes de implantar em cliente.
