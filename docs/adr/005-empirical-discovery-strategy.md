# ADR 005: Discovery Empírico como Estratégia de Integração

**Status**: ✅ Aceito e Validado
**Data**: 2025-11-02
**Autor(es)**: Tiago
**Decisão Substituída**: N/A (nova estratégia metodológica)

---

## Contexto

Durante a implementação da integração UAZAPI para WhatsApp (ADR 004), foi descoberto empiricamente que a documentação oficial da UAZAPI continha **inconsistências críticas** que impediram implementação direta. Autenticação usava header customizado `token` (não padrão Bearer), e exemplos faltavam detalhe essencial.

**Problema**: Como proceder quando documentação de API externa é inadequada ou inconsistente? Esperar suporte oficial (semanas) ou utilizar empirismo sistemático?

**Por que precisamos tomar essa decisão?**
- Documentação UAZAPI tinha gaps e inconsistências (exemplos incompletos, headers não mencionados explicitamente)
- Suporte UAZAPI responderia em 2-3 dias (inadequado para MVP tempo-crítico)
- Discovery empírico (curl, Postman, testes) identificou problema em < 3h de trabalho
- Projeto precisa de estratégia replicável para lidar com APIs de terceiros

**Stakeholders envolvidos**:
- Developer (solo) - responsável por implementação e descoberta
- Projeto Life Tracker - depende de integração rápida UAZAPI
- Futuros developers - herdarão conhecimento de descoberta

**Restrições**:
- Tempo: MVP precisa de WhatsApp em dias, não semanas
- Documentação: Não pode contar com docs oficiais perfeitas (realidade de terceiros)
- Confiabilidade: Descobertas devem ser validadas sistematicamente (não adivinhar)
- Documentação: Learnings devem ser registrados internamente

---

## Opções Consideradas

### Opção 1: Discovery Empírico Sistemático ⭐ (Escolhida)

**Descrição**:
Utilizar empirismo sistemático como estratégia legítima quando documentação é inadequada. Método: testes iterativos (curl/Postman), isolamento de variáveis, validação com requests reais, documentação de descobertas em ADR/testes.

**Prós**:
- ✅ **Rápido**: Identifica problemas em 2-3h (vs dias esperando suporte)
- ✅ **Concreto**: Validado com requests reais (não especulação)
- ✅ **Sistemático**: Isolamento de variáveis, não cargo cult programming
- ✅ **Documentado**: Learnings registrados em ADR, código, testes
- ✅ **Replicável**: Próximas APIs podem usar mesma abordagem
- ✅ **Economia**: 30-50% economia de tempo (vs esperar + suporte + trial/error cego)
- ✅ **Transferência conhecimento**: Tests automatizados previnem regressão futura

**Contras**:
- ❌ **Tempo inicial**: 2-3h de discovery (não instantâneo como docs corretas)
- ❌ **Pode falhar**: Se API mudar behavior, descobertas viram obsoletas
- ❌ **Requer expertise**: Precisa de developer experiente em debugging
- ❌ **Percepção**: Pode ser visto como "workaround" vs "solução oficial"
- ❌ **Scope creep**: Fácil gastar muito tempo em edge cases minor

**Complexidade**:
- Implementação: **Média** (requer debug skills, isolamento variáveis)
- Manutenção: **Baixa** (tests validam behavior, alertam se API muda)

**Custo (tempo/recursos)**:
- Setup initial: 2-3h (discovery empírico UAZAPI)
- Documentação: 1h (escrever ADR, comentários código, tests)
- ROI: 30-50% economia (7h total vs 10-12h+ esperando suporte)

**Score técnico**: **8.2/10**
- Velocidade: 9/10 (2-3h vs dias esperando)
- Confiabilidade: 8/10 (validado com requests reais)
- Escalabilidade: 7/10 (requer expertise per API)
- Documentação: 8/10 (ADR + tests + código comentado)
- Legitimidade técnica: 8/10 (cientificamente válido)

---

### Opção 2: Esperar Suporte Oficial Corrigir Documentação

**Descrição**:
Aguardar resposta de suporte UAZAPI para clarificação de autenticação e inconsistências na documentação. Abordagem "formal" de confiar em vendor oficial.

