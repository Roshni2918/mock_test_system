import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use POST to seed student exams' });
  }

  try {
    const { db } = await connectToDatabase();

    // ALL 12 STUDENT_EXAM RECORDS FROM MySQL
    const studentExams = [
      {
        student_id: 3,
        exam_id: 1,
        score: 1,
        status: 'completed',
        answers: { "1": 1, "2": 2, "3": 3, "4": 4, "5": 1 },
        time_taken: 450,
        submitted_at: new Date('2026-04-10T12:02:50')
      },
      {
        student_id: 3,
        exam_id: 6,
        score: 0,
        status: 'completed',
        answers: {},
        time_taken: 15,
        submitted_at: new Date('2026-04-10T12:19:34')
      },
      {
        student_id: 3,
        exam_id: 8,
        score: 1,
        status: 'completed',
        answers: { "1": 1, "2": 2, "3": 3, "4": 4, "5": 1 },
        time_taken: 450,
        submitted_at: new Date('2026-04-10T15:46:34')
      },
      {
        student_id: 3,
        exam_id: 16,
        score: 0,
        status: 'completed',
        answers: { "175": 435, "176": 438, "177": 442, "179": 451, "180": 454, "181": 459, "182": 462, "183": 465, "184": 471 },
        time_taken: 33,
        submitted_at: new Date('2026-04-13T16:35:39')
      },
      {
        student_id: 62,
        exam_id: 36,
        score: 10,
        status: 'completed',
        answers: { "277": 842, "278": 847, "279": 850, "280": 855, "281": 858, "282": 862, "283": 866, "284": 870, "285": 875, "286": 878, "287": 883, "288": 886, "289": 891, "290": 894, "291": 899, "292": 904, "293": 906, "294": 911, "295": 915, "296": 920, "297": 923, "298": 927, "299": 931, "300": 935, "301": 939, "302": 943, "303": 947, "304": 951, "305": 955, "306": 959, "307": 963, "308": 967, "309": 971, "310": 976, "311": 979, "312": 984, "313": 987, "314": 991, "315": 995, "316": 998, "317": 1004, "318": 1008 },
        time_taken: 111,
        submitted_at: new Date('2026-04-14T15:26:39')
      },
      {
        student_id: 71,
        exam_id: 45,
        score: 5,
        status: 'completed',
        answers: { "327": 1042, "328": 1045, "329": 1052, "330": 1055, "331": 1057, "332": 1063, "333": 1065, "334": 1070, "335": 1074, "336": 1080, "337": 1082, "338": 1088, "339": 1091, "340": 1093 },
        time_taken: 46,
        submitted_at: new Date('2026-04-14T17:25:56')
      },
      {
        student_id: 3,
        exam_id: 48,
        score: 7,
        status: 'completed',
        answers: { "371": 1217, "372": 1223, "373": 1228, "374": 1229, "375": 1234, "376": 1240, "377": 1242, "378": 1247, "379": 1249, "380": 1254, "381": 1260, "382": 1262, "383": 1268, "385": 1276, "386": 1277, "387": 1284, "388": 1287, "389": 1290, "390": 1295, "391": 1300, "392": 1304, "393": 1308, "394": 1312, "395": 1315, "396": 1317, "397": 1322, "398": 1328, "399": 1330, "400": 1336, "401": 1338, "402": 1341, "403": 1348 },
        time_taken: 106,
        submitted_at: new Date('2026-04-15T17:24:06')
      },
      {
        student_id: 97,
        exam_id: 67,
        score: 2,
        status: 'completed',
        answers: { "628": 2245, "629": 2250, "630": 2256, "631": 2258, "632": 2264, "633": 2267, "634": 2270, "635": 2273, "636": 2280, "637": 2284, "638": 2286, "639": 2289, "640": 2294, "641": 2297 },
        time_taken: 45,
        submitted_at: new Date('2026-04-27T23:02:56')
      },
      {
        student_id: 98,
        exam_id: 68,
        score: 0,
        status: 'completed',
        answers: { "668": 2407, "669": 2410, "670": 2415, "671": 2418, "672": 2424, "673": 2428, "674": 2430, "675": 2434, "676": 2439, "677": 2443, "678": 2446, "679": 2449, "680": 2454, "681": 2458, "682": 2461, "683": 2466, "684": 2472, "685": 2475, "686": 2478 },
        time_taken: 184,
        submitted_at: new Date('2026-04-28T13:09:30')
      },
      {
        student_id: 98,
        exam_id: 70,
        score: 0,
        status: 'completed',
        answers: { "715": 2596, "716": 2599, "717": 2603, "718": 2606, "719": 2612 },
        time_taken: 18,
        submitted_at: new Date('2026-04-28T22:27:51')
      },
      {
        student_id: 98,
        exam_id: 69,
        score: 0,
        status: 'completed',
        answers: {},
        time_taken: 6,
        submitted_at: new Date('2026-05-01T20:00:17')
      },
      {
        student_id: 114,
        exam_id: 80,
        score: 0,
        status: 'completed',
        answers: { "765": 2793, "766": 2798 },
        time_taken: 33,
        submitted_at: new Date('2026-05-03T10:59:07')
      }
    ];

    let inserted = 0;
    let updated = 0;

    for (const record of studentExams) {
      // Find student by old MySQL ID pattern (stored as mysql_id or find by email pattern)
      const student = await db.collection('users').findOne({ 
        role: 'student',
        $or: [
          { mysql_id: record.student_id },
          { id: record.student_id }
        ]
      });

      // Find exam by old MySQL ID
      const exam = await db.collection('exams').findOne({
        $or: [
          { mysql_id: record.exam_id },
          { id: record.exam_id }
        ]
      });

      if (student && exam) {
        const result = await db.collection('student_exams').updateOne(
          { 
            student_id: student._id,
            exam_id: exam._id
          },
          { 
            $setOnInsert: {
              student_id: student._id,
              exam_id: exam._id,
              score: record.score,
              status: record.status,
              answers: record.answers,
              time_taken: record.time_taken,
              submitted_at: record.submitted_at,
              created_at: record.submitted_at
            }
          },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          inserted++;
        } else if (result.modifiedCount === 0) {
          updated++;
        }
      }
    }

    res.status(200).json({
      message: 'Student exam records migrated successfully!',
      summary: {
        totalInMySQL: studentExams.length,
        inserted,
        updated,
        note: 'Records matched by student_id and exam_id from MySQL'
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed student exams', error: error.message });
  }
}

export default handler;
