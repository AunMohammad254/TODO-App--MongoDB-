# MongoDB Compass Connection Guide

## Overview
This guide helps you connect to your MongoDB Atlas database using MongoDB Compass and verify that your TODO app data is properly stored and indexed.

## Connection Details

### MongoDB Atlas Connection String
```
mongodb+srv://aunmohammad254_db_user:DZtAQGMkmnctzd1S@cluster0.xxothym.mongodb.net/todoapp
```

### Database Information
- **Cluster**: cluster0.xxothym.mongodb.net
- **Database Name**: `todoapp`
- **Username**: `aunmohammad254_db_user`
- **Password**: `DZtAQGMkmnctzd1S`

## Step-by-Step Connection Guide

### 1. Download and Install MongoDB Compass
- Visit: https://www.mongodb.com/products/compass
- Download the appropriate version for your operating system
- Install following the standard installation process

### 2. Connect to Your Database

1. **Open MongoDB Compass**
2. **Choose Connection Method**: Select "Connect to MongoDB"
3. **Enter Connection String**: Paste the connection string above
4. **Alternative Manual Setup**:
   - **Hostname**: `cluster0.xxothym.mongodb.net`
   - **Port**: `27017` (default)
   - **Authentication**: Username/Password
   - **Username**: `aunmohammad254_db_user`
   - **Password**: `DZtAQGMkmnctzd1S`
   - **Authentication Database**: `admin`
   - **SSL**: Enabled (default for Atlas)

### 3. Navigate to Your Database

1. After successful connection, you'll see your cluster
2. Expand the cluster to view databases
3. Look for the `todoapp` database
4. Expand `todoapp` to see collections:
   - `users` - User account information
   - `tasks` - TODO task data

## Collections Overview

### Users Collection (`users`)
**Purpose**: Stores user account information

**Fields**:
- `_id`: Unique user identifier (ObjectId)
- `username`: User's chosen username (String, unique)
- `email`: User's email address (String, unique)
- `password`: Hashed password (String)
- `isActive`: Account status (Boolean)
- `createdAt`: Account creation timestamp (Date)
- `updatedAt`: Last modification timestamp (Date)

**Indexes**:
- `username_unique`: Unique index on username
- `email_unique`: Unique index on email
- `created_at_desc`: Descending index on creation date
- `active_users_by_date`: Compound index on isActive and createdAt
- `user_text_search`: Text search index on username and email

### Tasks Collection (`tasks`)
**Purpose**: Stores TODO task information

**Fields**:
- `_id`: Unique task identifier (ObjectId)
- `title`: Task title (String, required)
- `description`: Task description (String, optional)
- `priority`: Task priority (String: 'low', 'medium', 'high')
- `status`: Task status (String: 'Pending', 'In Progress', 'Completed')
- `dueDate`: Task due date (Date, optional)
- `userId`: Reference to user who owns the task (ObjectId)
- `completed`: Boolean completion status (Boolean)
- `createdAt`: Task creation timestamp (Date)
- `updatedAt`: Last modification timestamp (Date)
- `completedAt`: Task completion timestamp (Date, optional)

**Indexes**:
- `user_tasks_by_date`: User tasks sorted by creation date
- `user_tasks_by_status`: User tasks grouped by status
- `user_tasks_by_priority`: User tasks grouped by priority
- `user_tasks_by_due_date`: User tasks sorted by due date
- `user_tasks_completion_status`: User tasks by completion status and date
- `task_management_index`: Compound index for task management queries
- `due_date_index`: Index on due dates (partial, only for tasks with due dates)
- `task_text_search`: Text search index on title and description
- `completed_tasks_by_date`: Index on completion dates (partial)

## Verifying Data Visibility

### 1. Check Collections
- Both `users` and `tasks` collections should be visible
- If collections are missing, restart your TODO app to trigger initialization

### 2. View Sample Data
- In development mode, sample data is automatically created
- Look for:
  - Sample user: `compass_demo_user`
  - Sample tasks with different statuses and priorities

### 3. Verify Indexes
1. Click on a collection (e.g., `tasks`)
2. Go to the "Indexes" tab
3. You should see all the indexes listed above
4. If indexes are missing, restart the application

### 4. Test Queries
Try these sample queries in the MongoDB Compass query bar:

**Find all tasks for a specific user**:
```json
{ "userId": ObjectId("your-user-id-here") }
```

**Find high priority tasks**:
```json
{ "priority": "high" }
```

**Find completed tasks**:
```json
{ "status": "Completed" }
```

**Text search in tasks**:
```json
{ "$text": { "$search": "setup" } }
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to database
**Solutions**:
1. Verify internet connection
2. Check if the connection string is correct
3. Ensure MongoDB Atlas cluster is running
4. Verify IP whitelist settings in MongoDB Atlas

**Problem**: Authentication failed
**Solutions**:
1. Double-check username and password
2. Verify the user has proper permissions
3. Check if the user exists in the Atlas cluster

### Data Visibility Issues

**Problem**: Collections not visible
**Solutions**:
1. Restart the TODO application
2. Check server logs for initialization errors
3. Verify NODE_ENV is set to 'development'
4. Manually run database initialization

**Problem**: No data in collections
**Solutions**:
1. Use the TODO app to create some data
2. Check if sample data creation is enabled
3. Verify database connection in application logs

### Index Issues

**Problem**: Indexes not created
**Solutions**:
1. Restart the application to trigger index creation
2. Check server logs for index creation errors
3. Verify database permissions
4. Manually create indexes using MongoDB Compass

## Performance Monitoring

### Using MongoDB Compass for Performance

1. **Query Performance**:
   - Use the "Explain Plan" feature to analyze query performance
   - Check if queries are using indexes effectively

2. **Index Usage**:
   - Monitor index usage statistics
   - Identify unused indexes

3. **Collection Statistics**:
   - View document count and storage size
   - Monitor collection growth over time

## Security Considerations

### Connection Security
- Always use SSL/TLS connections (enabled by default with Atlas)
- Keep connection credentials secure
- Use IP whitelisting in MongoDB Atlas
- Regularly rotate database passwords

### Data Privacy
- Ensure sensitive data is properly encrypted
- Use appropriate field-level security
- Monitor access logs in MongoDB Atlas

## Additional Resources

- [MongoDB Compass Documentation](https://docs.mongodb.com/compass/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Query Documentation](https://docs.mongodb.com/manual/tutorial/query-documents/)
- [MongoDB Indexing Best Practices](https://docs.mongodb.com/manual/applications/indexes/)

## Support

If you encounter issues:
1. Check the application server logs
2. Verify MongoDB Atlas cluster status
3. Review connection string and credentials
4. Test connection using MongoDB Compass connection diagnostics