**Prós**:
- ✅ **Oficial**: Resposta vem direto do vendor (máxima confiabilidade)
- ✅ **Documentação**: Suporte pode fornecer exemplos corretos
- ✅ **Sem risco**: Não há chance de descobertas estarem erradas
- ✅ **Percepção**: Visto como abordagem "correta" e profissional

**Contras**:
- ❌ **Tempo**: 2-3 dias resposta suporte (MVP atrasa)
- ❌ **Incerto**: Suporte pode não responder ou ser vago
- ❌ **Bloqueado**: Developer fica esperando, não pode progredir
- ❌ **Economia baixa**: Mesmo esperando, ainda precisa tester tudo
- ❌ **Realidade**: APIs de terceiros frequentemente têm docs ruins (problema crônico)

**Por que foi rejeitada?**:
Esperar suporte oficial é **subótimo para MVP tempo-crítico**. UAZAPI suporte responderia em 2-3 dias (atrasa launch), e não há garantia resposta seja útil (ambígua). Empirismo valida real behavior em < 3h. Trade-off **clareza oficial vs velocidade MVP** favorece velocidade para validação de produto.

**Score técnico**: **5.0/10**
- Velocidade: 2/10 (dias esperando)
- Confiabilidade: 10/10 (suporte oficial)
- Praticidade MVP: 3/10 (atrasa crítico path)
- Custo: 4/10 (perda opportunity)

---

### Opção 3: Usar Outro Provider com Melhor Documentação

**Descrição**:
Rejeitar UAZAPI e escolher provider WhatsApp alternativo com documentação superior (ex: Twilio, WhatsApp Business API).

**Prós**:
- ✅ **Sem discovery needed**: Documentação correta desde início
- ✅ **Profissional**: Vendor estabelecido com suporte excelente
- ✅ **Sem workarounds**: Implementação direta em docs oficiais

**Contras**:
- ❌ **Custo prohibitivo**: Twilio/Meta custam 5-10x mais (não viável MVP)
- ❌ **Setup longo**: Meta Business API 1-2 semanas aprovação
- ❌ **Locked in**: Muda de vendor = reescrever integrações
- ❌ **Over-engineering**: 80% features não usadas em MVP
- ❌ **Tempo loss**: 2-3 semanas setup vs 2 dias UAZAPI + empirismo

**Por que foi rejeitada?**:
Trocar provider por causa de docs ruins **sacrifica custo/velocidade por "conveniência documentation"**. UAZAPI é 10x mais rápido (2 dias vs 2-3 semanas Meta) + 5x mais barato (R$50/mês vs R$250+). Empirismo resolve problema documentation com 2-3h de trabalho, não justifica trocar vendor.

**Score técnico**: **6.5/10**
- Documentação: 9/10 (excelente)
- Custo: 3/10 (prohibitivo MVP)
- Velocidade: 2/10 (semanas setup)
- Pragmatismo MVP: 2/10 (não viável)

---

## Decisão

**Decidimos adotar a Opção 1**: Discovery Empírico Sistemático

**Justificativa**:
Discovery empírico **não é workaround, é abordagem técnica legítima** quando documentação é inadequada. Validado com testes reais, documentado em ADR/código, transformado em testes automatizados - isso é engenharia sólida. Projeto valida que empirismo economiza **30-50% tempo** comparado a alternativas (esperar suporte, trocar vendor).

**Critérios de decisão**:
1. **Velocidade MVP** (critério crítico) ✅ empirismo 2-3h vs suporte 2-3 dias
2. **Custo total** ✅ empirismo R$50/mês UAZAPI vs R$250+ alternativas
3. **Confiabilidade científica** ✅ testes reais > especulação > docs ruins
4. **Replicabilidade** ✅ próximas APIs podem usar mesma estratégia
5. **ROI documentação** ✅ ADR 005 + tests previnem regressão futura

**Fatores decisivos**:
- **Economia temporal**: 7h total (3h discovery + 2h testes + 2h docs) vs 10-15h+ alternativas
- **Validação real**: Requests HTTP concretas > especulação theoretical
- **Knowledge transfer**: Tests + ADR + código comentado = expertise compartilhado
- **Precedente**: Estratégia testada com sucesso UAZAPI, replicável

