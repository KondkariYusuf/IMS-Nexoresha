# API Reference - Request/Response Headers & Bodies

## Common Headers (All Requests)
```
Content-Type: application/json
```

---

## 1. Get Dashboard

**Endpoint:** `GET /api/student/dashboard`

**Query Parameters:**
```
studentId=student-001 (optional, defaults to 'student-001')
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalMarks": 850,
    "batchRank": 3,
    "batchSize": 25,
    "upcomingLectures": [],
    "pendingAssignments": [],
    "unreadNotifications": 0
  },
  "message": "Dashboard retrieved successfully"
}
```

---

## 2. Get Mark History

**Endpoint:** `GET /api/student/marks/history`

**Query Parameters:**
```
studentId=student-001 (optional)
page=1 (optional, default: 1)
limit=10 (optional, default: 10)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ledger-001",
      "studentId": "student-001",
      "sourceType": "assignment",
      "sourceId": "assignment-001",
      "points": 10,
      "description": "React Todo App - Completed",
      "createdAt": "2024-07-16T14:30:00Z"
    }
  ],
  "message": "Mark history retrieved successfully"
}
```

---

## 3. Get Student Profile

**Endpoint:** `GET /api/student/profile`

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "student-001",
    "enrollementNo": "STU001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "dob": "2002-05-15",
    "gender": "Male",
    "gitHubUrl": "https://github.com/johndoe",
    "linkedInUrl": "https://linkedin.com/in/johndoe",
    "totalPoints": 850,
    "currentStreak": 5,
    "maxStreak": 12
  },
  "message": "Profile retrieved successfully"
}
```

---

## 4. Update Student Profile

**Endpoint:** `PUT /api/student/profile`

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe Updated"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "student-001",
    "name": "John Doe Updated"
  },
  "message": "Profile updated successfully"
}
```

---

## 5. Get Curriculum

**Endpoint:** `GET /api/student/curriculum`

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [],
  "message": "Curriculum retrieved successfully"
}
```

---

## 6. List All Assignments

**Endpoint:** `GET /api/student/assignments`

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "assignment-001",
      "title": "Build a React Todo App",
      "description": "Create a functional todo application",
      "submissionDeadline": "2024-07-17T23:59:59Z",
      "submitted": true,
      "marksObtained": 85
    }
  ],
  "message": "Assignments retrieved successfully",
  "count": 1
}
```

---

## 7. Get Single Assignment

**Endpoint:** `GET /api/student/assignments/:id`

**URL Parameters:**
```
:id = assignment-001
```

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "assignment-001",
    "title": "Build a React Todo App",
    "prompt": "Create a functional todo application",
    "instructions": "Fork the repo and submit your GitHub link",
    "submissionDeadline": "2024-07-17T23:59:59Z",
    "attachments": "https://example.com/starter-code.zip",
    "task": "Add, edit, delete, mark complete functionality",
    "studentSubmission": {
      "_id": "submission-001",
      "submittedUrl": "https://github.com/johndoe/react-todo-app",
      "submittedAt": "2024-07-16T14:30:00Z",
      "isLate": false
    }
  },
  "message": "Assignment retrieved successfully"
}
```

---

## 8. Submit Assignment

**Endpoint:** `POST /api/student/assignments/:id/submit`

**URL Parameters:**
```
:id = assignment-002
```

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "submittedUrl": "https://github.com/johndoe/project-name"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission-002",
    "isLate": false,
    "reviewStatus": "pending"
  },
  "message": "Submission received. Code review in progress."
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Invalid GitHub URL format",
  "statusCode": 400
}
```

---

## 9. Get Assignment Review

**Endpoint:** `GET /api/student/assignments/:id/review`

**URL Parameters:**
```
:id = assignment-001
```

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "result-001",
    "marksObtained": 85,
    "totalMarks": 100,
    "percentage": 85,
    "pointsAwarded": 10,
    "feedback": "Great implementation! Good code structure.",
    "codeQualityScore": 85,
    "evalBy": "instructor-001",
    "evalAt": "2024-07-17T10:00:00Z",
    "result": "pass"
  },
  "message": "Assignment review retrieved successfully"
}
```

---

## 10. Get Portfolio

**Endpoint:** `GET /api/student/portfolio`

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentInfo": {
      "name": "John Doe",
      "enrollmentNo": "STU001",
      "email": "john.doe@example.com",
      "gitHubUrl": "https://github.com/johndoe"
    },
    "metrics": {
      "totalScore": 850,
      "batchRank": 3,
      "batchPercentile": 88,
      "assignmentAvgScore": 85,
      "attendanceRate": 92
    },
    "projects": [
      {
        "title": "React Todo App",
        "marksObtained": 85,
        "submittedUrl": "https://github.com/johndoe/react-todo-app",
        "feedback": "Great implementation!"
      }
    ]
  },
  "message": "Portfolio retrieved successfully"
}
```

---

## 11. Download Portfolio PDF

