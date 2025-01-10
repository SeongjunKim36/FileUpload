#!/bin/bash
MIGRATION_TRADING_DIR="libs/database-trading/migrations"

echo "Migration running ... trading"

# TypeORM으로 마이그레이션 파일을 생성
NODE_ENV=docker ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d libs/database-trading/data-source.ts

echo "Done."