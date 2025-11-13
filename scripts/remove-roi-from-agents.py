#!/usr/bin/env python3
"""
Script: remove-roi-from-agents.py
Propósito: Remover TODAS menções de ROI e tempo de execução dos agentes
Uso: python3 scripts/remove-roi-from-agents.py [--dry-run]
"""

import re
import sys
from pathlib import Path

# Padrões a remover
PATTERNS_TO_REMOVE = [
    # ROI explícito
    r'\*\*ROI\*\*:.*\n',
    r'ROI:.*\n',
    r'- ROI:.*\n',

    # Tempo/Investment
    r'\*\*Time Investment\*\*:.*\n',
    r'\*\*Time Saved\*\*:.*\n',
    r'\*\*Monthly Savings\*\*:.*\n',
    r'\*\*Annual Impact\*\*:.*\n',
    r'\*\*Time to Extract \+ Implement\*\*:.*\n',

    # Comparações de tempo
    r'\d+x faster',
    r'\d+x speedup',
    r'\d+x ROI',

    # Horas/minutos economizados
    r'\d+h saved',
    r'\d+ hours? saved',
    r'\d+min saved',
    r'\d+ minutes? saved',
    r'economiza \d+h',
    r'economizadas',

    # Seções inteiras de ROI
    r'### ROI Tracking.*?(?=###|\Z)',
    r'## ROI.*?(?=##|\Z)',
]

# Substituições qualitativas
QUALITATIVE_REPLACEMENTS = {
    r'(\d+)x faster': r'faster via parallelization',
    r'(\d+)x speedup': r'performance improvement',
    r'ROI: (\d+)x': r'Benefício: Significant performance gain',
    r'Time Investment: \d+min': r'Implementation: Straightforward',
    r'Time Saved: .*\n': r'Impact: Reduces manual effort\n',
    r'Monthly Savings: .*\n': r'Benefit: Ongoing efficiency improvement\n',
}

def process_file(filepath, dry_run=False):
    """Processa um arquivo removendo ROI e tempo"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes = []

    # Aplicar substituições qualitativas
    for pattern, replacement in QUALITATIVE_REPLACEMENTS.items():
        matches = re.findall(pattern, content, re.IGNORECASE | re.DOTALL)
        if matches:
            content = re.sub(pattern, replacement, content, flags=re.IGNORECASE | re.DOTALL)
            changes.append(f"  - Substituído: {pattern} → {replacement}")

    # Remover padrões
    for pattern in PATTERNS_TO_REMOVE:
        matches = re.findall(pattern, content, re.IGNORECASE | re.DOTALL)
        if matches:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
            changes.append(f"  - Removido: {pattern}")

    # Limpar linhas vazias duplicadas
    content = re.sub(r'\n{3,}', '\n\n', content)

    if content != original_content:
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {filepath.name}")
        else:
            print(f"🔍 {filepath.name} (DRY RUN)")

        for change in changes:
            print(change)

        return True
    else:
        print(f"⏭️  {filepath.name} (sem mudanças)")
        return False

def main():
    dry_run = '--dry-run' in sys.argv

    agents_dir = Path(__file__).parent.parent / '.claude' / 'agents'

    if not agents_dir.exists():
        print(f"❌ Diretório não encontrado: {agents_dir}")
        sys.exit(1)

    print("=" * 60)
    print("Removendo ROI e Tempo de Agentes")
    print("=" * 60)

    if dry_run:
        print("🔍 MODO DRY RUN (nenhuma mudança será salva)\n")
    else:
        print("✍️  MODO PRODUÇÃO (arquivos serão modificados)\n")

    # Agentes a processar (excluir README.md e backup/)
    agent_files = [
        f for f in agents_dir.glob('*.md')
        if f.name != 'README.md'
    ]

    modified_count = 0

    for agent_file in sorted(agent_files):
        if process_file(agent_file, dry_run):
            modified_count += 1
        print()

    print("=" * 60)
    print(f"Resumo: {modified_count}/{len(agent_files)} agentes modificados")
    print("=" * 60)

    if dry_run:
        print("\n💡 Execute sem --dry-run para aplicar mudanças")
    else:
        print("\n✅ Mudanças aplicadas com sucesso!")

        # Validação
        print("\n🔍 Validando...")
        remaining_roi = []
        for agent_file in agent_files:
            content = agent_file.read_text()
            if re.search(r'ROI|Time Investment|Time Saved|economiza', content, re.IGNORECASE):
                remaining_roi.append(agent_file.name)

        if remaining_roi:
            print(f"⚠️  Ainda há ROI/tempo em: {', '.join(remaining_roi)}")
        else:
            print("✅ Nenhuma menção de ROI/tempo restante!")

if __name__ == '__main__':
    main()
