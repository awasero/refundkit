#!/usr/bin/env bash
# scaffold_project.sh - Generate project foundation files
# Usage: bash scaffold_project.sh <project_name> <skills_list>
# Example: bash scaffold_project.sh my-app "clean-code,security-guard,lean-deps"

set -euo pipefail

PROJECT_NAME="${1:?Usage: scaffold_project.sh <project_name> <skills_csv>}"
SKILLS_CSV="${2:-clean-code,security-guard,lean-deps}"

echo "🏗️  Scaffolding project foundation for: $PROJECT_NAME"

# Create docs structure
mkdir -p docs/decisions
echo "📁 Created docs/ structure"

# Create .claude/skills directories for each skill
IFS=',' read -ra SKILLS <<< "$SKILLS_CSV"
for skill in "${SKILLS[@]}"; do
    skill=$(echo "$skill" | xargs)  # trim whitespace
    mkdir -p ".claude/skills/$skill"
    echo "📁 Created .claude/skills/$skill/"
done

# Create ADR template
cat > docs/decisions/000-template.md << 'TEMPLATE'
# [Number]. [Title]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded by [ADR-XXX]

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult because of this change?
TEMPLATE
echo "📄 Created ADR template"

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
cat > .gitignore << 'GITIGNORE'
# Environment
.env
.env.*
!.env.example

# Dependencies
node_modules/
__pycache__/
*.pyc
venv/
.venv/

# Build
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/
GITIGNORE
echo "📄 Created .gitignore"
fi

# Create .env.example
if [ ! -f .env.example ]; then
cat > .env.example << 'ENVEXAMPLE'
# Copy this file to .env and fill in your values
# NEVER commit .env to git

# Database
DATABASE_URL=

# Authentication
# JWT_SECRET=
# SESSION_SECRET=

# Third-party APIs
# API_KEY=
ENVEXAMPLE
echo "📄 Created .env.example"
fi

echo ""
echo "✅ Foundation scaffolded for $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  1. Review and customize CLAUDE.md"
echo "  2. Review skills in .claude/skills/"
echo "  3. Fill in docs/security.md"
echo "  4. Run your framework's init command"
echo "  5. Start building!"
