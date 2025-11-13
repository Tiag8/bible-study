# CLAUDE.md - Seções Genéricas Reutilizáveis

**Use estas seções como base para qualquer projeto**

---

## 📚 HIERARQUIA DE DOCUMENTAÇÃO

1. Este arquivo (.claude/CLAUDE.md)
2. `/Users/tiago/.codeium/windsurf/memories/global_rules.md`
3. Docs detalhadas em `docs/` (arquitetura, features, workflows)

---

## 🛠️ COMANDOS ESSENCIAIS

```bash
# Development
npm run dev
npm run build && npm run preview

# Quality Gates (PRE-COMMIT)
./scripts/run-tests.sh                 # TypeScript + ESLint + Build
./scripts/code-review.sh               # Auto review
./scripts/run-security-tests.sh        # Security scan

# Database (se usar Supabase)
supabase migration new <name>
supabase db push
./scripts/regenerate-supabase-types.sh  # Após schema changes

# Validation
ls scripts/validate-*.sh
ls scripts/*.sh | grep -E "(test|validate|check)"
```

---

## 🏗️ ARQUITETURA

```
project/
├── .claude/agents/         # Subagents especializados
├── .windsurf/workflows/    # Workflows modulares
├── .context/               # Contexto persistente
├── docs/                   # Documentação
│   ├── adr/                # Architecture Decision Records
│   ├── guides/             # Guias técnicos
│   ├── meta-learnings/     # Aprendizados sistêmicos
│   └── INDEX.md            # Hub central
├── scripts/                # Automação
│   ├── validate-*.sh       # Validações
│   ├── test-*.sh           # Testes
│   └── deploy-*.sh         # Deploy
└── src/                    # Código fonte
```

---

## 🔒 SEGURANÇA

**ZERO secrets hardcoded**:
- ✅ Usar `.env` (local) ou secrets manager (produção)
- ✅ Queries parametrizadas (SQL injection)
- ✅ RLS policies (Row Level Security)
- ✅ Input sanitization
- ✅ CORS configurado
- ✅ Rate limiting

**Validação pré-commit**:
```bash
./scripts/run-security-tests.sh
```

---

## 🧪 TESTES

**Estratégia**:
- Unit tests: Lógica de negócio
- Integration tests: APIs + DB
- E2E tests: Fluxos críticos

**Executar**:
```bash
./scripts/run-tests.sh
```

---

## 📝 CONVENÇÕES

**Naming**:
- Variáveis/funções: `camelCase`
- Componentes: `PascalCase`
- Database: `snake_case` + prefixo (ex: `project_`)
- Arquivos: `kebab-case.tsx`

**Commits**: Conventional Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração
- `test:` Testes
- `meta:` Meta-learning/workflow

---

## 🚀 DEPLOY

**Ambientes**:
- `development`: Local
- `staging`: Testes
- `production`: Produção

**Processo**:
1. Quality gates (tests + review + security)
2. Build
3. Deploy
4. Smoke tests
5. Monitor (10-15min)

**Rollback**:
```bash
./scripts/rollback.sh production
```

---

## 📊 MONITORAMENTO

**Logs**:
- Application logs
- Error tracking
- Performance metrics

**Alertas**:
- Erros críticos
- Performance degradation
- Security issues

---

## 🧠 META-LEARNING

**Sistema de melhoria contínua**:
1. Identificar problema
2. RCA (5 Whys)
3. Documentar meta-learning
4. Aplicar em workflows
5. Sincronizar com template

**Docs**: `docs/meta-learnings/`

---

## 📚 DOCS

**Estrutura**:
- `docs/INDEX.md`: Hub central
- `docs/adr/`: Decisões arquiteturais
- `docs/guides/`: Guias técnicos
- `docs/meta-learnings/`: Aprendizados sistêmicos

**Manter atualizado**:
- Após cada feature
- Após decisões importantes
- Após bugs críticos

---

**Versão**: [X.Y.Z]
**Projeto**: [Nome do Projeto]
**Última atualização**: YYYY-MM-DD