---

## Consequências

### Positivas ✅

- **Velocidade MVP**: Discovery empírico 3h vs suporte 3 dias = 24x mais rápido
- **Economia de custo**: UAZAPI empirismo vs Meta/Twilio = 5-10x mais barato
- **Estratégia replicável**: Próximas integrações (Telegram, SMS, email) podem usar método
- **Documentação interna**: ADR 005 + tests + comentários suprem gaps vendor
- **Validação científica**: Requests reais > especulação > confiança cega em docs
- **Testes automatizados**: Descobertas transformadas em tests (previnem regressão)
- **Autonomia**: Developer não fica bloqueado esperando suporte terceiros
- **Knowledge sharing**: ADR + code documenta rationale para futuros developers

### Negativas ❌

- **Tempo initial de discovery**: 2-3h investimento inicial (não zero)
- **Expertise required**: Requer developer experiente em debugging HTTP
- **Percepção "hacky"**: Pode ser visto como workaround vs solução official
- **Risco obsolescência**: Se API muda, descobertas ficam obsoletas
- **Scope creep**: Fácil gastar tempo em edge cases minor vs 80/20
- **Não escalável per-infinito**: Cada API requer novo discovery (não é silver bullet)
- **Documentation gaps**: Se não documentar bem, conhecimento fica disperso

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Discovery invalida / API behavior muda | Média | Médio | Tests automatizados alertam mudanças. Monitorar logs webhook. |
| Scope creep discovery (gastar dias vs 3h) | Média | Médio | Time-box: máximo 4h discovery. Se não encontrar, escalar para Opção 2. |
| Developer faz empirismo cego (cargo cult) | Baixa | Médio | Code review + ADR + testes validam. Não aceitar "acho que funciona". |
| Documentação interna desatualizada | Média | Baixo | ADR + tests como source of truth. Docs derivam destes. |
| Outro developer não entende rationale | Baixa | Baixo | ADR 005 this document explica metodologia. Code comments dizem "por quê". |

---

## Alternativas Rejeitadas

**Opção 2 (Esperar Suporte)** foi rejeitada porque:
- Tempo: 2-3 dias atrasa MVP crítico
- Incerteza: Suporte pode não responder adequadamente
- Trade-off: Não justifica sacrificar velocidade por clareza official
- Realidade: Docs ruins é problema crônico de APIs terceiros (não vai resolver)

**Opção 3 (Trocar Provider)** foi rejeitada porque:
- Custo: 5-10x mais caro (não viável MVP)
- Velocidade: 2-3 semanas setup vs 2 dias empirismo
- Lock-in: Trocar vendor depois = reescrever tudo
- Pragmatismo: Empirismo resolve problema em 2-3h (não justifica trocar)

---

## Plano de Implementação

### Fase 1: Validação Empírica (Concluído ✅)
- [x] Teste manual com curl/Postman (header auth)
- [x] Validar request/response UAZAPI
- [x] Documentar descobertas em comentários inline
- [x] Confirmar behavior com requests reais

**Tempo real**: 3h

### Fase 2: Transformar em Testes Automatizados (Concluído ✅)
- [x] Criar testes unitários validando auth header
- [x] Testes webhook HMAC-SHA256
- [x] Testes message types (text, image, etc)
- [x] Testes error handling (429, timeout, etc)

**Tempo real**: 2h

### Fase 3: Documentação Interna (Concluído ✅)
- [x] Escrever ADR 005 (este documento)
- [x] Comentários código explicando "por quê" empirismo
- [x] Documentação técnica UAZAPI em `docs/UAZAPI_INTEGRATION.md`
- [x] Registrar descobertas em ADR 004 (seção "Discovery Empírico")

**Tempo real**: 1h

### Fase 4: Knowledge Transfer (Futuro)
- [ ] Code review com documentação de rationale
- [ ] Training futuro developer em metodologia discovery
- [ ] Aplicar método a próximas integrações (Telegram, SMS, email)

**Tempo estimado**: 2h (quando houver novo developer)

