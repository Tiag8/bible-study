#!/usr/bin/env python3

"""
Compress Workflows to Stay Under 12k Limit
Removes redundant content while preserving essential information
"""

import re
from pathlib import Path

# Colors
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
NC = '\033[0m'

WORKFLOW_DIR = Path(".windsurf/workflows")
MAX_SIZE = 12000

def compress_workflow(file_path: Path) -> tuple[bool, int, int]:
    """
    Compress a single workflow file.
    Returns (success, original_size, new_size)
    """
    content = file_path.read_text()
    original_size = len(content)
    
    # Strategy 1: Compress triple line breaks into double
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # Strategy 2: Remove redundant horizontal rules (keep only meaningful ones)
    content = re.sub(r'(━{40,}\n){2,}', '━' * 44 + '\n', content)
    
    # Strategy 3: Compress excessive blank lines in code blocks
    content = re.sub(r'(```bash\n)\n+', r'\1', content)
    content = re.sub(r'\n\n+(```)', r'\n\1', content)
    
    # Strategy 4: Remove duplicate "Pré-requisito" sections if multiple exist
    prereq_sections = content.count("## 📚 Pré-requisito")
    if prereq_sections > 1:
        # Keep only the first one
        parts = content.split("## 📚 Pré-requisito")
        content = parts[0] + "## 📚 Pré-requisito" + parts[1]
        # Merge other parts without the header
        for part in parts[2:]:
            content += "\n" + part.split("\n---", 1)[-1] if "\n---" in part else ""
    
    # Strategy 5: Compress changelog sections (keep only version, remove verbose descriptions)
    if "## 📝 Changelog" in content:
        changelog_match = re.search(r'(## 📝 Changelog\n\n.*?)(\n##|\Z)', content, re.DOTALL)
        if changelog_match:
            changelog = changelog_match.group(1)
            # Keep only last 2 versions
            versions = re.findall(r'\*\*v\d+\.\d+.*?\n', changelog)
            if len(versions) > 2:
                compressed_changelog = "## 📝 Changelog\n\n" + "".join(versions[:2]) + "\n*Versões anteriores: ver histórico git*\n"
                content = content[:changelog_match.start()] + compressed_changelog + content[changelog_match.end(1):]
    
    # Strategy 6: Compress example blocks (reduce verbosity)
    content = re.sub(r'(### Exemplo:.*?```)(.*?)(```)', lambda m: m.group(1) + (m.group(2)[:200] + '...\n' if len(m.group(2)) > 200 else m.group(2)) + m.group(3), content, flags=re.DOTALL)
    
    new_size = len(content)
    
    if new_size < original_size:
        file_path.write_text(content)
        return (True, original_size, new_size)
    else:
        return (False, original_size, original_size)

def main():
    print(f"🔧 Comprimindo workflows que excedem {MAX_SIZE} chars...")
    print()
    
    compressed_count = 0
    failed_count = 0
    
    # Find workflows that exceed limit
    for workflow_file in sorted(WORKFLOW_DIR.glob("*.md")):
        size = len(workflow_file.read_text())
        
        if size > MAX_SIZE:
            filename = workflow_file.name
            success, original_size, new_size = compress_workflow(workflow_file)
            
            if success:
                reduction = original_size - new_size
                percentage = (reduction / original_size) * 100
                still_exceeds = " ⚠️  AINDA EXCEDE" if new_size > MAX_SIZE else " ✅ OK"
                print(f"{GREEN if new_size <= MAX_SIZE else YELLOW}✓ {filename}: {original_size} → {new_size} chars (-{reduction}, -{percentage:.1f}%){still_exceeds}{NC}")
                compressed_count += 1
            else:
                print(f"{RED}✗ {filename}: {original_size} chars (não comprimido){NC}")
                failed_count += 1
    
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"📊 RESUMO:")
    print(f"  {GREEN}Comprimidos: {compressed_count}{NC}")
    print(f"  {RED}Não comprimidos: {failed_count}{NC}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print("📝 Próximo: Validar novamente")
    print("   ./scripts/validate-workflow-size.sh")
    print()

if __name__ == "__main__":
    main()
