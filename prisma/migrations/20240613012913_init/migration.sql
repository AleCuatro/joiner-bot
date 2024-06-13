-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "money" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Servidores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "srvId" TEXT NOT NULL,
    "personIn" INTEGER NOT NULL,
    CONSTRAINT "Servidores_srvId_fkey" FOREIGN KEY ("srvId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
