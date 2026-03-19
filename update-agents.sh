#!/bin/bash
FORGELAB_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd /Users/manojsharmayandapally/pycharmProjects/agency-agents
git fetch upstream
git merge upstream/main
git push origin main
./scripts/convert.sh --tool aider
cp integrations/aider/CONVENTIONS.md "$FORGELAB_DIR/"
echo "✅ Agents updated successfully in $FORGELAB_DIR"
