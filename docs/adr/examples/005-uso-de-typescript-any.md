# ADR 005: Uso de TypeScript `any` e Estratégia de Tipagem

## Status
✅ **Aceito** (2025-10-28)

## Contexto

O projeto CLTeam usa TypeScript em modo strict, mas existem **múltiplos warnings de ESLint** relacionados a `@typescript-eslint/no-explicit-any`:

```
Arquivos com warnings (detectados em 2025-10-28):
- src/components/ActivityHeatmapCalendar.tsx
- src/components/ClassEditModal.tsx
- src/components/ClassRegistrationTable.tsx
- src/components/MeetingActions.tsx
- src/components/makeup/*.tsx (vários arquivos)
- ... e outros
```

###Problemas

1. **Poluição do output**: ESLint roda a cada build/lint e mostra dezenas de warnings
2. **Risco de regressão**: Novos devs podem adicionar `any` sem perceber
3. **Type safety reduzido**: `any` desabilita verificação de tipos
4. **Manutenibilidade**: Código com `any` é mais difícil de refatorar

### Exemplos encontrados

```typescript
// ❌ EVITAR
function handleClick(event: any) {
  // TypeScript não valida event.target.value
}

const data: any = fetchData();
// Sem autocomplete, sem validação
```

## Decisão

**Adotar estratégia gradual de remoção de `any`** com as seguintes regras:

### 1. **Novos Códigos: ZERO `any`**

A partir de 2025-10-28, **TODO novo código deve ter tipagem explícita**:

```typescript
// ✅ CORRETO
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
}

type FetchResponse = {
  data: Player[];
  error: Error | null;
};
```

### 2. **Códigos Existentes: Refatorar Gradualmente**

Não refatorar tudo de uma vez (muito risco). Estratégia:

- **Prioridade Alta**: Arquivos críticos (auth, payments, database)
- **Prioridade Média**: Componentes principais (dashboard, stats, makeup)
- **Prioridade Baixa**: Componentes de UI simples

### 3. **Exceções Permitidas** (usar `// eslint-disable-next-line`)

Casos onde `any` é aceitável **temporariamente**:

```typescript
// ✅ OK: Biblioteca externa sem types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chart: any = externalLibraryWithoutTypes.create();

// ✅ OK: Dados dinâmicos do banco (marcar para refatorar)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamicData: any = await supabase.rpc('get_complex_data');
// TODO: Criar interface DynamicData
```

### 4. **Alternativas ao `any`**

Usar em ordem de preferência:

1. **Interface/Type específico** (melhor opção)
   ```typescript
   interface Player {
     id: number;
     name: string;
   }
   ```

2. **Generics** (para funções reutilizáveis)
   ```typescript
   function mapArray<T>(arr: T[], fn: (item: T) => T): T[] { ... }
   ```

3. **Union Types** (quando há opções finitas)
   ```typescript
   type Status = 'ativo' | 'desativado' | 'ferias';
   ```

4. **`unknown`** (quando tipo é realmente desconhecido)
   ```typescript
   function parseJSON(json: string): unknown {
     return JSON.parse(json);
   }
   // Depois validar com type guards
   ```

5. **`any`** (apenas com eslint-disable e justificativa)

## Consequências

### ✅ Positivas

- **Type Safety**: TypeScript previne bugs em tempo de compilação
- **Autocomplete**: IDEs sugerem propriedades/métodos corretos
- **Refatoração Segura**: Renomear propriedades atualiza todo o código
- **Documentação**: Types servem como documentação viva
- **Onboarding**: Novos devs entendem contratos de dados

### ⚠️ Atenção

- **Tempo inicial maior**: Criar interfaces leva mais tempo
- **Curva de aprendizado**: TypeScript avançado requer estudo
- **Breaking changes**: Refatorar `any` pode revelar bugs escondidos (bom!)

### ❌ Negativas

- Nenhuma identificada (os benefícios superam o custo)

## Implementação

### Script Automatizado

Criado `scripts/fix-eslint-any.sh` para:
1. Listar todos os arquivos com `any`
2. Sugerir tipos alternativos (heurísticas)
3. Criar TODOs para refatoração manual

### Pre-commit Hook

Adicionar hook para bloquear novos `any`:

```bash
# .husky/pre-commit
npx eslint $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx?|jsx?)$') \
  --rule '@typescript-eslint/no-explicit-any: error'
```

### Métricas

Monitorar progresso:

```bash
# Contar total de warnings
npm run lint 2>&1 | grep "no-explicit-any" | wc -l

# Meta: Reduzir de ~40 warnings (2025-10-28) para 0 (2025-12-31)
```

## Alternativas Consideradas

### 1. **Permitir `any` livremente**
- ❌ Perde benefícios do TypeScript
- ❌ Aumenta bugs em produção
- ❌ Dificulta manutenção

### 2. **Bloquear `any` imediatamente (error em vez de warning)**
- ❌ Muito disruptivo (quebra build)
- ❌ Requer refatorar ~40 arquivos de uma vez
- ❌ Alto risco de introduzir bugs

### 3. **Solução implementada: Gradual com pre-commit hook** ✅
- ✅ Não quebra código existente
- ✅ Previne novos `any`
- ✅ Refatoração controlada e segura

## Referências

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
- **ESLint Rule**: https://typescript-eslint.io/rules/no-explicit-any/
- **Script**: `scripts/fix-eslint-any.sh`
- **Hook**: `.husky/pre-commit`

## Notas

- **Data de implementação**: 2025-10-28
- **Meta de conclusão**: 2025-12-31 (zero `any` warnings)
- **Responsável**: Equipe de desenvolvimento (solo: Tiago)

## Checklist de Ação

- [x] Criar ADR 005
- [x] Criar script `fix-eslint-any.sh`
- [ ] Adicionar pre-commit hook (próxima melhoria)
- [ ] Refatorar arquivos críticos (prioridade alta)
- [ ] Refatorar componentes principais (prioridade média)
- [ ] Zerar warnings (meta 2025-12-31)

---

**Decisão tomada por**: Tiago + Claude Code
**Data**: 2025-10-28
**Última atualização**: 2025-10-28
