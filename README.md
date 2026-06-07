# Vendor Management System

A comprehensive web-based system for managing vendor records with registration, update, delete, search, and filtering capabilities.

## Features

✅ **Vendor Registration Form** - Add new vendors with comprehensive details
✅ **Update & Delete** - Modify or remove vendor records
✅ **Search & Filter** - Find vendors by name, email, phone, or company
✅ **Backend Validation** - Server-side validation of all vendor data
✅ **Persistent Database** - SQLite database for storing vendor records
✅ **Clean Admin Interface** - Responsive and intuitive user interface
✅ **Email Uniqueness** - Prevents duplicate vendor emails
✅ **Form Validation** - Real-time feedback on form errors

## Tech Stack

- **Backend**: Python Flask
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: CSS Grid & Flexbox for responsive design

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd "c:\Users\ASUS\Desktop\Cognetix Task Lists\Level-2\Project-2"
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open in browser**
   Navigate to `http://localhost:5000`

## Vendor Data Structure

Each vendor record contains:
- **Vendor Name** (Required)
- **Contact Person** (Required)
- **Email** (Required, Unique)
- **Phone** (Required, 10+ digits)
- **Address** (Required)
- **City** (Required)
- **State** (Required)
- **Pincode** (Required, 6 digits)
- **Company Name** (Required)
- **GST Number** (Optional)
- **Payment Terms** (Optional)
- **Created At** & **Updated At** (Auto-generated)

## Features Explanation

### 1. Add Vendor
- Click "Add New Vendor" button
- Fill in all required fields
- Optional fields: GST Number, Payment Terms
- Click "Save Vendor"

### 2. View Vendors
- All vendors displayed as cards
- Shows vendor name, contact, email, phone, company, address
- Sorted by most recent first

### 3. Search Vendors
- Type in search box to find vendors by:
  - Vendor Name
  - Email
  - Contact Person
  - Phone Number
  - Company Name

### 4. Filter Vendors
- Filter dropdown for future filter options
- Real-time search and filter results

### 5. Edit Vendor
- Click "Edit" button on vendor card
- Modify any field
- Changes are validated and saved

### 6. Delete Vendor
- Click "Delete" button on vendor card
- Confirmation dialog before deletion
- Vendor record is permanently removed

## Backend Validation Rules

- **Vendor Name**: Cannot be empty
- **Contact Person**: Cannot be empty
- **Email**: Must be valid format, must be unique
- **Phone**: Must be 10+ digits
- **Address**: Cannot be empty
- **City**: Cannot be empty
- **State**: Cannot be empty
- **Pincode**: Must be exactly 6 digits
- **Company Name**: Cannot be empty

## API Endpoints

### GET /api/vendors
Get all vendors with optional search and filter parameters
- Query params: `search`, `filter`
- Returns: Array of vendor objects

### GET /api/vendors/<id>
Get a specific vendor by ID
- Returns: Single vendor object

### POST /api/vendors
Create a new vendor
- Body: Vendor object with required fields
- Returns: Success status and vendor ID

### PUT /api/vendors/<id>
Update an existing vendor
- Body: Updated vendor object
- Returns: Success status

### DELETE /api/vendors/<id>
Delete a vendor
- Returns: Success status

## Database Schema

```sql
CREATE TABLE vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    company_name TEXT NOT NULL,
    gst_number TEXT,
    payment_terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Security Features

- XSS Protection: HTML escaping for all user inputs
- SQL Injection Prevention: Parameterized queries
- Email Uniqueness: Database constraint on email field
- CSRF Protection: Flask's built-in CSRF handling
- Input Validation: Both client-side and server-side validation

## File Structure

```
Project-2/
├── app.py                    # Flask backend application
├── requirements.txt          # Python dependencies
├── vendors.db               # SQLite database (auto-created)
├── README.md                # This file
├── templates/
│   └── index.html           # Main HTML template
└── static/
    ├── style.css            # CSS styling
    └── script.js            # JavaScript functionality
```

## Usage Example

1. Start the application
2. Click "Add New Vendor"
3. Fill in vendor details:
   - Name: "ABC Supplies Inc"
   - Contact: "John Doe"
   - Email: "john@abcsupplies.com"
   - Phone: "9876543210"
   - Address: "123 Business St"
   - City: "New York"
   - State: "NY"
   - Pincode: "100001"
   - Company: "ABC Supplies Inc"
4. Click "Save Vendor"
5. Use search to find vendors
6. Edit or delete as needed

## Troubleshooting

### Port 5000 already in use
If port 5000 is already in use, modify the last line in `app.py`:
```python
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5001)  # Change to a different port
```

### Database locked error
Delete `vendors.db` to start fresh, or wait a moment and refresh the page.

### Styling not loading
Clear browser cache (Ctrl+Shift+Delete) and hard refresh (Ctrl+Shift+R).

## Future Enhancements

- User authentication & roles
- Vendor categories & tags
- Bulk import/export
- Email notifications
- Vendor ratings & reviews
- Transaction history
- Advanced reporting

## License

This project is open source and available for educational purposes.
