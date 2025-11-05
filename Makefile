MIGRATION_DIR = src/database/migrations
MIGRATION_NAME ?= migration_name

migration_generate:
	npx typeorm-ts-node-commonjs migration:generate $(MIGRATION_DIR)/resources/$(MIGRATION_NAME) -d $(MIGRATION_DIR)/index.ts

migration_run:
	npx typeorm-ts-node-commonjs migration:run -d $(MIGRATION_DIR)/index.ts

migration_revert:
	npx typeorm-ts-node-commonjs migration:revert -d $(MIGRATION_DIR)/index.ts

migration_create:
	npx typeorm-ts-node-commonjs migration:create $(MIGRATION_DIR)/resources/$(MIGRATION_NAME)

server:
	nest start