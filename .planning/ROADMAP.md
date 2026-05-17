# ROADMAP

## Milestone 1: Simplificação do Cadastro de Produtos

### [CONCLUÍDO] Fase 1: Interface de Página Única e Salvamento Unificado
- Reorganização do layout (Imagens -> Dados -> Variações).
- Implementação de handleSaveEverything.
- Sincronização de opções via itens.
- Itens virtuais na grade de estoque.

### [PENDENTE] Fase 2: Polimento e Validação do Fluxo
- Feedbacks visuais granulares durante o salvamento (loading states por etapa).
- Validações preventivas (impedir salvamento se campos críticos faltarem).
- Tratamento de erros aprimorado.

### Phase 3: Tela de listagem de produtos com menu lateral em seções e ações em massa

**Goal:** Reorganizar o admin com menu em seções (Catálogo, Vendas, Configuração), página única de configuração com três formulários, e listagem de produtos em tabela com paginação (30/página), filtros e ações em massa.

**Depends on:** Fases 1–2 do cadastro (concluída / pendente polimento)
**Plans:** 3 plans em 2 waves

Plans:
- [ ] 03-01 — Menu lateral em seções (`navSections` + `AdminSidebar`)
- [ ] 03-02 — Página unificada `/configuracoes` (Entregas + Pagamentos + Gerais)
- [ ] 03-03 — Tabela de produtos + paginação API 30 + bulk actions

**Wave 1** *(paralelo)*: 03-01, 03-02  
**Wave 2** *(após menu)*: 03-03
