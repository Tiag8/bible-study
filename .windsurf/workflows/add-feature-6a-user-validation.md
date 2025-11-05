---
description: Workflow Add-Feature (6a/9) - User Validation (Validação Manual - CRÍTICO!)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `README.md` - Descrição do projeto
- `AGENTS.md` - Comportamento dos agents
- `.windsurf/workflows` - Todos workflows em etapas (arquivos diferentes)
- `docs/` - Todos documentos importantes
- `scripts/` - Todos scrips importantes

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Fase 13 (Testes Funcionais): Executar testes em paralelo (UI, Performance, Integração)
- Fase 14 (Feedback): Analisar múltiplos problemas simultaneamente em agentes separados
- Análises paralelas: Funcionalidade, Design, Performance, Segurança, Edge Cases

---

# Workflow 6a/11: User Validation (Validação Manual)

Este é o **sexto workflow** de 11 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 13: **PARADA OBRIGATÓRIA** - Testar Manualmente
- Fase 14: Ciclo de Feedback (ajustes se necessário)
- **GATE 3**: Usuário confirma "funciona perfeitamente!"

**Por que esta etapa é CRÍTICA?**
- ✅ **IA raramente acerta de primeira** (sua observação!)
- ✅ Usuário valida UX, UI, lógica de negócio
- ✅ Feedback humano é essencial
- ✅ Previne commit de código com problemas
- ✅ Sistema aprende com suas correções

**⚠️ NENHUM commit foi feito ainda!**
- Código está apenas na branch local
- Testes automáticos passaram
- MAS precisa de **SUA aprovação** antes de prosseguir

---

## 🧪 Fase 13: PARADA OBRIGATÓRIA - Testar Manualmente

### 13.1 Iniciar Servidor de Desenvolvimento

Abra o terminal e rode:
```bash
npm run dev
```

