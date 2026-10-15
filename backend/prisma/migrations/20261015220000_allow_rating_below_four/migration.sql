ALTER TABLE "restaurants" DROP CONSTRAINT "restaurants_rating_check";

ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_rating_check" CHECK (
  "rating" >= 0.0 AND "rating" <= 5.0
);