**Endpoint:** `GET /api/student/portfolio/pdf`

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
Accept: application/pdf
```

**Request Body:** None

**Response (200 OK):**
```
[Binary PDF File]
Content-Type: application/pdf
Content-Disposition: attachment; filename="portfolio-student-001.pdf"
```

---

## 12. List Notifications

**Endpoint:** `GET /api/student/notifications`

**Query Parameters:**
```
studentId=student-001 (optional)
page=1 (optional, default: 1)
limit=10 (optional, default: 10)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notification-001",
      "type": "assignment_graded",
      "title": "Your React Todo App has been graded",
      "message": "Your assignment received 85/100. Great work!",
      "isRead": false,
      "createdAt": "2024-07-17T10:00:00Z"
    },
    {
      "_id": "notification-002",
      "type": "new_assignment",
      "title": "New Assignment: Build a Chat Application",
      "message": "A new assignment has been published",
      "isRead": false,
      "createdAt": "2024-07-18T09:00:00Z"
    }
  ],
  "message": "Notifications retrieved successfully"
}
```

---

## 13. Mark Single Notification as Read

**Endpoint:** `PATCH /api/student/notifications/:id/read`

**URL Parameters:**
```
:id = notification-001
```

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "notification-001",
    "isRead": true
  },
  "message": "Notification marked as read"
}
```

---

## 14. Mark All Notifications as Read

**Endpoint:** `PATCH /api/student/notifications/read-all`

**Query Parameters:**
```
studentId=student-001 (optional)
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "updatedCount": 2
  },
  "message": "All notifications marked as read"
}
```

---

# Assignment Submission Endpoints

## 1. Create Submission

**Endpoint:** `POST /api/assignment-submissions`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "student-001",
  "assignmentId": "assignment-001",
  "submittedUrl": "https://github.com/johndoe/project"
}
```

**Response (201 Created):**
```json
{
  "message": "Assignment submission created successfully",
  "data": {
    "_id": "submission-001",
    "studentId": "student-001",
    "assignmentId": "assignment-001",
    "submittedUrl": "https://github.com/johndoe/project",
    "submittedAt": "2024-07-18T14:30:00Z",
    "isLate": false
  }
}
```

---

## 2. Get Submission by ID

**Endpoint:** `GET /api/assignment-submissions/:submissionId`

**URL Parameters:**
```
:submissionId = submission-001
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "message": "Assignment submission retrieved successfully",
  "data": {
    "_id": "submission-001",
    "studentId": "student-001",
    "assignmentId": "assignment-001",
    "submittedUrl": "https://github.com/johndoe/project",
    "submittedAt": "2024-07-18T14:30:00Z",
    "isLate": false
  }
}
```

---

## 3. Get Submissions by Assignment

**Endpoint:** `GET /api/assignment-submissions/assignment/:assignmentId`

**URL Parameters:**
```
:assignmentId = assignment-001
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "message": "Submissions retrieved successfully",
  "data": [
    {
      "_id": "submission-001",
      "studentId": "student-001",
      "assignmentId": "assignment-001",
      "submittedUrl": "https://github.com/johndoe/project",
      "submittedAt": "2024-07-18T14:30:00Z",
      "isLate": false
    }
  ],
  "count": 1
}
```

---

## 4. Get Submissions by Student

**Endpoint:** `GET /api/assignment-submissions/student/:studentId`

**URL Parameters:**
```
:studentId = student-001
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "message": "Submissions retrieved successfully",
  "data": [
    {
      "_id": "submission-001",
      "studentId": "student-001",
      "assignmentId": "assignment-001",
      "submittedUrl": "https://github.com/johndoe/project",
      "submittedAt": "2024-07-18T14:30:00Z",
      "isLate": false
    }
  ],
  "count": 1
}
```

---

## 5. Update Submission

**Endpoint:** `PUT /api/assignment-submissions/:submissionId`

**URL Parameters:**
```
:submissionId = submission-001
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "submittedUrl": "https://github.com/johndoe/updated-project"
}
```

**Response (200 OK):**
```json
{
  "message": "Assignment submission updated successfully",
  "data": {
    "_id": "submission-001",
    "studentId": "student-001",
    "assignmentId": "assignment-001",
    "submittedUrl": "https://github.com/johndoe/updated-project",
    "submittedAt": "2024-07-18T14:30:00Z",
    "isLate": false
  }
}
```

---

## 6. Delete Submission

**Endpoint:** `DELETE /api/assignment-submissions/:submissionId`

**URL Parameters:**
```
:submissionId = submission-001
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "message": "Assignment submission deleted successfully",
  "data": {
    "_id": "submission-001"
  }
}
```

---

## Error Response Examples

**400 Bad Request:**
```json
{
  "message": "Validation failed: Invalid GitHub URL format",
  "statusCode": 400
}
```

**404 Not Found:**
```json
{
  "message": "Assignment not found",
  "statusCode": 404
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Summary

- **Total Endpoints:** 20 (14 student + 6 assignment submission)
- **Default Student ID:** `student-001`
- **Pagination:** Supported on list endpoints with `page` and `limit`
- **Authentication:** Not required (development mode)
- **Content-Type:** Always `application/json`
