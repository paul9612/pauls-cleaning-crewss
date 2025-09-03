document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle (Dark/Light Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeButtons = document.querySelectorAll('.close-button');

    // Function to apply theme
    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.checked = false;
        }
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    } else {
        applyTheme(false); // Default to light if no preference or 'light'
    }

    // Event listener for theme toggle in settings modal
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

    // Open settings modal
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
            // Ensure the toggle reflects current theme when modal opens
            applyTheme(document.body.classList.contains('dark-mode'));
        });
    }

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // --- Admin Login Logic ---
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const adminLoginSection = document.getElementById('admin-login');
    const adminDashboardSection = document.getElementById('admin-dashboard');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    // Check if admin is already "logged in" (based on session storage for this demo)
    function checkAdminStatus() {
        const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
        if (isAdminLoggedIn === 'true') {
            if (adminLoginSection) adminLoginSection.style.display = 'none';
            if (adminDashboardSection) adminDashboardSection.style.display = 'block';
            if (adminLogoutBtn) adminLogoutBtn.style.display = 'inline-block';
            // Only show default section and fetch admin data if on the admin page
            if (window.location.pathname.includes('/admin')) {
                showSection('view-appointments-section'); // Default to view appointments
                fetchAppointments(); // Load appointments on dashboard entry
                fetchComplaints(); // Load complaints on dashboard entry
                fetchJobApplications(); // Load job applications on dashboard entry
                fetchClients(); // NEW: Load clients on dashboard entry
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
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    loginMessage.className = 'success-message';
                    loginMessage.textContent = 'Login successful! Redirecting to dashboard...';
                    sessionStorage.setItem('isAdminLoggedIn', 'true'); // Store login status
                    setTimeout(() => {
                        checkAdminStatus();
                    }, 1000);
                } else {
                    loginMessage.className = 'error-message';
                    loginMessage.textContent = result.message || 'Login failed.';
                }
            } catch (error) {
                console.error('Login error:', error);
                loginMessage.className = 'error-message';
                loginMessage.textContent = 'An error occurred during login. Please try again.';
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


    const addClientSection = document.getElementById('add-client-section');
    const viewClientsSection = document.getElementById('view-clients-section');
    const createAppointmentSection = document.getElementById('create-appointment-section');
    const viewAppointmentsSection = document.getElementById('view-appointments-section');
    const viewComplaintsSection = document.getElementById('view-complaints-section');
    const viewApplicationsSection = document.getElementById('view-applications-section');


    function hideAllSections() {
        if (addClientSection) addClientSection.style.display = 'none';
        if (viewClientsSection) viewClientsSection.style.display = 'none';
        if (createAppointmentSection) createAppointmentSection.style.display = 'none';
        if (viewAppointmentsSection) viewAppointmentsSection.style.display = 'none';
        if (viewComplaintsSection) viewComplaintsSection.style.display = 'none';
        if (viewApplicationsSection) viewApplicationsSection.style.display = 'none';
    }

    function showSection(sectionId) {
        hideAllSections();
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
    }

    if (addClientNavBtn) {
        addClientNavBtn.addEventListener('click', () => {
            showSection('add-client-section');
            document.getElementById('client-message').textContent = ''; // Clear message
        });
    }
    if (viewClientsNavBtn) {
        viewClientsNavBtn.addEventListener('click', () => {
            showSection('view-clients-section');
            fetchClients(); // Load clients when viewing
        });
    }
    if (createAppointmentBtn) {
        createAppointmentBtn.addEventListener('click', () => showSection('create-appointment-section'));
    }
    if (viewAppointmentsBtn) {
        viewAppointmentsBtn.addEventListener('click', () => {
            showSection('view-appointments-section');
            fetchAppointments(); // Refresh appointments when viewing
        });
    }
    if (viewComplaintsBtn) {
        viewComplaintsBtn.addEventListener('click', () => {
            showSection('view-complaints-section');
            fetchComplaints(); // Refresh complaints when viewing
        });
    }
    if (viewApplicationsNavBtn) {
        viewApplicationsNavBtn.addEventListener('click', () => {
            showSection('view-applications-section');
            fetchJobApplications(); // Refresh job applications when viewing
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

    // --- Create Appointment Logic (Admin Only) ---
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
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    appointmentMessage.className = 'success-message';
                    appointmentMessage.textContent = 'Appointment created successfully!';
                    createAppointmentForm.reset();
                    fetchAppointments(); // Refresh appointments list in admin view
                    fetchPublicAppointments(); // NEW: Refresh public appointments list
                } else {
                    appointmentMessage.className = 'error-message';
                    appointmentMessage.textContent = result.message || 'Failed to create appointment.';
                }
            } catch (error) {
                console.error('Error creating appointment:', error);
                appointmentMessage.className = 'error-message';
                appointmentMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // --- Fetch and Display Appointments (Admin) ---
    const appointmentsTableBody = document.querySelector('#appointments-table tbody');
    const noAppointmentsMessage = document.getElementById('no-appointments-message');

    async function fetchAppointments() {
        if (!appointmentsTableBody) return; // Exit if table body doesn't exist (i.e., not on admin page)

        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const appointments = await response.json();
            displayAdminAppointments(appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentsTableBody.innerHTML = `<tr><td colspan="7" class="error-message">Failed to load appointments.</td></tr>`;
            if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'block';
        }
    }

    function displayAdminAppointments(appointments) {
        if (!appointmentsTableBody) return;

        appointmentsTableBody.innerHTML = ''; // Clear previous content
        if (appointments.length === 0) {
            if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'block';
            return;
        }
        if (noAppointmentsMessage) noAppointmentsMessage.style.display = 'none';

        // Sort appointments by date and then time
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
                <td><button class="delete-btn" data-id="${appointment._id}">Delete</button></td>
            `;
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteAppointment);
        });
    }

    async function deleteAppointment(event) {
        const appointmentId = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Appointment deleted successfully!');
                fetchAppointments(); // Refresh the list in admin view
                fetchPublicAppointments(); // NEW: Refresh public appointments list
            } else {
                const result = await response.json();
                alert(result.message || 'Failed to delete appointment.');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('An error occurred while deleting the appointment.');
        }
    }

    // --- Print Appointments Button Logic ---
    const printAppointmentsBtn = document.getElementById('print-appointments-btn');

    if (printAppointmentsBtn) {
        printAppointmentsBtn.addEventListener('click', () => {
            // Trigger the browser's print dialog
            window.print();
        });
    }

    // --- Fetch and Display Complaints/Reports (Admin) ---
    const complaintsTableBody = document.querySelector('#complaints-table tbody');
    const noComplaintsMessage = document.getElementById('no-complaints-message');

    async function fetchComplaints() {
        if (!complaintsTableBody) return; // Exit if table body doesn't exist

        try {
            const response = await fetch('/api/complaints');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const complaints = await response.json();
            displayAdminComplaints(complaints);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            complaintsTableBody.innerHTML = `<tr><td colspan="7" class="error-message">Failed to load reports/complaints.</td></tr>`; // Adjusted colspan
            if (noComplaintsMessage) noComplaintsMessage.style.display = 'block';
        }
    }

    function displayAdminComplaints(complaints) {
        if (!complaintsTableBody) return;

        complaintsTableBody.innerHTML = ''; // Clear previous content
        if (complaints.length === 0) {
            if (noComplaintsMessage) noComplaintsMessage.style.display = 'block';
            return;
        }
        if (noComplaintsMessage) noComplaintsMessage.style.display = 'none';

        complaints.forEach(complaint => {
            const row = complaintsTableBody.insertRow();
            row.innerHTML = `
                <td>${complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}</td>
                <td>${complaint.senderName}</td>
                <td>${complaint.senderEmail || 'N/A'}</td>
                <td>${complaint.senderPhone || 'N/A'}</td>
                <td>${complaint.message}</td>
                <td>${new Date(complaint.createdAt).toLocaleDateString('en-NZ')} ${new Date(complaint.createdAt).toLocaleTimeString('en-NZ')}</td>
                <td><button class="delete-btn" data-id="${complaint._id}">Delete</button></td>
            `;
        });

        // Add event listeners for delete buttons for complaints
        document.querySelectorAll('#complaints-table .delete-btn').forEach(button => {
            button.addEventListener('click', deleteComplaint);
        });
    }

    // Function to delete a complaint/report
    async function deleteComplaint(event) {
        const complaintId = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this report/complaint? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/complaints/${complaintId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Report/Complaint deleted successfully!');
                fetchComplaints(); // Refresh the list in admin view
            } else {
                const result = await response.json();
                alert(result.message || 'Failed to delete report/complaint.');
            }
        } catch (error) {
            console.error('Error deleting report/complaint:', error);
            alert('An error occurred while deleting the report/complaint.');
        }
    }

    // NEW ADDITION: Fetch and Display Job Applications (Admin)
    const applicationsTableBody = document.querySelector('#applications-table tbody');
    const noApplicationsMessage = document.getElementById('no-applications-message');

    async function fetchJobApplications() {
        if (!applicationsTableBody) return;

        applicationsTableBody.innerHTML = ''; // Clear previous content
        if (noApplicationsMessage) {
            noApplicationsMessage.style.display = 'none'; // Hide it initially
            noApplicationsMessage.className = ''; // Clear any previous error/success classes
            noApplicationsMessage.textContent = ''; // Clear text
        }

        try {
            const response = await fetch('/api/applications'); // New API endpoint
            if (!response.ok) {
                // Try to parse error message from server response
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const applications = await response.json();
            displayAdminApplications(applications);
        } catch (error) {
            console.error('Error fetching job applications:', error);
            if (noApplicationsMessage) {
                noApplicationsMessage.className = 'error-message'; // Apply error styling
                noApplicationsMessage.textContent = `Failed to load job applications: ${error.message}`;
                noApplicationsMessage.style.display = 'block';
            }
            // Ensure table body is empty if an error occurred
            applicationsTableBody.innerHTML = '';
        }
    }

    function displayAdminApplications(applications) {
        if (!applicationsTableBody) return;

        applicationsTableBody.innerHTML = ''; // Clear previous content
        if (noApplicationsMessage) {
            noApplicationsMessage.style.display = 'none'; // Hide if data is being displayed
            noApplicationsMessage.className = '';
            noApplicationsMessage.textContent = '';
        }

        if (applications.length === 0) {
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
                <td>${application.experienceYears}</td>
                <td>${application.address}</td>
                <td>${application.phone}</td>
                <td>${application.email}</td>
                <td>${application.motivation ? application.motivation.substring(0, 50) + '...' : 'N/A'}</td>
                <td>${new Date(application.createdAt).toLocaleDateString('en-NZ')} ${new Date(application.createdAt).toLocaleTimeString('en-NZ')}</td>
                <td><button class="delete-btn" data-id="${application._id}">Delete</button></td>
            `;
        });

        // Add event listeners for delete buttons for job applications
        document.querySelectorAll('#applications-table .delete-btn').forEach(button => {
            button.addEventListener('click', deleteJobApplication);
        });
    }

    // NEW ADDITION: Function to delete a job application
    async function deleteJobApplication(event) {
        const applicationId = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this job application? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/applications/${applicationId}`, { // New API endpoint
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Job application deleted successfully!');
                fetchJobApplications(); // Refresh the list in admin view
            } else {
                const result = await response.json();
                alert(result.message || 'Failed to delete job application.');
            }
        } catch (error) {
            console.error('Error deleting job application:', error);
            alert('An error occurred while deleting the job application.');
        }
    }

    // --- NEW: Public Appointments Logic ---
    const publicAppointmentsListDiv = document.getElementById('appointments-list');
    let publicAppointmentsTableBody; // Will be initialized after table creation
    let noPublicAppointmentsMessage; // Will be initialized after table creation

    async function fetchPublicAppointments() {
        if (!publicAppointmentsListDiv) return; // Exit if public appointments section doesn't exist

        // Create table structure if it doesn't exist
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

        publicAppointmentsTableBody.innerHTML = ''; // Clear previous content
        if (noPublicAppointmentsMessage) noPublicAppointmentsMessage.style.display = 'none'; // Hide message initially

        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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

        publicAppointmentsTableBody.innerHTML = ''; // Clear previous content

        // Filter for future appointments (optional, but "upcoming" implies this)
        const now = new Date();
        const upcomingAppointments = appointments.filter(appointment => {
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
            return appointmentDateTime > now;
        });

        // Sort upcoming appointments by date and then time
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

    // --- Public-facing elements (Job Application Modal, Review Section, Complaint/Report Form) ---
    const applyJobsBtn = document.getElementById('apply-jobs-btn');
    const jobApplicationModal = document.getElementById('job-application-modal');
    const jobApplicationForm = document.getElementById('job-application-form');
    const applicationMessage = document.getElementById('application-message');

    if (applyJobsBtn) {
        applyJobsBtn.addEventListener('click', () => {
            jobApplicationModal.style.display = 'block';
            applicationMessage.textContent = ''; // Clear previous messages
            jobApplicationForm.reset();
        });
    }

    if (jobApplicationForm) {
        jobApplicationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('applicantName').value,
                experienceYears: parseInt(document.getElementById('applicantExperience').value),
                address: document.getElementById('applicantAddress').value,
                phone: document.getElementById('applicantPhone').value,
                email: document.getElementById('applicantEmail').value,
                motivation: document.getElementById('applicantMotivation').value
            };

            try {
                const response = await fetch('/api/applications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    applicationMessage.className = 'success-message';
                    applicationMessage.textContent = 'Application submitted successfully!';
                    jobApplicationForm.reset();
                    // Optionally close modal after a delay
                    setTimeout(() => {
                        jobApplicationModal.style.display = 'none';
                    }, 2000);
                } else {
                    applicationMessage.className = 'error-message';
                    applicationMessage.textContent = result.message || 'Failed to submit application.';
                }
            } catch (error) {
                console.error('Error submitting job application:', error);
                applicationMessage.className = 'error-message';
                applicationMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // --- Star Rating Logic ---
    const starRatingContainer = document.querySelector('.star-rating');
    const reviewThankYouModal = document.getElementById('review-thank-you-modal');

    if (starRatingContainer) {
        starRatingContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('star')) {
                const rating = e.target.dataset.value;
                // Visually update stars
                document.querySelectorAll('.star').forEach(star => {
                    if (parseInt(star.dataset.value) <= rating) {
                        star.classList.add('selected');
                    } else {
                        star.classList.remove('selected');
                    }
                });

                try {
                    const response = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ rating: parseInt(rating) })
                    });

                    if (response.ok) {
                        // Show thank you modal
                        reviewThankYouModal.style.display = 'block';
                        // Optionally reset stars after a delay or after modal closes
                        setTimeout(() => {
                            document.querySelectorAll('.star').forEach(star => star.classList.remove('selected'));
                        }, 3000); // Reset after 3 seconds
                    } else {
                        const result = await response.json();
                        alert(result.message || 'Failed to submit review.');
                    }
                } catch (error) {
                    console.error('Error submitting review:', error);
                    alert('An error occurred while submitting your review.');
                }
            }
        });
    }

    // --- Complaint/Report Form Logic ---
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
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    formMessage.className = 'success-message';
                    formMessage.textContent = 'Message sent successfully!';
                    complaintReportForm.reset();
                    // Optionally refresh admin complaints list if admin is logged in and viewing
                    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
                        fetchComplaints();
                    }
                } else {
                    formMessage.className = 'error-message';
                    formMessage.textContent = result.message || 'Failed to send message.';
                }
            } catch (error) {
                console.error('Error sending message:', error);
                formMessage.className = 'error-message';
                formMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // Initial calls on page load
    checkAdminStatus(); // Existing admin check
    fetchPublicAppointments(); // NEW: Load public appointments on page load
});
