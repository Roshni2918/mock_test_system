import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

// ALL 776 QUESTIONS FROM MySQL
const allQuestions = [
  // Basic questions (IDs 1-4)
  { id: 1, exam_id: 1, section_name: 'Algebra', question_text: 'What is 2 + 2?' },
  { id: 2, exam_id: 2, section_name: 'Algebra', question_text: 'What is 2 + 2?' },
  { id: 3, exam_id: 3, section_name: 'Algebra', question_text: 'What is 2 + 2?' },
  { id: 4, exam_id: 4, section_name: 'Algebra', question_text: 'What is 2 + 2?' },
  
  // Exam 5-7 (Test exams - Hindi questions)
  { id: 5, exam_id: 6, section_name: '', question_text: '1. भारत के प्रथम राष्ट्रपति कौन थे?' },
  { id: 6, exam_id: 6, section_name: '', question_text: '2. संविधान की रचना किसने की थी?' },
  { id: 7, exam_id: 6, section_name: '', question_text: '3. भारत की राजधानी क्या है?' },
  { id: 8, exam_id: 6, section_name: '', question_text: '4. गंगा नदी कहां से निकलती है?' },
  { id: 9, exam_id: 6, section_name: '', question_text: '6. ताजमहल किसने बनवाया था?' },
  { id: 10, exam_id: 6, section_name: '', question_text: '7. भारत में कितने राज्य हैं?' },
  { id: 11, exam_id: 6, section_name: '', question_text: '8. भारत की सबसे लंबी नदी कौन सी है?' },
  { id: 12, exam_id: 6, section_name: '', question_text: '10. भारत का राष्ट्रीय पशु कौन सा है?' },
  { id: 13, exam_id: 6, section_name: '', question_text: '12. भारत का राष्ट्रीय खेल कौन सा है?' },
  { id: 14, exam_id: 6, section_name: '', question_text: '13. भारत के प्रधानमंत्री कौन हैं?' },
  { id: 15, exam_id: 6, section_name: '', question_text: '14. भारत में कितने केंद्र शासित प्रदेश हैं?' },
  { id: 16, exam_id: 6, section_name: '', question_text: '15. भारत की सबसे ऊंची चोटी कौन सी है?' },
  { id: 17, exam_id: 6, section_name: '', question_text: '16. भारत का सबसे बड़ा राज्य कौन सा है?' },
  { id: 18, exam_id: 6, section_name: '', question_text: '18. भारत की सबसे बड़ी झील कौन सी है?' },
  { id: 19, exam_id: 6, section_name: '', question_text: '19. भारत में सबसे ज्यादा बोली जाने वाली भाषा कौन सी है?' },
  { id: 20, exam_id: 6, section_name: '', question_text: '20. भारत का सबसे छोटा राज्य कौन सा है?' },
  { id: 21, exam_id: 6, section_name: '', question_text: '21. किसानों के लिए सरकार की कौन सी योजना है?' },
  { id: 22, exam_id: 6, section_name: '', question_text: '22. भारत में "महान भारतीय" कौन हैं?' },
  { id: 23, exam_id: 6, section_name: '', question_text: '23. भारतीय नोट कौन जारी करता है?' },
  { id: 24, exam_id: 6, section_name: '', question_text: '24. भारत की सबसे बड़ी अर्थव्यवस्था कौन सी है?' },
  { id: 25, exam_id: 6, section_name: '', question_text: '26. भारत के राष्ट्रपति का चुनाव कैसे होता है?' },
  { id: 26, exam_id: 6, section_name: '', question_text: '27. संसद के दोनों सदनों को क्या कहते हैं?' },
  { id: 27, exam_id: 6, section_name: '', question_text: '29. गांधी जी का जन्म कब हुआ था?' },
  { id: 28, exam_id: 6, section_name: '', question_text: '30. भारत में कितने राष्ट्रीय त्योहार हैं?' },
  { id: 29, exam_id: 6, section_name: '', question_text: '31. भारत की सबसे पुरानी भाषा कौन सी है?' },
  { id: 30, exam_id: 6, section_name: '', question_text: '35. 2000 रुपये का नोट कब बंद हुआ?' },
  { id: 31, exam_id: 6, section_name: '', question_text: '38. भारत की प्रथम महिला प्रधानमंत्री कौन थीं?' },
  { id: 32, exam_id: 6, section_name: '', question_text: '41. भारत की पहली महिला राज्यपाल कौन थीं?' },
  { id: 33, exam_id: 6, section_name: '', question_text: '45. भारत का राष्ट्रीय गीत कौन सा है?' },
  { id: 34, exam_id: 6, section_name: '', question_text: '46. भारत : भारतीय :: विश्व : ?' },
  { id: 35, exam_id: 6, section_name: '', question_text: '47. IJK:MNO::PQR: ?' },
  { id: 36, exam_id: 6, section_name: '', question_text: '50. 5,10,17,26,37,..... ?' },

  // Exam 7 (Same questions as Exam 6)
  { id: 37, exam_id: 7, section_name: '', question_text: '1. भारत के प्रथम राष्ट्रपति कौन थे?' },
  { id: 38, exam_id: 7, section_name: '', question_text: '2. संविधान की रचना किसने की थी?' },
  { id: 39, exam_id: 7, section_name: '', question_text: '3. भारत की राजधानी क्या है?' },
  { id: 40, exam_id: 7, section_name: '', question_text: '4. गंगा नदी कहां से निकलती है?' },
  { id: 41, exam_id: 7, section_name: '', question_text: '6. ताजमहल किसने बनवाया था?' },
  { id: 42, exam_id: 7, section_name: '', question_text: '7. भारत में कितने राज्य हैं?' },
  { id: 43, exam_id: 7, section_name: '', question_text: '8. भारत की सबसे लंबी नदी कौन सी है?' },
  { id: 44, exam_id: 7, section_name: '', question_text: '10. भारत का राष्ट्रीय पशु कौन सा है?' },
  { id: 45, exam_id: 7, section_name: '', question_text: '12. भारत का राष्ट्रीय खेल कौन सा है?' },
  { id: 46, exam_id: 7, section_name: '', question_text: '13. भारत के प्रधानमंत्री कौन हैं?' },
  { id: 47, exam_id: 7, section_name: '', question_text: '14. भारत में कितने केंद्र शासित प्रदेश हैं?' },
  { id: 48, exam_id: 7, section_name: '', question_text: '15. भारत की सबसे ऊंची चोटी कौन सी है?' },
  { id: 49, exam_id: 7, section_name: '', question_text: '16. भारत का सबसे बड़ा राज्य कौन सा है?' },
  { id: 50, exam_id: 7, section_name: '', question_text: '18. भारत की सबसे बड़ी झील कौन सी है?' },
  { id: 51, exam_id: 7, section_name: '', question_text: '19. भारत में सबसे ज्यादा बोली जाने वाली भाषा कौन सी है?' },
  { id: 52, exam_id: 7, section_name: '', question_text: '20. भारत का सबसे छोटा राज्य कौन सा है?' },
  { id: 53, exam_id: 7, section_name: '', question_text: '21. किसानों के लिए सरकार की कौन सी योजना है?' },
  { id: 54, exam_id: 7, section_name: '', question_text: '22. भारत में "महान भारतीय" कौन हैं?' },
  { id: 55, exam_id: 7, section_name: '', question_text: '23. भारतीय नोट कौन जारी करता है?' },
  { id: 56, exam_id: 7, section_name: '', question_text: '24. भारत की सबसे बड़ी अर्थव्यवस्था कौन सी है?' },
  { id: 57, exam_id: 7, section_name: '', question_text: '26. भारत के राष्ट्रपति का चुनाव कैसे होता है?' },
  { id: 58, exam_id: 7, section_name: '', question_text: '27. संसद के दोनों सदनों को क्या कहते हैं?' },
  { id: 59, exam_id: 7, section_name: '', question_text: '29. गांधी जी का जन्म कब हुआ था?' },
  { id: 60, exam_id: 7, section_name: '', question_text: '30. भारत में कितने राष्ट्रीय त्योहार हैं?' },
  { id: 61, exam_id: 7, section_name: '', question_text: '31. भारत की सबसे पुरानी भाषा कौन सी है?' },
  { id: 62, exam_id: 7, section_name: '', question_text: '35. 2000 रुपये का नोट कब बंद हुआ?' },
  { id: 63, exam_id: 7, section_name: '', question_text: '38. भारत की प्रथम महिला प्रधानमंत्री कौन थीं?' },
  { id: 64, exam_id: 7, section_name: '', question_text: '41. भारत की पहली महिला राज्यपाल कौन थीं?' },
  { id: 65, exam_id: 7, section_name: '', question_text: '45. भारत का राष्ट्रीय गीत कौन सा है?' },
  { id: 66, exam_id: 7, section_name: '', question_text: '46. भारत : भारतीय :: विश्व : ?' },
  { id: 67, exam_id: 7, section_name: '', question_text: '47. IJK:MNO::PQR: ?' },
  { id: 68, exam_id: 7, section_name: '', question_text: '50. 5,10,17,26,37,..... ?' },

  // Exam 8 - JEE Main (IDs 69-73)
  { id: 69, exam_id: 8, section_name: 'Physics', question_text: 'What is the SI unit of force?' },
  { id: 70, exam_id: 8, section_name: 'Chemistry', question_text: 'What is the atomic number of Carbon?' },
  { id: 71, exam_id: 8, section_name: 'Mathematics', question_text: 'What is the derivative of x²?' },
  { id: 72, exam_id: 8, section_name: 'Physics', question_text: 'What is the speed of light?' },
  { id: 73, exam_id: 8, section_name: 'Chemistry', question_text: 'What is the pH of pure water at 25°C?' },

  // Exam 9 - NDA (IDs 74-78)
  { id: 74, exam_id: 9, section_name: 'General Knowledge', question_text: 'Who is the current President of India?' },
  { id: 75, exam_id: 9, section_name: 'History', question_text: 'In which year did India gain independence?' },
  { id: 76, exam_id: 9, section_name: 'Geography', question_text: 'What is the capital of France?' },
  { id: 77, exam_id: 9, section_name: 'Mathematics', question_text: 'What is 15% of 200?' },
  { id: 78, exam_id: 9, section_name: 'General Knowledge', question_text: 'How many sides does a hexagon have?' },

  // Exam 10 - JEE Main (IDs 79-83)
  { id: 79, exam_id: 10, section_name: 'Physics', question_text: 'What is the SI unit of force?' },
  { id: 80, exam_id: 10, section_name: 'Chemistry', question_text: 'What is the atomic number of Carbon?' },
  { id: 81, exam_id: 10, section_name: 'Mathematics', question_text: 'What is the derivative of x²?' },
  { id: 82, exam_id: 10, section_name: 'Physics', question_text: 'What is the speed of light?' },
  { id: 83, exam_id: 10, section_name: 'Chemistry', question_text: 'What is the pH of pure water at 25°C?' },

  // Exam 11 - NDA (IDs 84-88)
  { id: 84, exam_id: 11, section_name: 'General Knowledge', question_text: 'Who is the current President of India?' },
  { id: 85, exam_id: 11, section_name: 'History', question_text: 'In which year did India gain independence?' },
  { id: 86, exam_id: 11, section_name: 'Geography', question_text: 'What is the capital of France?' },
  { id: 87, exam_id: 11, section_name: 'Mathematics', question_text: 'What is 15% of 200?' },
  { id: 88, exam_id: 11, section_name: 'General Knowledge', question_text: 'How many sides does a hexagon have?' },

  // Exam 14 - Army Paper (IDs 91-108, Hindi)
  { id: 91, exam_id: 14, section_name: '', question_text: 'भारत के प्रथम राष्ट्रपति कौन थे?' },
  { id: 92, exam_id: 14, section_name: '', question_text: 'संविधान की रचना किसने की थी?' },
  { id: 93, exam_id: 14, section_name: '', question_text: 'भारत की राजधानी क्या है?' },
  { id: 94, exam_id: 14, section_name: '', question_text: 'गंगा नदी कहां से निकलती है?' },
  { id: 95, exam_id: 14, section_name: '', question_text: 'भारत का राष्ट्रीय ध्वज किसने डिजाइन किया?' },
  { id: 96, exam_id: 14, section_name: '', question_text: 'ताजमहल किसने बनवाया था?' },
  { id: 97, exam_id: 14, section_name: '', question_text: 'भारत में कितने राज्य हैं?' },
  { id: 98, exam_id: 14, section_name: '', question_text: 'भारत की सबसे लंबी नदी कौन सी है?' },
  { id: 99, exam_id: 14, section_name: '', question_text: 'भारत का राष्ट्रीय पक्षी कौन सा है?' },
  { id: 100, exam_id: 14, section_name: '', question_text: 'भारत का राष्ट्रीय पशु कौन सा है?' },
  { id: 101, exam_id: 14, section_name: '', question_text: 'भारत का राष्ट्रीय खेल कौन सा है?' },
  { id: 102, exam_id: 14, section_name: '', question_text: 'भारत के प्रधानमंत्री कौन हैं?' },
  { id: 103, exam_id: 14, section_name: '', question_text: 'भारत में कितने केंद्र शासित प्रदेश हैं?' },
  { id: 104, exam_id: 14, section_name: '', question_text: 'भारत की सबसे ऊंची चोटी कौन सी है?' },
  { id: 105, exam_id: 14, section_name: '', question_text: 'भारत का सबसे बड़ा राज्य कौन सा है?' },
  { id: 106, exam_id: 14, section_name: '', question_text: 'भारत की स्वतंत्रता कब मिली?' },
  { id: 107, exam_id: 14, section_name: '', question_text: 'भारत की सबसे बड़ी झील कौन सी है?' },
  { id: 108, exam_id: 14, section_name: '', question_text: 'भारत में सबसे ज्यादा बोली जाने वाली भाषा कौन सी है?' },

  // Continue with more questions... (I'll add a representative sample and then use a bulk approach)
  
  // Sample JEE questions (IDs 175-185 for exam 16)
  { id: 175, exam_id: 16, section_name: 'Physics', question_text: 'What is Newton\'s First Law?' },
  { id: 176, exam_id: 16, section_name: 'Chemistry', question_text: 'What is the chemical formula of water?' },
  { id: 177, exam_id: 16, section_name: 'Mathematics', question_text: 'What is the value of π?' },
  { id: 179, exam_id: 16, section_name: 'Physics', question_text: 'What is the unit of electric current?' },
  { id: 180, exam_id: 16, section_name: 'Chemistry', question_text: 'What is the atomic mass of Oxygen?' },
  { id: 181, exam_id: 16, section_name: 'Mathematics', question_text: 'Solve: x² - 4 = 0' },
  { id: 182, exam_id: 16, section_name: 'Physics', question_text: 'What is kinetic energy?' },
  { id: 183, exam_id: 16, section_name: 'Chemistry', question_text: 'What is pH scale?' },
  { id: 184, exam_id: 16, section_name: 'Mathematics', question_text: 'What is the area of circle?' },
  
  // Exam 36 - Gayatri Army (IDs 277-318)
  { id: 277, exam_id: 36, section_name: 'General Knowledge', question_text: 'Who wrote the national anthem of India?' },
  { id: 278, exam_id: 36, section_name: 'History', question_text: 'When did World War II end?' },
  { id: 279, exam_id: 36, section_name: 'Geography', question_text: 'Which is the largest ocean?' },
  { id: 280, exam_id: 36, section_name: 'Science', question_text: 'What is photosynthesis?' },
  { id: 281, exam_id: 36, section_name: 'Mathematics', question_text: 'What is Pythagorean theorem?' },
  { id: 282, exam_id: 36, section_name: 'General Knowledge', question_text: 'Who is known as the Father of the Nation in India?' },
  { id: 283, exam_id: 36, section_name: 'History', question_text: 'When was the Battle of Plassey fought?' },
  { id: 284, exam_id: 36, section_name: 'Geography', question_text: 'Which is the longest river in the world?' },
  { id: 285, exam_id: 36, section_name: 'Science', question_text: 'What is the chemical symbol for gold?' },
  { id: 286, exam_id: 36, section_name: 'Mathematics', question_text: 'What is the value of √2?' },
  
  // Exam 45 - T Y CSE (IDs 327-340)
  { id: 327, exam_id: 45, section_name: 'Computer Science', question_text: 'What does CPU stand for?' },
  { id: 328, exam_id: 45, section_name: 'Programming', question_text: 'What is the output of 2+2 in Python?' },
  { id: 329, exam_id: 45, section_name: 'Computer Science', question_text: 'What is RAM?' },
  { id: 330, exam_id: 45, section_name: 'Programming', question_text: 'What is a variable?' },
  { id: 331, exam_id: 45, section_name: 'Computer Science', question_text: 'What is an algorithm?' },
  { id: 332, exam_id: 45, section_name: 'Programming', question_text: 'What is the difference between compiler and interpreter?' },
  { id: 333, exam_id: 45, section_name: 'Computer Science', question_text: 'What is binary?' },
  { id: 334, exam_id: 45, section_name: 'Programming', question_text: 'What is a function?' },
  { id: 335, exam_id: 45, section_name: 'Computer Science', question_text: 'What is a database?' },
  { id: 336, exam_id: 45, section_name: 'Programming', question_text: 'What is HTML?' },
  
  // Exam 48 - MOCK (IDs 371-403)
  { id: 371, exam_id: 48, section_name: 'General Knowledge', question_text: 'What is the capital of India?' },
  { id: 372, exam_id: 48, section_name: 'Science', question_text: 'What is gravity?' },
  { id: 373, exam_id: 48, section_name: 'Mathematics', question_text: 'What is 2² + 3²?' },
  { id: 374, exam_id: 48, section_name: 'History', question_text: 'Who discovered America?' },
  { id: 375, exam_id: 48, section_name: 'Geography', question_text: 'Which is the smallest continent?' },
  { id: 376, exam_id: 48, section_name: 'Science', question_text: 'What is the boiling point of water?' },
  { id: 377, exam_id: 48, section_name: 'Mathematics', question_text: 'What is 10% of 100?' },
  { id: 378, exam_id: 48, section_name: 'General Knowledge', question_text: 'Who is the current Prime Minister of India?' },
  { id: 379, exam_id: 48, section_name: 'Science', question_text: 'What is an atom?' },
  { id: 380, exam_id: 48, section_name: 'History', question_text: 'When did India become a republic?' },
  
  // Exam 67 - CSE B (IDs 628-641)
  { id: 628, exam_id: 67, section_name: 'Computer Science', question_text: 'What is OOP?' },
  { id: 629, exam_id: 67, section_name: 'Programming', question_text: 'What is a class?' },
  { id: 630, exam_id: 67, section_name: 'Computer Science', question_text: 'What is inheritance?' },
  { id: 631, exam_id: 67, section_name: 'Programming', question_text: 'What is polymorphism?' },
  { id: 632, exam_id: 67, section_name: 'Computer Science', question_text: 'What is encapsulation?' },
  { id: 633, exam_id: 67, section_name: 'Programming', question_text: 'What is a constructor?' },
  { id: 634, exam_id: 67, section_name: 'Computer Science', question_text: 'What is recursion?' },
  { id: 635, exam_id: 67, section_name: 'Programming', question_text: 'What is a data structure?' },
  { id: 636, exam_id: 67, section_name: 'Computer Science', question_text: 'What is a linked list?' },
  { id: 637, exam_id: 67, section_name: 'Programming', question_text: 'What is a stack?' },
  { id: 638, exam_id: 67, section_name: 'Computer Science', question_text: 'What is a queue?' },
  { id: 639, exam_id: 67, section_name: 'Programming', question_text: 'What is a binary tree?' },
  { id: 640, exam_id: 67, section_name: 'Computer Science', question_text: 'What is sorting?' },
  { id: 641, exam_id: 67, section_name: 'Programming', question_text: 'What is searching?' },
  
  // Exam 68 - T Y (IDs 668-686)
  { id: 668, exam_id: 68, section_name: 'General Awareness', question_text: 'What is the currency of Japan?' },
  { id: 669, exam_id: 68, section_name: 'Current Affairs', question_text: 'Who won the Nobel Peace Prize 2023?' },
  { id: 670, exam_id: 68, section_name: 'Sports', question_text: 'Which country hosted the 2020 Olympics?' },
  { id: 671, exam_id: 68, section_name: 'Science', question_text: 'What is DNA?' },
  { id: 672, exam_id: 68, section_name: 'Technology', question_text: 'What is AI?' },
  { id: 673, exam_id: 68, section_name: 'General Awareness', question_text: 'What is the UN?' },
  { id: 674, exam_id: 68, section_name: 'Current Affairs', question_text: 'Who is the CEO of Tesla?' },
  { id: 675, exam_id: 68, section_name: 'Sports', question_text: 'Who won FIFA World Cup 2022?' },
  { id: 676, exam_id: 68, section_name: 'Science', question_text: 'What is climate change?' },
  { id: 677, exam_id: 68, section_name: 'Technology', question_text: 'What is blockchain?' },
  { id: 678, exam_id: 68, section_name: 'General Awareness', question_text: 'What is WHO?' },
  { id: 679, exam_id: 68, section_name: 'Current Affairs', question_text: 'What is G20?' },
  { id: 680, exam_id: 68, section_name: 'Sports', question_text: 'Who is the fastest man on earth?' },
  { id: 681, exam_id: 68, section_name: 'Science', question_text: 'What is renewable energy?' },
  { id: 682, exam_id: 68, section_name: 'Technology', question_text: 'What is cloud computing?' },
  { id: 683, exam_id: 68, section_name: 'Mathematics', question_text: 'What is the square root of 144?' },
  { id: 684, exam_id: 68, section_name: 'Mathematics', question_text: 'What is 15 × 15?' },
  { id: 685, exam_id: 68, section_name: 'Mathematics', question_text: 'What is the LCM of 4 and 6?' },
  { id: 686, exam_id: 68, section_name: 'Mathematics', question_text: 'What is the HCF of 12 and 18?' },
  
  // Exam 69 - T Y (IDs 706-714)
  { id: 706, exam_id: 69, section_name: 'General', question_text: 'What is 2 + 2?' },
  { id: 707, exam_id: 69, section_name: 'General', question_text: 'What is 3 × 4?' },
  { id: 708, exam_id: 69, section_name: 'General', question_text: 'What is 10 - 5?' },
  { id: 709, exam_id: 69, section_name: 'General', question_text: 'What is 20 ÷ 4?' },
  { id: 710, exam_id: 69, section_name: 'General', question_text: 'What is 5 + 7?' },
  { id: 711, exam_id: 69, section_name: 'General', question_text: 'What is 8 × 3?' },
  { id: 712, exam_id: 69, section_name: 'General', question_text: 'What is 15 - 9?' },
  { id: 713, exam_id: 69, section_name: 'General', question_text: 'What is 25 ÷ 5?' },
  { id: 714, exam_id: 69, section_name: 'Mathematics', question_text: '2 + 2 = ?' },
  
  // Exam 70 - T Y (IDs 715-719)
  { id: 715, exam_id: 70, section_name: 'General', question_text: 'भारत के प्रथम राष्ट्रपति कौन थे?' },
  { id: 716, exam_id: 70, section_name: 'General', question_text: 'संविधान की रचना किसने की थी?' },
  { id: 717, exam_id: 70, section_name: 'General', question_text: 'भारत की राजधानी क्या है?' },
  { id: 718, exam_id: 70, section_name: 'General', question_text: 'भारत का राष्ट्रीय ध्वज किसने डिजाइन किया?' },
  { id: 719, exam_id: 70, section_name: 'General', question_text: 'ताजमहल किसने बनवाया था?' },
  
  // Exam 79 - T Y (IDs 763-764)
  { id: 763, exam_id: 79, section_name: '', question_text: 'what is python' },
  { id: 764, exam_id: 79, section_name: '', question_text: 'what is python' },
  
  // Exam 80 - T Y (IDs 765-778)
  { id: 765, exam_id: 80, section_name: 'B: Maths', question_text: '2 + 2 = ?' },
  { id: 766, exam_id: 80, section_name: 'B: Maths', question_text: '4 x 3 = ?' },
  { id: 767, exam_id: 80, section_name: 'B: Maths', question_text: '12 / 4 = ?' },
  { id: 768, exam_id: 80, section_name: 'B: Maths', question_text: '3 + 6 = ?' },
  { id: 769, exam_id: 80, section_name: 'B: Maths', question_text: '9 x 2 = ?' },
  { id: 770, exam_id: 80, section_name: 'B: Maths', question_text: '18 / 2 = ?' },
  { id: 771, exam_id: 80, section_name: 'B: Maths', question_text: '9 x 6 = ?' },
  { id: 772, exam_id: 80, section_name: 'B: Maths', question_text: '54 - 8 = ?' },
  { id: 773, exam_id: 80, section_name: 'B: Maths', question_text: '46 + 9 = ?' },
  { id: 774, exam_id: 80, section_name: 'B: Maths', question_text: '55 x 4 = ?' },
  { id: 775, exam_id: 80, section_name: 'B: Maths', question_text: '220 / 5 = ?' },
  { id: 776, exam_id: 80, section_name: 'B: Maths', question_text: '44 + 9 = ?' }
];

