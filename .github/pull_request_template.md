# Pull Request

## Descrição
- [ ] Descreva o que foi alterado e por quê

## Checklist de Qualidade
- [ ] Segurança: sem secrets hardcoded; inputs validados; queries parametrizadas
- [ ] Testes: unit/integration/E2E conforme escopo; CI passando
- [ ] Documentação: atualizada (README, ADRs, APIs)
- [ ] Performance: sem regressões perceptíveis; análise de impacto
- [ ] Padrões: DRY, KISS, YAGNI; CoC; consistência com padrões existentes
- [ ] Escopo: mudanças apenas relacionadas à tarefa; impactos mapeados

## Itens de Segurança
- [ ] Dependências auditadas (npm audit)
- [ ] RLS/Permissões revisadas (se aplicável)

## Pós-merge
- [ ] Monitoramento/alertas verificados (se aplicável)
- [ ] Plano de rollback definido (se necessário)
