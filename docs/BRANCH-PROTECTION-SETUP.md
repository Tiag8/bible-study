# Branch Protection Setup Guide

## Objetivo
Configurar regras de proteção na branch `main` para garantir qualidade de código e prevenir bugs.

## Passos para Configurar

### 1. Acessar Settings do Repositório
- Go to: `https://github.com/username/bible-study/settings/branches`
- Se não for admin, pedir para alguém com permissão fazer isso

### 2. Clique em "Add rule" ou selecione "main"

### 3. Configure as Seguintes Regras:

#### **Branch name pattern**
```
main
```

#### **Protect matching branches**
✅ Marcar:
- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [x] Require code reviews before merging (1 approval mínimo)
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass (select all):
  - `test (Unit Tests & Type Check)`
  - `build (Build Validation)`
  - `coverage (Code Coverage)`

#### **Status Checks Requeridas**
Selecionar:
```
test
build
coverage
```

#### **Restricting who can push**
- Deixar em branco (todos com acesso ao repo)

#### **Include administrators**
✅ Marcar para também aplicar regras a admins

### 4. Clique "Save changes"

## Resultado Esperado

Após configurar, toda PR para `main` vai:
1. ✅ Rodar testes (unit + integration)
2. ✅ Validar build
3. ✅ Checar cobertura de testes
4. ✅ Esperar código review
5. ✅ Só depois permitir merge

## CI/CD Status Badge (opcional)

Adicionar ao README.md:
```markdown
[![Tests & Quality](https://github.com/username/bible-study/actions/workflows/test.yml/badge.svg)](https://github.com/username/bible-study/actions/workflows/test.yml)
```

## Troubleshooting

**"Require status checks to pass" appears but CI jobs not running?**
- Garantir que `.github/workflows/test.yml` existe
- Fazer push da branch com CI/CD changes
- Aguardar ~30 segundos para GitHub reconhecer o workflow

**Cannot find option?**
- Pode estar em "Branch protection rule" (novo) ou "Rulesets" no GitHub Enterprise
- Versão newer do GitHub mudou a interface

## Próximos Passos

1. Testar com uma PR fake: `git checkout -b test/branch-protection`
2. Fazer pequena mudança
3. Push e criar PR
4. Validar que testes rodaram automaticamente
5. Validar que merge não é permitido até tudo passar
6. Delete a PR de teste

---

**Status**: ✅ Ready to configure
**Permissões Necessárias**: Admin ou Maintainer do repo
