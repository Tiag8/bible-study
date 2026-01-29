# Guia Prático de Avaliação - Story 4.3: Reference Links UI

**Data:** 2026-01-29
**Status:** Pronto para teste prático
**Objetivo:** Avaliar na prática o que funciona/o que não funciona na Story 4.3

---

## 🎯 Teste Prático em 5 Fases

Siga **exatamente nesta ordem**. Cada fase valida um aspecto diferente.

---

## FASE 1: Setup Inicial (5 min)

### Antes de Começar
1. **Abrir o app**: `npm run dev` → navegue para http://localhost:3000
2. **Verificar auth**: Você deve estar logado (veja nome no canto superior direito)
3. **Ir para um estudo**: Clique em qualquer estudo já existente (ex: Gênesis 1:1)
4. **Verificar sidebar**: À DIREITA da página, você deve ver um painel chamado "Referências"

### ✅ O que Procurar (FASE 1)
- [ ] Painel "Referências" visível à direita no desktop?
- [ ] Se estiver em mobile, há um botão FAB (círculo redondo) no canto inferior direito?
- [ ] O painel está vazio ou tem itens? (tudo bem estar vazio no primeiro acesso)

### ❌ Red Flags (FASE 1)
- ❌ Sidebar não aparece → Problema de renderização
- ❌ FAB não aparece em mobile → Problema responsivo
- ❌ Erro no console (F12) → Bug no código

---

## FASE 2: Adicionar Referências (10 min)

### Passo 1: Abrir Modal de Adição
**Desktop:**
1. No painel "Referências" à direita, clique no botão "+ Adicionar Referência" (ou ícone +)
2. Um modal deve abrir com um campo de busca

**Mobile:**
1. Clique no FAB (círculo redondo no canto inferior direito)
2. Uma drawer deve deslizar da base da tela
3. Dentro da drawer, clique em "+ Adicionar" ou ícone +

### ✅ O que Procurar
- [ ] Modal/drawer abre SEM erros?
- [ ] Campo de busca está focado (cursor piscando)?
- [ ] Há um placeholder tipo "Buscar estudos..."?

### Passo 2: Buscar um Estudo
1. Digite o nome de um estudo já criado (ex: "Êxodo" ou "Mateus")
2. **Observe a busca em TEMPO REAL** (não pressione Enter, só observe)

### ✅ O que Procurar
- [ ] Resultados aparecem ENQUANTO digita? (não depois)
- [ ] Resultados aparecem com delay de ~200ms? (isso é normal)
- [ ] Cada resultado mostra: [Livro Capítulo:Versículo] + [Status]?
- [ ] Não há resultados duplicados?

### Passo 3: Selecionar e Confirmar
1. Clique em um resultado (ex: "Mateus 5:1")
2. Uma confirmação deve aparecer

### ✅ O que Procurar
- [ ] Após selecionar, a referência foi ADICIONADA à lista?
- [ ] Modal/drawer FECHA automaticamente?
- [ ] Há uma notificação verde (toast) confirmando "Referência adicionada"?
- [ ] A nova referência aparece na lista com número de ordem?

### ❌ Red Flags (FASE 2)
- ❌ Busca não atualiza enquanto digita → Problema de debounce
- ❌ Busca muito lenta (>1s) → Problema de performance
- ❌ Referência duplicada aparece na lista → Validação quebrada
- ❌ Não consegue adicionar → Erro de API/database
- ❌ Toast não aparece → Feedback visual quebrado

---

## FASE 3: Reordenar Referências (8 min)

### Pré-requisito
Você deve ter **pelo menos 2-3 referências adicionadas** (Phase 2)

### Passo 1: Reordenação por Arraste

**Desktop:**
1. Na lista de referências, veja o ícone de "seis pontinhos" (⋮⋮) à esquerda de cada referência
2. **Clique e mantenha pressionado** nesse ícone
3. **Arraste para CIMA ou PARA BAIXO** a referência
4. **Solte** o mouse

**Mobile:**
1. Toque e mantenha pressionado no item (em qualquer lugar do card)
2. Arraste deslizando o dedo para cima ou para baixo
3. Solte o dedo

