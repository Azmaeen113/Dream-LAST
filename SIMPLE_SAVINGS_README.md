# Simple Savings Update Feature

This feature allows admins to update the group savings amount, which is then immediately reflected on the homepage.

## How It Works

1. A simple Node.js server stores the savings amount in a JSON file (db.json)
2. The admin can update this amount through the admin interface
3. The homepage periodically checks for updates to the savings amount
4. When the admin updates the savings, the homepage automatically reflects the changes

## Running the Application

### Option 1: Using the Batch File (Windows)

1. Simply double-click the `start-app.bat` file
2. This will start both the Node.js server and the frontend

### Option 2: Manual Start

1. Open two terminal windows
2. In the first terminal, run: `npm run server`
3. In the second terminal, run: `npm run dev`

## Testing the Feature

1. Open the application in your browser (usually at http://localhost:5173)
2. Log in with admin credentials
3. Navigate to the dashboard and note the current savings amount
4. Go to the Admin page by clicking on "Admin" in the bottom navigation bar
5. Enter a new savings amount and click "Update Savings"
6. Return to the dashboard and verify that the savings amount has been updated

## Implementation Details

### Backend

The backend is a simple Express server that:
- Stores the savings amount in a JSON file (db.json)
- Provides an endpoint to get the current savings amount
- Provides an endpoint to update the savings amount

### Frontend

The frontend has been modified to:
- Fetch the savings amount from the API
- Periodically refresh the data
- Update the display when the savings amount changes
- Allow admins to update the savings amount

## Files Modified/Created

1. `server.js` - New file for the simple Node.js backend
2. `db.json` - New file to store the savings amount
3. `src/lib/savingsService.ts` - New service to interact with the API
4. `src/components/dashboard/GroupSavings.tsx` - Updated to use the new API
5. `src/components/admin/AdminSavings.tsx` - New component for updating savings
6. `src/pages/AdminPage.tsx` - New page for admin functionality
7. `src/App.tsx` - Updated to include the new AdminPage route
8. `src/components/navigation/BottomNavbar.tsx` - Updated to link to the new AdminPage
9. `package.json` - Added script to run the server
10. `start-app.bat` - New file to start both the server and frontend

## Troubleshooting

If you encounter any issues:

1. Make sure both the server and frontend are running
2. Check the browser console for any errors
3. Verify that the server is running on port 3000
4. Ensure you're logged in as an admin to update savings
5. Check that the db.json file exists and is writable
