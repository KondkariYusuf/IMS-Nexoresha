export async function getBatchOverviewService(batchUuid) {
    return {
        success: true,
        batch: {
            id: batchUuid,
            name: "Batch 1",
            totalStudents: 4,
            activeStudents: 4,
            completedStudents: 0
        }
    };
}

export async function getBatchStudentsService(batchUuid) {
  const students = [
    {
      id: 'student-001',
      name: 'Aisha Khan',
      email: 'aisha@example.com',
      status: 'active',
      batchUuid: 'batch-001',
    },
    {
      id: 'student-002',
      name: 'Bilal Ahmed',
      email: 'bilal@example.com',
      status: 'active',
      batchUuid: 'batch-001',
    },
    {
      id: 'student-003',
      name: 'Sara Ali',
      email: 'sara@example.com',
      status: 'active',
      batchUuid: 'batch-002',
    },
    {
      id: 'student-004',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'completed',
      batchUuid: 'batch-002',
    },
  ];

  return {
    success: true,
    students: students.filter(
      (student) => student.batchUuid === batchUuid
    ),
  };
}

export async function getStudentPortfolioService(batchUuid, studentId) {
  const students = [
    {
      id: 'student-001',
      name: 'Aisha Khan',
      email: 'aisha@example.com',
      status: 'active',
      batchUuid: 'batch-001',
      attendance: '92%',
      overallScore: 88,
      course: 'MERN Stack',
    },
    {
      id: 'student-002',
      name: 'Bilal Ahmed',
      email: 'bilal@example.com',
      status: 'active',
      batchUuid: 'batch-001',
      attendance: '95%',
      overallScore: 91,
      course: 'MERN Stack',
    },
    {
      id: 'student-003',
      name: 'Sara Ali',
      email: 'sara@example.com',
      status: 'active',
      batchUuid: 'batch-002',
      attendance: '90%',
      overallScore: 85,
      course: 'Java Full Stack',
    },
    {
      id: 'student-004',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'completed',
      batchUuid: 'batch-002',
      attendance: '98%',
      overallScore: 94,
      course: 'Java Full Stack',
    },
  ];

  const student = students.find(
    (student) =>
      student.batchUuid === batchUuid &&
      student.id === studentId
  );

  if (!student) {
    return {
      success: false,
      message: 'Student not found',
    };
  }

  return {
    success: true,
    student,
  };
}