### ✅ O que Procurar
- [ ] Ao arrastar, o item fica VISUALMENTE destacado? (cor diferente, sombra)
- [ ] Enquanto arrasta, há um feedback visual (ex: opacidade muda)?
- [ ] Ao soltar, a ordem MUDOU na lista?
- [ ] A mudança foi SALVA no banco de dados? (recarregue a página com F5 - deve manter a ordem)

### Passo 2: Validar Persistência
1. Após reordenar, **recarregue a página** (F5)
2. Veja se a ordem se mantém

### ✅ O que Procurar
- [ ] Ordem persiste após reload?
- [ ] Não há erro no console (F12)?

### ❌ Red Flags (FASE 3)
- ❌ Drag-drop não funciona → @dnd-kit não inicializou
- ❌ Item some ao arrastar → Bug no componente
- ❌ Ordem não persiste após reload → Problema de banco de dados
- ❌ Performance ruim ao arrastar (jank, lag) → Problema de otimização React
- ❌ Em mobile, não consegue arrastar → Touch handlers quebrados

---

## FASE 4: Deletar Referências (5 min)

### Passo 1: Abrir Modal de Confirmação
1. Na lista de referências, localize o botão **ícone de lixeira (🗑)** no final de cada item
2. Clique nele

### ✅ O que Procurar
- [ ] Um modal de confirmação abre?
- [ ] Mensagem: "Tem certeza que deseja remover esta referência?"?
- [ ] Há 2 botões: "Cancelar" e "Remover"?

### Passo 2: Confirmar Deleção
1. Clique no botão "Remover"

### ✅ O que Procurar
- [ ] Modal fecha?
- [ ] A referência **desaparece da lista**?
- [ ] Há toast verde confirmando "Referência removida"?
- [ ] **Recarregue a página** (F5) - a referência deve continuar fora da lista

### Passo 3: Cancelamento
1. Adicione outra referência (Phase 2)
2. Clique no ícone 🗑 para abrir confirmação
3. Clique em "Cancelar"

### ✅ O que Procurar
- [ ] Modal fecha?
- [ ] A referência **continua na lista**?
- [ ] Nada foi deletado?

### ❌ Red Flags (FASE 4)
- ❌ Modal não abre → Botão quebrado
- ❌ Confirmação não funciona → Hook useReferences quebrado
- ❌ Referência não some → Problema de UI update
- ❌ Referência volta ao recarregar → Não foi deletada do banco
- ❌ Sem toast de confirmação → Feedback visual faltando

---

## FASE 5: Responsividade e Mobile (10 min)

### Setup
1. Abra **DevTools** (F12)
2. Clique no ícone "Toggle device toolbar" (Ctrl+Shift+M)
3. Selecione diferentes tamanhos:
   - iPhone SE (375px) - MÓVEL PEQUENO
   - iPhone 11 (667px) - MÓVEL NORMAL
   - iPad (768px) - TABLET
   - Volte para Desktop (1024px+)

### MÓVEL (< 768px)

#### ✅ O que Procurar
- [ ] Não há "Referências" sidebar à direita (deve estar oculta)
- [ ] Há um **FAB (círculo com ícone)** no canto inferior direito?
- [ ] FAB é **tátil** (48x48px ou maior)?
- [ ] Ao clicar FAB, uma **drawer desliza de baixo**?
- [ ] Drawer tem overlay escuro por trás?
- [ ] Ao clicar no overlay, drawer **fecha**?
- [ ] Dentro da drawer, consegue adicionar/reordenar/deletar?
- [ ] Drag-drop funciona em mobile (deslizar o dedo)?

#### ❌ Red Flags (MÓVEL)
- ❌ Sidebar visível em mobile → Quebrou responsividade
- ❌ FAB muito pequeno (<44px) → Inacessível
- ❌ FAB em lugar estranho (cobre conteúdo) → Positioning quebrado
- ❌ Drawer não fecha ao clicar overlay → Modal trap bug
- ❌ Não consegue arrastar em mobile → Touch handlers faltando

### TABLET (768px - 1024px)

#### ✅ O que Procurar
- [ ] Sidebar aparece à direita?
- [ ] Sidebar toma ~20-25% da tela?
- [ ] Ainda é possível interagir com o editor à esquerda?
- [ ] Drag-drop funciona?

### DESKTOP (1024px+)

