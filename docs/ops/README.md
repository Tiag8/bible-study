# Operações (Ops)

> Documentação de deploy, operações e troubleshooting

---

## O que é?

Documentação de operações: deploy, configuração de ambientes, runbooks, troubleshooting, monitoramento.

---

## Quando criar?

- Setup de novo ambiente
- Processo de deploy
- Procedimento operacional
- Guia de troubleshooting
- Runbook para incidentes
- Configuração de monitoramento

---

## O que documentar?

### Deploy e CI/CD
- Processo de deploy (manual e automatizado)
- Configuração de ambientes
- Variáveis de ambiente necessárias
- Rollback procedures
- Pipeline CI/CD

### Configurações
- Configuração de serviços externos
- Credenciais e secrets (onde ficam, não os valores!)
- Configuração de DNS
- Configuração de SSL/TLS

### Monitoramento
- Dashboards e alertas
- Métricas importantes
- Logs e como acessá-los
- Health checks

### Troubleshooting
- Problemas comuns e soluções
- Procedimentos de diagnóstico
- Como debugar em produção
- Rollback procedures

### Runbooks
- Procedimento para incidentes
- Escalation paths
- Recovery procedures
- Emergency contacts

---

## Como criar?

```bash
# Criar documentos operacionais
touch docs/ops/deploy.md
touch docs/ops/environments.md
touch docs/ops/troubleshooting.md
touch docs/ops/monitoring.md
```

---

## Estrutura Sugerida

```
ops/
├── README.md                    # Este arquivo
├── deploy/
│   ├── production.md            # Deploy para produção
│   ├── staging.md               # Deploy para staging
│   └── rollback.md              # Procedimento de rollback
├── environments/
│   ├── setup-dev.md             # Setup ambiente dev
│   ├── setup-prod.md            # Setup ambiente prod
│   └── env-variables.md         # Variáveis de ambiente
├── monitoring/
│   ├── dashboards.md            # Dashboards disponíveis
│   ├── alerts.md                # Alertas configurados
│   └── logs.md                  # Como acessar logs
├── troubleshooting/
│   ├── common-issues.md         # Problemas comuns
│   ├── debugging.md             # Como debugar
│   └── performance.md           # Issues de performance
└── runbooks/
    ├── incident-response.md     # Resposta a incidentes
    └── backup-restore.md        # Backup e restore
```

---

## Template: Deploy

```markdown
# Deploy para [Ambiente]

**Ambiente**: Production / Staging / Development
**Frequência**: [Diária / Semanal / Sob demanda]
**Responsável**: [Equipe/Pessoa]

## Pré-requisitos

- [ ] Acesso ao [serviço]
- [ ] Credenciais configuradas
- [ ] Testes passando
- [ ] Code review aprovado

## Processo de Deploy

### 1. Preparação

```bash
# Verificar branch
git status

# Atualizar dependências
npm install

# Executar testes
npm run test

# Build
npm run build
```

### 2. Deploy

**Automático (CI/CD)**:
```bash
# Push para branch main
git push origin main

# Pipeline automático executará:
# - Testes
# - Build
# - Deploy
```

**Manual**:
```bash
# [Comandos específicos]
```

### 3. Verificação

- [ ] Acessar URL: [url]
- [ ] Verificar health check: [url/health]
- [ ] Testar funcionalidade crítica X
- [ ] Verificar logs para erros

### 4. Rollback (se necessário)

```bash
# [Comandos de rollback]
```

## Variáveis de Ambiente

| Variável | Descrição | Onde configurar |
|----------|-----------|-----------------|
| `DATABASE_URL` | URL do banco de dados | Vercel > Settings > Environment Variables |
| `API_KEY` | Chave da API externa | [Local] |

**IMPORTANTE**: Nunca commitar secrets no código!

## Troubleshooting

### Deploy falhou
1. Verificar logs do pipeline
2. Verificar se testes passaram localmente
3. Verificar variáveis de ambiente

### Site não carrega após deploy
1. Verificar logs da aplicação
2. Verificar health check endpoint
3. Verificar se build foi bem-sucedido

## Monitoramento Pós-Deploy

- [ ] Verificar dashboard de métricas
- [ ] Monitorar alertas por 30min
- [ ] Verificar logs de erro

## Rollback

Se necessário fazer rollback:

```bash
# [Comandos específicos de rollback]
```

**Tempo estimado**: X minutos

## Contatos

- **Equipe Dev**: [contato]
- **Suporte**: [contato]
- **Escalation**: [contato]

## Histórico

- **2025-10-27**: Documento criado
- **YYYY-MM-DD**: [Mudança no processo]
```

