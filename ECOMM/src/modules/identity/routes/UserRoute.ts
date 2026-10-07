import express from "express";
import multer from "multer";
import {UserController} from "../controller/UserController";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

export class UserRoute {

    route = () => {

        const router = express.Router();

        const user = app(UserController);

        /** =========================================================================
         * CREATE USER OPERATIONS
         * ========================================================================= */

        /**
         * @route   POST /users/create
         * @desc    Create a single user
         *
         * Request Body:
         * {
         *     "first_name": "John",
         *     "last_name": "Doe",
         *     "email": "john@doe.com",
         *     "password_hash": "secret123",
         *     "status": "active" // optional enum: "active" | "inactive" | "pending" (default: "active")
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": null,
         *     "message": "user created successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "user not created",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.post('/users/create', user.createUser.bind(user));

        /**
         * @route   POST /users/create/all
         * @desc    Batch create multiple users
         *
         * Request Body:
         * [
         *     {
         *         "first_name": "John 1",
         *         "last_name": "Doe 1",
         *         "email": "john1@doe.com",
         *         "password_hash": "secret123",
         *         "status": "active"
         *     },
         *     {
         *         "first_name": "John 2",
         *         "last_name": "Doe 2",
         *         "email": "john2@doe.com",
         *         "password_hash": "secret123",
         *         "status": "pending"
         *     }
         * ]
         *
         * Response 200 (Success):
         * {
         *     "data": null,
         *     "message": "all users created successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "all users failed to create",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.post('/users/create/all', user.createAllUsers.bind(user));
        router.post('/users/create/bulk', user.createAllUsers.bind(user));

        /**
         * @route   POST /users/create/import
         * @desc    Import users from Excel or CSV file (.xlsx / .csv) with options
         *
         * Request (Multipart Form):
         * Content-Type: multipart/form-data
         * File Field: user_detail.xlsx OR user_detail.csv (or field 'file')
         * Form Field 'options' (JSON string or object):
         * {
         *     "options": {
         *         "skip_duplicates": true,
         *         "notify_users": false
         *     }
         * }
         *
         * File Columns supported (case-insensitive):
         * first_name | last_name | email | status | password_hash
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "imported_count": 2,
         *         "skipped_count": 1,
         *         "failed_count": 0,
         *         "users": [
         *             { "id": 1, "first_name": "John", "last_name": "Doe", "email": "john@mail.com", "status": "ACTIVE" },
         *             { "id": 2, "first_name": "John", "last_name": "Doe", "email": "deal@mail.com", "status": "ACTIVE" }
         *         ],
         *         "duplicates": [
         *             { "row": 4, "email": "john@mail.com", "reason": "Duplicate email in file" }
         *         ],
         *         "errors": [],
         *         "options": { "skip_duplicates": true, "notify_users": false }
         *     },
         *     "message": "Successfully imported 2 user(s), skipped 1 duplicate(s)",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "failed to import users",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.post('/users/create/import', upload.any(), user.importCreateUsers.bind(user));

        /** =========================================================================
         * READ USER OPERATIONS
         * ========================================================================= */

        /**
         * @route   GET /users
         * @desc    List users with pagination, filters, and sorting
         *
         * Request Query Parameters:
         * ?page=1&limit=12&first_name=john&status=active
         *
         * Filter Payload / Query Structure:
         * {
         *     "page": 1,
         *     "limit": 12,
         *     "filters": {
         *         "first_name": ["one", "jon"],
         *         "last_name": ["doe", "jon"],
         *         "status": ["active"],
         *         "date": ["10-12-2022", "20-12-2022"]
         *     },
         *     "sort": {
         *         "first_name": "asc"
         *     }
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": [
         *         {
         *             "id": 1,
         *             "first_name": "John 1",
         *             "last_name": "Doe 1",
         *             "email": "john1@doe.com",
         *             "status": "ACTIVE"
         *         },
         *         {
         *             "id": 2,
         *             "first_name": "John 2",
         *             "last_name": "Doe 2",
         *             "email": "john2@doe.com",
         *             "status": "PENDING"
         *         }
         *     ],
         *     "pagination": {
         *         "page": 1,
         *         "limit": 12,
         *         "total": 1200,
         *         "totalPages": 100
         *     },
         *     "message": "users list",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "user not found",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.get('/users', user.getUsers.bind(user));

        /**
         * @route   GET /users/:id
         * @desc    Get user details by ID
         *
         * Request Params:
         * id: 1
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "id": 1,
         *         "first_name": "John 1",
         *         "last_name": "Doe 1",
         *         "email": "john1@doe.com",
         *         "status": "ACTIVE"
         *     },
         *     "message": "user details",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 / 404 (Not Found):
         * {
         *     "data": null,
         *     "message": "user not found",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.get('/users/:id', user.getUser.bind(user));

        /** =========================================================================
         * UPDATE USER OPERATIONS
         * ========================================================================= */

        /**
         * @route   POST /users/update/bulk
         * @desc    Bulk update users based on filter criteria
         *
         * Request Body:
         * {
         *     "filters": {
         *         "first_name": ["one", "jon"],
         *         "last_name": ["doe", "jon"],
         *         "status": ["active"]
         *     },
         *     "excluded": [5, 12],
         *     "sorts": [
         *         { "key": "first_name", "direction": "asc" }
         *     ],
         *     "data": {
         *         "first_name": "Munira",
         *         "status": "active"
         *     }
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": { "affected_rows": 15 },
         *     "message": "successully rows update requested",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "row update failed",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.post('/users/update/bulk', user.updateBulkUsers.bind(user));

        /**
         * @route   POST /users/update/all
         * @desc    Batch update multiple users by ID
         *
         * Request Body:
         * [
         *     {
         *         "id": 1,
         *         "first_name": "John 1",
         *         "last_name": "Doe 1",
         *         "email": "john1@doe.com",
         *         "status": "active"
         *     },
         *     {
         *         "id": 2,
         *         "first_name": "John 2",
         *         "last_name": "Doe 2",
         *         "email": "john2@doe.com",
         *         "status": "pending"
         *     }
         * ]
         *
         * Response 200 (Success):
         * {
         *     "data": { "affected_rows": 2 },
         *     "message": "successully rows update requested",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "row update failed",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.post('/users/update/all', user.updateAllUsers.bind(user));

        /**
         * @route   POST /users/update/import
         * @desc    Batch import updates from file
         *
         * Request Body (Multipart / JSON):
         * Content-Type: multipart/form-data
         * Field: file (.csv / .xlsx containing IDs and updated columns)
         * Or JSON:
         * {
         *     "file_url": "https://storage.example.com/imports/user_updates.csv",
         *     "identifier_key": "id"
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "updated_count": 45,
         *         "failed_count": 0,
         *         "errors": []
         *     },
         *     "message": "user updates imported successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "failed to import user updates",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.post('/users/update/import', user.importUpdateUsers.bind(user));

        /**
         * @route   PUT /users/update/:id
         * @desc    Update a single user by ID
         *
         * Request Params:
         * id: 3
         *
         * Request Body:
         * {
         *     "first_name": "John 3",
         *     "last_name": "Doe 4",
         *     "email": "john6@doe.com",
         *     "status": "active"
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": [
         *         {
         *             "id": 3,
         *             "first_name": "John 3",
         *             "last_name": "Doe 4",
         *             "email": "john6@doe.com",
         *             "status": "ACTIVE"
         *         }
         *     ],
         *     "message": "user updated successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "user not found",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.put('/users/update/:id', user.updateUser.bind(user));

        /** =========================================================================
         * DELETE USER OPERATIONS
         * ========================================================================= */

        /**
         * @route   DELETE /users/delete/all
         * @desc    Delete multiple users by list of IDs
         *
         * Request Body:
         * {
         *     "ids": [1, 2, 3, 4, 6]
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": [1, 2, 3, 4, 6],
         *     "message": "users deleted",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "users not deleted",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.delete('/users/delete/all', user.deleteAllUsers.bind(user));

        /**
         * @route   DELETE /users/delete/bulk
         * @desc    Delete users matching filter criteria
         *
         * Request Body:
         * {
         *     "filters": {
         *         "first_name": ["one", "jon"],
         *         "last_name": ["doe", "jon"],
         *         "status": ["active"]
         *     },
         *     "excluded": [2],
         *     "sorts": []
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": { "deleted_count": 10 },
         *     "message": "successully rows update requested",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "row update failed",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.delete('/users/delete/bulk', user.deleteBulkUsers.bind(user));

        /**
         * @route   DELETE /users/delete/:id
         * @desc    Delete single user by ID
         *
         * Request Params:
         * id: 1
         *
         * Response 200 (Success):
         * {
         *     "data": null,
         *     "message": "user is deleted",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "user delete failed",
         *     "status": "failed",
         *     "code": 400
         * }
         */
        router.delete('/users/delete/:id', user.deleteUser.bind(user));

        /** =========================================================================
         * LOCK USER OPERATIONS
         * ========================================================================= */

        /**
         * @route   GET /users/lock
         * @desc    Get current lock status of table / rows
         *
         * Request Query Parameters:
         * ?table_key=users_table_1234
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "table_locked": false,
         *         "locked_rows": [12, 18],
         *         "lock_details": [
         *             { "row_id": 12, "locked_by": "user_42", "expires_at": "2026-10-07T23:00:00Z" }
         *         ]
         *     },
         *     "message": "getLocks initiated",
         *     "status": "success",
         *     "code": 200
         * }
         */
        router.get('/users/lock', user.getLocks.bind(user));

        /**
         * @route   POST /users/lock/table
         * @desc    Acquire lock on entire users table
         *
         * Request Body:
         * {
         *     "table_key": "users_table_1234",
         *     "is_locked": true,
         *     "duration_seconds": 60,
         *     "reason": "Bulk schema synchronization"
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": null,
         *     "message": "lockTable initiated",
         *     "status": "success",
         *     "code": 200
         * }
         */
        router.post('/users/lock/table', user.lockTable.bind(user));

        /**
         * @route   POST /users/lock/rows
         * @desc    Acquire lock on specific user rows
         *
         * Request Body:
         * {
         *     "table_key": "users_table_1234",
         *     "row_ids": [1, 2, 3],
         *     "is_locked": true,
         *     "duration_seconds": 60
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": null,
         *     "message": "lockRows initiated",
         *     "status": "success",
         *     "code": 200
         * }
         */
        router.post('/users/lock/rows', user.lockRows.bind(user));

        /** =========================================================================
         * EXPORT / DOWNLOAD USER OPERATIONS
         * ========================================================================= */

        /**
         * @route   POST /users/export
         * @desc    Initiate export job for user data
         *
         * Request Body:
         * {
         *     "table_key": "users_table_1234",
         *     "format": "csv", // "csv" | "xlsx" | "json"
         *     "filters": {
         *         "status": ["active"]
         *     },
         *     "columns": ["id", "first_name", "last_name", "email", "status"]
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "export_id": "exp_users_98765",
         *         "file_url": "https://storage.example.com/exports/users_20261007.csv",
         *         "total_records": 1200
         *     },
         *     "message": "exportData initiated",
         *     "status": "success",
         *     "code": 200
         * }
         */
        router.post('/users/export', user.exportData.bind(user));

        /**
         * @route   POST /users/download
         * @desc    Download generated export file
         *
         * Request Body:
         * {
         *     "export_id": "exp_users_98765"
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "download_url": "https://storage.example.com/exports/users_20261007.csv",
         *         "expires_in_seconds": 3600
         *     },
         *     "message": "downloadData initiated",
         *     "status": "success",
         *     "code": 200
         * }
         */
        router.post('/users/download', user.downloadData.bind(user));

        /** =========================================================================
         * TABLE VIEW USER OPERATIONS
         * ========================================================================= */

        /**
         * @route   GET /users/view/list
         * @desc    List saved table views for users
         *
         * Request Query Parameters:
         * ?table_key=users_table_1234&user_id=1
         *
         * Response 200 (Success):
         * {
         *     "data": [
         *         {
         *             "id": 1,
         *             "name": "Default View",
         *             "table_key": "users_table_1234",
         *             "user_id": 1,
         *             "description": "Default view",
         *             "is_default": true,
         *             "is_shared": false,
         *             "is_locked": false,
         *             "view_state": {
         *                 "columns": ["first_name", "last_name", "email", "status"],
         *                 "filters": { "status": ["active"] },
         *                 "sort": { "first_name": "asc" }
         *             }
         *         }
         *     ],
         *     "message": "Views fetched successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 500 (Internal Server Error):
         * {
         *     "data": null,
         *     "message": "Failed to fetch views",
         *     "status": "failed",
         *     "code": 500
         * }
         */
        router.get('/users/view/list', user.listViews.bind(user));

        /**
         * @route   POST /users/view/create
         * @desc    Create or update a saved table view
         *
         * Request Body:
         * {
         *     "id": 1, // optional, for update
         *     "name": "Active Users",
         *     "table_key": "users_table_1234",
         *     "user_id": 1, // optional, defaults to authenticated user
         *     "description": "Filter by active users only",
         *     "is_default": false,
         *     "is_shared": false,
         *     "is_locked": false,
         *     "view_state": {
         *         "columns": ["first_name", "last_name", "email"],
         *         "filters": { "status": ["active"] }
         *     }
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "id": 2,
         *         "name": "Active Users",
         *         "table_key": "users_table_1234",
         *         "user_id": 1,
         *         "is_default": false,
         *         "view_state": { ... }
         *     },
         *     "message": "View saved successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 400 (Bad Request):
         * {
         *     "data": null,
         *     "message": "View name is required",
         *     "status": "failed",
         *     "code": 400
         * }
         *
         * Response 500 (Internal Server Error):
         * {
         *     "data": null,
         *     "message": "Failed to save view",
         *     "status": "failed",
         *     "code": 500
         * }
         */
        router.post('/users/view/create', user.saveView.bind(user));

        /**
         * @route   GET /users/view/:id
         * @desc    Get single table view by ID
         *
         * Request Params:
         * id: 1
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "id": 1,
         *         "name": "Active Users",
         *         "table_key": "users_table_1234",
         *         "user_id": 1,
         *         "description": "Filter by active users only",
         *         "is_default": true,
         *         "view_state": { ... }
         *     },
         *     "message": "View fetched successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 404 (Not Found):
         * {
         *     "data": null,
         *     "message": "View not found",
         *     "status": "failed",
         *     "code": 404
         * }
         *
         * Response 500 (Internal Server Error):
         * {
         *     "data": null,
         *     "message": "Failed to fetch view",
         *     "status": "failed",
         *     "code": 500
         * }
         */
        router.get('/users/view/:id', user.getView.bind(user));

        /**
         * @route   DELETE /users/view/:id
         * @desc    Delete single table view by ID
         *
         * Request Params:
         * id: 1
         *
         * Response 200 (Success):
         * {
         *     "data": true,
         *     "message": "View deleted successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 500 (Internal Server Error):
         * {
         *     "data": null,
         *     "message": "Failed to delete view",
         *     "status": "failed",
         *     "code": 500
         * }
         */
        router.delete('/users/view/:id', user.deleteView.bind(user));

        /**
         * @route   PATCH /users/view/:id/default
         * @desc    Set default view for a table
         *
         * Request Params:
         * id: 1
         *
         * Request Body:
         * {
         *     "table_key": "users_table_1234",
         *     "user_id": 1 // optional
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "id": 1,
         *         "is_default": true
         *     },
         *     "message": "Default view updated successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 500 (Internal Server Error):
         * {
         *     "data": null,
         *     "message": "Failed to set default view",
         *     "status": "failed",
         *     "code": 500
         * }
         */
        router.patch('/users/view/:id/default', user.setDefaultView.bind(user));

        /** =========================================================================
         * PUB / SUB USER OPERATIONS
         * ========================================================================= */

        /**
         * @route   GET /users/talk
         * @route   POST /users/talk
         * @desc    Publish live table event via Redis
         *
         * Request Query / Body:
         * {
         *     "table_key": "users_table_1234",
         *     "event": "ROW_UPDATE",
         *     "payload": {
         *         "user_id": 1,
         *         "status": "active"
         *     }
         * }
         *
         * Response 200 (Success):
         * {
         *     "data": {
         *         "channel": "table:users_table_1234:live",
         *         "subscribers": 3,
         *         "published": true
         *     },
         *     "message": "liveUpdatePub broadcasted successfully",
         *     "status": "success",
         *     "code": 200
         * }
         *
         * Response 500 (Internal Server Error):
         * {
         *     "data": null,
         *     "message": "Redis is not connected",
         *     "status": "failed",
         *     "code": 500
         * }
         */
        router.get('/users/talk', user.liveUpdatePub.bind(user));
        router.post('/users/talk', user.liveUpdatePub.bind(user));

        /**
         * @route   GET /users/listen
         * @route   POST /users/listen
         * @desc    Subscribe to real-time table SSE (Server-Sent Events) stream
         *
         * Request Query / Body:
         * ?table_key=users_table_1234
         *
         * Response Headers:
         * Content-Type: text/event-stream
         * Cache-Control: no-cache
         * Connection: keep-alive
         *
         * SSE Event Stream Output:
         * data: {"type": "CONNECTED", "table_key": "users_table_1234", "timestamp": "2026-10-07T22:30:00.000Z"}
         *
         * data: {"table_key": "users_table_1234", "event": "ROW_UPDATE", "payload": { ... }}
         *
         * : heartbeat
         */
        router.get('/users/listen', user.liveUpdateSub.bind(user));
        router.post('/users/listen', user.liveUpdateSub.bind(user));

        /** =========================================================================
         * USER CONFIGURATION OPERATIONS
         * ========================================================================= */

        /**
         * @route   GET /users/config/table
         * @desc    Get user table UI configurations
         *
         * Response 200 (Success):
         * {
         *     "table_key": "users_table_1234",
         *     "display_name": "User Management",
         *     "readonly": false,
         *     "table_api": {
         *         "paginated_data_api": "/identity/management/users",
         *         "data_api": "/identity/management/users/:id",
         *         "create_api": "/identity/management/users/create",
         *         "update_api": "/identity/management/users/update/:id",
         *         "delete_api": "/identity/management/users/delete/:id"
         *     },
         *     "show_title_header_section": true,
         *     "enable_add_data_button": true,
         *     "add_data_button_name": "+ Add User",
         *     "action_panel": true,
         *     "pagination": {
         *         "active": true,
         *         "default_page_size": 10,
         *         "page_size_options": [10, 25, 50, 100, 200, 250]
         *     }
         * }
         */
        router.get('/users/config/table', user.getUserTableConfig.bind(user));

        /**
         * @route   GET /users/config/columns
         * @desc    Get user column definitions, ordering, and filter settings
         *
         * Response 200 (Success):
         * {
         *     "first_name": {
         *         "header_name": "First Name",
         *         "filter_key": "first_name",
         *         "filter_type": "multi_search",
         *         "editable": true,
         *         "sorting": true,
         *         "selected": true
         *     },
         *     "last_name": {
         *         "header_name": "Last Name",
         *         "filter_key": "last_name",
         *         "filter_type": "search",
         *         "editable": false,
         *         "sorting": true,
         *         "selected": true
         *     },
         *     "email": {
         *         "header_name": "Email",
         *         "filter_key": "user_email",
         *         "filter_type": "search",
         *         "editable": true,
         *         "sorting": true,
         *         "selected": true
         *     }
         * }
         */
        router.get('/users/config/columns', user.getUserColumnsConfig.bind(user));

        /**
         * @route   GET /users/config/actions
         * @desc    Get user table actions, toolbar buttons, and panel configuration
         *
         * Response 200 (Success):
         * {
         *     "sections": {
         *         "section_1": { "name": "Actions", "component": "dropdown_sections_component", "order": 1, "pinned": true },
         *         "section_2": { "name": "Views", "component": "dropdown_sections_component", "order": 2, "pinned": true },
         *         "section_3": { "name": "More", "component": "dropdown_sections_component", "order": 3, "pinned": true },
         *         "section_4": { "name": "Exports", "component": "dropdown_sections_component", "order": 4, "pinned": true },
         *         "section_5": { "name": "AI", "component": "dropdown_sections_component", "order": 5, "pinned": true }
         *     },
         *     "actions": {
         *         "refresh": { "name": "Refresh", "component": "refresh_component", "active": true, "pinned": true },
         *         "lock": { "name": "Lock", "component": "lock_component", "active": true, "pinned": true }
         *     }
         * }
         */
        router.get('/users/config/actions', user.getUserActionsConfig.bind(user));

        return router;
    }
}