---

## Métricas de Sucesso

**Como saberemos que a decisão foi boa?**

- [x] **Discovery time < 3h**: Validado, UAZAPI foi 3h total ✅
- [x] **ROI > 30%**: 7h total vs 10h+ (42% economia) ✅
- [ ] **Próxima integração < 3h**: Aplicar método a Telegram/SMS
- [ ] **Zero regressão no behavior**: Tests detectam mudanças API
- [ ] **Knowledge retention**: Documentação permite onboard novos developers
- [ ] **Team adoption**: Team usa estratégia para futuras integrações

**Revisão agendada**: **2025-12-31** (validar replicabilidade em próximas APIs)

**Critérios de revisão**:
- Se próxima integração também usa empirismo com sucesso: validou-se estratégia ✅
- Se discovery > 4h em próxima API: revisar metodologia (muito tempo)
- Se descobertas viram obsoletas (API mudou): mitigar com tests mais robustos
- Se team não adota estratégia: revisar comunicação/treinamento

---

## Exemplos Reais: UAZAPI Discovery

### Exemplo 1: Header Autenticação

**Problema**: Docs UAZAPI não mencionam formato exato do header auth.

**Tentativas**:
```bash
# Tentativa 1: Padrão Bearer (fracassou)
curl -X POST https://api.uazapi.com/messages \
  -H "Authorization: Bearer token_aqui" \
  # 401 Unauthorized ❌

# Tentativa 2: Header "Authorization" (fracassou)
curl -X POST https://api.uazapi.com/messages \
  -H "Authorization: token_aqui" \
  # 401 Unauthorized ❌

# Tentativa 3: Header "token" (SUCCESS ✅)
curl -X POST https://api.uazapi.com/messages \
  -H "token: token_aqui" \
  # 200 OK ✅
```

**Descoberta**: UAZAPI usa header customizado `token` (não padrão).

**Tempo**: ~30min de discovery

**Documentação agora**: ADR 004 seção "Discovery Empírico" + código comentado

**Test automático**:
```javascript
test('UAZAPI auth requires token header, not Bearer', async () => {
  const response = await fetch('https://api.uazapi.com/messages', {
    method: 'POST',
    headers: {
      'token': process.env.UAZAPI_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({...})
  });
  expect(response.status).toBe(200);
});
```

### Exemplo 2: Webhook HMAC Validation

**Problema**: Docs UAZAPI mencionam signature, mas não detalham algoritmo.

**Hipóteses testadas**:
1. Signature é MD5 (not commonly used)
2. Signature é SHA1 (legacy)
3. Signature é SHA256 (modern padrão) ✅

**Descoberta**: UAZAPI usa HMAC-SHA256 em header `x-webhook-signature`

**Tempo**: ~1h discovery + validação

**Documentação agora**: ADR 004 seção "Webhook HMAC Validation" + test

**Test automático**:
```javascript
test('Webhook signature validates HMAC-SHA256', async () => {
  const payload = {...};
  const signature = crypto
    .createHmac('sha256', process.env.UAZAPI_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  const webhookSignature = req.headers['x-webhook-signature'];
  expect(webhookSignature).toBe(signature);
});
```

### Exemplo 3: Message Types Suportados

**Problema**: Docs listam tipos possíveis mas sem exemplos detalhados.

**Discovery sistemático**:
- Testar cada tipo (text, image, document, audio, video, location)
- Validar formato correto (URL pública? Base64? Direct file?)
- Documentar resposta sucesso/erro para cada

**Descoberta**: UAZAPI suporta 6 tipos, requer URLs públicas (não upload)

**Documentação agora**: Tabela em `docs/UAZAPI_INTEGRATION.md`

**Test automático**: Testes e2e de cada type

---

## Metodologia: Como Fazer Discovery Empírico Bem

### 1. Preparação
- Ler docs (mesmo que ruins)
- Identificar gaps/inconsistências
- Listar hipóteses a testar

### 2. Testes Isolados
- Testar **uma variável por vez**
- Usar curl/Postman para requests HTTP reais
- Documentar response exato (status, headers, body)
- Não mudar 3 coisas simultaneamente

