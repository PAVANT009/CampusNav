-- CreateTable
CREATE TABLE "timetables" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "sourceFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_entries" (
    "id" TEXT NOT NULL,
    "timetableId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "timeStart" TEXT,
    "timeEnd" TEXT,
    "type" TEXT,
    "group" TEXT,
    "course" TEXT,
    "room" TEXT,
    "section" TEXT,
    "note" TEXT,
    "raw" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timetable_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timetable_entries_timetableId_day_idx" ON "timetable_entries"("timetableId", "day");

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