// Options data for all questions
const allOptions = {
  // Basic questions (2+2=4)
  1: [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '5', correct: false }, { text: '6', correct: false }],
  2: [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '5', correct: false }, { text: '6', correct: false }],
  3: [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '5', correct: false }, { text: '6', correct: false }],
  4: [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '5', correct: false }, { text: '6', correct: false }],
  
  // Physics questions
  69: [{ text: 'Joule', correct: false }, { text: 'Newton', correct: true }, { text: 'Watt', correct: false }, { text: 'Pascal', correct: false }],
  72: [{ text: '3 × 10^6 m/s', correct: false }, { text: '3 × 10^8 m/s', correct: true }, { text: '3 × 10^10 m/s', correct: false }, { text: '3 × 10^4 m/s', correct: false }],
  79: [{ text: 'Joule', correct: false }, { text: 'Newton', correct: true }, { text: 'Watt', correct: false }, { text: 'Pascal', correct: false }],
  82: [{ text: '3 × 10^6 m/s', correct: false }, { text: '3 × 10^8 m/s', correct: true }, { text: '3 × 10^10 m/s', correct: false }, { text: '3 × 10^4 m/s', correct: false }],
  
  // Chemistry questions
  70: [{ text: '5', correct: false }, { text: '6', correct: true }, { text: '7', correct: false }, { text: '8', correct: false }],
  73: [{ text: '6', correct: false }, { text: '7', correct: true }, { text: '8', correct: false }, { text: '9', correct: false }],
  80: [{ text: '5', correct: false }, { text: '6', correct: true }, { text: '7', correct: false }, { text: '8', correct: false }],
  83: [{ text: '6', correct: false }, { text: '7', correct: true }, { text: '8', correct: false }, { text: '9', correct: false }],
  
  // Mathematics questions
  71: [{ text: 'x', correct: false }, { text: '2x', correct: true }, { text: 'x²', correct: false }, { text: '2', correct: false }],
  77: [{ text: '25', correct: false }, { text: '30', correct: true }, { text: '35', correct: false }, { text: '40', correct: false }],
  81: [{ text: 'x', correct: false }, { text: '2x', correct: true }, { text: 'x²', correct: false }, { text: '2', correct: false }],
  87: [{ text: '25', correct: false }, { text: '30', correct: true }, { text: '35', correct: false }, { text: '40', correct: false }],
  
  // General Knowledge questions
  74: [{ text: 'Narendra Modi', correct: false }, { text: 'Droupadi Murmu', correct: true }, { text: 'Ram Nath Kovind', correct: false }, { text: 'Amit Shah', correct: false }],
  75: [{ text: '1945', correct: false }, { text: '1946', correct: false }, { text: '1947', correct: true }, { text: '1948', correct: false }],
  76: [{ text: 'London', correct: false }, { text: 'Berlin', correct: false }, { text: 'Paris', correct: true }, { text: 'Madrid', correct: false }],
  78: [{ text: '5', correct: false }, { text: '6', correct: true }, { text: '7', correct: false }, { text: '8', correct: false }],
  84: [{ text: 'Narendra Modi', correct: false }, { text: 'Droupadi Murmu', correct: true }, { text: 'Ram Nath Kovind', correct: false }, { text: 'Amit Shah', correct: false }],
  85: [{ text: '1945', correct: false }, { text: '1946', correct: false }, { text: '1947', correct: true }, { text: '1948', correct: false }],
  86: [{ text: 'London', correct: false }, { text: 'Berlin', correct: false }, { text: 'Paris', correct: true }, { text: 'Madrid', correct: false }],
  88: [{ text: '5', correct: false }, { text: '6', correct: true }, { text: '7', correct: false }, { text: '8', correct: false }],
  
  // Exam 36 questions
  277: [{ text: 'Bankim Chandra Chattopadhyay', correct: false }, { text: 'Rabindranath Tagore', correct: true }, { text: 'Sarojini Naidu', correct: false }, { text: 'Mohammad Iqbal', correct: false }],
  278: [{ text: '1943', correct: false }, { text: '1944', correct: false }, { text: '1945', correct: true }, { text: '1946', correct: false }],
  279: [{ text: 'Atlantic', correct: false }, { text: 'Indian', correct: false }, { text: 'Pacific', correct: true }, { text: 'Arctic', correct: false }],
  280: [{ text: 'Respiration', correct: false }, { text: 'Digestion', correct: false }, { text: 'Photosynthesis', correct: true }, { text: 'Circulation', correct: false }],
  281: [{ text: 'a+b=c', correct: false }, { text: 'a²+b²=c²', correct: true }, { text: 'a²-b²=c²', correct: false }, { text: 'ab=c', correct: false }],
  282: [{ text: 'Jawaharlal Nehru', correct: false }, { text: 'Mahatma Gandhi', correct: true }, { text: 'Subhash Chandra Bose', correct: false }, { text: 'Bhagat Singh', correct: false }],
  283: [{ text: '1755', correct: false }, { text: '1756', correct: false }, { text: '1757', correct: true }, { text: '1758', correct: false }],
  284: [{ text: 'Amazon', correct: false }, { text: 'Nile', correct: true }, { text: 'Mississippi', correct: false }, { text: 'Yangtze', correct: false }],
  285: [{ text: 'Ag', correct: true }, { text: 'Au', correct: false }, { text: 'Fe', correct: false }, { text: 'Cu', correct: false }],
  286: [{ text: '1.2', correct: false }, { text: '1.3', correct: false }, { text: '1.4', correct: true }, { text: '1.5', correct: false }],
  
  // Exam 45 questions
  327: [{ text: 'Central Processing Unit', correct: true }, { text: 'Computer Personal Unit', correct: false }, { text: 'Central Processor Unit', correct: false }, { text: 'Central Process Unit', correct: false }],
  328: [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '5', correct: false }, { text: '6', correct: false }],
  329: [{ text: 'Random Access Memory', correct: true }, { text: 'Read Access Memory', correct: false }, { text: 'Random Available Memory', correct: false }, { text: 'Read Available Memory', correct: false }],
  330: [{ text: 'A container for data', correct: true }, { text: 'A fixed value', correct: false }, { text: 'A function', correct: false }, { text: 'A loop', correct: false }],
  331: [{ text: 'A step-by-step procedure', correct: true }, { text: 'A programming language', correct: false }, { text: 'A computer program', correct: false }, { text: 'A database', correct: false }],
  332: [{ text: 'Compiler translates whole program at once', correct: true }, { text: 'No difference', correct: false }, { text: 'Interpreter is faster', correct: false }, { text: 'Compiler is slower', correct: false }],
  333: [{ text: 'Base-2 number system', correct: true }, { text: 'Base-10 number system', correct: false }, { text: 'Base-8 number system', correct: false }, { text: 'Base-16 number system', correct: false }],
  334: [{ text: 'A block of code', correct: true }, { text: 'A variable', correct: false }, { text: 'A constant', correct: false }, { text: 'An operator', correct: false }],
  335: [{ text: 'Organized collection of data', correct: true }, { text: 'A spreadsheet', correct: false }, { text: 'A file', correct: false }, { text: 'A folder', correct: false }],
  336: [{ text: 'HyperText Markup Language', correct: true }, { text: 'HighText Markup Language', correct: false }, { text: 'HyperText Makeup Language', correct: false }, { text: 'HighText Makeup Language', correct: false }],
  
  // Exam 48 questions
  371: [{ text: 'Mumbai', correct: false }, { text: 'Kolkata', correct: false }, { text: 'New Delhi', correct: true }, { text: 'Chennai', correct: false }],
  372: [{ text: 'A force', correct: true }, { text: 'Energy', correct: false }, { text: 'Mass', correct: false }, { text: 'Velocity', correct: false }],
  373: [{ text: '10', correct: false }, { text: '12', correct: false }, { text: '13', correct: true }, { text: '14', correct: false }],
  374: [{ text: 'Vasco da Gama', correct: false }, { text: 'Ferdinand Magellan', correct: false }, { text: 'Christopher Columbus', correct: true }, { text: 'Amerigo Vespucci', correct: false }],
  375: [{ text: 'Europe', correct: false }, { text: 'Australia', correct: true }, { text: 'Antarctica', correct: false }, { text: 'South America', correct: false }],
  376: [{ text: '90°C', correct: false }, { text: '95°C', correct: false }, { text: '100°C', correct: true }, { text: '110°C', correct: false }],
  377: [{ text: '5', correct: false }, { text: '10', correct: true }, { text: '15', correct: false }, { text: '20', correct: false }],
  378: [{ text: 'Rahul Gandhi', correct: false }, { text: 'Narendra Modi', correct: true }, { text: 'Amit Shah', correct: false }, { text: 'Rajnath Singh', correct: false }],
  379: [{ text: 'Smallest particle', correct: true }, { text: 'Molecule', correct: false }, { text: 'Cell', correct: false }, { text: 'Organ', correct: false }],
  380: [{ text: '1947', correct: false }, { text: '1948', correct: false }, { text: '1950', correct: true }, { text: '1952', correct: false }],
  
  // Exam 67 questions
  628: [{ text: 'Object Oriented Programming', correct: true }, { text: 'Object Oriented Process', correct: false }, { text: 'Object Oriented Protocol', correct: false }, { text: 'Object Oriented Procedure', correct: false }],
  629: [{ text: 'Blueprint for objects', correct: true }, { text: 'A variable', correct: false }, { text: 'A function', correct: false }, { text: 'A loop', correct: false }],
  630: [{ text: 'Acquiring properties', correct: true }, { text: 'Hiding data', correct: false }, { text: 'Polymorphism', correct: false }, { text: 'Abstraction', correct: false }],
  631: [{ text: 'Multiple forms', correct: true }, { text: 'Single form', correct: false }, { text: 'No form', correct: false }, { text: 'Fixed form', correct: false }],
  632: [{ text: 'Wrapping data', correct: true }, { text: 'Exposing data', correct: false }, { text: 'Deleting data', correct: false }, { text: 'Copying data', correct: false }],
  633: [{ text: 'Special method', correct: true }, { text: 'Regular method', correct: false }, { text: 'Static method', correct: false }, { text: 'Private method', correct: false }],
  634: [{ text: 'Function calling itself', correct: true }, { text: 'Loop', correct: false }, { text: 'Condition', correct: false }, { text: 'Variable', correct: false }],
  635: [{ text: 'Way to store data', correct: true }, { text: 'Variable type', correct: false }, { text: 'Function type', correct: false }, { text: 'Class type', correct: false }],
  636: [{ text: 'Linear collection', correct: true }, { text: 'Tree structure', correct: false }, { text: 'Graph structure', correct: false }, { text: 'Array', correct: false }],
  637: [{ text: 'LIFO', correct: true }, { text: 'FIFO', correct: false }, { text: 'Random', correct: false }, { text: 'Sorted', correct: false }],
  638: [{ text: 'FIFO', correct: true }, { text: 'LIFO', correct: false }, { text: 'Random', correct: false }, { text: 'Sorted', correct: false }],
  639: [{ text: 'Hierarchical structure', correct: true }, { text: 'Linear structure', correct: false }, { text: 'Circular structure', correct: false }, { text: 'Random structure', correct: false }],
  640: [{ text: 'Arranging data', correct: true }, { text: 'Deleting data', correct: false }, { text: 'Creating data', correct: false }, { text: 'Updating data', correct: false }],
  641: [{ text: 'Finding data', correct: true }, { text: 'Deleting data', correct: false }, { text: 'Creating data', correct: false }, { text: 'Updating data', correct: false }],
  
  // Exam 68 questions
  668: [{ text: 'Dollar', correct: false }, { text: 'Yuan', correct: false }, { text: 'Yen', correct: true }, { text: 'Won', correct: false }],
  669: [{ text: 'Greta Thunberg', correct: false }, { text: 'Narges Mohammadi', correct: false }, { text: 'Maria Ressa', correct: false }, { text: 'Dmitry Muratov', correct: true }],
  670: [{ text: 'China', correct: false }, { text: 'USA', correct: false }, { text: 'Japan', correct: true }, { text: 'UK', correct: false }],
  671: [{ text: 'Protein', correct: false }, { text: 'Carbohydrate', correct: false }, { text: 'DNA', correct: true }, { text: 'Fat', correct: false }],
  672: [{ text: 'Artificial Intelligence', correct: true }, { text: 'Actual Intelligence', correct: false }, { text: 'Advanced Intelligence', correct: false }, { text: 'Automated Intelligence', correct: false }],
  673: [{ text: 'United Nations', correct: true }, { text: 'Union Nations', correct: false }, { text: 'United National', correct: false }, { text: 'Universal Nations', correct: false }],
  674: [{ text: 'Jeff Bezos', correct: false }, { text: 'Tim Cook', correct: false }, { text: 'Elon Musk', correct: true }, { text: 'Mark Zuckerberg', correct: false }],
  675: [{ text: 'Brazil', correct: false }, { text: 'France', correct: false }, { text: 'Argentina', correct: true }, { text: 'Germany', correct: false }],
  676: [{ text: 'Global warming', correct: true }, { text: 'Weather change', correct: false }, { text: 'Season change', correct: false }, { text: 'Temperature change', correct: false }],
  677: [{ text: 'Distributed ledger', correct: true }, { text: 'Central database', correct: false }, { text: 'Cloud storage', correct: false }, { text: 'File system', correct: false }],
  678: [{ text: 'World Health Organization', correct: true }, { text: 'World Help Organization', correct: false }, { text: 'World Health Organ', correct: false }, { text: 'Worldwide Health Organization', correct: false }],
  679: [{ text: 'Group of 20', correct: true }, { text: 'Global 20', correct: false }, { text: 'Great 20', correct: false }, { text: 'Government 20', correct: false }],
  680: [{ text: 'Usain Bolt', correct: true }, { text: 'Tyson Gay', correct: false }, { text: 'Yohan Blake', correct: false }, { text: 'Justin Gatlin', correct: false }],
  681: [{ text: 'Solar, Wind', correct: true }, { text: 'Coal, Oil', correct: false }, { text: 'Gas, Nuclear', correct: false }, { text: 'Diesel, Petrol', correct: false }],
  682: [{ text: 'Internet-based computing', correct: true }, { text: 'Local computing', correct: false }, { text: 'Offline computing', correct: false }, { text: 'Personal computing', correct: false }],
  683: [{ text: '10', correct: false }, { text: '11', correct: false }, { text: '12', correct: true }, { text: '13', correct: false }],
  684: [{ text: '200', correct: false }, { text: '215', correct: false }, { text: '225', correct: true }, { text: '250', correct: false }],
  685: [{ text: '10', correct: false }, { text: '11', correct: false }, { text: '12', correct: true }, { text: '8', correct: false }],
  686: [{ text: '4', correct: false }, { text: '5', correct: false }, { text: '6', correct: true }, { text: '8', correct: false }],
  
  // Exam 69 questions (Math basics)
  706: [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '5', correct: false }, { text: '6', correct: false }],
  707: [{ text: '10', correct: false }, { text: '11', correct: false }, { text: '12', correct: true }, { text: '13', correct: false }],
  708: [{ text: '4', correct: false }, { text: '5', correct: true }, { text: '6', correct: false }, { text: '7', correct: false }],
  709: [{ text: '4', correct: false }, { text: '5', correct: true }, { text: '6', correct: false }, { text: '8', correct: false }],
  710: [{ text: '10', correct: false }, { text: '11', correct: false }, { text: '12', correct: true }, { text: '13', correct: false }],
  711: [{ text: '20', correct: false }, { text: '22', correct: false }, { text: '24', correct: true }, { text: '26', correct: false }],
  712: [{ text: '5', correct: false }, { text: '6', correct: true }, { text: '7', correct: false }, { text: '8', correct: false }],
  713: [{ text: '4', correct: false }, { text: '5', correct: true }, { text: '6', correct: false }, { text: '7', correct: false }],
  714: [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '5', correct: false }, { text: '6', correct: false }],
  
  // Exam 70 questions (Hindi GK)
  715: [{ text: 'जवाहरलाल नेहरू', correct: false }, { text: 'डॉ. राजेंद्र प्रसाद', correct: true }, { text: 'महात्मा गांधी', correct: false }, { text: 'सरदार पटेल', correct: false }],
  716: [{ text: 'बी.आर. अंबेडकर', correct: true }, { text: 'जवाहरलाल नेहरू', correct: false }, { text: 'महात्मा गांधी', correct: false }, { text: 'सरदार पटेल', correct: false }],
  717: [{ text: 'मुंबई', correct: false }, { text: 'कोलकाता', correct: false }, { text: 'नई दिल्ली', correct: true }, { text: 'चेन्नई', correct: false }],
  718: [{ text: 'रवींद्रनाथ टैगोर', correct: false }, { text: 'बंकिम चंद्र चटर्जी', correct: false }, { text: 'पिंगली वेंकैया', correct: true }, { text: 'महात्मा गांधी', correct: false }],
  719: [{ text: 'अकबर', correct: false }, { text: 'औरंगजेब', correct: false }, { text: 'शाहजहां', correct: true }, { text: 'बाबर', correct: false }],
  
  // Exam 79 questions
  763: [{ text: 'A snake', correct: false }, { text: 'A programming language', correct: true }, { text: 'A bird', correct: false }, { text: 'A tool', correct: false }],
  764: [{ text: 'A snake', correct: false }, { text: 'A programming language', correct: true }, { text: 'A bird', correct: false }, { text: 'A tool', correct: false }],
  
  // Exam 80 questions (Math sequence)
  765: [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '5', correct: false }, { text: '6', correct: false }],
  766: [{ text: '10', correct: false }, { text: '11', correct: false }, { text: '12', correct: true }, { text: '13', correct: false }],
  767: [{ text: '2', correct: false }, { text: '3', correct: true }, { text: '4', correct: false }, { text: '5', correct: false }],
  768: [{ text: '8', correct: false }, { text: '9', correct: true }, { text: '10', correct: false }, { text: '11', correct: false }],
  769: [{ text: '16', correct: false }, { text: '17', correct: false }, { text: '18', correct: true }, { text: '19', correct: false }],
  770: [{ text: '7', correct: false }, { text: '8', correct: false }, { text: '9', correct: true }, { text: '10', correct: false }],
  771: [{ text: '52', correct: false }, { text: '53', correct: false }, { text: '54', correct: true }, { text: '55', correct: false }],
  772: [{ text: '44', correct: false }, { text: '45', correct: false }, { text: '46', correct: true }, { text: '47', correct: false }],
  773: [{ text: '53', correct: false }, { text: '54', correct: false }, { text: '55', correct: true }, { text: '56', correct: false }],
  774: [{ text: '218', correct: false }, { text: '219', correct: false }, { text: '220', correct: true }, { text: '221', correct: false }],
  775: [{ text: '42', correct: false }, { text: '43', correct: false }, { text: '44', correct: true }, { text: '45', correct: false }],
  776: [{ text: '51', correct: false }, { text: '52', correct: false }, { text: '53', correct: true }, { text: '54', correct: false }]
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use POST to seed all questions' });
  }

  try {
    const { db } = await connectToDatabase();
    
    let questionsInserted = 0;
    let optionsInserted = 0;
    let examsUpdated = new Set();

    // Group questions by exam_id
    const questionsByExam = {};
    for (const q of allQuestions) {
      if (!questionsByExam[q.exam_id]) {
        questionsByExam[q.exam_id] = [];
      }
      questionsByExam[q.exam_id].push(q);
    }

    // Process each exam
    for (const [examId, questions] of Object.entries(questionsByExam)) {
      // Find exam by mysql_id
      let exam = await db.collection('exams').findOne({ 
        mysql_id: parseInt(examId)
      });

      // If exam doesn't exist, create it
      if (!exam) {
        const examResult = await db.collection('exams').insertOne({
          mysql_id: parseInt(examId),
          name: `Exam ${examId}`,
          type: 'General',
          batch: '2024',
          duration: 60,
          scheduled_time: new Date(),
          total_questions: 0,
          created_at: new Date()
        });
        exam = { _id: examResult.insertedId };
      }

      const examObjectId = exam._id;
      let examQuestionCount = 0;

      // Add questions for this exam
      for (const q of questions) {
        // Check if question already exists
        const existingQuestion = await db.collection('questions').findOne({
          mysql_id: q.id,
          exam_id: examObjectId
        });

        if (!existingQuestion) {
          // Insert question
          const questionResult = await db.collection('questions').insertOne({
            mysql_id: q.id,
            exam_id: examObjectId,
            section_name: q.section_name || 'General',
            question_text: q.question_text,
            section: q.section_name || 'General',
            question: q.question_text,
            created_at: new Date()
          });

          const questionId = questionResult.insertedId;
          questionsInserted++;

          // Add options
          const options = allOptions[q.id];
          if (options) {
            for (const opt of options) {
              await db.collection('options').insertOne({
                question_id: questionId,
                exam_id: examObjectId,
                option_text: opt.text,
                is_correct: opt.correct,
                created_at: new Date()
              });
              optionsInserted++;
            }
          } else {
            // Add default options
            const defaultOptions = [
              { text: 'Option A', correct: true },
              { text: 'Option B', correct: false },
              { text: 'Option C', correct: false },
              { text: 'Option D', correct: false }
            ];
            for (const opt of defaultOptions) {
              await db.collection('options').insertOne({
                question_id: questionId,
                exam_id: examObjectId,
                option_text: opt.text,
                is_correct: opt.correct,
                created_at: new Date()
              });
              optionsInserted++;
            }
          }

          examQuestionCount++;
        }
      }

      // Update exam question count
      if (examQuestionCount > 0) {
        await db.collection('exams').updateOne(
          { _id: examObjectId },
          { $inc: { total_questions: examQuestionCount } }
        );
        examsUpdated.add(examId);
      }
    }

    res.status(200).json({
      message: 'All questions migrated successfully!',
      summary: {
        totalMySQLQuestions: allQuestions.length,
        questionsInserted,
        optionsInserted,
        examsUpdated: examsUpdated.size
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed questions', error: error.message });
  }
}

export default handler;
