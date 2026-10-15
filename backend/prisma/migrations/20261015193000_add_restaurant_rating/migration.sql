-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "rating" DECIMAL(2,1) NOT NULL DEFAULT 4.5;

ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_rating_check" CHECK (
  "rating" >= 4.0 AND "rating" <= 5.0
);
