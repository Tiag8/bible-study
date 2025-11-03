# Smoke Tests LGPD + Interactive Buttons

## Descrição

Script de testes automatizados para validar o deploy da feature LGPD + Buttons interativos no WhatsApp.

## Funcionalidades Testadas

### 1. Edge Function Code (Pré-deploy check)
- ✅ Verifica se `sendConsentMenu()` existe no código
- ✅ Verifica se `extractButtonPayload()` existe no código
- ✅ Verifica se há suporte a botões (`buttonsResponseMessage`, `listResponseMessage`)

### 2. Variáveis de Ambiente (Pré-deploy check)
- ✅ Verifica se `.env` contém variáveis necessárias:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `UAZAPI_INSTANCE_TOKEN`
  - `UAZAPI_WEBHOOK_SECRET`

### 3. Webhook WhatsApp Ativo
- ✅ Verifica se Edge Function responde (qualquer HTTP status = ativo)
- ⏱️ Timeout de 10s

### 4. Página /privacy-whatsapp (Production + Staging)
- ✅ Verifica se retorna HTTP 200
- ✅ Verifica se contém conteúdo LGPD (keywords: "privacidade", "LGPD", "WhatsApp")
- ⏱️ Timeout de 15s

## Como Usar

### Execução Local (Pré-deploy)
```bash
# Rodar testes antes de fazer deploy
node scripts/smoke-test-lgpd-buttons.js
```

### Interpretação dos Resultados

#### ✅ Todos os testes passaram (100% sucesso)
```
╔════════════════════════════════════════════════════════════╗
║          ✓ TODOS OS TESTES PASSARAM COM SUCESSO!          ║
╚════════════════════════════════════════════════════════════╝

Feature LGPD + Buttons validada e pronta para deploy!
```
**Ação**: Pode fazer deploy com segurança.

#### ⚠️ Alguns testes falharam (80-99% sucesso)
```
╔════════════════════════════════════════════════════════════╗
║        ⚠ ALGUNS TESTES FALHARAM (>80% sucesso)            ║
╚════════════════════════════════════════════════════════════╝

Feature pode estar funcional, mas revise os testes que falharam
```
**Ação**: Revisar testes que falharam. Se for apenas Staging ou variáveis de ambiente opcionais, pode deployar.

#### ❌ Muitos testes falharam (<80% sucesso)
```
╔════════════════════════════════════════════════════════════╗
║           ✗ MUITOS TESTES FALHARAM (<80% sucesso)         ║
╚════════════════════════════════════════════════════════════╝

Feature não está pronta para deploy!
```
**Ação**: NÃO fazer deploy. Corrigir problemas e rodar novamente.

## Exemplo de Output

```
╔════════════════════════════════════════════════════════════╗
║      Life Tracker - Smoke Tests LGPD + Buttons             ║
╚════════════════════════════════════════════════════════════╝

ℹ Iniciando smoke tests...

━━━ TESTE 3: Edge Function possui novas funções (pré-deploy check)
✓ PASSOU: Edge Function possui novas funções

━━━ TESTE 4: Variáveis de ambiente necessárias (pré-deploy check)
✓ PASSOU: Variáveis de ambiente configuradas

━━━ TESTE 1: Webhook WhatsApp está ativo
URL: https://ybxznkqqjifchvkigqnr.supabase.co/functions/v1/webhook-whatsapp-adapter
Verificando...
✓ PASSOU: Webhook está ativo

━━━ TESTE 2: Página /privacy-whatsapp está acessível
URL: https://life-tracker.stackia.com.br/privacy-whatsapp
Verificando...
✓ PASSOU: Página /privacy-whatsapp acessível

ℹ
Testando ambiente STAGING:
✓ PASSOU: Página /privacy-whatsapp acessível

╔════════════════════════════════════════════════════════════╗
║                    RESUMO DOS TESTES                       ║
╚════════════════════════════════════════════════════════════╝

Total de testes: 6
Testes passaram: 6
Testes falharam: 0
Taxa de sucesso: 100%

Detalhes:
┌─────────┬──────────────────────────────────────┬────────┬────────────────────────────────────────────┐
│ (index) │ test                                 │ status │ details                                    │
├─────────┼──────────────────────────────────────┼────────┼────────────────────────────────────────────┤
│ 0       │ 'Edge Function possui novas funções' │ 'PASS' │ 'sendConsentMenu: ✓, extractButtonPayload │
│ 1       │ 'Variáveis de ambiente configuradas' │ 'PASS' │ 'Todas variáveis presentes'                │
│ 2       │ 'Webhook está ativo'                 │ 'PASS' │ 'HTTP 405 - Edge Function está respondend  │
│ 3       │ 'Página /privacy-whatsapp acessível' │ 'PASS' │ 'HTTP 200 - Página carregada com conteúdo  │
│ 4       │ 'Página /privacy-whatsapp acessível' │ 'PASS' │ 'HTTP 200 - Página carregada com conteúdo  │
│ 5       │ 'Ambos ambientes funcionando'        │ 'PASS' │ 'Production e Staging OK'                  │
└─────────┴──────────────────────────────────────┴────────┴────────────────────────────────────────────┘
```