#### ✅ O que Procurar
- [ ] Sidebar visível e bem posicionada?
- [ ] Editor ocupa ~70% da tela, sidebar ~30%?
- [ ] Scroll da sidebar funciona se há muitas referências?

### ❌ Red Flags (RESPONSIVIDADE)
- ❌ Layout quebrado em algum breakpoint
- ❌ Componentes sobrepostos
- ❌ Texto ilegível em mobile
- ❌ Botões fora da tela

---

## FASE 6: Acessibilidade e Teclado (8 min)

### Setup
1. Mantenha DevTools aberto (F12)
2. Vá para a aba **Console** e procure por erros (cor vermelha)

### Teste de Teclado (Desktop)

#### Passo 1: Navegar sem Mouse
1. **Feche o DevTools** (F12 novamente)
2. Use **TAB** para navegar entre elementos
3. Procure por ícones de foco visíveis (anel azul ao redor dos botões)

### ✅ O que Procurar
- [ ] Ao pressionar TAB, há um **anel ou borda azul** ao redor dos botões?
- [ ] Consegue navegar até: "+ Adicionar", botões de reordenação, botão de delete?
- [ ] Ao focar no campo de busca (TAB), consegue digitar?
- [ ] Pressionar **ENTER** confirma seleção?
- [ ] Pressionar **ESCAPE** fecha o modal/drawer?

### Teste de Leitura de Tela (Opcional, mas Valioso)

Se seu navegador tiver Acessibilidade integrada:
1. Abra configurações de acessibilidade do SO
2. Ative "Leitura de tela"
3. Navegue com TAB e observe:

### ✅ O que Procurar
- [ ] Leitura de tela anuncia: "Botão: Adicionar Referência"?
- [ ] Cada referência tem descrição clara?
- [ ] Anuncia "Drag item" ou equivalente?

### ❌ Red Flags (ACESSIBILIDADE)
- ❌ Sem foco visível (anel azul) → Violação WCAG AA
- ❌ Leitura de tela não funciona → aria-labels faltando
- ❌ Não consegue navegar com teclado → Sem keyboard handlers
- ❌ ESCAPE não funciona em modal → Focus trap quebrado

---

## FASE 7: Performance & Observação (5 min)

### Setup
1. Abra **DevTools** (F12)
2. Vá para aba **Performance** (ou **Network**)
3. Recarregue a página (F5)

### ✅ O que Procurar
- [ ] Página carrega em **< 2 segundos**?
- [ ] Não há erros vermelhos na aba **Console**?
- [ ] Não há avisos (⚠️) na aba **Console**?
- [ ] Ao adicionar uma referência, há uma **skeleton/loader**? (ou carrega muito rápido)
- [ ] Operações não "congelam" a página (sem freezing)?

### Teste de Animações
1. Ao arrastar um item, move **suavemente** ou **pula/jank**?

### ✅ O que Procurar
- [ ] Drag-drop é suave?
- [ ] Drawer desliza suavemente?
- [ ] Modais aparecem sem jerks?

### ❌ Red Flags (PERFORMANCE)
- ❌ Erros vermelhos no console → Bugs críticos
- ❌ Avisos na console → Depreciações ou problemas
- ❌ Carregamento > 3s → Performance ruim
- ❌ Jank ao arrastar → Falta de React.memo ou useCallback
- ❌ Página congela ao adicionar/deletar → Query pesada

---

## FASE 8: Validações e Edge Cases (7 min)

### Teste 1: Self-Reference (Adicionar o mesmo estudo)
1. Você está em "Mateus 5:1"
2. Tente adicionar "Mateus 5:1" como referência

### ✅ O que Procurar
- [ ] Sistema **IMPEDE** a adição (impede antes de confirmar)?
- [ ] Há mensagem tipo "Não é possível adicionar a si mesmo"?

### Teste 2: Duplicata
1. Você já tem "Mateus 5:1" adicionado
2. Tente adicionar "Mateus 5:1" novamente

### ✅ O que Procurar
- [ ] Sistema **IMPEDE** duplicatas?
- [ ] Mensagem: "Esta referência já foi adicionada"?

### Teste 3: Busca Vazia
1. Abra o modal de adição
2. Deixe o campo vazio
3. Observe

### ✅ O que Procurar
- [ ] Não há resultados (normal)?
- [ ] Há mensagem "Nenhum resultado encontrado" ou similar?

