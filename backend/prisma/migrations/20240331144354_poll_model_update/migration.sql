/*
  Warnings:

  - You are about to drop the column `IsActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `img1URL` to the `Poll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img2URL` to the `Poll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainImgURL` to the `Poll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterSequence
ALTER SEQUENCE "Poll_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "img1URL" STRING NOT NULL;
ALTER TABLE "Poll" ADD COLUMN     "img2URL" STRING NOT NULL;
ALTER TABLE "Poll" ADD COLUMN     "mainImgURL" STRING NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "IsActive";
ALTER TABLE "User" ADD COLUMN     "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "_PollToUser" (
    "A" INT4 NOT NULL,
    "B" INT4 NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PollToUser_AB_unique" ON "_PollToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PollToUser_B_index" ON "_PollToUser"("B");

-- AddForeignKey
ALTER TABLE "_PollToUser" ADD CONSTRAINT "_PollToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PollToUser" ADD CONSTRAINT "_PollToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
