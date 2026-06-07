from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
DATABASE = 'vendors.db'

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    if not os.path.exists(DATABASE):
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
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
        ''')
        db.commit()
        db.close()

@app.route('/')
def index():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM vendors ORDER BY created_at DESC')
    vendors = cursor.fetchall()
    db.close()
    return render_template('index.html', vendors=vendors)

@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    search = request.args.get('search', '').strip()
    filter_by = request.args.get('filter', '').strip()

    db = get_db()
    cursor = db.cursor()

    query = 'SELECT * FROM vendors WHERE 1=1'
    params = []

    if search:
        query += ''' AND (vendor_name LIKE ? OR email LIKE ? OR
                   contact_person LIKE ? OR phone LIKE ? OR company_name LIKE ?)'''
        search_param = f'%{search}%'
        params.extend([search_param] * 5)

    if filter_by == 'active':
        pass

    query += ' ORDER BY created_at DESC'

    cursor.execute(query, params)
    vendors = [dict(row) for row in cursor.fetchall()]
    db.close()

    return jsonify(vendors)

@app.route('/api/vendors', methods=['POST'])
def create_vendor():
    data = request.json

    errors = validate_vendor(data)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            INSERT INTO vendors (vendor_name, contact_person, email, phone,
                               address, city, state, pincode, company_name,
                               gst_number, payment_terms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['vendor_name'],
            data['contact_person'],
            data['email'],
            data['phone'],
            data['address'],
            data['city'],
            data['state'],
            data['pincode'],
            data['company_name'],
            data.get('gst_number', ''),
            data.get('payment_terms', '')
        ))
        db.commit()
        vendor_id = cursor.lastrowid
        db.close()

        return jsonify({'success': True, 'id': vendor_id}), 201
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'errors': {'email': 'Email already exists'}}), 400

@app.route('/api/vendors/<int:vendor_id>', methods=['GET'])
def get_vendor(vendor_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM vendors WHERE id = ?', (vendor_id,))
    vendor = cursor.fetchone()
    db.close()

    if not vendor:
        return jsonify({'success': False, 'error': 'Vendor not found'}), 404

    return jsonify(dict(vendor))

@app.route('/api/vendors/<int:vendor_id>', methods=['PUT'])
def update_vendor(vendor_id):
    data = request.json

    errors = validate_vendor(data, vendor_id)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            UPDATE vendors SET
                vendor_name = ?, contact_person = ?, email = ?, phone = ?,
                address = ?, city = ?, state = ?, pincode = ?, company_name = ?,
                gst_number = ?, payment_terms = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            data['vendor_name'],
            data['contact_person'],
            data['email'],
            data['phone'],
            data['address'],
            data['city'],
            data['state'],
            data['pincode'],
            data['company_name'],
            data.get('gst_number', ''),
            data.get('payment_terms', ''),
            vendor_id
        ))
        db.commit()
        db.close()

        return jsonify({'success': True})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'errors': {'email': 'Email already exists'}}), 400

@app.route('/api/vendors/<int:vendor_id>', methods=['DELETE'])
def delete_vendor(vendor_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('DELETE FROM vendors WHERE id = ?', (vendor_id,))
    db.commit()
    db.close()

    return jsonify({'success': True})

def validate_vendor(data, vendor_id=None):
    errors = {}

    if not data.get('vendor_name', '').strip():
        errors['vendor_name'] = 'Vendor name is required'

    if not data.get('contact_person', '').strip():
        errors['contact_person'] = 'Contact person is required'

    email = data.get('email', '').strip()
    if not email:
        errors['email'] = 'Email is required'
    elif '@' not in email or '.' not in email:
        errors['email'] = 'Invalid email format'

    if not data.get('phone', '').strip():
        errors['phone'] = 'Phone is required'
    elif not data['phone'].isdigit() or len(data['phone']) < 10:
        errors['phone'] = 'Phone must be at least 10 digits'

    if not data.get('address', '').strip():
        errors['address'] = 'Address is required'

    if not data.get('city', '').strip():
        errors['city'] = 'City is required'

    if not data.get('state', '').strip():
        errors['state'] = 'State is required'

    if not data.get('pincode', '').strip():
        errors['pincode'] = 'Pincode is required'
    elif not data['pincode'].isdigit() or len(data['pincode']) != 6:
        errors['pincode'] = 'Pincode must be 6 digits'

    if not data.get('company_name', '').strip():
        errors['company_name'] = 'Company name is required'

    if email and not vendor_id:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT id FROM vendors WHERE email = ?', (email,))
        if cursor.fetchone():
            errors['email'] = 'Email already exists'
        db.close()

    return errors

init_db()

if __name__ == '__main__':
    app.run(debug=True)
