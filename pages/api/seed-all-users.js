import { connectToDatabase } from '../../lib/mongodb';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use POST to seed all users' });
  }

  try {
    const { db } = await connectToDatabase();

    const results = {
      admins: [],
      students: []
    };

    // ALL 82 USERS FROM MySQL
    const allUsers = [
      // ADMINS (2)
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: '$2b$10$examplehashedpassword',
        role: 'admin',
        batch: null,
        exam_type: null,
        mobile_no: null,
        roll_no: null,
        admission_year: null,
        created_at: new Date('2026-04-07T16:37:18')
      },
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: '$2a$10$NU6Xuq6xv9/6fUF.EKbbUua8byhFfRDDMdEBw6zB0tukIErlnvm8q',
        role: 'admin',
        batch: null,
        exam_type: null,
        mobile_no: null,
        roll_no: null,
        admission_year: null,
        created_at: new Date('2026-04-07T16:53:35')
      },
      // STUDENTS (80)
      { name: 'Chetana pawar', email: 'student1@test.com', password: '$2a$10$1zChVZxHTlUQX276VoVFAOj4hf/5YP4FJwcZOWq0sPdhdXRGh2FuG', role: 'student', batch: '2024', exam_type: 'SBC', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-07T16:53:35') },
      { name: 'Aman Patel', email: 'student3@test.com', password: '$2a$10$GPO5..RQZUICoekXDgUOvuqKNOr.Zpzzo7C2HGCXLcR1VEgjJQwDm', role: 'student', batch: '2025', exam_type: 'Mock Test', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-10T11:58:51') },
      { name: 'Test JEE Student', email: 'testjee@test.com', password: '$2a$10$5YkAEmcdYBxXVrVmVM.LiuONubhQ.GarWyK3RyIaxqWX7k3MOYX.i', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:18:36') },
      { name: 'Student JEE', email: 'studentJEE@test.com', password: '$2a$10$BAIB8TbPulWLYrK4XM2mQOvo.VxjZ9gxxUky1reQCS6gPb6fzvLhO', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:18:40') },
      { name: 'Student NEET', email: 'studentNEET@test.com', password: '$2a$10$63CXQSU4KDGk/hlIhtf0tOMw8SVWpNVJ/WwbrIZz3P2Ug8PPAZnMC', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:18:40') },
      { name: 'Student NDA', email: 'studentNDA@test.com', password: '$2a$10$JW2/tupCHDxscdwrtiZjQe93iAyb0LapilG.TXd8vu9MHhGscyFUO', role: 'student', batch: '2024', exam_type: 'NDA', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:18:40') },
      { name: 'Test Student 1776156581450', email: 'test1776156581450@test.com', password: '$2a$10$fLfllHF1MaHBnGmGeMpXquyOZgGF1R2srmhHo4.yr.cmD8rXoS9IW', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:19:41') },
      { name: 'NEET Student 1776156581450', email: 'neet1776156581450@test.com', password: '$2a$10$H5vjqlsnW/ijb9GlpazWx.Vyec2xIJ2BrZnU2/Dxn2WCnmlC6ZHDO', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:19:41') },
      { name: 'Test Student 1776156601036', email: 'test1776156601036@test.com', password: '$2a$10$lcCQy51p5XPLYI0TzwwY2e9NeK4/eZgrYf8t5r2UHlAooiP6ATei6', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:20:01') },
      { name: 'NEET Student 1776156601036', email: 'neet1776156601036@test.com', password: '$2a$10$z2g2.pU1M/1tNPu8Z2c9d.vbJPYJP9Y6.AyFxxRJcDDIQojWzcdXq', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:20:01') },
      { name: 'Debug Student 1776156628949', email: 'debug1776156628949@test.com', password: '$2a$10$u6Qs1BstPnvCmDa5is92kueVPbScryKwZpP..9pnOR13vB.W0FPeq', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:20:29') },
      { name: 'Debug Student 1776156658383', email: 'debug1776156658383@test.com', password: '$2a$10$GvQpgvjt/kI5K5Kmro1b2eSXe5jb8rUIoYYPRJbnG.UU0u636u49O', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:20:58') },
      { name: 'Debug Student 1776156669070', email: 'debug1776156669070@test.com', password: '$2a$10$Irug4/MHQ9tI/Hjgmccbge5nmOYe0blnR5uzA8rfjjCc2V3nmHM.G', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:21:09') },
      { name: 'Debug Student 1776156675285', email: 'debug1776156675285@test.com', password: '$2a$10$nXV/6Vqz7RmImCYgIMG5/eY3W1AqyBQZbyGttSZclNFwH3je0hlpS', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:21:15') },
      { name: 'Direct Test Student 1776156700557', email: 'direct1776156700557@test.com', password: '$2a$10$Re/2RipgwEiVh8Z3DA/EJe5x.A.5.lUg0Z8rBpIsh6J6yzGQY4fUW', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:21:40') },
      { name: 'NEET Direct Test 1776156700557', email: 'neetdirect1776156700557@test.com', password: '$2a$10$S2lo/ClpmhvS10JY5cbgI.jmdeugiya.mLlnE8r5H1KVQBQSTKRJm', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:21:40') },
      { name: 'Direct Test Student 1776156764083', email: 'direct1776156764083@test.com', password: '$2a$10$VYhYWe0kKAHAo3z6FaB7TeFgokWrqpDqKohrYuWUfB49m9we/ridK', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:22:44') },
      { name: 'NEET Direct Test 1776156764083', email: 'neetdirect1776156764083@test.com', password: '$2a$10$CI1U2knR8y2H/nGvexyuieM/1stLZgzqP8pTk9XE86va044RlEkYO', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:22:44') },
      { name: 'Direct Test Student 1776157439412', email: 'direct1776157439412@test.com', password: '$2a$10$GSnXZBnix2UYS3EftZLg0uhBJDZW/5eI9xwf52bARpSvUTrmRdG8m', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:33:59') },
      { name: 'NEET Direct Test 1776157439412', email: 'neetdirect1776157439412@test.com', password: '$2a$10$cSFLM7tvsSQz.8FpWKXXo.4tfPCmQjoE.ZXtmEwKHf6jG5JCHX2aW', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:33:59') },
      { name: 'JEE Test Student 1776157598997', email: 'jee1776157598997@test.com', password: '$2a$10$phjt5ElTRiShyLhkYX4RHuC5bNjwt1S5jcSeo9dniWWAzUFljacO2', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:36:39') },
      { name: 'NEET Test Student 1776157599102', email: 'neet1776157599102@test.com', password: '$2a$10$HKriAbAvUBrnXaB4Eadntuc1XqA8T9C60RuAE.6jpOvf85pk4Ipbi', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:36:39') },
      { name: 'Direct Test Student 1776157799208', email: 'direct1776157799208@test.com', password: '$2a$10$i2ORkFnsYbJOTphG5bXPu.oGdlDEMprZ167kJKnDIFtqgXm9gNgiW', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:39:59') },
      { name: 'NEET Direct Test 1776157799208', email: 'neetdirect1776157799208@test.com', password: '$2a$10$Tc7z5cKGt9Aj6KKT7Nr54.Z4s/GY92rpT1y3371JAaBQbgl8Zr8NK', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:39:59') },
      { name: 'JEE Student 1776158949728', email: 'jee1776158949728@test.com', password: '$2a$10$5.A/d7Mvbfyu.pDdMcJXveETCuqj9aIVNI6GFseT18iYWPZENn2SK', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T14:59:09') },
      { name: 'JEE Test Student 1776159490412', email: 'jee1776159490412@test.com', password: '$2a$10$MIx/M7GsNA/EaCXQXoGJJ.vPRVj0pPtAUYPV0nJL/WQmtxmTduy1y', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T15:08:10') },
      { name: 'NEET Test Student 1776159490633', email: 'neet1776159490633@test.com', password: '$2a$10$E0CpKeBNI.JC4AAzD8ezXuvBqb3k6NXmEddtuHVXORf9cOENUXL0q', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T15:08:10') },
      { name: 'JEE Test Student 1776159495885', email: 'jee1776159495885@test.com', password: '$2a$10$JozLokR4jv8KXb2JT.bHKe5o.OSvGt1xco6Gr/J2HStubKARJJa5G', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T15:08:16') },
      { name: 'NEET Test Student 1776159496066', email: 'neet1776159496066@test.com', password: '$2a$10$6HBJFYNhET4iJ7COoOodpOzhmwm3TdtPPQHbB93Rc5lt5UaTorqO6', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T15:08:16') },
      { name: 'JEE Student 1776159667631', email: 'jee1776159667631@test.com', password: '$2a$10$6E2oaRnlQ2MPHpVXadbwNeM.cnQmH26HUNx34MbPFecrSzwFVsNwC', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T15:11:07') },
      { name: 'JEE Student 1776159838341', email: 'jee1776159838341@test.com', password: '$2a$10$MHb1pjJvDbg1IegHEYu37.8Oa8uM2Hjs3crJ4LETii7lTflGUj0/a', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T15:13:58') },
      { name: 'JEE Student 1776159966422', email: 'jee1776159966422@test.com', password: '$2a$10$Ip36b2vp/SlBoz8IjSd0HuYuxTrIzaDLwvYMyi.BDf/kGm3P4hbf6', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T15:16:06') },
      { name: 'Gayatri pujari', email: 'gayatri@gmail.com', password: '$2a$10$F1GHoamynIM1Ff.awIM1oOXvkUReDzJg4pab5osjWRH7Ncemmtb3.', role: 'student', batch: '2025', exam_type: 'Practice Test', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T15:22:43') },
      { name: 'JEE Test Student 1776167045412', email: 'jee1776167045412@test.com', password: '$2a$10$oD1q9YfPQYBhJ/LC0WoB2OIZGITOwU9ORnJVDE2Kh/f2pyAY7m976', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:14:05') },
      { name: 'NEET Test Student 1776167045412', email: 'neet1776167045412@test.com', password: '$2a$10$nQE/nmEx2ATtO7ObAcsxY.0md9zn.mUye5sT.vENzt8kK7CfkjyMO', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:14:05') },
      { name: 'JEE Test Student 1776167086945', email: 'jee1776167086945@test.com', password: '$2a$10$Xd96EKUXbLZ6zZiO7ovFGuMT2zptuD76Id75bpoLLJcIJlIFq/.Ky', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:14:47') },
      { name: 'NEET Test Student 1776167086945', email: 'neet1776167086945@test.com', password: '$2a$10$BpyPQMP192Q6TSVwCH673uyVUTcyMLkzRwkKfte/1REgN37q3NQqO', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:14:47') },
      { name: 'JEE Test Student 1776167340811', email: 'jee1776167340811@test.com', password: '$2a$10$EhdOVTkc94YNbR634X3PQ.p/QiFV3PK9wIZ2/f8lDhLpbz4ZvehlK', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:19:01') },
      { name: 'NEET Test Student 1776167340811', email: 'neet1776167340811@test.com', password: '$2a$10$LZ6ehBZ5szNiBykeJDD3..AlhWzJGnw2/81GJsFJXxNMBPRuuyBae', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:19:01') },
      { name: 'JEE Test Student 1776167495830', email: 'jee1776167495830@test.com', password: '$2a$10$h7NIyRj4Q0ZFxdlgKXE1vuFTudkiw8omJ4QVX2S4mUz1qk.LmVsya', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:21:36') },
      { name: 'NEET Test Student 1776167495830', email: 'neet1776167495830@test.com', password: '$2a$10$hKrW/A0RqSbyKYINjaeU4enhZLcKzNmqnPsI55x5rOzBg0HQjQyaq', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:21:36') },
      { name: 'Roshni Pawar', email: 'roshni@gmail.com', password: '$2a$10$Zl9HQwJQxEbZjVRpcSG1YeaKRyQFAqIzrXyWzWpJSq/Mt8Eu/JKLO', role: 'student', batch: '2025', exam_type: 'UPSC', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:24:17') },
      { name: 'JEE Test Student 1776168175768', email: 'jee1776168175768@test.com', password: '$2a$10$byzuz3RbXmNWmRCnJdX8S.9K1LCdz5mXdZbrHaxc65rM6FnRWeWEq', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:32:56') },
      { name: 'shreya patil', email: 'shreya@gmail.com', password: '$2a$10$LUnYytlf2fX0ewhjWWpAlOHwzmDTGAK1GhriKubXw54.9EAm6VTxa', role: 'student', batch: '2024', exam_type: 'Mock Test', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:34:52') },
      { name: 'JEE Test Student 1776168873959', email: 'jee1776168873959@test.com', password: '$2a$10$23J/pD5i6/OoLkioLmZyLuqzNx7QFtSl38uHirxcRWCKG76G3dEGK', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T17:44:34') },
      { name: 'Sanika Tandle', email: 'sanika@gmail.com', password: '$2a$10$HB6KHmYLtfzEWBcCVylrFeEBFQXai805YgQt/cCM2TC1PePbGsPOW', role: 'student', batch: '2025', exam_type: 'NDA', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-14T18:24:17') },
      { name: 'JEE Test Student 1776425208203', email: 'jee1776425208203@test.com', password: '$2a$10$CUHfyRlGkUHT22s/VCn2e.JwLUDSdvis/ZlxRSI8qW1sD1NmTvAba', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-17T16:56:48') },
      { name: 'NEET Test Student 1776425208203', email: 'neet1776425208203@test.com', password: '$2a$10$lDH5KrX4YwPVbRLbDqpN..PqFy6QsE53nXdA7GbLq9vKDAfFK7/cS', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-17T16:56:48') },
      { name: 'JEE Test Student 1776425234830', email: 'jee1776425234830@test.com', password: '$2a$10$DSqolC1KvFzkh/rhXkFkFOdcHqG.I1Jj5GShzcC3mjb..1GpMvUWq', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-17T16:57:15') },
      { name: 'NEET Test Student 1776425234830', email: 'neet1776425234830@test.com', password: '$2a$10$bs4p4.nj3VDYFJ/PRChC/.wF28h86lCd15IbP/2Q8IAA2AnaPYuQG', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-17T16:57:15') },
      { name: 'JEE Test Student 1777308279973', email: 'jee1777308279973@test.com', password: '$2a$10$6z8VbfHCPxv3lyG8kjU1Y.MzJz.65NybOG9CIh7l7i/cEPCGNr09m', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:14:40') },
      { name: 'NEET Test Student 1777308279973', email: 'neet1777308279973@test.com', password: '$2a$10$nnwQImqMyqrUEykLQfjTdehVn.TR658QaWRjg6UKZUltoyBGdsgsy', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:14:40') },
      { name: 'JEE Test Student 1777308717742', email: 'jee1777308717742@test.com', password: '$2a$10$I3yWZubmGkO/6sxruQQx.ONVYjMlJ4.vu07fMEUU/PfnW3k70Isxm', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:21:57') },
      { name: 'NEET Test Student 1777308717742', email: 'neet1777308717742@test.com', password: '$2a$10$7h17/OOSx8kE8vym5QCt..jltUXyYuPbWfxJNO1qAqVY2O9vOZ4BG', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:21:58') },
      { name: 'JEE Test Student 1777309457462', email: 'jee1777309457462@test.com', password: '$2a$10$DcZvr01N982h0qhKhA/.vuiodY/1ZAibM4Xi1PJXjRwdmooMy7zHm', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:34:17') },
      { name: 'NEET Test Student 1777309457462', email: 'neet1777309457462@test.com', password: '$2a$10$ayCi/IrzqWJIiewZ2sujee3P6WLYwAsusXLFQP.oSYeMPpf0F4YA6', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:34:17') },
      { name: 'JEE Test Student 1777310341321', email: 'jee1777310341321@test.com', password: '$2a$10$L/bBGTieJ4i4HJN26MV4jeGq2Wg3sPUoRBuBloS0MFV8Pwj37l1oi', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:49:01') },
      { name: 'NEET Test Student 1777310341321', email: 'neet1777310341321@test.com', password: '$2a$10$NJquIy40qdFc2iaD9Q8taOcIjcZN/P2RiTg4xG4PbxVuLj.A9zDbS', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:49:01') },
      { name: 'Debug Student 1777310773419', email: 'debug1777310773419@test.com', password: '$2a$10$.t0d1yqL6w0vN1I20Wb3MusVo6hBx3PAW1F/chVooUX3I9HN9WpvK', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:56:13') },
      { name: 'Debug Student 1777310817301', email: 'debugfix1777310817301@test.com', password: '$2a$10$.UWeFv126HttWnKDkJxyAep33NunSc/5o/QAJduw60/5bflcnNEwK', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:56:57') },
      { name: 'Debug Student 1777310914013', email: 'debugfix21777310914013@test.com', password: '$2a$10$TlDQQBTRH9Vj8gz/6kkXV.bubAhfVep89k/vd.2J8RB49E5vYk.s2', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-27T22:58:34') },
      { name: 'Sanika patil', email: 'sanika15@gmail.com', password: '$2a$10$RKtbOz5/c1EClFg9MKeom.GCok0D2V.3s5.c50O7X7G3Hf9ed1fom', role: 'student', batch: '2026', exam_type: 'JEE', mobile_no: '4567879890', roll_no: '1001', admission_year: 2026, created_at: new Date('2026-04-27T23:01:51') },
      { name: 'Roshu Patil', email: 'roshu@gmail.com', password: '$2a$10$lilsfM152uYuJDYTYzWODuF3iUce8Bp8IlpNDNoXrKoJQx2BEZUmK', role: 'student', batch: '2026', exam_type: 'Mock Test', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-28T13:03:42') },
      { name: 'JEE Test Student 1777367707273', email: 'jee1777367707273@test.com', password: '$2a$10$W6t51EnGYPAIOjzuGVTqJeKX1sJd5vHKOgjKFkpJwKZwd5GyGaZWO', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-28T14:45:07') },
      { name: 'NEET Test Student 1777367707273', email: 'neet1777367707273@test.com', password: '$2a$10$Bc93DK4pFL9KnXZNbS6nIuvEXq6ljnCeYb2iziawJ3STq2ESMGoN.', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-28T14:45:07') },
      { name: 'JEE Test Student 1777367720895', email: 'jee1777367720895@test.com', password: '$2a$10$IjWeYlKLd40BSucy1811suni.xZVQKmAW22If4PXZzBjrbfcaggbO', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-28T14:45:21') },
      { name: 'NEET Test Student 1777367720895', email: 'neet1777367720895@test.com', password: '$2a$10$Rki6OQPiKOA5eJHBE36Jju5kqJhSM76i5afdW7YilvV0HsP8J3f8G', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-28T14:45:21') },
      { name: 'JEE Test Student 1777479174072', email: 'jee1777479174072@test.com', password: '$2a$10$dxNIWEhFBdtPb4sczf7d8OTH2/A/KegC714QQipfQC1mr8vveB1SW', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-29T21:42:54') },
      { name: 'NEET Test Student 1777479174072', email: 'neet1777479174072@test.com', password: '$2a$10$PZ7AylsIzTOTkDrN4rowkOrjKT5pBjrESRpWATM.tIEeulHKaBcYC', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-29T21:42:54') },
      { name: 'JEE Test Student 1777479205465', email: 'jee1777479205465@test.com', password: '$2a$10$Lmi1BnNLeX5fWmarAyZZWux60aIX3j00XgJ8RgCAg6QclhktYl45C', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-29T21:43:25') },
      { name: 'NEET Test Student 1777479205684', email: 'neet1777479205684@test.com', password: '$2a$10$3tBSpu.P9WkpdFEovuDKX.M3e3nf4658mrNoP22uwCGukWXCfC2ja', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: null, roll_no: null, admission_year: null, created_at: new Date('2026-04-29T21:43:25') },
      { name: 'Tina Patil', email: 'tina1001@gmail.com', password: '$2a$10$Mhj95Hn8m7lghoypBbuz8.y2gvd6.U5WF69XtsC0kMgOQ2xyCjNPq', role: 'student', batch: '2026', exam_type: 'JEE', mobile_no: '4567879890', roll_no: '1001', admission_year: 2026, created_at: new Date('2026-05-02T21:30:42') },
      { name: 'Rahul Sharma', email: 'rahul1002@gmail.com', password: '$2a$10$d.PZdYqOEVtXLsxo.Yo6HOPwrJG2Xag3L56kTac.jlI5cRfteTTLO', role: 'student', batch: '2024', exam_type: 'JEE', mobile_no: '9876543210', roll_no: '1002', admission_year: 2024, created_at: new Date('2026-05-02T21:31:40') },
      { name: 'Priya Patel', email: 'priya1003@gmail.com', password: '$2a$10$gkGYrZqhJFkofg3/0nBrL.gqVU0lCLvZCrgogfYZ1ACqKlxVvxIJe', role: 'student', batch: '2024', exam_type: 'NEET', mobile_no: '9876543211', roll_no: '1003', admission_year: 2024, created_at: new Date('2026-05-02T21:31:40') },
      { name: 'Kaveri Patil', email: 'kaveri1004@gmail.com', password: '$2a$10$XQIL5Zc4.c4iw9K5.8AjpetJMrOAtU0.tJEvpDu0C6V5JBUgSFRGW', role: 'student', batch: '2025', exam_type: 'Mock Test', mobile_no: '8675432145', roll_no: '1004', admission_year: 2025, created_at: new Date('2026-05-02T21:43:56') },
      { name: 'divya patil', email: 'divya1005@gmail.com', password: '$2a$10$c23dFOWc6P0fTjpI2/72..aE9GurPEMG4i7JSEkfZed589S9JMaFu', role: 'student', batch: '2026', exam_type: 'Practice Test', mobile_no: null, roll_no: '1005', admission_year: 2026, created_at: new Date('2026-05-03T10:20:12') },
      { name: 'tejshri', email: 'tejshri1006@gmail.com', password: '$2a$10$t.LOaw1oFqw/SJHpNd.9WOxMaGKbZK8F.5m/ZSvRhSFAxEpHL6rvu', role: 'student', batch: '2025', exam_type: 'NDA', mobile_no: '5742839047', roll_no: '1006', admission_year: 2025, created_at: new Date('2026-05-03T10:22:57') },
      { name: 'sanal patil', email: 'sanal1007@gmail.com', password: '$2a$10$c7LiS8jT/7cvl2D/m3XvbugJURJpg6p8PBJNpiH3SuoWd.NrAquI6', role: 'student', batch: '2026', exam_type: 'Mock Test', mobile_no: '2345677898', roll_no: '1007', admission_year: 2026, created_at: new Date('2026-05-03T10:35:11') },
      { name: 'Ranu patil', email: 'ranu1008@gmail.com', password: '$2a$10$uq0NahEGZx4ekLjBY0rlC.mDQ1e9SQpRXIFYABHamui.rKcCDN8PS', role: 'student', batch: '2026', exam_type: 'UPSC', mobile_no: '8796543212', roll_no: '1008', admission_year: 2026, created_at: new Date('2026-05-03T10:44:09') },
      { name: 'Arohi patil', email: 'arohi1009@vijeta.com', password: '$2a$10$BdZQBqes1Hp/qfjh8GCiVenvd7kX6LtcoLHaph9x5uGoelttAf.LG', role: 'student', batch: '2025', exam_type: 'JEE', mobile_no: '8675432145', roll_no: '1009', admission_year: 2025, created_at: new Date('2026-05-04T13:19:28') }
    ];

    for (const user of allUsers) {
      await db.collection('users').updateOne(
        { email: user.email },
        { $setOnInsert: user },
        { upsert: true }
      );
      
      if (user.role === 'admin') {
        results.admins.push(user.email);
      } else {
        results.students.push({ name: user.name, email: user.email });
      }
    }

    res.status(200).json({
      message: 'ALL 82 USERS MIGRATED SUCCESSFULLY! 🎉',
      summary: {
        totalUsers: allUsers.length,
        admins: results.admins.length,
        students: results.students.length
      },
      details: {
        admins: results.admins,
        studentCount: results.students.length
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed users', error: error.message });
  }
}

export default handler;
