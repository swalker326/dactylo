-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('ACTIVE', 'UNDER_REVIEW', 'REMOVED');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateTable
CREATE TABLE "Sign" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "definition" TEXT NOT NULL,

    CONSTRAINT "Sign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "signId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "uploaderInfo" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "videoURL" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "voteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RelatedSigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SignCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_RelatedSigns_AB_unique" ON "_RelatedSigns"("A", "B");

-- CreateIndex
CREATE INDEX "_RelatedSigns_B_index" ON "_RelatedSigns"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SignCategories_AB_unique" ON "_SignCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_SignCategories_B_index" ON "_SignCategories"("B");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_signId_fkey" FOREIGN KEY ("signId") REFERENCES "Sign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedSigns" ADD CONSTRAINT "_RelatedSigns_A_fkey" FOREIGN KEY ("A") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedSigns" ADD CONSTRAINT "_RelatedSigns_B_fkey" FOREIGN KEY ("B") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SignCategories" ADD CONSTRAINT "_SignCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SignCategories" ADD CONSTRAINT "_SignCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Sign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
