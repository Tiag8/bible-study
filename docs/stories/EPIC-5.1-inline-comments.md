# EPIC 5.1: Comentarios Inline no Editor (estilo Notion)

**Status**: Pending
**Priority**: Media
**Assignee**: @dev
**Arch Review**: @architect (Aria - Decisoes finalizadas)
**PM**: @pm (Morgan)

---

## CONTEXTO

### Visao Geral
Adicionar sistema de comentarios inline ao editor Tiptap, permitindo ao usuario selecionar trechos de texto e adicionar anotacoes/reflexoes pessoais. Inspirado no Notion, com highlight visual e tooltip de visualizacao.

### Usuario-alvo
Estudioso biblico que quer:
- Anotar reflexoes sobre trechos especificos do estudo
- Revisar anotacoes facilmente via hover no texto destacado
- Editar e excluir comentarios quando necessario

### Valor de Negocio
- Aprofundamento do estudo biblico com anotacoes contextuais
- Experiencia "segundo cerebro" mais completa (Obsidian/Notion)
- Retencao de insights durante leitura e revisao

---

## OBJETIVOS

| Objetivo | Sucesso |
|----------|---------|
| Criar comentario via BubbleMenu | Selecionar texto + clicar icone + digitar + salvar |
| Visualizar comentario | Hover no highlight exibe tooltip com texto |
| Editar comentario | Botao editar no tooltip abre popover editavel |
| Excluir comentario | Botao excluir no tooltip + modal de confirmacao |
| Highlight visual | Texto comentado com fundo amarelo/laranja |
| Indicador na margem | Icone de balao na margem do texto comentado |

---

## DECISOES ARQUITETURAIS (@architect)

### Persistencia: JSONB (content existente)
- Comentario armazenado como **mark** dentro do JSON do Tiptap
- Auto-save existente (debounce 300ms + timer 30s) persiste automaticamente
- Zero migrations, zero tabelas novas
- Justificativa: single-user, anotacao pessoal acoplada ao texto, YAGNI

### Extensao Tiptap: Custom Mark (`comment`)
- Mark = decoracao inline sobre texto (semantica correta)
- Segue padrao do `Highlight` que ja existe no projeto
- `excludes: 'comment'` para impedir sobreposicao

### Estrutura do Mark no JSONB
```json
{
  "type": "text",
  "text": "trecho comentado",
  "marks": [
    {
      "type": "comment",
      "attrs": {
        "commentId": "uuid-gerado-client-side",
        "commentText": "Minha reflexao sobre este trecho",
        "createdAt": "2026-01-29T..."
      }
    }
  ]
}
```

### Arquitetura de Componentes
```
src/components/Editor/
  CommentMark.ts              # Custom Tiptap Mark
  BubbleMenu/
    BubbleMenuToolbar.tsx      # + botao MessageSquare
    BubbleMenuComment.tsx      # Popover criar/editar (NOVO)
  CommentTooltip.tsx           # Tooltip hover com texto + acoes (NOVO)
  CommentMarginIcon.tsx        # Icone na margem do texto (NOVO)
```

---

## STORIES

### Story 5.1.1: Custom Mark + BubbleMenu Integration
**Descricao**: Criar a extensao Tiptap `CommentMark` e integrar botao no BubbleMenu com popover de criacao.

**Escopo**:
- [ ] Criar `CommentMark.ts` (custom mark com attrs: commentId, commentText, createdAt)
- [ ] Adicionar icone `MessageSquare` no `BubbleMenuToolbar.tsx`
- [ ] Criar `BubbleMenuComment.tsx` (popover com textarea + botao salvar)
- [ ] Handler `setComment` no `useBubbleMenuHandlers.ts`
- [ ] Registrar extensao no editor (`index.tsx`)
- [ ] CSS para highlight amarelo/laranja no texto comentado
- [ ] Verificar que auto-save persiste o mark sem alteracoes

**Criterios de Aceite**:
- Selecionar texto → BubbleMenu → icone comentario → popover → digitar → salvar
- Texto fica com highlight amarelo/laranja
- Auto-save persiste o comentario no JSONB
- Recarregar pagina mostra highlight preservado
- Nao permite sobrepor comentarios (excludes)

**Predicted Agents**: @dev
**Quality Gates**:
- Pre-Commit: Build passa, lint passa
- Pre-PR: Testar criar comentario, recarregar, verificar persistencia

