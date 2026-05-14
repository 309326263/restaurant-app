-- AlterTable: snapshot fields on OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "unitPrice" REAL NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN "displayName" TEXT NOT NULL DEFAULT 'Item';

-- Backfill unitPrice from historical sources
UPDATE "OrderItem"
SET "unitPrice" = COALESCE(
  "customPrice",
  NULLIF("variantPrice", 0),
  (SELECT "price" FROM "Product" WHERE "id" = "OrderItem"."productId"),
  0
);

-- Backfill displayName (custom > product + variant > fallback)
UPDATE "OrderItem"
SET "displayName" = COALESCE(
  NULLIF(TRIM("customName"), ''),
  (
    SELECT TRIM("p"."name") || IIF(
      NULLIF(TRIM("OrderItem"."variantName"), '') IS NULL,
      '',
      ' ' || TRIM("OrderItem"."variantName")
    )
    FROM "Product" AS "p"
    WHERE "p"."id" = "OrderItem"."productId"
  ),
  'Item'
);
