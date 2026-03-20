/*
  Warnings:

  - Added the required column `name` to the `AuthUser` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuthUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roles" TEXT NOT NULL,
    "permissions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AuthUser" ("createdAt", "email", "id", "passwordHash", "roles", "updatedAt") SELECT "createdAt", "email", "id", "passwordHash", "roles", "updatedAt" FROM "AuthUser";
DROP TABLE "AuthUser";
ALTER TABLE "new_AuthUser" RENAME TO "AuthUser";
CREATE UNIQUE INDEX "AuthUser_email_key" ON "AuthUser"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
