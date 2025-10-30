# Regras de Negócio

> Documentação de lógica de negócio, cálculos e validações

---

## O que são?

Documentação detalhada de regras de negócio, fórmulas matemáticas, algoritmos complexos e validações específicas do domínio.

---

## Quando criar?

- Lógica de negócio complexa
- Fórmulas matemáticas
- Cálculos com múltiplas variáveis
- Algoritmos específicos do domínio
- Validações de negócio não-triviais
- Regras que mudam com frequência

---

## Por que documentar?

- 🧠 **Conhecimento explícito**: Não depender de memória
- 🔄 **Manutenibilidade**: Fácil entender e modificar
- ✅ **Validação**: Stakeholders podem revisar
- 📊 **Testes**: Base para criar testes abrangentes
- 👥 **Onboarding**: Novos devs entendem rapidamente

---

## Como documentar?

### Template de Regra de Negócio

```markdown
# Regra: [Nome da Regra]

**Domínio**: [Área do sistema]
**Impacto**: Alto / Médio / Baixo
**Complexidade**: Alta / Média / Baixa

## Descrição

[Explicação clara do que a regra faz em linguagem natural]

## Quando Aplicar

[Condições e contextos onde esta regra é aplicada]

## Fórmula / Algoritmo

### Matemática (se aplicável)
```
[Fórmula em notação matemática]
```

### Pseudocódigo
```
SE condição1 ENTÃO
  resultado = cálculo1
SENÃO SE condição2 ENTÃO
  resultado = cálculo2
SENÃO
  resultado = default
```

### Implementação
**Arquivo**: `src/utils/calculos.ts:XXX`

## Exemplos

### Exemplo 1: Caso Normal
**Input**: `{ valor1: X, valor2: Y }`
**Output**: `Z`
**Explicação**: ...

### Exemplo 2: Caso Especial
**Input**: `{ ... }`
**Output**: `...`

## Validações

- [ ] Campo X deve ser > 0
- [ ] Campo Y deve ser entre A e B
- [ ] Resultado não pode ultrapassar limite Z

## Casos de Borda

1. **E se X for zero?**: [Comportamento esperado]
2. **E se Y for negativo?**: [Comportamento esperado]
3. **E se resultado for infinito?**: [Comportamento esperado]

## Histórico

- **2025-10-27**: Criação inicial
- **YYYY-MM-DD**: [Mudança realizada]

## Referências

- [Link para requisito]
- [Link para documentação externa]
- [ADR relacionado]
```

---

## Exemplo Real: Cálculo de Ranking

```markdown
# Regra: Cálculo de Score de Performance

**Domínio**: Ranking de Jogadores
**Impacto**: Alto
**Complexidade**: Alta

## Descrição

Calcula o score de performance de um jogador com base em múltiplas métricas ponderadas por categoria.

## Fórmula

```
Score = Σ (métrica_i × peso_categoria_i) / Σ (peso_categoria_i)

Onde:
- métrica_i = valor normalizado da métrica (0-100)
- peso_categoria_i = peso da categoria (1-5)
```

## Categorias e Pesos

| Categoria | Peso | Métricas |
|-----------|------|----------|
| Vitórias | 5 | Win Rate |
| Mãos | 3 | Total Hands |
| ROI | 4 | Return on Investment |

## Implementação

**Arquivo**: `src/lib/ranking/calculate-score.ts:45`

```typescript
export function calculatePerformanceScore(
  metrics: PlayerMetrics,
  weights: CategoryWeights
): number {
  const weightedSum = Object.entries(metrics).reduce(
    (sum, [category, value]) => {
      return sum + (value * weights[category]);
    },
    0
  );

  const totalWeight = Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );

  return weightedSum / totalWeight;
}
```

## Exemplos

### Exemplo 1: Jogador com Alta Performance
**Input**:
```json
{
  "metrics": {
    "winRate": 85,
    "totalHands": 90,
    "roi": 75
  },
  "weights": {
    "winRate": 5,
    "totalHands": 3,
    "roi": 4
  }
}
```

**Output**: `81.25`

**Cálculo**:
```
Score = (85×5 + 90×3 + 75×4) / (5+3+4)
      = (425 + 270 + 300) / 12
      = 995 / 12
      = 81.25
```

## Validações

- ✅ Todas as métricas devem estar entre 0 e 100
- ✅ Todos os pesos devem ser > 0
- ✅ Score final deve estar entre 0 e 100

## Casos de Borda

1. **Métrica faltando**: Usa valor 0 para aquela métrica
2. **Peso zero**: Ignora essa categoria no cálculo
3. **Divisão por zero**: Retorna 0 se soma de pesos = 0

## Histórico

- **2025-10-15**: Criação inicial
- **2025-10-20**: Adicionado peso para categoria ROI
- **2025-10-25**: Ajustado peso de vitórias de 4 para 5

## Referências

- [Feature Map: Ranking Performance](../features/ranking-performance.md)
- [ADR-005: Metodologia de Cálculo de Score](../adr/005-calculo-score.md)
```

---

## Estrutura de Arquivos

```
regras-de-negocio/
├── README.md                      # Este arquivo
├── calculos/
│   ├── score-performance.md
│   ├── roi-calculation.md
│   └── winrate-calculation.md
├── validacoes/
│   ├── validacao-cadastro.md
│   └── validacao-torneio.md
└── algoritmos/
    ├── matching-algorithm.md
    └── ranking-algorithm.md
```

---

## Boas Práticas

### ✅ Fazer

- Usar exemplos concretos com números
- Documentar casos de borda
- Manter implementação sincronizada
- Incluir referência ao código
- Usar notação matemática quando apropriado
- Validar com stakeholders

### ❌ Evitar

- Descrições vagas ou ambíguas
- Fórmulas sem exemplos
- Documentação desatualizada
- Regras muito gerais (documentar no código)
- Falta de validações

---

## Quando Atualizar

- ✅ Regra de negócio mudou
- ✅ Fórmula foi ajustada
- ✅ Novos casos de borda descobertos
- ✅ Validações adicionadas/removidas
- ✅ Stakeholders solicitaram mudança

---

**Princípio**: Se você precisa pensar 30+ segundos para lembrar como funciona, deve estar documentado aqui.
