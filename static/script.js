let currentVendorId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadVendors();
    document.getElementById('vendorForm').addEventListener('submit', handleFormSubmit);
});

function loadVendors() {
    fetch('/api/vendors')
        .then(response => response.json())
        .then(vendors => displayVendors(vendors))
        .catch(error => console.error('Error loading vendors:', error));
}

function displayVendors(vendors) {
    const vendorsList = document.getElementById('vendorsList');

    if (vendors.length === 0) {
        vendorsList.innerHTML = '<div class="empty-state"><h3>No vendors found</h3><p>Click "Add New Vendor" to get started.</p></div>';
        return;
    }

    vendorsList.innerHTML = vendors.map(vendor => `
        <div class="vendor-card">
            <h3>${escapeHtml(vendor.vendor_name)}</h3>
            <div class="label">Contact Person</div>
            <div class="value">${escapeHtml(vendor.contact_person)}</div>
            <div class="label">Email</div>
            <div class="value">${escapeHtml(vendor.email)}</div>
            <div class="label">Phone</div>
            <div class="value">${escapeHtml(vendor.phone)}</div>
            <div class="label">Company</div>
            <div class="value">${escapeHtml(vendor.company_name)}</div>
            <div class="label">Address</div>
            <div class="value">${escapeHtml(vendor.address)}, ${escapeHtml(vendor.city)}, ${escapeHtml(vendor.state)} ${escapeHtml(vendor.pincode)}</div>
            ${vendor.gst_number ? `<div class="label">GST</div><div class="value">${escapeHtml(vendor.gst_number)}</div>` : ''}
            ${vendor.payment_terms ? `<div class="label">Payment Terms</div><div class="value">${escapeHtml(vendor.payment_terms)}</div>` : ''}
            <div class="vendor-actions">
                <button class="btn btn-edit" onclick="editVendor(${vendor.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteVendor(${vendor.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function searchVendors() {
    const search = document.getElementById('searchInput').value;
    const filter = document.getElementById('filterSelect').value;

    let url = '/api/vendors?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (filter) url += `filter=${encodeURIComponent(filter)}`;

    fetch(url)
        .then(response => response.json())
        .then(vendors => displayVendors(vendors))
        .catch(error => console.error('Error searching vendors:', error));
}

function filterVendors() {
    searchVendors();
}

function openAddVendorModal() {
    currentVendorId = null;
    document.getElementById('modalTitle').textContent = 'Add New Vendor';
    document.getElementById('vendorForm').reset();
    clearAllErrors();
    document.getElementById('vendorModal').style.display = 'block';
}

function editVendor(vendorId) {
    fetch(`/api/vendors/${vendorId}`)
        .then(response => response.json())
        .then(vendor => {
            currentVendorId = vendorId;
            document.getElementById('modalTitle').textContent = 'Edit Vendor';
            document.getElementById('vendor_name').value = vendor.vendor_name;
            document.getElementById('contact_person').value = vendor.contact_person;
            document.getElementById('email').value = vendor.email;
            document.getElementById('phone').value = vendor.phone;
            document.getElementById('address').value = vendor.address;
            document.getElementById('city').value = vendor.city;
            document.getElementById('state').value = vendor.state;
            document.getElementById('pincode').value = vendor.pincode;
            document.getElementById('company_name').value = vendor.company_name;
            document.getElementById('gst_number').value = vendor.gst_number || '';
            document.getElementById('payment_terms').value = vendor.payment_terms || '';
            clearAllErrors();
            document.getElementById('vendorModal').style.display = 'block';
        })
        .catch(error => console.error('Error loading vendor:', error));
}

function deleteVendor(vendorId) {
    if (!confirm('Are you sure you want to delete this vendor?')) {
        return;
    }

    fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadVendors();
                alert('Vendor deleted successfully');
            }
        })
        .catch(error => console.error('Error deleting vendor:', error));
}

function closeVendorModal() {
    document.getElementById('vendorModal').style.display = 'none';
    currentVendorId = null;
}

function handleFormSubmit(event) {
    event.preventDefault();
    clearAllErrors();

    const formData = {
        vendor_name: document.getElementById('vendor_name').value.trim(),
        contact_person: document.getElementById('contact_person').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
        company_name: document.getElementById('company_name').value.trim(),
        gst_number: document.getElementById('gst_number').value.trim(),
        payment_terms: document.getElementById('payment_terms').value.trim()
    };

    const method = currentVendorId ? 'PUT' : 'POST';
    const url = currentVendorId ? `/api/vendors/${currentVendorId}` : '/api/vendors';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                closeVendorModal();
                loadVendors();
                alert(currentVendorId ? 'Vendor updated successfully' : 'Vendor added successfully');
            } else if (result.errors) {
                displayErrors(result.errors);
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(field);

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }

        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });

    document.querySelectorAll('input.error').forEach(el => {
        el.classList.remove('error');
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

window.onclick = function(event) {
    const modal = document.getElementById('vendorModal');
    if (event.target === modal) {
        closeVendorModal();
    }
}
