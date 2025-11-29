#!/bin/bash
# Monitor Deployment Health
# Executa smoke tests em loop para monitoramento contínuo

INTERVAL=${1:-60}  # Intervalo em segundos (padrão: 60s = 1min)
ITERATIONS=${2:-10}  # Quantas iterações (padrão: 10 = 10min se interval=60)

echo "=========================================="
echo "MONITORING DEPLOYMENT HEALTH"
echo "Interval: ${INTERVAL}s"
echo "Duration: ~$((INTERVAL * ITERATIONS / 60))min"
echo "=========================================="
echo ""

for i in $(seq 1 $ITERATIONS); do
  echo "========================================"
  echo "ITERATION $i/$ITERATIONS ($(date '+%Y-%m-%d %H:%M:%S'))"
  echo "========================================"

  # Executar smoke tests
  ./scripts/smoke-tests-post-deploy.sh

  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed"
  elif [ $EXIT_CODE -eq 2 ]; then
    echo "⚠️ Some warnings detected"
  else
    echo "❌ Tests failed - deployment may be unhealthy"
    echo ""
    echo "RECOMENDAÇÃO: Investigar logs e considerar rollback"
    exit 1
  fi

  # Aguardar próxima iteração (exceto última)
  if [ $i -lt $ITERATIONS ]; then
    echo ""
    echo "⏳ Aguardando ${INTERVAL}s até próxima verificação..."
    echo ""
    sleep $INTERVAL
  fi
done

echo ""
echo "=========================================="
echo "MONITORING COMPLETE"
echo "Iterations: $ITERATIONS"
echo "Deployment appears stable ✅"
echo "=========================================="