**Output esperado**:
```
  VITE v5.x.x  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Abra o navegador em: **http://localhost:5173/**

---

### 13.2 Checklist de Testes Funcionais

**Marque cada item APÓS validar:**

#### Funcionalidade Principal
- [ ] **Feature funciona como esperado**
  - Comportamento está correto?
  - Dados são exibidos corretamente?
  - Interações funcionam (cliques, hovers, etc)?

- [ ] **Não quebrou nenhuma funcionalidade existente**
  - Navegue por outras páginas do app
  - Teste features relacionadas
  - Verifique se nada "sumiu" ou está quebrado

#### Interface e Design
- [ ] **UI está correta (layout, cores, espaçamento)**
  - Design segue padrão do projeto?
  - Cores estão consistentes?
  - Espaçamento está adequado?
  - Tipografia está correta?

- [ ] **Responsivo funciona (mobile, tablet, desktop)**
  - Teste em largura < 640px (mobile)
  - Teste em largura 640-1024px (tablet)
  - Teste em largura > 1024px (desktop)
  - Use DevTools → Toggle Device Toolbar (Ctrl+Shift+M)

#### Performance
- [ ] **Performance está aceitável (sem lentidão)**
  - App responde rápido (< 500ms)?
  - Não há travamentos ao interagir?
  - Transições são suaves?

- [ ] **Não há erros no console do navegador**
  - Abra DevTools → Console (F12)
  - Verifique que NÃO há erros vermelhos
  - Warnings amarelos são OK (mas analise se críticos)

- [ ] **Não há warnings do TypeScript**
  - No terminal, verifique que Vite não mostra erros TS
  - Se houver, corrigir antes de prosseguir

---

### 13.3 Checklist de Testes de Borda (Edge Cases)

**Teste cenários extremos:**

- [ ] **Funciona com dados vazios**
  - O que acontece se não houver dados?
  - Mostra mensagem amigável? ("Nenhum dado disponível")
  - Não quebra com erro?

- [ ] **Funciona com muitos dados**
  - O que acontece com 100+ itens?
  - Há paginação ou infinite scroll?
  - Performance continua OK?

- [ ] **Funciona com dados inválidos**
  - O que acontece com valores nulos/undefined?
  - Validação funciona corretamente?
  - Mensagens de erro são claras?

- [ ] **Funciona offline (se aplicável)**
  - DevTools → Network → Offline
  - App degrada graciosamente?
  - Mensagem de offline é exibida?

---

### 13.4 Checklist de Integração

- [ ] **Integração com Supabase OK**
  - Dados são buscados corretamente?
  - Mutations (insert/update/delete) funcionam?
  - RLS está funcionando (não vê dados de outros usuários)?

- [ ] **Queries não estão lentas (< 500ms)**
  - Abra DevTools → Network → Filter: "supabase"
  - Verifique tempo de cada query
  - Se > 500ms, considere otimizar

- [ ] **Não há vazamento de memória**
  - Deixe app rodando por 1-2 minutos
  - Interaja várias vezes com a feature
  - App não fica lento com o tempo?

- [ ] **Build de produção funciona: `npm run build`**
  - Rode em outro terminal: `npm run build`
  - Verifique que build completa SEM erros
  - Warnings de chunk size são OK (já otimizado)

---

## 🔄 Fase 14: Ciclo de Feedback

### 14.1 Se Encontrou Problemas ⚠️

**NÃO prossiga! Vamos corrigir primeiro.**

**Descreva o problema encontrado:**
- O que está errado?
- Como reproduzir?
- Comportamento esperado vs. atual?
- Screenshot/video ajuda?

**Fluxo de correção:**
1. Você descreve o problema
2. IA analisa e propõe correção
3. IA implementa correção (commit: `fix: corrigir problema X`)
4. **Volta para Fase 11** (testes automáticos)
5. Se testes passarem → **Volta para Fase 13** (você testa novamente)
6. Repete até **TUDO estiver OK**

**🐛 Se Encontrar Problemas Complexos**

**Quando usar**: Problema com comportamento inesperado, múltiplas features afetadas, ou dificuldade em reproduzir.

**Ação**: Execute o workflow de debugging:

```bash
# Ver workflow completo
cat .windsurf/workflows/debug-complex-problem.md
```

**O que ele faz**:
- 5 agentes paralelos diagnosticam (Database, Frontend, Backend, Auth, Logs)
- Root cause analysis sistemática usando 5 Whys (ver `docs/guides/ROOT_CAUSE_ANALYSIS.md`)
- Solution design com rollback plan
- Documentação do caso em docs/debugging/

**Quando é complexo**:
- ❌ "Às vezes salva, às vezes não" (intermitente)
- ❌ "Funciona local mas quebra em produção"
- ❌ "Múltiplos campos afetados, não sei por quê"
- ❌ "Erro genérico, difícil de debugar"

**Exemplo**:
```
Usuário: "O card PROFIT está mostrando valor negativo errado"

IA: "Vou analisar o cálculo... Identifiquei bug na linha 42
do hook useProfit. Vou corrigir..."

[IA corrige, comita fix, roda testes automáticos]

IA: "Correção aplicada! Testes passando. Por favor, teste
novamente no navegador (npm run dev já está rodando,
apenas recarregue a página)."