### 3. Validação
- Repetir teste 2-3x (confirmar consistent)
- Testar edge cases (empty strings, special chars, etc)
- Testar error cases (invalid input, rate limit, etc)

### 4. Documentação
- Registrar descobertas em ADR
- Adicionar comentários inline em código
- Criar tests automatizados
- Atualizar docs internas

### 5. Knowledge Transfer
- Explicar rationale em code review
- Documentar "por quê" não apenas "o quê"
- Permettir que futuro developer entenda

---

## Por que isso é Engenharia, não Hackers?

**Diferença crítica**:

| Cargo Cult Programming (❌) | Discovery Empírico (✅) |
|-----|-----|
| "Copiar exemplo sem entender" | "Testar hypothesis sistematicamente" |
| "Acho que funciona" | "Validei com requests reais" |
| Sem documentação | ADR + tests + código comentado |
| Comportamento mágico | Rationale explicada |
| Quebra quando contexto muda | Tests alertam mudanças |

**Discovery empírico bem feito**:
1. ✅ Sistematicamente testa variáveis isoladas
2. ✅ Valida com dados reais (não especulação)
3. ✅ Documenta descobertas
4. ✅ Transforma em tests automatizados
5. ✅ Permite replicação por outros developers
6. ✅ Scientificamente válido (método empírico)

---

## Quando NÃO Usar Discovery Empírico

**Não use empirismo para**:
- [ ] Análise de security (use security audit formal)
- [ ] Compliance crítico (HIPAA, PCI, GDPR) - exige documentação official
- [ ] Coisas que poderiam quebrar em produção sem teste prévio
- [ ] APIs bem documentadas (tempo desperdiçado)

**Use apenas quando**:
- [x] Docs são inadequadas/inconsistentes
- [x] Suporte oficial é lento
- [x] Tempo-crítico (MVP, product validation)
- [x] Risco baixo-médio (não mission-critical primeiro)
- [x] Developer experiente (não junior)

---

## Referências

- **ADR 004**: `docs/adr/004-uazapi-whatsapp-integration.md` (decisão que usou empirismo)
- **UAZAPI Integration**: `docs/UAZAPI_INTEGRATION.md` (guia prático com descobertas)
- **Tests**: `supabase/functions/webhook-whatsapp-adapter/__tests__/` (validações automáticas)
- **Código**: `supabase/functions/webhook-whatsapp-adapter/index.ts` (implementação com comments)
- **Empirical Method (Wikipedia)**: https://en.wikipedia.org/wiki/Empiricism
- **Scientific Method**: https://www.scientificmethod.org/

---

## Notas Adicionais

### Por que empirismo é diferente de guesswork?

**Guesswork** (❌):
- "Mudei 3 parâmetros e funcionou, não sei qual"
- Sem documentação
- Frágil (quebra facilmente)

**Empirismo científico** (✅):
- "Testei parâmetro A (falhou), B (falhou), C (sucesso)"
- Documentado e replicável
- Robusto (tests previnem regressão)

Projeto Life Tracker pratica empirismo científico, não guesswork.

### Crítica Comum: "Mas esperar suporte é mais profissional"

**Resposta**:
Profissionalismo não é ser escravo de vendor. É **resolver problema de forma eficiente e documentada**. Se:
- ✅ Tester com hipóteses sistematicamente
- ✅ Documentar discovery em ADR
- ✅ Criar tests automatizados
- ✅ Explicar rationale para futuros developers

...isso **é profissional, é engenharia sólida**. Esperar suporte indefinidamente é ser refém.

### Próximas Oportunidades

Empirismo será aplicado a:
1. **Telegram Bot API** (próxima channel)
2. **Stripe/Payment APIs** (quando monetizar)
3. **Google Analytics API** (quando analytics crítico)
4. **Twilio SMS** (fallback WhatsApp)

Cada integração seguirá metodologia ADR 005.

---

**Última atualização**: 2025-11-02
**Revisores**: Tiago (autor + implementador)
**Status**: Aceito e Validado (empirismo UAZAPI bem-sucedido)
**Next Review**: 2025-12-31 (validar replicabilidade próximas integrações)
