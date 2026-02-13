#!/bin/bash
# Script para convertir archivos CommonJS a ES modules
find src/main -type f -name "*.js" -exec sed -i '' 's/const { /import { /g' {} \;
find src/main -type f -name "*.js" -exec sed -i '' "s/const .* = require('/import /g" {} \;
find src/main -type f -name "*.js" -exec sed -i '' 's/module\.exports = {/export {/g' {} \;
find src/main -type f -name "*.js" -exec sed -i '' 's/module\.exports = /export default /g' {} \;
find src/main -type f -name "*.js" -exec sed -i '' 's/function \([a-zA-Z]*\)(/export function \1(/g' {} \;
