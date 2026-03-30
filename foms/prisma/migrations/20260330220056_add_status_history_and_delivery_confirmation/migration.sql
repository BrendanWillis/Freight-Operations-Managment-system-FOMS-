-- CreateTable
CREATE TABLE "ShipmentStatusUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipmentId" INTEGER NOT NULL,
    "updatedById" TEXT,
    CONSTRAINT "ShipmentStatusUpdate_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShipmentStatusUpdate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeliveryConfirmation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "confirmedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "shipmentId" INTEGER NOT NULL,
    CONSTRAINT "DeliveryConfirmation_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryConfirmation_shipmentId_key" ON "DeliveryConfirmation"("shipmentId");
