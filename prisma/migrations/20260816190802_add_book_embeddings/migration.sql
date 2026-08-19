-- AlterTable
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "Book" ADD COLUMN     "embedding" vector(384),
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "synopsis" TEXT;
