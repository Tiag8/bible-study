#!/usr/bin/env python3

"""
Analyze Workflows for Splitting
Identifies workflows that need to be split and suggests optimal split points
"""

import re
from pathlib import Path

# Colors
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
BLUE = '\033[0;34m'
NC = '\033[0m'

WORKFLOW_DIR = Path(".windsurf/workflows")
MAX_SIZE = 12000
TARGET_SIZE = 11000  # Target after split (with buffer)

def find_split_point(content: str, target: int) -> tuple[int, str]:
    """
    Find optimal split point around target position.
    Returns (position, section_title)
    """
    lines = content.split('\n')
    pos = 0
    best_split_pos = 0
    best_split_title = ""
    
    for i, line in enumerate(lines):
        pos += len(line) + 1  # +1 for newline
        
        # Look for section headers (## or ###)
        if line.startswith('## ') and not line.startswith('## 🔄') and not line.startswith('## ⏭️'):
            # Check if this is close to our target
            if abs(pos - target) < abs(best_split_pos - target):
                best_split_pos = pos
                best_split_title = line
    
    return (best_split_pos, best_split_title)

def analyze_workflow(file_path: Path):
    """Analyze a single workflow and suggest split if needed."""
    content = file_path.read_text()
    size = len(content)
    
    if size <= MAX_SIZE:
        return  # No split needed
    
    filename = file_path.name
    
    # Calculate how many parts needed
    num_parts = (size // TARGET_SIZE) + 1
    
    print(f"\n{RED}📄 {filename}: {size} chars (exceeds by {size - MAX_SIZE}){NC}")
    print(f"   Suggested: Split into {num_parts} parts")
    
    # Find split points
    split_points = []
    for i in range(1, num_parts):
        target_pos = (size // num_parts) * i
        split_pos, split_title = find_split_point(content, target_pos)
        split_points.append((split_pos, split_title))
    
    # Show split suggestions
    for idx, (pos, title) in enumerate(split_points, 1):
        print(f"   Split {idx} at pos {pos} (~{pos//1000}k): {BLUE}{title}{NC}")
    
    # Calculate resulting sizes
    prev_pos = 0
    for idx, (pos, title) in enumerate(split_points + [(size, "")], 1):
        part_size = pos - prev_pos
        status = f"{GREEN}✓{NC}" if part_size <= MAX_SIZE else f"{RED}✗{NC}"
        print(f"   Part {idx}: {part_size} chars {status}")
        prev_pos = pos

def main():
    print(f"🔍 Analisando workflows que excedem {MAX_SIZE} chars...")
    
    exceeding_workflows = []
    
    for workflow_file in sorted(WORKFLOW_DIR.glob("*.md")):
        size = len(workflow_file.read_text())
        if size > MAX_SIZE:
            exceeding_workflows.append((workflow_file, size))
            analyze_workflow(workflow_file)
    
    print("\n" + "━" * 60)
    print(f"📊 Total de workflows que precisam ser divididos: {len(exceeding_workflows)}")
    print("━" * 60)
    
    print(f"\n{YELLOW}💡 RECOMENDAÇÃO:{NC}")
    print(f"   1. Dividir workflows com > 14k chars (crítico)")
    print(f"   2. Comprimir workflows com 12-14k chars (moderado)")
    print(f"   3. Validar que todos < 12k após divisão")

if __name__ == "__main__":
    main()
