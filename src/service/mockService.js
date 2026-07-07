const mockStudents = [
  {
    id: 'student-001',
    name: 'Aisha Khan',
    email: 'aisha@example.com',
    batch: 'Batch 1',
    status: 'active',
  },
  {
    id: 'student-002',
    name: 'Bilal Ahmed',
    email: 'bilal@example.com',
    batch: 'Batch 1',
    status: 'active',
  },
  {
    id: 'student-003',
    name: 'Sara Ali',
    email: 'sara@example.com',
    batch: 'Batch 2',
    status: 'inactive',
  },
];

export function getMockStudents() {
  return {
    success: true,
    message: 'Mock student data loaded successfully',
    data: mockStudents,
  };
}
