#!/bin/bash
# ==============================================================================
# Script: validate-yagni.sh
# ==============================================================================
# Purpose: validate yagni
#
# Usage:
#   ./scripts/validate-yagni.sh [arguments]
#
# Used by:
#   - Workflow (3 references), CLAUDE.md (1 references)
#
# Exit codes:
#     1
#
# Version: 1.0.0
# Date: 2026-01-04
# ==============================================================================
# scripts/validate-yagni.sh
# Valida Anti-Over-Engineering: Framework já tem? Biblioteca cobre? Gap REAL?

set -e

set -euo pipefail

# Trap ERR to show line number on error
trap 'echo "❌ Error at line $LINENO"' ERR

echo "🔍 Validação YAGNI (Anti-Over-Engineering)"
echo ""

# Inputs
FEATURE_DESC="$1"
PROPOSED_SOLUTION="$2"

if [ -z "$FEATURE_DESC" ] || [ -z "$PROPOSED_SOLUTION" ]; then
  echo "❌ ERRO: Feature e solução obrigatórios"
  echo "Uso: ./scripts/validate-yagni.sh \"Feature X\" \"Criar componente Y\""
  exit 1
fi

echo "📋 Feature: $FEATURE_DESC"
echo "💡 Solução Proposta: $PROPOSED_SOLUTION"
echo ""

# 5 Checks Objetivos (YAGNI)
echo "🚨 5 CHECKS OBRIGATÓRIOS (YAGNI):"
echo ""

# Check 1: Framework já tem?
echo "1️⃣ Framework já tem funcionalidade similar?"
echo "   Buscar em: React docs, Vite docs, shadcn/ui, Tailwind"
read -p "   Framework tem? (s/n): " CHECK1
if [ "$CHECK1" = "s" ]; then
  read -p "   Qual componente/feature? " FRAMEWORK_FEATURE
  echo "   ⚠️ USAR FRAMEWORK: $FRAMEWORK_FEATURE"
  echo "   ❌ REJEITAR: Criar custom (over-engineering)"
  exit 1
fi
echo "   ✅ Framework NÃO tem equivalente"
echo ""

# Check 2: Biblioteca instalada cobre?
echo "2️⃣ Biblioteca instalada cobre caso de uso?"
echo "   Buscar em: package.json (47 deps)"
read -p "   Biblioteca cobre? (s/n): " CHECK2
if [ "$CHECK2" = "s" ]; then
  read -p "   Qual biblioteca? " LIBRARY
  echo "   ⚠️ USAR BIBLIOTECA: $LIBRARY"
  echo "   ❌ REJEITAR: Criar custom"
  exit 1
fi
echo "   ✅ Bibliotecas instaladas NÃO cobrem"
echo ""

# Check 3: Testou solução atual e FALHOU?
echo "3️⃣ Testou abordagem simples/nativa e FALHOU?"
echo "   Exemplo: Antes criar parser, testar Gemini structured output"
read -p "   Testou e falhou? (s/n): " CHECK3
if [ "$CHECK3" = "n" ]; then
  echo "   ❌ REJEITAR: NÃO testou alternativa simples primeiro"
  echo "   🎯 AÇÃO: Testar solução nativa → SE FALHAR: retornar aqui"
  exit 1
fi
read -p "   Evidência falha (erro/log/screenshot): " FAILURE_EVIDENCE
echo "   ✅ Testado e falhou: $FAILURE_EVIDENCE"
echo ""

# Check 4: Gap SISTÊMICO (3+ casos)?
echo "4️⃣ Gap é SISTÊMICO (afeta 3+ casos/features)?"
echo "   Exemplo: YAGNI ✅ = Util reusável 5+ features | ❌ = Helper 1 feature"
read -p "   Sistêmico (3+ casos)? (s/n): " CHECK4
if [ "$CHECK4" = "n" ]; then
  echo "   ❌ REJEITAR: Problema único (não sistêmico)"
  echo "   🎯 AÇÃO: Resolver inline OU aguardar 3º caso (Rule of Three)"
  exit 1
fi
read -p "   Listar 3+ casos: " SYSTEMIC_CASES
echo "   ✅ Gap sistêmico: $SYSTEMIC_CASES"
echo ""

# Check 5: Ajustar config/prompt resolve?
echo "5️⃣ Ajustar configuração OU prompt Gemini resolve?"
echo "   Exemplo: YAGNI ✅ = Ajustar temperature | ❌ = Criar validation layer"
read -p "   Config/prompt resolve? (s/n): " CHECK5
if [ "$CHECK5" = "s" ]; then
  read -p "   Qual ajuste? " CONFIG_FIX
  echo "   ⚠️ USAR CONFIG: $CONFIG_FIX"
  echo "   ❌ REJEITAR: Criar código custom"
  exit 1
fi
echo "   ✅ Config/prompt NÃO resolve"
echo ""

# APROVADO
echo "✅ YAGNI APROVADO: Implementação custom justificada"
echo ""
echo "📊 RESUMO:"
echo "  - Framework: NÃO tem equivalente"
echo "  - Bibliotecas: NÃO cobrem"
echo "  - Testado nativo: FALHOU ($FAILURE_EVIDENCE)"
echo "  - Gap sistêmico: SIM ($SYSTEMIC_CASES)"
echo "  - Config resolve: NÃO"
echo ""
echo "🎯 PRÓXIMO: Implementar custom solution com confiança (ZERO over-engineering)"
