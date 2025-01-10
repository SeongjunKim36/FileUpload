#!/bin/bash
MIGRATION_NAME=$1
MIGRATION_TRADING_DIR="libs/database-trading/migrations"
MIGRATION_AUTH_DIR="libs/database-auth/migrations"

# TypeORM으로 마이그레이션 파일을 생성
NODE_ENV=local ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d libs/database-trading/data-source.ts -o libs/database-trading/migrations/$MIGRATION_NAME

# NODE_ENV=local ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d libs/database-auth/data-source.ts -o libs/database-auth/migrations/$MIGRATION_NAME

# 해당 디렉토리의 모든 .js 파일을 순회하며 수정
for file in $MIGRATION_TRADING_DIR/*.js; do
    ABS_PATH=$(realpath "$file")
    echo "Processing file: $ABS_PATH"
    # 'require("typeorm")' 문자열을 포함한 모든 줄 삭제
    sed -i '' '/require("typeorm")/d' "$file"
    # 린터 비활성화
    if ! grep -q '\/\* eslint-disable prettier/prettier \*\/' "$file"; then
        sed -i '' '1i\
/* eslint-disable prettier/prettier */' "$file"
    fi
done

# for file in $MIGRATION_AUTH_DIR/*.js; do
#     ABS_PATH=$(realpath "$file")
#     echo "Processing file: $ABS_PATH"
#     # 'require("typeorm")' 문자열을 포함한 모든 줄 삭제
#     sed -i '' '/require("typeorm")/d' "$file"
#     # 린터 비활성화
#     if ! grep -q '\/\* eslint-disable prettier/prettier \*\/' "$file"; then
#         sed -i '' '1i\
# /* eslint-disable prettier/prettier */' "$file"
#     fi
# done

echo "Removed unused require statements from migration files."