---

### Story 5.1.2: Tooltip de Visualizacao + Editar + Excluir
**Descricao**: Implementar tooltip no hover/click do texto comentado com acoes de editar e excluir.

**Escopo**:
- [ ] Criar `CommentTooltip.tsx` (tooltip com texto do comentario)
- [ ] Desktop: exibir no hover sobre texto com mark `comment`
- [ ] Mobile: exibir no tap sobre texto com mark `comment`
- [ ] Botao editar no tooltip → popover com textarea pre-preenchida
- [ ] Botao excluir no tooltip → modal de confirmacao (reutilizar existente)
- [ ] Handler `updateComment` no `useBubbleMenuHandlers.ts`
- [ ] Handler `removeComment` no `useBubbleMenuHandlers.ts`

**Criterios de Aceite**:
- Hover no highlight → tooltip aparece com texto do comentario
- Mobile: tap no highlight → tooltip aparece
- Botao editar → popover com texto atual → salvar atualiza mark
- Botao excluir → modal confirmacao → confirmar remove highlight e mark
- Auto-save persiste edicao/exclusao

**Predicted Agents**: @dev
**Quality Gates**:
- Pre-Commit: Build passa, lint passa
- Pre-PR: Testar CRUD completo, testar mobile (responsive)

---

### Story 5.1.3: Indicador Visual na Margem
**Descricao**: Adicionar icone de balao na margem do editor para linhas que contem comentarios.

**Escopo**:
- [ ] Criar `CommentMarginIcon.tsx` (icone MessageSquare pequeno)
- [ ] Posicionar na margem esquerda do editor, alinhado com a linha do comentario
- [ ] Click no icone da margem → scroll e foco no trecho comentado
- [ ] Estilizar com cor sutil que nao interfira na leitura

**Criterios de Aceite**:
- Linhas com comentario exibem icone na margem
- Click no icone destaca/foca o trecho comentado
- Icone nao interfere com layout do editor
- Funciona em mobile (menor, touch-friendly)

**Predicted Agents**: @dev
**Quality Gates**:
- Pre-Commit: Build passa, lint passa
- Pre-PR: Testar em desktop e mobile, verificar alinhamento visual

---

## COMPATIBILIDADE

- [x] APIs existentes nao afetadas (zero mudanca backend)
- [x] Schema do banco nao muda (comentario dentro do JSONB existente)
- [x] BubbleMenu existente preservado (apenas adicionar botao)
- [x] Auto-save funciona sem modificacao
- [x] Performance: marks sao leves, impacto negligivel

## RISCOS E MITIGACAO

| Risco | Mitigacao |
|-------|----------|
| Texto deletado com comentario | Mark removido junto (comportamento padrao ProseMirror) |
| JSONB cresce com muitos comentarios | Comentarios sao texto curto, impacto negligivel |
| Tooltip conflita com BubbleMenu | Tooltip so aparece quando NAO ha selecao ativa |
| Icone margem desalinha em mobile | Esconder icone margem em telas < 768px se necessario |

## ROLLBACK

- Remover extensao `CommentMark` do array de extensions
- Comentarios existentes no JSONB serao ignorados (marks desconhecidos sao descartados pelo Tiptap)

---

## DEFINITION OF DONE

- [ ] CRUD completo de comentarios (criar, ver, editar, excluir)
- [ ] Highlight visual no texto comentado
- [ ] Tooltip funcional (desktop hover, mobile tap)
- [ ] Indicador na margem do editor
- [ ] Auto-save persiste todas as operacoes
- [ ] Modal de confirmacao para exclusao
- [ ] Build e lint passando
- [ ] Testado em desktop e mobile

---

## HANDOFF PARA @sm

Desenvolver stories detalhadas para este epic brownfield. Consideracoes:

- Enhancement no editor Tiptap existente (Next.js 15 + React 19 + TypeScript)
- Pontos de integracao: BubbleMenu, Editor extensions, auto-save, design tokens
- Padroes existentes: ColoredBlockquote (custom extension), BubbleMenu modular, useBubbleMenuHandlers
- Requisito critico: zero mudanca no backend/database
- Cada story deve verificar que funcionalidades existentes permanecem intactas

O epic deve manter a integridade do sistema enquanto entrega comentarios inline completos.
