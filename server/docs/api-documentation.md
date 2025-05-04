# Unlocked Coding API Documentation

## Base URL

All API endpoints are relative to the base URL: `/api`

## Authentication

Most endpoints require authentication. Include authentication cookies with each request.

### Authentication Endpoints

#### Register a new user

```
POST /api/register
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string" (optional)
}
```

**Response (201):**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "isAdmin": "boolean",
  "hasCompletedProfile": "boolean",
  "createdAt": "date"
}
```

#### Login

```
POST /api/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "isAdmin": "boolean",
  "hasCompletedProfile": "boolean",
  "createdAt": "date"
}
```

#### Logout

```
POST /api/logout
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### Get Current User

```
GET /api/user
```

**Response (200):**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "isAdmin": "boolean",
  "hasCompletedProfile": "boolean",
  "createdAt": "date"
}
```

## Categories

### Get All Categories

```
GET /api/categories
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "name": "string",
    "slug": "string",
    "description": "string",
    "imageUrl": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Get Category by Slug

```
GET /api/categories/:slug
```

**Response (200):**
```json
{
  "_id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "imageUrl": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Create Category (Admin only)

```
POST /api/categories
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "imageUrl": "string"
}
```

**Response (201):**
```json
{
  "_id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "imageUrl": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Update Category (Admin only)

```
PUT /api/categories/:id
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "imageUrl": "string"
}
```

**Response (200):**
```json
{
  "_id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "imageUrl": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Delete Category (Admin only)

```
DELETE /api/categories/:id
```

**Response (200):**
```json
{
  "message": "Category deleted successfully"
}
```

## Courses

### Get All Courses

```
GET /api/courses
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "imageUrl": "string",
    "price": "number",
    "duration": "number",
    "level": "string",
    "categoryId": "string",
    "instructorId": "string",
    "instructorName": "string",
    "lessonCount": "number",
    "rating": "number",
    "enrollmentLink": "string",
    "createdAt": "date",
    "updatedAt": "date",
    "category": {
      "_id": "string",
      "name": "string",
      "slug": "string"
    },
    "instructor": {
      "_id": "string",
      "username": "string"
    }
  }
]
```

### Get Course by ID

```
GET /api/courses/:id
```

**Response (200):**
```json
{
  "_id": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "imageUrl": "string",
  "price": "number",
  "duration": "number",
  "level": "string",
  "categoryId": "string",
  "instructorId": "string",
  "instructorName": "string",
  "lessonCount": "number",
  "rating": "number",
  "enrollmentLink": "string",
  "createdAt": "date",
  "updatedAt": "date",
  "category": {
    "_id": "string",
    "name": "string",
    "slug": "string"
  },
  "instructor": {
    "_id": "string",
    "username": "string"
  }
}
```

### Get Courses by Category Slug

```
GET /api/categories/:slug/courses
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "imageUrl": "string",
    "price": "number",
    "duration": "number",
    "level": "string",
    "categoryId": "string",
    "instructorId": "string",
    "instructorName": "string",
    "lessonCount": "number",
    "rating": "number",
    "enrollmentLink": "string",
    "createdAt": "date",
    "updatedAt": "date",
    "category": {
      "_id": "string",
      "name": "string",
      "slug": "string"
    },
    "instructor": {
      "_id": "string",
      "username": "string"
    }
  }
]
```

### Create Course (Admin only)

```
POST /api/courses
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "imageUrl": "string",
  "price": "number",
  "duration": "number",
  "level": "string",
  "categoryId": "string",
  "enrollmentLink": "string",
  "instructorName": "string"
}
```

**Response (201):**
```json
{
  "_id": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "imageUrl": "string",
  "price": "number",
  "duration": "number",
  "level": "string",
  "categoryId": "string",
  "instructorId": "string",
  "instructorName": "string",
  "lessonCount": "number",
  "rating": "number",
  "enrollmentLink": "string",
  "createdAt": "date",
  "updatedAt": "date",
  "category": {
    "_id": "string",
    "name": "string",
    "slug": "string"
  },
  "instructor": {
    "_id": "string",
    "username": "string"
  }
}
```

### Update Course (Admin only)

```
PUT /api/courses/:id
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "imageUrl": "string",
  "price": "number",
  "duration": "number",
  "level": "string",
  "categoryId": "string",
  "enrollmentLink": "string",
  "instructorName": "string"
}
```

**Response (200):**
```json
{
  "_id": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "imageUrl": "string",
  "price": "number",
  "duration": "number",
  "level": "string",
  "categoryId": "string",
  "instructorId": "string",
  "instructorName": "string",
  "lessonCount": "number",
  "rating": "number",
  "enrollmentLink": "string",
  "createdAt": "date",
  "updatedAt": "date",
  "category": {
    "_id": "string",
    "name": "string",
    "slug": "string"
  },
  "instructor": {
    "_id": "string",
    "username": "string"
  }
}
```

### Delete Course (Admin only)

```
DELETE /api/courses/:id
```

**Response (200):**
```json
{
  "message": "Course deleted successfully"
}
```

### Check Enrollment Status

```
GET /api/courses/:id/enrollment
```

**Response (200):**
```json
{
  "enrolled": "boolean"
}
```

### Enroll in Course

```
POST /api/courses/:id/enroll
```

**Response (200):**
```json
{
  "message": "Enrolled successfully",
  "enrollment": {
    "_id": "string",
    "userId": "string",
    "courseId": "string",
    "progress": "number",
    "completed": "boolean",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

## Lessons

### Get Lessons by Course

```
GET /api/courses/:id/lessons
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "description": "string",
    "content": "string",
    "videoUrl": "string",
    "courseId": "string",
    "order": "number",
    "duration": "number",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Get Lesson by ID

```
GET /api/lessons/:id
```

**Response (200):**
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "content": "string",
  "videoUrl": "string",
  "courseId": "string",
  "order": "number",
  "duration": "number",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Create Lesson (Admin only)

```
POST /api/courses/:courseId/lessons
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "content": "string",
  "videoUrl": "string",
  "order": "number",
  "duration": "number"
}
```

**Response (201):**
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "content": "string",
  "videoUrl": "string",
  "courseId": "string",
  "order": "number",
  "duration": "number",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Update Lesson (Admin only)

```
PUT /api/lessons/:id
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "content": "string",
  "videoUrl": "string",
  "order": "number",
  "duration": "number"
}
```

**Response (200):**
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "content": "string",
  "videoUrl": "string",
  "courseId": "string",
  "order": "number",
  "duration": "number",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Delete Lesson (Admin only)

```
DELETE /api/lessons/:id
```

**Response (200):**
```json
{
  "message": "Lesson deleted successfully"
}
```

## Profiles

### Create or Update Profile

```
POST /api/profile
```

**Request Body:**
```json
{
  "fullName": "string",
  "bio": "string",
  "interest": "string",
  "profileImageUrl": "string"
}
```

**Response (200):**
```json
{
  "_id": "string",
  "userId": "string",
  "fullName": "string",
  "bio": "string",
  "interest": "string",
  "profileImageUrl": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Get Profile

```
GET /api/profile
```

**Response (200):**
```json
{
  "_id": "string",
  "userId": "string",
  "fullName": "string",
  "bio": "string",
  "interest": "string",
  "profileImageUrl": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Notifications

### Get All Notifications

```
GET /api/notifications
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "message": "string",
    "type": "string",
    "recipients": "string | Array<string>",
    "read": ["string"],
    "createdAt": "date",
    "expiresAt": "date"
  }
]
```

### Get Unread Notifications

```
GET /api/notifications/unread
```

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "message": "string",
    "type": "string",
    "recipients": "string | Array<string>",
    "read": ["string"],
    "createdAt": "date",
    "expiresAt": "date"
  }
]
```

