#!/usr/bin/env python3

"""
Add Meta-Learning Section to ALL Workflows
Inserts meta-learning section before "CONTINUAÇÃO AUTOMÁTICA" or "Próximo Workflow"
"""

import os
import sys
from pathlib import Path

# Colors
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
NC = '\033[0m'

WORKFLOW_DIR = Path(".windsurf/workflows")
TEMPLATE_FILE = Path(".windsurf/templates/meta-learning-section.md")

def main():
    # Check if template exists
    if not TEMPLATE_FILE.exists():
        print(f"{RED}❌ Template não encontrado: {TEMPLATE_FILE}{NC}")
        sys.exit(1)
    
    # Read template
    template_content = TEMPLATE_FILE.read_text()
    
    print(f"🔍 Buscando workflows sem meta-learning em {WORKFLOW_DIR}...")
    print()
    
    # Counters
    total_files = 0
    skipped_files = 0
    updated_files = 0
    failed_files = 0
    
    # Process each workflow
    for workflow_file in sorted(WORKFLOW_DIR.glob("*.md")):
        total_files += 1
        filename = workflow_file.name
        
        # Read current content
        content = workflow_file.read_text()
        
        # Skip if already has meta-learning
        if "## 🧠 Meta-Learning: Captura de Aprendizados" in content:
            print(f"{YELLOW}⏭️  SKIP: {filename} (já tem meta-learning){NC}")
            skipped_files += 1
            continue
        
        # Check if has continuation section
        if "## ⏭️ CONTINUAÇÃO AUTOMÁTICA" not in content and "## 🔄 Próximo Workflow" not in content:
            print(f"{YELLOW}⏭️  SKIP: {filename} (sem seção de continuação){NC}")
            skipped_files += 1
            continue
        
        # Insert meta-learning before continuation section
        lines = content.split("\n")
        new_lines = []
        inserted = False
        
        for i, line in enumerate(lines):
            if not inserted and (line.startswith("## ⏭️ CONTINUAÇÃO AUTOMÁTICA") or line.startswith("## 🔄 Próximo Workflow")):
                # Insert meta-learning section
                new_lines.append("---")
                new_lines.append("")
                new_lines.append(template_content.strip())
                new_lines.append("")
                inserted = True
            new_lines.append(line)
        
        # Write updated content
        new_content = "\n".join(new_lines)
        
        # Check if content changed
        if len(new_content) > len(content):
            workflow_file.write_text(new_content)
            size_diff = len(new_content) - len(content)
            print(f"{GREEN}✅ UPDATED: {filename} (+{size_diff} chars, total: {len(new_content)} chars){NC}")
            updated_files += 1
        else:
            print(f"{RED}❌ FAILED: {filename} (tamanho não aumentou){NC}")
            failed_files += 1
    
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("📊 RESUMO:")
    print(f"  Total analisados: {total_files}")
    print(f"  {YELLOW}Já tinham: {skipped_files}{NC}")
    print(f"  {GREEN}Atualizados: {updated_files}{NC}")
    print(f"  {RED}Falharam: {failed_files}{NC}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    
    if updated_files > 0:
        print(f"{GREEN}✅ Meta-learning adicionado a {updated_files} workflows!{NC}")
        print()
        print("📝 Próximo passo: Validar tamanhos")
        print("   ./scripts/validate-workflow-size.sh")
        print()

if __name__ == "__main__":
    main()
