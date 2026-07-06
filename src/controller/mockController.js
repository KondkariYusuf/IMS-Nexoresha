import { getMockStudents } from '../service/mockService.js';

export function mockStudentsController(_req, res) {
  res.status(200).json(getMockStudents());
}
