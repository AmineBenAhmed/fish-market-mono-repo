-- CreateTable Governorate
CREATE TABLE "Governorate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Governorate_pkey" PRIMARY KEY ("id")
);

-- CreateTable Area
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "governorateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable Zone
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "governorateId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "Governorate_slug_key" ON "Governorate"("slug");
CREATE INDEX "Governorate_slug_idx" ON "Governorate"("slug");
CREATE INDEX "Governorate_name_idx" ON "Governorate"("name");
CREATE UNIQUE INDEX "Area_slug_key" ON "Area"("slug");
CREATE INDEX "Area_slug_idx" ON "Area"("slug");
CREATE INDEX "Area_governorateId_idx" ON "Area"("governorateId");
CREATE UNIQUE INDEX "Zone_slug_key" ON "Zone"("slug");
CREATE INDEX "Zone_slug_idx" ON "Zone"("slug");
CREATE INDEX "Zone_governorateId_idx" ON "Zone"("governorateId");
CREATE INDEX "Zone_areaId_idx" ON "Zone"("areaId");

-- Foreign keys
ALTER TABLE "Area" ADD CONSTRAINT "Area_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
