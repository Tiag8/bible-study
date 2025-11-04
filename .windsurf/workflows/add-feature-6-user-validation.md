---
description: Workflow Add-Feature (6/9) - User Validation (Validação Manual - CRÍTICO!)
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

# Workflow 6/11: User Validation (Validação Manual)

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
- Root cause analysis sistemática
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

## ✋ GATE 3: Confirmação do Usuário

**⚠️ PARADA OBRIGATÓRIA - Decisão do Usuário**

**Sua decisão:**
- **✅ APROVAR** - Tudo perfeito, pode prosseguir
- **⚠️ AJUSTAR** - Tem problemas, precisa corrigir (volta para Fase 14.1)

**Aguardando sua confirmação...** 🚦

---

## ✅ Checkpoint: Validação Manual Completa!

**Feature validada e aprovada pelo usuário!**

**O que aconteceu até agora:**
- ✅ Código implementado (Workflow 5)
- ✅ Testes automáticos passaram
- ✅ **Usuário testou manualmente e aprovou** ⭐
- ✅ Ajustes feitos (se necessário)
- ✅ Código está 100% funcional

**Próximas etapas:**
- Code Review automatizado (detectar bugs/padrões)
- Security Scan (vulnerabilidades)
- Meta-Learning (aprender antes de documentar)
- Documentação + Commit + Push

**Status atual**:
- Branch: `feat/add-profit-cards-makeup`
- Commits locais: ~8-15 commits (incluindo correções)
- Testes: ✅ Automáticos + ✅ Manuais
- Aprovação: ✅ Usuário

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-7-quality.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-7-quality`

---

**Workflow criado em**: 2025-10-27
**Parte**: 6 de 9
**Próximo**: Quality (Code Review + Security)


## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural

---