# Relatório de Alterações — v72

## Arquivos gerados
- `Automação Imobiliária Produto Comercial v72 - Cópia Segura Final.json`
- `noname-base-v72.zip`

## O que foi feito
1. Criada nova versão v72 sem sobrescrever a v71.
2. Workflow exportado como nova cópia segura: sem `id` e `versionId` top-level, mantendo IDs internos de nós, webhooks e credenciais.
3. `05.04 Validar Configuração Obrigatória` atualizado com `product_health` completo.
4. Normalização de site reforçada para `site_form`, imóvel específico, título, URL e tipo de interesse.
5. Deduplicação local mantida e documentada com recomendação de persistência em Supabase.
6. Site atualizado para `lead_schema_version=site_lead_v72`.
7. Documentação final adicionada dentro do pacote.
8. Payloads de testes de aceite adicionados.
9. JavaScript do workflow e do site validado sintaticamente.

## Pontos preservados
- Caminho `lais-imob-site-lead`.
- URLs existentes.
- Telefones existentes.
- Tokens e credenciais existentes.
- IDs de credenciais e integrações existentes.
- Webhook IDs internos.
- Dados demo e materiais comerciais.
