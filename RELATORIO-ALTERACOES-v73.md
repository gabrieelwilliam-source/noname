# Relatório de Alterações v73

## Workflow

- Criado workflow novo: Automação Imobiliária Produto Comercial v73 - Gestão Comercial e Leads Quentes.
- Removidos id/versionId principais para evitar sobrescrita da v71/v72 ao importar.
- Adicionado Motor Comercial v73 depois da governança de conversa.
- Adicionadas configurações comerciais no node 05.01.
- Adicionado parser de comandos do corretor no node 05.05.
- Adicionado roteamento de comando seller_command no bloco admin.
- Adicionado node 12.40 para responder comandos do corretor.
- CRM interno agora recebe score/funil/SLA/comandos na mensagem para vendedor.
- Adicionado alerta periódico para leads quentes sem aceite usando o endpoint operacional já existente.

## Segurança

- URLs, endpoints, paths, telefones, credenciais, tokens e integrações foram preservados.
- Nenhuma credencial foi exposta neste relatório.
- v71/v72 não foram sobrescritas.

## Risco restante

- Redistribuição 100% automática depende de persistência no Supabase/CRM do cliente.
- O alerta de leads sem aceite depende da RPC operacional retornar hot_unaccepted/unaccepted_handoffs ou campos equivalentes.
- Teste real no n8n ainda é necessário com credenciais ativas.
