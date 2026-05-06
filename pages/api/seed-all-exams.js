import { connectToDatabase } from '../../lib/mongodb';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use POST to seed all exams' });
  }

  try {
    const { db } = await connectToDatabase();

    // ALL 78 EXAMS FROM MySQL
    const examsData = [
      { id: 1, name: 'API Route Check', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-05-01T10:00:00', total_questions: 0 },
      { id: 2, name: 'Mathematics Quiz', type: 'NDA', batch: '2024', duration: 30, scheduled_time: '2026-04-08T17:10:07', total_questions: 0 },
      { id: 3, name: 'Mathematics Quiz', type: 'NDA', batch: '2024', duration: 30, scheduled_time: '2026-04-09T14:30:12', total_questions: 0 },
      { id: 4, name: 'Mathematics Quiz', type: 'NDA', batch: '2024', duration: 30, scheduled_time: '2026-04-09T14:53:20', total_questions: 0 },
      { id: 5, name: 'History Final', type: 'UPSC', batch: '2024', duration: 120, scheduled_time: '2026-04-12T09:00:00', total_questions: 0 },
      { id: 6, name: 'Test 1', type: 'NDA', batch: '2024', duration: 30, scheduled_time: '2026-04-15T00:00:00', total_questions: 0 },
      { id: 7, name: 'Test 2', type: 'NEET', batch: '2025', duration: 2, scheduled_time: '2025-03-16T00:00:00', total_questions: 0 },
      { id: 8, name: 'JEE Main 2024', type: 'JEE', batch: '2024', duration: 180, scheduled_time: '2026-04-10T11:58:51', total_questions: 5 },
      { id: 9, name: 'NDA Exam 2024', type: 'NDA', batch: '2024', duration: 120, scheduled_time: '2026-04-10T11:58:52', total_questions: 5 },
      { id: 10, name: 'JEE Main 2024', type: 'JEE', batch: '2024', duration: 180, scheduled_time: '2026-04-10T15:56:30', total_questions: 5 },
      { id: 11, name: 'NDA Exam 2024', type: 'NDA', batch: '2024', duration: 120, scheduled_time: '2026-04-10T15:56:30', total_questions: 5 },
      { id: 14, name: 'Army Paper Test Exam', type: 'Army Test', batch: '2024', duration: 120, scheduled_time: '2026-04-13T16:29:35', total_questions: 0 },
      { id: 15, name: 'Army exam 2', type: 'NEET', batch: '2025', duration: 40, scheduled_time: '2026-04-13T16:32:25', total_questions: 0 },
      { id: 16, name: 'Army Paper Test Exam', type: 'Army Test', batch: '2024', duration: 120, scheduled_time: '2026-04-13T16:34:50', total_questions: 0 },
      { id: 17, name: 'Roshni exam', type: 'SSC', batch: '2026', duration: 30, scheduled_time: '2026-04-13T16:36:48', total_questions: 0 },
      { id: 18, name: 'JEE Test Exam 1', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:48:00', total_questions: 1 },
      { id: 19, name: 'NEET Test Exam 2', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:48:00', total_questions: 1 },
      { id: 20, name: 'NDA Test Exam 3', type: 'NDA', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:48:00', total_questions: 1 },
      { id: 21, name: 'UPSC Test Exam 4', type: 'UPSC', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:48:00', total_questions: 1 },
      { id: 22, name: 'JEE Test Exam 1', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:48:00', total_questions: 1 },
      { id: 23, name: 'NEET Test Exam 2', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:48:00', total_questions: 1 },
      { id: 24, name: 'NDA Test Exam 3', type: 'NDA', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:48:00', total_questions: 1 },
      { id: 25, name: 'UPSC Test Exam 4', type: 'UPSC', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:48:00', total_questions: 1 },
      { id: 26, name: 'JEE Test Exam 1', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:49:00', total_questions: 1 },
      { id: 27, name: 'NEET Test Exam 2', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:49:00', total_questions: 1 },
      { id: 28, name: 'NDA Test Exam 3', type: 'NDA', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:49:00', total_questions: 1 },
      { id: 29, name: 'UPSC Test Exam 4', type: 'UPSC', batch: '2024', duration: 60, scheduled_time: '2026-04-15T08:49:00', total_questions: 1 },
      { id: 30, name: 'JEE Test Exam 1776157599198', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T09:06:00', total_questions: 1 },
      { id: 31, name: 'NEET Test Exam 1776157599277', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T09:06:00', total_questions: 1 },
      { id: 32, name: 'JEE Test Exam 1776159490828', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T09:38:00', total_questions: 1 },
      { id: 33, name: 'NEET Test Exam 1776159490902', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T09:38:00', total_questions: 1 },
      { id: 34, name: 'JEE Test Exam 1776159496250', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T09:38:00', total_questions: 1 },
      { id: 35, name: 'NEET Test Exam 1776159496289', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T09:38:00', total_questions: 1 },
      { id: 36, name: 'Gayatri Army', type: 'Practice Test', batch: '2025', duration: 120, scheduled_time: '2026-04-15T00:00:00', total_questions: 0 },
      { id: 37, name: 'JEE Test Exam 1776167045412', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T11:44:00', total_questions: 1 },
      { id: 38, name: 'NEET Test Exam 1776167045412', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T11:44:00', total_questions: 1 },
      { id: 39, name: 'JEE Test Exam 1776167086945', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T11:44:00', total_questions: 1 },
      { id: 40, name: 'NEET Test Exam 1776167086945', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T11:44:00', total_questions: 1 },
      { id: 41, name: 'JEE Test Exam 1776167340811', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T11:49:00', total_questions: 1 },
      { id: 42, name: 'NEET Test Exam 1776167340811', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T11:49:00', total_questions: 1 },
      { id: 43, name: 'JEE Test Exam 1776167495830', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-15T11:51:00', total_questions: 1 },
      { id: 44, name: 'NEET Test Exam 1776167495830', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-15T11:51:00', total_questions: 1 },
      { id: 45, name: 'T Y CSE', type: 'UPSC', batch: '2025', duration: 30, scheduled_time: '2026-04-14T00:00:00', total_questions: 0 },
      { id: 46, name: 'Future JEE Exam 1776168175768', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-14T14:02:00', total_questions: 1 },
      { id: 47, name: 'Past JEE Exam 1776168175768', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-14T10:02:00', total_questions: 1 },
      { id: 48, name: 'MOCK', type: 'Mock Test', batch: '2024', duration: 45, scheduled_time: '2026-04-15T00:00:00', total_questions: 0 },
      { id: 49, name: 'Future JEE Exam 1776168873959', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-14T14:14:00', total_questions: 1 },
      { id: 50, name: 'TEST !', type: 'NDA', batch: '2025', duration: 45, scheduled_time: '2026-04-14T00:00:00', total_questions: 0 },
      { id: 51, name: 'JEE Test Exam 1776425208203', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-18T11:26:00', total_questions: 1 },
      { id: 52, name: 'NEET Test Exam 1776425208203', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-18T11:26:00', total_questions: 1 },
      { id: 53, name: 'JEE Test Exam 1776425234830', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-18T11:27:00', total_questions: 1 },
      { id: 54, name: 'NEET Test Exam 1776425234830', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-18T11:27:00', total_questions: 1 },
      { id: 55, name: 'JEE Test Exam 1777308279973', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-28T16:44:00', total_questions: 1 },
      { id: 56, name: 'NEET Test Exam 1777308279973', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-28T16:44:00', total_questions: 1 },
      { id: 57, name: 'JEE Test Exam 1777308717742', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-28T16:51:00', total_questions: 1 },
      { id: 58, name: 'NEET Test Exam 1777308717742', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-28T16:51:00', total_questions: 1 },
      { id: 59, name: 'Parser Flex Upload 1777309140528', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-28T16:59:00', total_questions: 40 },
      { id: 60, name: 'JEE Test Exam 1777309457462', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-28T17:04:00', total_questions: 1 },
      { id: 61, name: 'NEET Test Exam 1777309457462', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-28T17:04:00', total_questions: 1 },
      { id: 62, name: 'NoLimit Upload 1777309458761', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-28T17:04:00', total_questions: 40 },
      { id: 63, name: 'NoRestriction Upload 1777309629732', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-28T17:07:00', total_questions: 40 },
      { id: 64, name: 'JEE Test Exam 1777310341321', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-28T17:19:00', total_questions: 1 },
      { id: 65, name: 'NEET Test Exam 1777310341321', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-28T17:19:00', total_questions: 1 },
      { id: 66, name: 'Live Upload Flow 1777310387732', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-28T17:19:00', total_questions: 40 },
      { id: 67, name: 'CSE B', type: 'JEE', batch: '2026', duration: 35, scheduled_time: '2026-04-27T22:51:00', total_questions: 40 },
      { id: 68, name: 'T Y', type: 'Mock Test', batch: '2026', duration: 35, scheduled_time: '2026-04-28T13:00:00', total_questions: 38 },
      { id: 69, name: 'T Y', type: 'Mock Test', batch: '2026', duration: 45, scheduled_time: '2026-04-28T13:01:00', total_questions: 9 },
      { id: 70, name: 'T Y', type: 'Mock Test', batch: '2026', duration: 35, scheduled_time: '2026-04-28T13:02:00', total_questions: 40 },
      { id: 71, name: 'JEE Test Exam 1777367707273', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-29T09:15:00', total_questions: 1 },
      { id: 72, name: 'NEET Test Exam 1777367707273', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-29T09:15:00', total_questions: 1 },
      { id: 73, name: 'JEE Test Exam 1777367720895', type: 'JEE', batch: '2024', duration: 37, scheduled_time: '2026-04-29T09:15:00', total_questions: 1 },
      { id: 74, name: 'NEET Test Exam 1777367720895', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-29T09:15:00', total_questions: 1 },
      { id: 75, name: 'JEE Test Exam 1777479174072', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-30T16:12:00', total_questions: 1 },
      { id: 76, name: 'NEET Test Exam 1777479174072', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-30T16:12:00', total_questions: 1 },
      { id: 77, name: 'JEE Test Exam 1777479205963', type: 'JEE', batch: '2024', duration: 60, scheduled_time: '2026-04-30T16:13:00', total_questions: 1 },
      { id: 78, name: 'NEET Test Exam 1777479206005', type: 'NEET', batch: '2024', duration: 60, scheduled_time: '2026-04-30T16:13:00', total_questions: 1 },
      { id: 79, name: 'T Y', type: 'NDA', batch: '2026', duration: 45, scheduled_time: '2026-05-03T10:24:00', total_questions: 2 },
      { id: 80, name: 'T Y', type: 'UPSC', batch: '2026', duration: 45, scheduled_time: '2026-05-03T10:44:00', total_questions: 14 }
    ];

    let inserted = 0;
    let updated = 0;

    for (const exam of examsData) {
      const result = await db.collection('exams').updateOne(
        { mysql_id: exam.id },
        { 
          $setOnInsert: {
            mysql_id: exam.id,
            name: exam.name,
            type: exam.type,
            batch: exam.batch,
            duration: exam.duration,
            scheduled_time: new Date(exam.scheduled_time),
            total_questions: exam.total_questions,
            created_at: new Date()
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        inserted++;
      } else {
        updated++;
      }
    }

    res.status(200).json({
      message: 'All exams migrated successfully!',
      summary: {
        totalMySQL: examsData.length,
        inserted,
        updated
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed exams', error: error.message });
  }
}

export default handler;