## Troubleshooting

### "Webhook está ativo" falha com "fetch failed"
**Causa**: Problema de rede ou Edge Function não deployada.

**Solução**:
1. Verificar se Edge Function foi deployada: `supabase functions list`
2. Testar manualmente: `curl https://ybxznkqqjifchvkigqnr.supabase.co/functions/v1/webhook-whatsapp-adapter`
3. Verificar logs: Supabase Dashboard > Edge Functions > webhook-whatsapp-adapter > Logs

### "Página /privacy-whatsapp" falha com "não contém termos esperados"
**Causa**: Build do frontend não incluiu página PrivacyWhatsApp.

**Solução**:
1. Verificar se arquivo existe: `src/pages/PrivacyWhatsApp.tsx`
2. Verificar rota no `App.tsx`: `<Route path="/privacy-whatsapp" element={<PrivacyWhatsApp />} />`
3. Rebuild e redeploy: `npm run build && ./scripts/deploy-vps.sh production`

### "Variáveis de ambiente configuradas" falha
**Causa**: `.env` não contém todas variáveis necessárias.

**Solução**:
1. Copiar de `.env.example`: `cp .env.example .env`
2. Preencher valores faltantes
3. Verificar secrets no Supabase: `supabase secrets list`
4. Definir secrets faltantes: `supabase secrets set KEY=value`

## Integração com CI/CD

### Pre-deploy Hook
```bash
# Em scripts/deploy-vps.sh, adicionar antes de deploy:
echo "🧪 Running smoke tests..."
node scripts/smoke-test-lgpd-buttons.js

if [ $? -ne 0 ]; then
  echo "❌ Smoke tests falharam! Deploy abortado."
  exit 1
fi

echo "✅ Smoke tests passaram! Continuando deploy..."
```

### Post-deploy Validation
```bash
# Após deploy, validar produção:
echo "🧪 Validating production deploy..."
node scripts/smoke-test-lgpd-buttons.js

if [ $? -ne 0 ]; then
  echo "❌ Validação falhou! Considere rollback."
  exit 1
fi
```

## Arquivos Relacionados

- **Edge Function**: `supabase/functions/webhook-whatsapp-adapter/index.ts`
- **Página Privacidade**: `src/pages/PrivacyWhatsApp.tsx`
- **Roteamento**: `src/App.tsx`
- **Variáveis de ambiente**: `.env`, `.env.example`
- **Deploy Script**: `scripts/deploy-vps.sh`

## Versão

**v1.0** (2025-11-02)
- Testes iniciais para feature LGPD + Buttons
- 6 testes: Edge Function code, env vars, webhook, privacy page (2 ambientes)
- Output colorido e tabela de resultados

## Autor

Life Tracker Team