---

## Template: Troubleshooting

```markdown
# Troubleshooting: [Problema]

**Sintoma**: [Descrição do problema]
**Severidade**: 🔴 Crítico / 🟡 Médio / 🟢 Baixo
**Impacto**: [Quem/o que afeta]

## Diagnóstico

### 1. Verificar Sintomas

- [ ] [Sintoma 1]
- [ ] [Sintoma 2]

### 2. Coletar Informações

```bash
# Verificar logs
tail -f /var/log/app.log

# Verificar status
curl http://api.example.com/health
```

### 3. Identificar Causa

**Causas Possíveis**:
1. [Causa 1]
2. [Causa 2]
3. [Causa 3]

## Solução

### Solução 1: [Nome]

**Quando usar**: [Condição]

**Passos**:
```bash
# 1. [Passo 1]
# 2. [Passo 2]
```

**Verificação**:
- [ ] [Como verificar que resolveu]

### Solução 2: [Nome]

[Mesma estrutura]

## Prevenção

Como evitar que isso aconteça novamente:
- [ ] [Ação preventiva 1]
- [ ] [Ação preventiva 2]

## Escalation

Se as soluções acima não funcionarem:
1. Contatar [equipe/pessoa]
2. Abrir ticket: [link]
3. Slack: [#canal]

## Histórico de Ocorrências

- **2025-10-27**: Ocorreu em [ambiente], resolvido com [solução]
```

---

## Template: Runbook

```markdown
# Runbook: [Tipo de Incidente]

**Tipo**: [Database Down / API Slow / etc]
**Severidade**: 🔴 P1 / 🟡 P2 / 🟢 P3
**SLA**: [Tempo de resposta esperado]

## Identificação

### Alertas
- [ ] [Nome do alerta 1]
- [ ] [Nome do alerta 2]

### Sintomas
- [Sintoma observável 1]
- [Sintoma observável 2]

## Resposta Imediata

### 1. Avaliação (primeiros 5 min)

```bash
# Verificar saúde geral do sistema
[comandos]

# Verificar logs recentes
[comandos]
```

### 2. Mitigação Temporária (se aplicável)

```bash
# [Comandos para mitigar temporariamente]
```

### 3. Comunicação

- [ ] Notificar stakeholders
- [ ] Atualizar status page: [url]
- [ ] Postar em #incidents

**Template de Comunicação**:
```
🔴 INCIDENTE DETECTADO

Tipo: [tipo]
Impacto: [descrição]
Status: Investigando / Mitigando / Resolvendo
ETA: [estimativa]

Updates: [frequência]
```

## Resolução

### Passo 1: [Nome do Passo]

**Objetivo**: [O que este passo faz]

```bash
# Comandos
```

**Verificação**:
- [ ] [Como verificar sucesso]

### Passo 2: [Nome do Passo]

[Continuar até resolução]

## Verificação de Resolução

- [ ] Sistema voltou ao normal
- [ ] Métricas estabilizaram
- [ ] Alertas silenciados
- [ ] Testes manuais OK

## Post-Mortem

Após resolver, agendar post-mortem:

**Template**: `docs/ops/post-mortems/YYYY-MM-DD-incident.md`

**Agenda**:
- [ ] O que aconteceu (timeline)
- [ ] Causa raiz
- [ ] Como foi resolvido
- [ ] Action items para prevenir

## Contatos

- **On-call**: [contato]
- **Engineering Lead**: [contato]
- **CTO**: [contato]
- **External Support**: [contato]

## Ferramentas

- **Logs**: [link para ferramenta de logs]
- **Métricas**: [link para dashboard]
- **Status Page**: [link]
- **Incident Management**: [link]
```

---

## Boas Práticas

### ✅ Fazer

- Manter procedimentos atualizados
- Testar runbooks regularmente
- Incluir comandos exatos (copy-paste)
- Documentar após cada incidente
- Revisar e melhorar continuamente

### ❌ Evitar

- Procedimentos vagos ou ambíguos
- Documentação desatualizada
- Assumir conhecimento prévio
- Falta de exemplos concretos
- Esquecer de documentar credenciais (onde encontrar)

---

## Quando Atualizar

- ✅ Processo de deploy mudou
- ✅ Novo ambiente adicionado
- ✅ Incidente ocorreu e foi resolvido
- ✅ Ferramenta mudou (ex: novo dashboard)
- ✅ Runbook foi testado e melhorado

---

**Princípio**: Documentação ops deve ser prática, clara e testada. Se você não consegue executar sozinho seguindo a doc, ela precisa melhorar.
