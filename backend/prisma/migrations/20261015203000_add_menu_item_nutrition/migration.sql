-- Estimated allergens and nutrition per serving, shown on the item detail.
ALTER TABLE "menu_items"
ADD COLUMN "allergens" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "calories_kcal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "protein_grams" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "carbs_grams" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "fat_grams" INTEGER NOT NULL DEFAULT 0;
