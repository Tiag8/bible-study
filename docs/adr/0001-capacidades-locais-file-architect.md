# ADR 0001: Capacidades locais declaradas na campanha EP60-S6.0

## Contexto

A migracao estrutural cross-repo (EP60-S6.0) rodou o censo do file-architect
contra o perfil canonico. Os itens abaixo sao raizes ou prefixos legitimos
deste repositorio que o perfil canonico global nao cobre, e ficam declarados
aqui em vez de forcados para dentro de uma capability generica.

## Decisao

- **capability_roots** `e2e` (capability: `tests`): raiz de testes end-to-end (Playwright), convencao separada de tests/ unitario

## Status

Aceito.
