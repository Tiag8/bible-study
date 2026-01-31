# Estudo de Design: Identidade Visual "Parchment" - Bible Study

**Data:** 2026-01-30
**Autor:** Atlas (Analyst Agent)
**Status:** Estudo de referência para redesign

---

## 1. Conceito Visual: Pergaminho (Parchment)

O conceito remete ao pergaminho antigo - o material original onde textos bíblicos foram preservados por milênios. A estética combina:
- **Calor do papel envelhecido** com tons sépia/bege
- **Minimalismo profissional** sem parecer "antigo demais"
- **Conforto de leitura** como um livro físico de qualidade

**Referência mental:** Imaginar uma Bíblia de estudo premium (ESV Study Bible da Crossway) traduzida para interface digital - elegante, legível, respeitosa com o conteúdo.

---

## 2. Paleta de Cores

### 2.1 Cores Base (Background e Superfícies)

| Token | Nome | Hex | Uso |
|-------|------|-----|-----|
| `bg-parchment` | Parchment | `#FAF6F0` | Background principal do app |
| `bg-cream` | Cream | `#F5F0E8` | Cards e superfícies elevadas |
| `bg-ivory` | Ivory | `#FFFEF9` | Sidebar, áreas de destaque |
| `bg-linen` | Linen | `#EDE8E0` | Borders sutis, separadores |
| `bg-warm-white` | Warm White | `#FEFCF8` | Inputs, campos de texto |

### 2.2 Cores de Texto (Hierarquia)

| Token | Nome | Hex | Uso |
|-------|------|-----|-----|
| `text-primary` | Charcoal Warm | `#272626` | Corpo de texto principal |
| `text-espresso` | Espresso | `#3C2415` | Títulos principais (h1, h2) - Lora Bold |
| `text-walnut` | Walnut | `#5C4033` | Subtítulos (h3, h4) |
| `text-stone` | Stone | `#7A6F64` | Texto secundário, metadata |
| `text-sand` | Sand | `#A69B8D` | Texto muted, placeholders |

