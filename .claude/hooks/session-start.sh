#!/bin/bash
# 클라우드 세션이 시작될 때 graphify 스킬을 설치한다. (로컬 PC에서는 아무것도 하지 않음)
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# 이미 설치돼 있으면 건너뛴다
if command -v graphify >/dev/null 2>&1 && [ -f "$HOME/.claude/skills/graphify/SKILL.md" ]; then
  exit 0
fi

python3 -m pip install --quiet graphifyy
graphify install
