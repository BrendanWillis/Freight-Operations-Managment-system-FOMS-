/*
  Warnings:

  - You are about to drop the column `userId` on the `Shipment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Created',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shipperId" TEXT,
    "driverId" TEXT,
    CONSTRAINT "Shipment_shipperId_fkey" FOREIGN KEY ("shipperId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Shipment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Shipment" ("createdAt", "destination", "id", "origin", "reference", "status", "updatedAt") SELECT "createdAt", "destination", "id", "origin", "reference", "status", "updatedAt" FROM "Shipment";
DROP TABLE "Shipment";
ALTER TABLE "new_Shipment" RENAME TO "Shipment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