Usuário: [Testa novamente]
```

**Iterações esperadas**: 2-4 (normal)
- 1ª iteração: Feature básica funciona, mas tem ajustes de UI/UX
- 2ª iteração: Ajustes aplicados, mas falta edge case
- 3ª iteração: Edge case corrigido, pequeno polimento
- 4ª iteração: ✅ Perfeito!

**Por que isso é valioso?**
- ✅ IA aprende com seus feedbacks
- ✅ Código fica mais alinhado com sua visão
- ✅ Evita refatoração cara depois
- ✅ Qualidade final é muito maior

---

### 14.2 Se Tudo Estiver OK ✅

**Parabéns! Feature pronta para próxima etapa.**

**Confirme que:**
- ✅ TODOS os checkboxes acima estão marcados
- ✅ Feature funciona perfeitamente
- ✅ Performance está OK
- ✅ UI/UX está como você esperava
- ✅ Sem erros no console
- ✅ Build de produção funciona

**Digite para confirmar:**
- `Aprovar` ou `OK` ou `Funciona perfeitamente` ou `Prosseguir`

---

## ✅ GATE 3 CHECKLIST - VALIDAÇÃO OBRIGATÓRIA

**⛔ REGRA CRÍTICA**: NÃO prosseguir sem ✅ em TODOS os itens abaixo!

### Checklist de Validação (marque TODOS antes de aprovar):

#### Funcionalidade
- [ ] Feature funciona conforme especificado
- [ ] Todos casos de uso testados (happy path + edge cases)
- [ ] Integração com sistemas existentes funciona
- [ ] Nenhuma feature existente foi quebrada

#### Design & UX
- [ ] Layout está correto (posicionamento, tamanho, espaçamento)
- [ ] Cores consistem com padrão do projeto
- [ ] Responsivo funciona (mobile 375px, tablet 768px, desktop 1440px)
- [ ] Navegação por teclado OK (Tab, Enter, Escape)
- [ ] Contraste de cores atende acessibilidade WCAG AA
- [ ] Animações suaves (sem jank, < 16ms por frame)

#### Qualidade Técnica
- [ ] Console do navegador **LIMPO** (0 erros, 0 warnings críticos)
- [ ] Vite compile SEM errors ou warnings TS
- [ ] Performance aceitável (queries < 500ms, interações < 100ms)
- [ ] Build de produção funciona (`npm run build` sem erros)
- [ ] TypeScript compile sem erros

#### Integração
- [ ] Supabase: dados salvam e carregam corretamente
- [ ] RLS: não vê dados de outros usuários
- [ ] Mutations (insert/update/delete) funcionam
- [ ] Nenhum vazamento de memória detectado
- [ ] Queries otimizadas (sem N+1 problems)

#### Edge Cases & Robustez
- [ ] Comportamento com dados vazios OK (mensagem amigável)
- [ ] Comportamento com muitos dados OK (> 100 itens)
- [ ] Comportamento com dados inválidos OK (validação clara)
- [ ] Offline mode testado (se aplicável)
- [ ] Erros tratados graciosamente (user-friendly messages)

---

### ⚠️ Se Algum Item NÃO Está ✅

**AÇÃO OBRIGATÓRIA**: Voltar para Fase 14.1 e descrever o problema!

**NÃO marcar como "Aprovar" se há checkboxes vazios.**

Qualidade > velocidade. Uma feature 100% correta agora economiza horas de debugging depois.

---

## ✋ GATE 3: Confirmação do Usuário

**⚠️ PARADA OBRIGATÓRIA - Decisão do Usuário**

**Sua decisão:**
- **✅ APROVAR** - Todos checkboxes marcados, tudo perfeito!
- **⚠️ AJUSTAR** - Tem problemas, precisa corrigir (volta para Fase 14.1)

**Aguardando sua confirmação...** 🚦

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Este workflow continua automaticamente em:**

→ [Workflow 6b - RCA e Edge Cases](.windsurf/workflows/add-feature-6b-rca-edge-cases.md)

**Próximas etapas:**
- Análise Root Cause de problemas identificados
- Testes de edge cases
- Validação final completa

*A execução do Workflow 6b deve ser iniciada automaticamente após a conclusão desta parte.*

---

## 📝 Atualização de Documentação

Após completar este workflow (aprovação do usuário):

### Obrigatório
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica

### Se Criou Novos Docs
- [ ] Se criou novos arquivos de documentação em `docs/`, adicionar referência em:
  - `docs/INDEX.md` (sumário de documentação) - ou criar se não existir
  - `README.md` (se relevante para visão geral)
  - Arquivo pai correlato (ex: docs/FEATURES.md para features)
- [ ] Manter nomes consistentes com padrão do projeto
- [ ] Adicionar seção "Última atualização" com data

### Se Houve Decisão Arquitetural
- [ ] Criar ADR em `docs/adr/` com numeração sequencial
- [ ] Referenciar ADR em `docs/ARCHITECTURE.md`

### Boas Práticas
- **Não criar docs desnecessários** - Só se agregar valor
- **Manter docs atualizados** - Docs desatualizados são piores que nenhum doc
- **Links internos** - Use caminhos absolutos (`/docs/ARQUIVO.md`)
- **Versionamento** - Se alterou doc existente, atualizar timestamp

---

**Workflow criado em**: 2025-10-27 | **Dividido em**: 2025-11-04
**Parte**: 6a de 11 (Parte 1 de 2)
**Próximo**: Workflow 6b - RCA e Edge Cases