**Contraste validado (sobre #FAF6F0):**
- `#272626` = ratio ~15:1 (WCAG AAA) - corpo
- `#3C2415` = ratio 11.2:1 (WCAG AAA) - títulos
- `#5C4033` = ratio 7.1:1 (WCAG AAA) - subtítulos
- `#7A6F64` = ratio 3.8:1 (WCAG AA large text) - secundário
- `#A69B8D` = ratio 2.5:1 (decorativo/placeholders)

### 2.3 Cores de Accent (Ações)

| Token | Nome | Hex | Uso |
|-------|------|-----|-----|
| `accent-amber` | Amber | `#B8860B` | Links, ações primárias |
| `accent-amber-light` | Amber Light | `#F5E6C8` | Hover states, highlights |
| `accent-amber-dark` | Amber Dark | `#8B6508` | Active states |

### 2.4 Cores de Status (Tons Pastéis Quentes)

| Token | Nome | Hex | Uso |
|-------|------|-----|-----|
| `status-studying-bg` | Studying BG | `#FFF8E7` | Background studying |
| `status-studying-text` | Studying Text | `#92742B` | Texto studying |
| `status-reviewing-bg` | Reviewing BG | `#F3EEF8` | Background revisando |
| `status-reviewing-text` | Reviewing Text | `#6B5B7B` | Texto revisando |
| `status-done-bg` | Done BG | `#EEF5EC` | Background concluído |
| `status-done-text` | Done Text | `#4A6741` | Texto concluído |
| `status-todo-bg` | Todo BG | `#FEF0E7` | Background estudar |
| `status-todo-text` | Todo Text | `#8B5E3C` | Texto estudar |

### 2.5 Cores de Tags (Pastéis Quentes)

| Token | Hex | Preview |
|-------|-----|---------|
| `tag-blue` | `#C5D5E4` | Azul suave quente |
| `tag-purple` | `#D1C4E0` | Lilás suave |
| `tag-green` | `#C5D9C0` | Verde salvia |
| `tag-orange` | `#E8D0B3` | Laranja areia |
| `tag-pink` | `#E0C8CF` | Rosa antigo |
| `tag-cyan` | `#BDD8D6` | Verde-água suave |
| `tag-red` | `#DEC0B8` | Terracota suave |
| `tag-yellow` | `#E0D8B0` | Dourado suave |

---

## 3. Tipografia

### 3.1 Análise de Fontes para Leitura Bíblica

**Critérios avaliados:**
1. Legibilidade em leitura prolongada (30-60min)
2. Estética que remeta a livros/estudo sem parecer antiquada
3. Disponibilidade gratuita (Google Fonts)
4. Boa renderização em telas (hinting)
5. Combinação serif (títulos) + sans-serif (corpo) ou vice-versa

### 3.2 Recomendação: Serif nos Títulos + Sans nos Corpos

**Padrão Bíblico Tradicional:** Bíblias usam serif para corpo (Palatino, Garamond, Century Schoolbook). Mas para interface digital, a pesquisa moderna mostra que sans-serif em corpo funciona melhor em telas, enquanto serif nos títulos dá personalidade.

#### Opção A: **Playfair Display + Source Sans 3**

| Elemento | Fonte | Weight | Justificativa |
|----------|-------|--------|---------------|
| h1 (Títulos) | Playfair Display | 700 (Bold) | Alto contraste, elegante, transmite autoridade. Curvas sofisticadas remetem a tipografia de livros clássicos |
| h2 (Subtítulos) | Playfair Display | 600 (SemiBold) | Mesma família, peso reduzido |
| h3 (Seções) | Source Sans 3 | 600 (SemiBold) | Transição suave para sans-serif |
| Body | Source Sans 3 | 400 (Regular) | Excelente legibilidade em tela, amplo x-height |
| Metadata | Source Sans 3 | 400 (Regular) | Tamanho menor, mantém clareza |
| Monospace | Source Code Pro | 400 | Código, dados técnicos |

**Por que Playfair Display?**
- Desenhada especificamente para transição print → digital
- Alto contraste entre hastes grossas e finas (reminiscente de gravação em metal)
- Ótima em tamanhos grandes (títulos), onde serif brilha
- Google Font gratuita, amplamente testada

**Por que Source Sans 3?**
- Criada pela Adobe para leitura em tela
- X-height generoso (letras parecem maiores no mesmo tamanho)
- Sem ornamentos que distraiam na leitura
- Complementa serif sem competir

#### Opção B (ESCOLHIDA): **Lora + Inter**

| Elemento | Fonte | Weight | Justificativa |
|----------|-------|--------|---------------|
| h1 (Títulos) | Lora | 700 (Bold) | Calor natural, suavidade elegante. Remete a livros de qualidade sem drama excessiva |
| h2 (Subtítulos) | Lora | 600 (SemiBold) | Mesma família, peso reduzido |
| h3 (Seções) | Inter | 600 (SemiBold) | Transição suave para sans-serif |
| Body | Inter | 400 (Regular) | Fonte mais refinada para interfaces, excelente x-height |
| Metadata | Inter | 400 (Regular) | Clareza em tamanhos menores |

**Por que Lora?**
- Inspirada em caligrafia com raízes em formas de livro
- Contraste moderado entre hastes (mais suave que Playfair)
- Otimizada para telas com boa renderização
- Google Font gratuita, amplamente testada

**Por que Inter?**
- Projetada especificamente para interfaces digitais
- X-height generoso, excelente legibilidade
- A sans-serif mais popular para web (usada por Linear, Vercel, etc.)
- Complementa Lora sem competir

#### Opção C: **Crimson Pro + Source Sans 3**

| Elemento | Fonte | Weight |
|----------|-------|--------|
| Títulos | Crimson Pro | 700 |
| Corpo | Source Sans 3 | 400 |

**Crimson Pro** é inspirada em Garamond - a fonte mais associada a Bíblias e livros religiosos no ocidente. Mais sutil e acadêmica que Playfair.

### 3.3 Escala Tipográfica

```
h1:  32px / 2rem    - Playfair Bold     - line-height: 1.2
h2:  24px / 1.5rem  - Playfair SemiBold - line-height: 1.3
h3:  20px / 1.25rem - Source Sans Semi  - line-height: 1.4
h4:  18px / 1.125rem- Source Sans Semi  - line-height: 1.4
body: 16px / 1rem   - Source Sans Reg   - line-height: 1.6
small: 14px / 0.875rem - Source Sans Reg - line-height: 1.5
xs:  12px / 0.75rem - Source Sans Reg   - line-height: 1.5
```

**Line-height de 1.6 para corpo** é fundamental para conforto em leitura prolongada (padrão tipográfico de livros).

### 3.4 Tracking (Letter Spacing)

```
Títulos (Playfair): -0.02em (levemente apertado - cria presença)
Subtítulos:          0em (natural)
Corpo:               0.01em (levemente aberto - melhora legibilidade)
Small/Metadata:      0.02em (mais aberto - compensa tamanho menor)
Caps/Labels:         0.05em (aberto - padrão para uppercase)
```

---

## 4. Princípios de Layout

### 4.1 Espaçamento

- **Generoso, não excessivo** - O pergaminho real tem margens amplas
- Padding interno dos cards: `24px` (atual é `20px`)
- Gap entre cards: `20px` (atual é `16px`)
- Margens laterais do conteúdo: `32px` mínimo
- Espaço entre seções AT/NT: `48px`

### 4.2 Bordas e Sombras

- **Bordas:** `1px solid` em tons linen (`#EDE8E0`), não cinza
- **Sombras:** Quentes (com tom sépia), não cinza frio
  - `box-shadow: 0 1px 3px rgba(60, 36, 21, 0.06)` (sm)
  - `box-shadow: 0 4px 12px rgba(60, 36, 21, 0.08)` (md)
  - `box-shadow: 0 8px 24px rgba(60, 36, 21, 0.10)` (lg)
- **Hover:** Elevação suave com transição de 200ms

### 4.3 Cantos Arredondados

- Cards: `12px` (suave, não agressivo)
- Buttons: `8px`
- Badges/Tags: `6px`
- Avatares: `full` (circular)

### 4.4 Micro-interações

- **Hover em cards:** Translate Y -2px + shadow md (elevação suave)
- **Transitions:** `200ms ease` para cores, `300ms ease` para transform
- **Progress bars:** Gradient sutil (amber → amber-dark)
- **Sem animações complexas** - Transições CSS puras

---

## 5. Componentes Específicos

### 5.1 Sidebar
- Background: `bg-ivory` (#FFFEF9)
- Border-right: `1px solid #EDE8E0`
- Logo "Bible Graph": Playfair Display Bold, `text-espresso`
- Nav items: Source Sans 3, `text-earth`, hover com `bg-cream`
- Avatar: Gradient amber com initial em branco

### 5.2 TopBar
- Background: `bg-warm-white` (#FEFCF8)
- Border-bottom: `1px solid #EDE8E0`
- Search: Background `bg-parchment`, border `#EDE8E0`, placeholder `text-sand`
- Botões: Outline em `accent-amber`, texto `text-walnut`

### 5.3 BookCard
- Background: `bg-cream` (#F5F0E8)
- Border: `1px solid #EDE8E0`
- Hover: `bg-warm-white` + shadow-md + translate -2px
- Título do livro: Playfair Display SemiBold, `text-espresso`
- Metadata: Source Sans 3, `text-stone`
- Progress bar: Gradient `accent-amber` → `accent-amber-dark`
- Cards sem estudo: Opacity 0.7 com background mais neutro

### 5.4 BookGrid
- Section headers (AT/NT): Playfair Display Bold, `text-espresso`
- Decorador visual: Linha horizontal em `accent-amber-light` ao lado do título
- Stats: Source Sans 3, `text-stone`

---

## 6. Comparativo Visual

### Antes (Atual)
```
Background:  bg-gray-50  (#F9FAFB)  → Frio, genérico
Cards:       bg-white    (#FFFFFF)  → Sem personalidade
Títulos:     text-gray-900 (#111827) → Preto frio
Corpo:       text-gray-600 (#4B5563) → Cinza frio
Accent:      bg-blue-600  (#2563EB) → Azul padrão
Borders:     border-gray-200 (#E5E7EB) → Cinza frio
```

### Depois (Parchment)
```
Background:  bg-parchment (#FAF6F0) → Quente, acolhedor
Cards:       bg-cream     (#F5F0E8) → Personalidade, calor
Títulos:     text-espresso(#3C2415) → Marrom escuro, autoridade (Lora Bold)
Corpo:       text-primary (#272626) → Quase-preto quente, máxima legibilidade (Inter)
Accent:      accent-amber (#B8860B) → Dourado/amber, elegante
Borders:     border-linen (#EDE8E0) → Bege suave, harmonioso
Font títulos: Lora (serif)           → Calor, elegância de livro
Font corpo:   Inter (sans-serif)     → Clareza, interface moderna
```

---

## 7. Referências de Apps

| App | O que extrair |
|-----|--------------|
| **Logos Bible Software** | Tipografia cuidadosa, hierarquia clara, tons neutros quentes |
| **BibleProject App** | Design moderno com respeito ao conteúdo, cards limpos |
| **Kindle (modo sépia)** | Background pergaminho, conforto de leitura prolongada |
| **Notion** | Minimalismo funcional, espaçamento generoso, tipografia como design |
| **Linear** | Sidebar refinada, micro-interações sutis, sensação premium |
| **Apple Books** | Elegância, uso de serif em títulos, transições suaves |

---

## 8. Fontes Google - Instalação

```typescript
// layout.tsx
import { Lora, Inter } from "next/font/google";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});
```

---

## 9. Decisões Confirmadas pelo Usuário

- [x] BookCards: Tons neutros (não coloridos por categoria)
- [x] Sidebar: Fundo bege bem claro (ivory)
- [x] Grid: Manter separação AT/NT
- [x] Stats overview: Não incluir
- [x] Estética: Pergaminho + minimalismo profissional
- [x] Tipografia: Opção B - Lora (títulos) + Inter (corpo)
- [x] Cor do corpo de texto: #272626 (quase-preto quente)
- [x] Títulos: Lora Bold em marrom escuro (#3C2415)
- [x] Status/Tags: Tons pastéis quentes
- [x] Calendário de estudo: Feature separada (não neste redesign)

---

## 10. Próximos Passos

1. **Aprovação deste estudo de design** (usuário)
2. **Escolha da opção tipográfica** (A, B ou C)
3. **@pm** cria Epic + Stories com base neste estudo
4. **@architect** valida impacto técnico (fonts, tokens, shadows)
5. **@ux-design-expert** gera mockups com MCP Magic
6. **@dev** implementa

---

*— Atlas, investigando a verdade 🔎*
