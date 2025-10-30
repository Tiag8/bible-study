# Exemplos de ADRs

Esta pasta contém **exemplos reais de ADRs** do projeto CLTeam para servir de referência.

## ADRs Inclusos

1. **002-adocao-do-supabase.md** - Decisão de adotar Supabase como BaaS
   - Exemplo de ADR completo sobre escolha de tecnologia
   - Inclui comparação detalhada de alternativas
   - Demonstra análise de trade-offs técnicos e de negócio
   - Métricas de sucesso e plano de mitigação de riscos

2. **005-uso-de-typescript-any.md** - Estratégia para lidar com TypeScript `any`
   - Exemplo de ADR sobre convenções de código
   - Estratégia gradual de implementação
   - Abordagem prática para melhorar qualidade de código

## Como Usar

Estes são exemplos reais de um projeto em produção. Use-os como inspiração para:
- **Estrutura de um ADR completo**: Contexto, Decisão, Consequências, Implementação
- **Nível de detalhamento apropriado**: Suficiente para entender sem ser verboso
- **Como documentar prós/contras**: Análise equilibrada de alternativas
- **Como registrar decisões técnicas**: Justificativas claras e acionáveis

## Estrutura Recomendada de um ADR

```markdown
# ADR XXX: Título da Decisão

## Status
[Proposto | Aceito | Depreciado | Substituído]

## Contexto
Descreva o problema ou situação que motivou a decisão

## Decisão
A decisão tomada e como será implementada

## Consequências
### Positivas
- Benefícios da decisão

### Negativas
- Trade-offs e limitações

## Alternativas Consideradas
Outras opções avaliadas e por que não foram escolhidas

## Referências
Links, documentação, discussões relevantes
```

## Fonte

- **Projeto**: CLTeam (Dashboard de Poker)
- **Data**: 2025-10
- **Autor**: Tiago + Claude Code

## Mais Informações

Para entender melhor o conceito de ADRs:
- [Architecture Decision Records (ADR)](https://adr.github.io/)
- [ADR Tools e Templates](https://github.com/joelparkerhenderson/architecture-decision-record)
