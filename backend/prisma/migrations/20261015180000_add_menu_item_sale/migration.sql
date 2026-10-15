-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN "is_on_sale" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "menu_items" ADD COLUMN "compare_at_price_cents" INTEGER;

-- Sale rows store a higher list price; regular rows have no compare-at price.
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_sale_check" CHECK (
  ("is_on_sale" = false AND "compare_at_price_cents" IS NULL)
  OR ("is_on_sale" = true AND "compare_at_price_cents" > "price_cents")
);
