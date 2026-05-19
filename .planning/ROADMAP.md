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

### [CONCLUÍDO] Phase 3: Tela de listagem de produtos com menu lateral em seções e ações em massa

**Goal:** Reorganizar o admin com menu em seções (Catálogo, Vendas, Configuração), página única de configuração com três formulários, e listagem de produtos em tabela com paginação (30/página), filtros e ações em massa.

**Depends on:** Fases 1–2 do cadastro (concluída / pendente polimento)
**Plans:** 3 plans em 2 waves

Plans:

- [x] 03-01 — Menu lateral em seções (`navSections` + `AdminSidebar`)
- [x] 03-02 — Página unificada `/configuracoes` (Entregas + Pagamentos + Gerais)
- [x] 03-03 — Tabela de produtos + paginação API 30 + bulk actions

**Wave 1** *(paralelo)*: 03-01, 03-02  
**Wave 2** *(após menu)*: 03-03

### Phase 4: Configurações de Identidade, Endereço, Pagamentos e Descontos

**Goal:** Implementar as configurações completas e reais do e-commerce unificando o formulário `/configuracoes` com a API do backend, com upload de logo/favicon/banners (até 7), autopreenchimento de endereço por CEP, ativação do PIX e métodos presenciais, e regras dinâmicas de descontos, taxas e parcelamento.
**Requirements**: REQ-07
**Depends on:** Phase 3
**Plans:** 2 planos

Plans:

- [ ] 04-01: Identidade Visual, Contato e Endereço com Busca de CEP (Frontend)
- [ ] 04-02: PIX, Pagamentos e Regras Dinâmicas de Descontos e Taxas (Frontend)

### Phase 5: Filtro de Valores Mockados

**Goal:** Filtrar em tempo de execução os valores de testes e placeholders padrões (como "Minha Loja", "Rua 14 de Julho", "podemais@email.com", etc.) no carregamento dos formulários de configurações, mantendo os campos de texto completamente limpos e prontos para o onboarding se não houver configurações reais salvas.
**Depends on:** Phase 4
**Plans:** 1 plano

Plans:

- [ ] 05-01: Implementar filtros reativos de placeholders nos formulários de Configurações (Frontend-Only)

### Phase 6: Configuração de Juros Customizados de Parcelas (Backend & Frontend)

**Goal:** Permitir ao lojista configurar juros customizados para cartão de crédito em faixas de parcelas (ex: de 2 a 3 parcelas, de 4 a 5 parcelas) com inputs numéricos totalmente editáveis tanto para os intervalos de parcelas quanto para a taxa de juros correspondente, integrando o backend e o frontend.
**Depends on:** Phase 4
**Plans:** 2 planos

Plans:

- [x] 06-01: Extensão do Schema, DTO e Repositório para Suportar Faixas de Juros (Backend)
- [x] 06-02: Formulário com Inputs Editáveis de Faixas de Parcelas e Juros (Frontend)

### [CONCLUÍDO] Phase 7: Gestão e Listagem de Pedidos (Orders Portal)

**Goal:** Implementar o painel de gerenciamento de vendas com listagem reativa agrupada cronologicamente por datas (Hoje, datas anteriores), filtros avançados, e gaveta lateral de detalhamento do pedido fiel ao design de alta fidelidade e suporte ao fluxo de cancelamento.
**Depends on:** Phase 3
**Plans:** 2 planos

Plans:

- [x] 07-02: Tela de Listagem de Pedidos Agrupada por Data (Frontend)
- [x] 07-03: Drawer de Detalhes do Pedido e Ação de Cancelamento (Frontend)

### Phase 8: Integração Dinâmica de Pedidos e Estoque (Dynamic Orders & Stock Integration)

**Goal:** Interligar pedidos aos produtos e variações reais do banco de dados (remover mock no use case), decrementando o estoque do produto/variação quando o pedido for confirmado/criado e revertendo a baixa em caso de cancelamento.
**Depends on:** Phase 7
**Plans:** 1 plano

Plans:

- [x] 08-01: Associação de Pedidos a Produtos Reais, Validação e Atualização Dinâmica de Estoque (Backend & Frontend)