### Teste 4: Busca com Caracteres Especiais
1. Digite: `@#$%`

### ✅ O que Procurar
- [ ] Não há erro?
- [ ] Resultado é "Nenhum encontrado"?

### ❌ Red Flags (VALIDAÇÕES)
- ❌ Self-reference é permitida → Validação frontend quebrada
- ❌ Duplicatas permitidas → Validação backend quebrada
- ❌ Erro ao digitar caracteres especiais → XSS ou sanitização faltando

---

## FASE 9: Banco de Dados (Verificação Final)

### Advanced: Verificar Isolamento de Usuários (RLS)

Se houver outro usuário de teste:
1. Logout (clique nome → Logout)
2. Login com **outra conta** (outro email)
3. Vá para um estudo e adicione referências
4. Logout novamente e login com **primeira conta**
5. Vá para o **mesmo estudo**

### ✅ O que Procurar
- [ ] Referências do usuário B não aparecem para usuário A?
- [ ] Cada usuário vê só suas referências?

### ❌ Red Flags (BANCO DE DADOS)
- ❌ Referências de outro usuário visíveis → RLS quebrado (CRÍTICO)
- ❌ Consegue deletar referência de outro usuário → RLS bypassed (CRÍTICO)

---

## 📋 Resumo Rápido: O que Procurar

| Aspecto | ✅ Esperado | ❌ Red Flag |
|---------|-----------|-----------|
| **Renderização** | Sidebar/FAB visível | Não aparece |
| **Busca** | Real-time, <500ms | Lenta ou não funciona |
| **Adição** | Toast de sucesso | Referência não adiciona |
| **Reordenação** | Drag suave, persiste | Jank ou volta ao reload |
| **Deleção** | Modal de confirmação | Não pode deletar |
| **Mobile** | Drawer + FAB | Sidebar em mobile |
| **Teclado** | TAB funciona, ESCAPE fecha | Sem foco visível |
| **Console** | Sem erros vermelhos | Erros ou warnings |
| **Isolamento** | Referências privadas | Vê referências de outros |

---

## 🎯 Critério de Aprovação

### ✅ APROVADO se:
- ✅ Todas as fases 1-8 passam sem red flags
- ✅ Nenhum erro vermelho no console
- ✅ Mobile funciona (drawer, FAB)
- ✅ Teclado funciona (TAB, ESCAPE)
- ✅ Validações funcionam (sem self-ref, sem dup)
- ✅ Banco de dados persiste (reload mantém ordem)
- ✅ RLS funciona (isolamento de usuários)

### ❌ REJEITADO se:
- ❌ Red flags críticas encontradas (em qualquer fase)
- ❌ Erros no console
- ❌ RLS quebrado (referências de outro usuário visíveis)
- ❌ Não funciona em mobile
- ❌ Dados não persistem

---

## 📝 Template de Resultado

Após testar, documente:

```markdown
# Teste Prático - Story 4.3 Reference Links UI

**Tester:** [Seu Nome]
**Data:** 2026-01-XX
**Build:** [Commit ou versão]
**Ambiente:** [Dev/Staging]

## Resultado Geral
- [ ] APROVADO - Pronto para produção
- [ ] APROVADO COM NOTAS - Pequenos ajustes
- [ ] REJEITADO - Blockers encontrados

## Fases Testadas
- [x] Fase 1: Setup Inicial ✅
- [x] Fase 2: Adicionar Referências ✅
- [ ] Fase 3: Reordenar ✅
- [ ] Fase 4: Deletar ✅
- [ ] Fase 5: Responsividade ✅
- [ ] Fase 6: Acessibilidade ✅
- [ ] Fase 7: Performance ✅
- [ ] Fase 8: Validações ✅
- [ ] Fase 9: Banco de Dados ✅

## Problemas Encontrados
1. [Problema] - [Severidade: Critical/High/Medium/Low]
   - Passos: ...
   - Esperado: ...
   - Observado: ...
   - Screenshot: [Link]

## Observações
[Qualquer observação adicional]

## Recomendação
[APROVADO / REVISAR / REJEITAR]
```

---

**Pronto para testar! 🚀**

Siga as fases nesta ordem. Se encontrar problemas, documente com print + passos. Bom teste!
