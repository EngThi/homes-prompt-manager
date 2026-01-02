#!/bin/bash

# HOMES: Neural Deck - System Diagnostic Tool
# This script verifies the project integrity and environment.

echo "=========================================="
echo "   HOMES: NEURAL DECK DIAGNOSTIC v1.0    "
echo "=========================================="

# 1. Check Core Files
echo -n "[1/4] Checking core files... "
FILES=("index.html" "main.js" "style.css" "README.md")
MISSING=0
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "\n      [ERROR] Missing: $file"
        MISSING=$((MISSING+1))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo "OK"
else
    echo "FAILED ($MISSING missing)"
fi

# 2. Check Dependencies in index.html
echo -n "[2/4] Verifying CDN dependencies... "
if grep -q "jszip" index.html && grep -q "FileSaver" index.html; then
    echo "OK (JSZip & FileSaver detected)"
else
    echo "WARNING (Missing CDNs in index.html)"
fi

# 3. Check Git Status
echo -n "[3/4] Checking Git repository... "
if [ -d ".git" ]; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    STATUS=$(git status --short)
    if [ -z "$STATUS" ]; then
        echo "OK (Branch: $BRANCH, Clean)"
    else
        echo "PENDING (Uncommitted changes detected)"
    fi
else
    echo "FAILED (Not a git repo)"
fi

# 4. Project Stats
echo "[4/4] Project Statistics:"
echo "      - HTML Lines: $(wc -l < index.html)"
echo "      - JS Lines:   $(wc -l < main.js)"
echo "      - CSS Lines:  $(wc -l < style.css)"
echo "      - Disk Usage: $(du -sh . | cut -f1)"

echo "=========================================="
echo "   DIAGNOSTIC COMPLETE                  "
echo "=========================================="