### Mark Notification as Read

```
PUT /api/notifications/:id/read
```

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read

```
PUT /api/notifications/read-all
```

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

### Create Notification (Admin only)

```
POST /api/notifications
```

**Request Body:**
```json
{
  "title": "string",
  "message": "string",
  "type": "string" (one of: "info", "success", "warning", "error"),
  "recipients": "string" ("all") or ["userId1", "userId2", ...],
  "expiresAt": "date" (optional)
}
```

**Response (201):**
```json
{
  "_id": "string",
  "title": "string",
  "message": "string",
  "type": "string",
  "recipients": "string | Array<string>",
  "read": [],
  "createdAt": "date",
  "expiresAt": "date"
}
```

### Delete Notification (Admin only)

```
DELETE /api/notifications/:id
```

**Response (200):**
```json
{
  "message": "Notification deleted successfully"
}
```

## Admin Dashboard

### Get Dashboard Statistics (Admin only)

```
GET /api/admin/dashboard/stats
```

**Response (200):**
```json
{
  "totalUsers": "number",
  "totalCourses": "number",
  "totalCategories": "number",
  "totalEnrollments": "number",
  "recentUsers": [{
    "_id": "string",
    "username": "string",
    "createdAt": "date"
  }],
  "recentCourses": [{
    "_id": "string",
    "title": "string",
    "createdAt": "date"
  }]
}
```

## Error Responses

**400 Bad Request:**
```json
{
  "message": "Error message explaining the issue"
}
```

**401 Unauthorized:**
```json
{
  "message": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "message": "Forbidden: Admin access required"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```