// admin-client-app.js
// Client-side admin/public logic — includes booking deletion support for server/legacy localStorage bookings

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle (Dark/Light Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeButtons = document.querySelectorAll('.close-button');

    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.checked = false;
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    } else {
        applyTheme(false);
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                applyTheme(true);
                localStorage.setItem('theme', 'dark');
            } else {
                applyTheme(false);
                localStorage.setItem('theme', 'light');
            }
        });
    }

    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
            applyTheme(document.body.classList.contains('dark-mode'));
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (settingsModal && event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // --- Admin Login Logic ---
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const adminLoginSection = document.getElementById('admin-login');
    const adminDashboardSection = document.getElementById('admin-dashboard');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    function checkAdminStatus() {
        const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
        if (isAdminLoggedIn === 'true') {
            if (adminLoginSection) adminLoginSection.style.display = 'none';
            if (adminDashboardSection) adminDashboardSection.style.display = 'block';
            if (adminLogoutBtn) adminLogoutBtn.style.display = 'inline-block';
            if (window.location.pathname.includes('/admin')) {
                showSection('view-appointments-section'); // default section
                fetchAppointments();
                fetchComplaints();
                fetchJobApplications();
                fetchBookings();
            }
        } else {
            if (adminLoginSection) adminLoginSection.style.display = 'block';
            if (adminDashboardSection) adminDashboardSection.style.display = 'none';
            if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    if (loginMessage) {
                        loginMessage.className = 'success-message';
                        loginMessage.textContent = 'Login successful! Redirecting to dashboard...';
                    }
                    sessionStorage.setItem('isAdminLoggedIn', 'true');
                    setTimeout(() => checkAdminStatus(), 800);
                } else {
                    if (loginMessage) {
                        loginMessage.className = 'error-message';
                        loginMessage.textContent = result.message || 'Login failed.';
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                if (loginMessage) {
                    loginMessage.className = 'error-message';
                    loginMessage.textContent = 'An error occurred during login. Please try again.';
                }
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAdminLoggedIn');
            checkAdminStatus();
            alert('You have been logged out.');
        });
    }

    // --- Dashboard Navigation (Admin Only) ---
    const addClientNavBtn = document.getElementById('addClientNavBtn');
    const viewClientsNavBtn = document.getElementById('viewClientsNavBtn');
    const createAppointmentBtn = document.getElementById('create-appointment-btn');
    const viewAppointmentsBtn = document.getElementById('view-appointments-btn');
    const viewComplaintsBtn = document.getElementById('view-complaints-btn');
    const viewApplicationsNavBtn = document.getElementById('viewApplicationsNavBtn');
    const viewBookingsBtn = document.getElementById('viewBookingsBtn');

    const addClientSection = document.getElementById('add-client-section');
    const viewClientsSection = document.getElementById('view-clients-section');
    const createAppointmentSection = document.getElementById('create-appointment-section');
    const viewAppointmentsSection = document.getElementById('view-appointments-section');
    const viewComplaintsSection = document.getElementById('view-complaints-section');
    const viewApplicationsSection = document.getElementById('view-applications-section');
    const bookingsContainer = document.getElementById('bookingsContainer');

    function hideAllSections() {
        if (addClientSection) addClientSection.style.display = 'none';
        if (viewClientsSection) viewClientsSection.style.display = 'none';
        if (createAppointmentSection) createAppointmentSection.style.display = 'none';
        if (viewAppointmentsSection) viewAppointmentsSection.style.display = 'none';
        if (viewComplaintsSection) viewComplaintsSection.style.display = 'none';
        if (viewApplicationsSection) viewApplicationsSection.style.display = 'none';
        if (bookingsContainer) bookingsContainer.style.display = 'none';
    }

    function showSection(sectionId) {
        hideAllSections();
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
    }

    if (addClientNavBtn) {
        addClientNavBtn.addEventListener('click', () => {
            showSection('add-client-section');
            const cm = document.getElementById('client-message');
            if (cm) cm.textContent = '';
        });
    }
    if (viewClientsNavBtn) {
        viewClientsNavBtn.addEventListener('click', () => {
            showSection('view-clients-section');
            fetchClients();
        });
    }
    if (createAppointmentBtn) {
        createAppointmentBtn.addEventListener('click', () => showSection('create-appointment-section'));
    }
    if (viewAppointmentsBtn) {
        viewAppointmentsBtn.addEventListener('click', () => {
            showSection('view-appointments-section');
            fetchAppointments();
        });
    }
    if (viewComplaintsBtn) {
        viewComplaintsBtn.addEventListener('click', () => {
            showSection('view-complaints-section');
            fetchComplaints();
        });
    }
    if (viewApplicationsNavBtn) {
        viewApplicationsNavBtn.addEventListener('click', () => {
            showSection('view-applications-section');
            fetchJobApplications();
        });
    }
    if (viewBookingsBtn) {
        viewBookingsBtn.addEventListener('click', () => {
            showSection('bookingsContainer');
            fetchBookings();
        });
    }

    // --- Client Management Functionality (NOW using MongoDB via API) ---
    const newClientNameInput = document.getElementById('newClientName');
    const clientEmailInput = document.getElementById('clientEmail');
    const clientPhoneInput = document.getElementById('clientPhone');
    const clientAddressInput = document.getElementById('clientAddress');
    const saveClientBtn = document.getElementById('saveClientBtn');
    const clientList = document.getElementById('clientList');
    const noClientsMessage = document.getElementById('no-clients-message');
    const clientMessage = document.getElementById('client-message');

    async function fetchClients() {
        if (!clientList) return; // Ensure element exists (only on admin page)

        clientList.innerHTML = ''; // Clear previous content
        if (noClientsMessage) noClientsMessage.style.display = 'none'; // Hide message initially

        try {
            const response = await fetch('/api/clients');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const clients = await response.json();
            displayAdminClients(clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
            clientList.innerHTML = `<li class="error-message">Failed to load clients.</li>`;
            if (noClientsMessage) {
                noClientsMessage.textContent = 'Failed to load clients.';
                noClientsMessage.style.display = 'block';
            }
        }
    }

    function displayAdminClients(clients) {
        if (!clientList) return;

        clientList.innerHTML = ''; // Clear previous content
        if (clients.length === 0) {
            if (noClientsMessage) {
                noClientsMessage.textContent = 'No clients found.';
                noClientsMessage.style.display = 'block';
            }
            return;
        }
        if (noClientsMessage) noClientsMessage.style.display = 'none';

        clients.forEach(client => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>
                    <strong>${client.name}</strong><br>
                    Email: ${client.email || 'N/A'}<br>
                    Phone: ${client.phone || 'N/A'}<br>
                    Address: ${client.address || 'N/A'}
                </div>
                <button data-id="${client._id}">Delete</button>
            `;
            clientList.appendChild(listItem);
        });

        document.querySelectorAll('#clientList li button').forEach(button => {
            button.addEventListener('click', deleteClient);
        });
    }

    async function deleteClient(event) {
        const clientIdToDelete = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this client?')) {
            return;
        }

        try {
            const response = await fetch(`/api/clients/${clientIdToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Client deleted successfully!');
                fetchClients(); // Refresh the list
            } else {
                const result = await response.json();
                alert(result.message || 'Failed to delete client.');
            }
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('An error occurred while deleting the client.');
        }
    }

    if (saveClientBtn) {
        saveClientBtn.addEventListener('click', async () => {
            const name = newClientNameInput.value.trim();
            const email = clientEmailInput.value.trim();
            const phone = clientPhoneInput.value.trim();
            const address = clientAddressInput.value.trim();

            if (!name || !email) {
                clientMessage.className = 'error-message';
                clientMessage.textContent = 'Client Name and Email are required.';
                return;
            }

            const newClientData = { name, email, phone, address };

            try {
                const response = await fetch('/api/clients', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newClientData)
                });

                const result = await response.json();

                if (response.ok) {
                    clientMessage.className = 'success-message';
                    clientMessage.textContent = 'Client saved successfully!';

                    // Clear inputs
                    newClientNameInput.value = '';
                    clientEmailInput.value = '';
                    clientPhoneInput.value = '';
                    clientAddressInput.value = '';

                    // Optionally, switch to view clients section after saving
                    // showSection('view-clients-section');
                    // fetchClients();
                } else {
                    clientMessage.className = 'error-message';
                    clientMessage.textContent = result.message || 'Failed to save client.';
                }
            } catch (error) {
                console.error('Error saving client:', error);
                clientMessage.className = 'error-message';
                clientMessage.textContent = 'An error occurred during saving. Please try again.';
            }
        });
    }

    // --- Create Appointment (Admin) ---
    const createAppointmentForm = document.getElementById('create-appointment-form');
    const appointmentMessage = document.getElementById('appointment-message');

    if (createAppointmentForm) {
        createAppointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                clientName: document.getElementById('appointmentClientName').value,
                contactNumber: document.getElementById('contactNumber').value,
                service: document.getElementById('service').value,
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                notes: document.getElementById('notes').value
            };

            try {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (response.ok) {
                    if (appointmentMessage) {
                        appointmentMessage.className = 'success-message';
                        appointmentMessage.textContent = 'Appointment created successfully!';
                    }
                    createAppointmentForm.reset();
                    fetchAppointments();
                    fetchPublicAppointments();
                } else {
                    if (appointmentMessage) {
                        appointmentMessage.className = 'error-message';
                        appointmentMessage.textContent = result.message || 'Failed to create appointment.';
                    }
                }
            } catch (error) {
                console.error('Error creating appointment:', error);
                if (appointmentMessage) {
                    appointmentMessage.className = 'error-message';
                    appointmentMessage.textContent = 'An error occurred. Please try again.';
                }
            }
        });
    }

    // --- Fetch and Display Appointments (Admin) ---
    const appointmentsTableBody = document.querySelector('#appointments-table tbody');
    const noAppointmentsMessage = document.getElementById('no-appointments-message');

    async function fetchAppointments() {
        if (!appointmentsTableBody) return;
        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const appointments = await response.json();
            displayAdminAppointments(appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            if (appointmentsTableBody) {
                appointmentsTableBody.innerHTML = `<tr><td colspan="7" class="error-message">Failed to load appointments.</td></tr>`;
            }
            if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'block';
        }
    }

    function displayAdminAppointments(appointments) {
        if (!appointmentsTableBody) return;
        appointmentsTableBody.innerHTML = '';
        if (!Array.isArray(appointments) || appointments.length === 0) {
            if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'block';
            return;
        }
        if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'none';

        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        appointments.forEach(appointment => {
            const row = appointmentsTableBody.insertRow();
            row.innerHTML = `
                <td>${appointment.clientName}</td>
                <td>${appointment.contactNumber}</td>
                <td>${appointment.service}</td>
                <td>${new Date(appointment.date).toLocaleDateString('en-NZ')}</td>
                <td>${appointment.time}</td>
                <td>${appointment.notes || 'N/A'}</td>
                <td><button class="delete-appointment-btn" data-id="${appointment._id || appointment.id}">Delete</button></td>
            `;
        });

        document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
            btn.addEventListener('click', deleteAppointment);
        });
    }

    async function deleteAppointment(event) {
        const appointmentId = event.target.dataset.id;
        if (!appointmentId) {
            alert('Appointment ID not found.');
            return;
        }
        if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Appointment deleted successfully!');
                fetchAppointments();
                fetchPublicAppointments();
            } else {
                const result = await response.json().catch(() => ({}));
                alert(result.message || 'Failed to delete appointment.');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('An error occurred while deleting the appointment.');
        }
    }

    // --- Print Appointments ---
    const printAppointmentsBtn = document.getElementById('print-appointments-btn');
    if (printAppointmentsBtn) {
        printAppointmentsBtn.addEventListener('click', () => window.print());
    }

    // --- Fetch and Display Complaints/Reports (Admin) ---
    const complaintsTableBody = document.querySelector('#complaints-table tbody');
    const noComplaintsMessage = document.getElementById('no-complaints-message');

    async function fetchComplaints() {
        if (!complaintsTableBody) return;
        try {
            const response = await fetch('/api/complaints');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const complaints = await response.json();
            displayAdminComplaints(complaints);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            if (complaintsTableBody) {
                complaintsTableBody.innerHTML = `<tr><td colspan="7" class="error-message">Failed to load reports/complaints.</td></tr>`;
            }
            if (noComplaintsMessage) noComplaintsMessage.style.display = 'block';
        }
    }

    function displayAdminComplaints(complaints) {
        if (!complaintsTableBody) return;
        complaintsTableBody.innerHTML = '';
        if (!Array.isArray(complaints) || complaints.length === 0) {
            if (noComplaintsMessage) noComplaintsMessage.style.display = 'block';
            return;
        }
        if (noComplaintsMessage) noComplaintsMessage.style.display = 'none';

        complaints.forEach(complaint => {
            const row = complaintsTableBody.insertRow();
            row.innerHTML = `
                <td>${complaint.type ? (complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)) : 'N/A'}</td>
                <td>${complaint.senderName}</td>
                <td>${complaint.senderEmail || 'N/A'}</td>
                <td>${complaint.senderPhone || 'N/A'}</td>
                <td>${complaint.message}</td>
                <td>${complaint.createdAt ? (new Date(complaint.createdAt).toLocaleDateString('en-NZ') + ' ' + new Date(complaint.createdAt).toLocaleTimeString('en-NZ')) : 'N/A'}</td>
                <td><button class="delete-complaint-btn" data-id="${complaint._id || complaint.id}">Delete</button></td>
            `;
        });

        document.querySelectorAll('.delete-complaint-btn').forEach(btn => {
            btn.addEventListener('click', deleteComplaint);
        });
    }

    async function deleteComplaint(event) {
        const complaintId = event.target.dataset.id;
        if (!complaintId) {
            alert('Complaint ID not found.');
            return;
        }
        if (!confirm('Are you sure you want to delete this report/complaint? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/complaints/${complaintId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Report/Complaint deleted successfully!');
                fetchComplaints();
            } else {
                const result = await response.json().catch(() => ({}));
                alert(result.message || 'Failed to delete report/complaint.');
            }
        } catch (error) {
            console.error('Error deleting report/complaint:', error);
            alert('An error occurred while deleting the report/complaint.');
        }
    }

    // --- Job Applications (Admin) ---
    const applicationsTableBody = document.querySelector('#applications-table tbody');
    const noApplicationsMessage = document.getElementById('no-applications-message');

    async function fetchJobApplications() {
        if (!applicationsTableBody) return;
        applicationsTableBody.innerHTML = '';
        if (noApplicationsMessage) {
            noApplicationsMessage.style.display = 'none';
            noApplicationsMessage.className = '';
            noApplicationsMessage.textContent = '';
        }

        try {
            const response = await fetch('/api/applications');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const applications = await response.json();
            displayAdminApplications(applications);
        } catch (error) {
            console.error('Error fetching job applications:', error);
            if (noApplicationsMessage) {
                noApplicationsMessage.className = 'error-message';
                noApplicationsMessage.textContent = `Failed to load job applications: ${error.message}`;
                noApplicationsMessage.style.display = 'block';
            }
            applicationsTableBody.innerHTML = '';
        }
    }

    function displayAdminApplications(applications) {
        if (!applicationsTableBody) return;
        applicationsTableBody.innerHTML = '';
        if (noApplicationsMessage) {
            noApplicationsMessage.style.display = 'none';
            noApplicationsMessage.className = '';
            noApplicationsMessage.textContent = '';
        }

        if (!Array.isArray(applications) || applications.length === 0) {
            if (noApplicationsMessage) {
                noApplicationsMessage.textContent = 'No job applications found.';
                noApplicationsMessage.style.display = 'block';
            }
            return;
        }

        applications.forEach(application => {
            const row = applicationsTableBody.insertRow();
            row.innerHTML = `
                <td>${application.name}</td>
                <td>${application.experience || 'N/A'}</td>
                <td>${application.address}</td>
                <td>${application.phone}</td>
                <td>${application.email}</td>
                <td>${application.motivation ? application.motivation.substring(0, 50) + (application.motivation.length > 50 ? '...' : '') : 'N/A'}</td>
                <td>${application.createdAt ? (new Date(application.createdAt).toLocaleDateString('en-NZ') + ' ' + new Date(application.createdAt).toLocaleTimeString('en-NZ')) : 'N/A'}</td>
                <td><button class="delete-application-btn" data-id="${application._id || application.id}">Delete</button></td>
            `;
        });

        document.querySelectorAll('.delete-application-btn').forEach(btn => {
            btn.addEventListener('click', deleteJobApplication);
        });
    }

    async function deleteJobApplication(event) {
        const applicationId = event.target.dataset.id;
        if (!applicationId) {
            alert('Application ID not found.');
            return;
        }
        if (!confirm('Are you sure you want to delete this job application? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/applications/${applicationId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Job application deleted successfully!');
                fetchJobApplications();
            } else {
                const result = await response.json().catch(() => ({}));
                alert(result.message || 'Failed to delete job application.');
            }
        } catch (error) {
            console.error('Error deleting job application:', error);
            alert('An error occurred while deleting the job application.');
        }
    }

    // --- Bookings (Admin + localStorage support) ---
    const noBookingsMsg = document.getElementById('no-bookings-message');

    // track the current tbody used for bookings and ensure listener attaches to the current tbody
    let attachedBookingTbody = null;

    // Handler function for booking delete clicks (attached to a tbody element)
    async function handleBookingTbodyClick(e) {
        const targetBtn = e.target.closest && e.target.closest('.delete-booking-btn');
        if (!targetBtn) return;

        const bookingId = (targetBtn.dataset.bookingId || '').toString();

        if (!bookingId) {
            alert("Booking ID not found!");
            return;
        }

        if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            return;
        }

        // Heuristic: if bookingId looks like a MongoDB ObjectId (24 hex chars) call backend DELETE
        const isLikelyMongoId = typeof bookingId === 'string' && /^[0-9a-fA-F]{24}$/.test(bookingId);

        if (isLikelyMongoId) {
            try {
                const res = await fetch(`/api/bookings/${bookingId}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    // Also remove any matching booking in localStorage (tempId/id/_id)
                    try {
                        let stored = JSON.parse(localStorage.getItem('bookings')) || [];
                        const filtered = stored.filter(b => {
                            const ids = [
                                b && (b.tempId !== undefined ? b.tempId : null),
                                b && (b.id !== undefined ? b.id : null),
                                b && (b._id !== undefined ? b._id : null)
                            ].filter(Boolean).map(x => x.toString());
                            return !ids.includes(bookingId);
                        });
                        if (filtered.length !== stored.length) {
                            localStorage.setItem('bookings', JSON.stringify(filtered));
                        }
                    } catch (lsErr) {
                        console.error('Error cleaning up localStorage bookings after server delete:', lsErr);
                    }

                    alert("Booking deleted!");
                    fetchBookings(); // refresh the table
                } else {
                    const text = await res.text().catch(() => '');
                    // Try JSON if available
                    try {
                        const json = JSON.parse(text);
                        alert(json.message || "Failed to delete booking.");
                    } catch {
                        alert(text || "Failed to delete booking.");
                    }
                }
            } catch (err) {
                console.error("Error deleting booking:", err);
                alert("Error deleting booking: " + (err.message || err));
            }
        } else {
            // treat as localStorage tempId or non-mongo id -> remove from localStorage
            try {
                let stored = JSON.parse(localStorage.getItem('bookings')) || [];
                const filtered = stored.filter(b => {
                    const ids = [
                        b && (b.tempId !== undefined ? b.tempId : null),
                        b && (b.id !== undefined ? b.id : null),
                        b && (b._id !== undefined ? b._id : null)
                    ].filter(Boolean).map(x => x.toString());
                    return !ids.includes(bookingId);
                });
                localStorage.setItem('bookings', JSON.stringify(filtered));
                alert('Booking deleted from local storage!');
                fetchBookings();
            } catch (err) {
                console.error('Error deleting booking from localStorage:', err);
                alert('Failed to delete booking from local storage.');
            }
        }
    }

    // Helper: save a booking to localStorage with tempId (use where you handle local booking creation)
    function saveBookingToLocalStorage({ name, address, phone, cleaningType, notes, date }) {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const newBooking = {
            tempId: Date.now().toString(),
            name,
            address,
            phone,
            cleaningType,
            notes,
            date: date || new Date().toISOString()
        };
        bookings.push(newBooking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return newBooking;
    }

    // --- Updated fetchBookings: supports server bookings and localStorage bookings (tempId) ---
    async function fetchBookings() {
        // Determine where to render: prefer existing table with id="booking-table", else use bookingsContainer
        let tbody = document.querySelector('#booking-table tbody');
        const usingExistingTable = !!tbody;

        // If using bookingsContainer, clear previous table/content except the no-bookings-message
        if (!usingExistingTable) {
            if (!bookingsContainer) return;
            Array.from(bookingsContainer.children).forEach(child => {
                if (child.id !== 'no-bookings-message') child.remove();
            });
        } else {
            // Clear existing table body
            tbody.innerHTML = '';
        }

        // Fetch server bookings
        let serverBookings = [];
        try {
            const res = await fetch('/api/bookings');
            if (res.ok) {
                serverBookings = await res.json();
                if (!Array.isArray(serverBookings)) serverBookings = [];
            } else {
                console.warn('Failed to fetch server bookings, status:', res.status);
            }
        } catch (err) {
            console.error('Error fetching server bookings:', err);
        }

        // Load localStorage bookings (legacy)
        let localBookings = [];
        try {
            localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
            if (!Array.isArray(localBookings)) localBookings = [];
        } catch (e) {
            console.error('Error parsing localStorage bookings:', e);
            localBookings = [];
        }

        // Combine
        const allBookings = [...serverBookings, ...localBookings];

        if (!allBookings || allBookings.length === 0) {
            if (noBookingsMsg) {
                noBookingsMsg.textContent = 'No bookings found.';
                noBookingsMsg.style.display = 'block';
            }
            return;
        }

        if (noBookingsMsg) noBookingsMsg.style.display = 'none';

        // If we're not using an existing table structure, create one inside bookingsContainer
        if (!usingExistingTable) {
            const table = document.createElement('table');
            table.className = 'data-table';
            table.id = 'booking-table'; // keep consistent id for potential referencing

            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Cleaning Type</th>
                    <th>Notes</th>
                    <th>Date/Time</th>
                    <th>Actions</th>
                </tr>
            `;
            table.appendChild(thead);

            tbody = document.createElement('tbody');
            table.appendChild(tbody);
            bookingsContainer.appendChild(table);
        }

        // Populate rows
        allBookings.forEach((booking) => {
            const row = document.createElement('tr');

            const name = booking.name || 'N/A';
            const address = booking.address || 'N/A';
            const phone = booking.phone || 'N/A';
            const cleaningType = booking.cleaningType || 'N/A';
            const notes = booking.notes || 'N/A';
            const dateVal = booking.date || booking.createdAt || Date.now();
            const dateTime = new Date(dateVal).toLocaleString('en-NZ');

            // Always prefer MongoDB _id, ignore tempId if real id exists
            const id = booking._id ? booking._id : (booking.id || booking.tempId || '');

            row.innerHTML = `
                <td>${name}</td>
                <td>${address}</td>
                <td>${phone}</td>
                <td>${cleaningType}</td>
                <td>${notes}</td>
                <td>${dateTime}</td>
                <td>
                    <button class="delete-booking-btn" data-booking-id="${id}">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Attach delete handler to the current tbody (only once per tbody element)
        if (tbody && attachedBookingTbody !== tbody) {
            tbody.addEventListener('click', handleBookingTbodyClick);
            attachedBookingTbody = tbody;
        }
    }

    // --- Public Appointments ---
    const publicAppointmentsListDiv = document.getElementById('appointments-list');
    let publicAppointmentsTableBody;
    let noPublicAppointmentsMessage;

    async function fetchPublicAppointments() {
        if (!publicAppointmentsListDiv) return;

        if (!publicAppointmentsTableBody) {
            publicAppointmentsListDiv.innerHTML = `
                <table id="public-appointments-table">
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <p id="no-public-appointments-message" style="display: none;">No upcoming appointments.</p>
            `;
            publicAppointmentsTableBody = document.querySelector('#public-appointments-table tbody');
            noPublicAppointmentsMessage = document.getElementById('no-public-appointments-message');
        }

        publicAppointmentsTableBody.innerHTML = '';
        if (noPublicAppointmentsMessage) noPublicAppointmentsMessage.style.display = 'none';

        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const appointments = await response.json();
            displayPublicAppointments(appointments);
        } catch (error) {
            console.error('Error fetching public appointments:', error);
            if (publicAppointmentsTableBody) {
                publicAppointmentsTableBody.innerHTML = `<tr><td colspan="5" class="error-message">Failed to load appointments.</td></tr>`;
            }
            if (noPublicAppointmentsMessage) {
                noPublicAppointmentsMessage.textContent = 'Failed to load appointments.';
                noPublicAppointmentsMessage.style.display = 'block';
            }
        }
    }

    function displayPublicAppointments(appointments) {
        if (!publicAppointmentsTableBody) return;
        publicAppointmentsTableBody.innerHTML = '';

        const now = new Date();
        const upcomingAppointments = (appointments || []).filter(a => {
            const dt = new Date(`${a.date}T${a.time}`);
            return dt > now;
        });

        upcomingAppointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        if (upcomingAppointments.length === 0) {
            if (noPublicAppointmentsMessage) {
                noPublicAppointmentsMessage.textContent = 'No upcoming appointments.';
                noPublicAppointmentsMessage.style.display = 'block';
            }
            return;
        }
        if (noPublicAppointmentsMessage) noPublicAppointmentsMessage.style.display = 'none';

        upcomingAppointments.forEach(appointment => {
            const row = publicAppointmentsTableBody.insertRow();
            row.innerHTML = `
                <td>${appointment.clientName}</td>
                <td>${appointment.service}</td>
                <td>${new Date(appointment.date).toLocaleDateString('en-NZ')}</td>
                <td>${appointment.time}</td>
                <td>${appointment.notes ? appointment.notes.substring(0, 50) + (appointment.notes.length > 50 ? '...' : '') : 'N/A'}</td>
            `;
        });
    }

    // --- Public Job Application Modal & Submit ---
    const applyJobsBtn = document.getElementById('apply-jobs-btn');
    const jobApplicationModal = document.getElementById('job-application-modal');
    const jobApplicationForm = document.getElementById('job-application-form');
    const applicationMessage = document.getElementById('application-message');

    if (applyJobsBtn && jobApplicationModal && jobApplicationForm) {
        applyJobsBtn.addEventListener('click', () => {
            jobApplicationModal.style.display = 'block';
            applicationMessage.textContent = '';
            jobApplicationForm.reset();
        });

        jobApplicationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('applicantName').value,
                experienceYears: parseInt(document.getElementById('applicantExperience').value, 10),
                address: document.getElementById('applicantAddress').value,
                phone: document.getElementById('applicantPhone').value,
                email: document.getElementById('applicantEmail').value,
                motivation: document.getElementById('applicantMotivation').value
            };

            try {
                const response = await fetch('/api/applications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (response.ok) {
                    if (applicationMessage) {
                        applicationMessage.className = 'success-message';
                        applicationMessage.textContent = 'Application submitted successfully!';
                    }
                    jobApplicationForm.reset();
                    setTimeout(() => { if (jobApplicationModal) jobApplicationModal.style.display = 'none'; }, 1500);
                } else {
                    if (applicationMessage) {
                        applicationMessage.className = 'error-message';
                        applicationMessage.textContent = result.message || 'Failed to submit application.';
                    }
                }
            } catch (error) {
                console.error('Error submitting job application:', error);
                if (applicationMessage) {
                    applicationMessage.className = 'error-message';
                    applicationMessage.textContent = 'An error occurred. Please try again.';
                }
            }
        });
    }

    // --- Star Rating (Public) ---
    const starRatingContainer = document.querySelector('.star-rating');
    const reviewThankYouModal = document.getElementById('review-thank-you-modal');

    if (starRatingContainer) {
        starRatingContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('star')) {
                const rating = e.target.dataset.value;
                document.querySelectorAll('.star').forEach(star => {
                    if (parseInt(star.dataset.value, 10) <= parseInt(rating, 10)) {
                        star.classList.add('selected');
                    } else {
                        star.classList.remove('selected');
                    }
                });

                try {
                    const response = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rating: parseInt(rating, 10) })
                    });

                    if (response.ok) {
                        if (reviewThankYouModal) reviewThankYouModal.style.display = 'block';
                        setTimeout(() => {
                            document.querySelectorAll('.star').forEach(star => star.classList.remove('selected'));
                        }, 3000);
                    } else {
                        const result = await response.json().catch(() => ({}));
                        alert(result.message || 'Failed to submit review.');
                    }
                } catch (error) {
                    console.error('Error submitting review:', error);
                    alert('An error occurred while submitting your review.');
                }
            }
        });
    }

    // --- Complaint/Report Form (Public) ---
    const complaintReportForm = document.getElementById('complaint-report-form');
    const formMessage = document.getElementById('form-message');

    if (complaintReportForm) {
        complaintReportForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                senderName: document.getElementById('senderName').value,
                senderEmail: document.getElementById('senderEmail').value,
                senderPhone: document.getElementById('senderPhone').value,
                message: document.getElementById('message').value,
                type: document.getElementById('messageType').value
            };

            try {
                const response = await fetch('/api/complaints', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (response.ok) {
                    if (formMessage) {
                        formMessage.className = 'success-message';
                        formMessage.textContent = 'Message sent successfully!';
                    }
                    complaintReportForm.reset();
                    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') fetchComplaints();
                } else {
                    if (formMessage) {
                        formMessage.className = 'error-message';
                        formMessage.textContent = result.message || 'Failed to send message.';
                    }
                }
            } catch (error) {
                console.error('Error sending message:', error);
                if (formMessage) {
                    formMessage.className = 'error-message';
                    formMessage.textContent = 'An error occurred. Please try again.';
                }
            }
        });
    }

    // --- User Appointment Form (Public Users) ---
    const userAppointmentForm = document.getElementById('user-appointment-form');
    const userAppointmentMessage = document.getElementById('user-appointment-message');

    if (userAppointmentForm) {
        userAppointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                clientName: document.getElementById('userClientName').value,
                contactNumber: document.getElementById('userContactNumber').value,
                service: document.getElementById('userService').value,
                date: document.getElementById('userAppointmentDate').value,
                time: document.getElementById('userAppointmentTime').value,
                notes: document.getElementById('userNotes').value
            };

            try {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (response.ok) {
                    if (userAppointmentMessage) {
                        userAppointmentMessage.className = 'success-message';
                        userAppointmentMessage.textContent = 'Appointment booked successfully!';
                    }
                    userAppointmentForm.reset();
                    fetchPublicAppointments(); // refresh public list
                } else {
                    if (userAppointmentMessage) {
                        userAppointmentMessage.className = 'error-message';
                        userAppointmentMessage.textContent = result.message || 'Failed to book appointment.';
                    }
                }
            } catch (error) {
                console.error('Error booking appointment:', error);
                if (userAppointmentMessage) {
                    userAppointmentMessage.className = 'error-message';
                    userAppointmentMessage.textContent = 'An error occurred. Please try again.';
                }
            }
        });
    }

    // --- Initial Calls ---
    checkAdminStatus();
    fetchPublicAppointments();
    // fetchBookings() is called after admin login or when admin clicks view bookings
});
