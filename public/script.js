document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle (Dark/Light Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeButtons = document.querySelectorAll('.close-button'); // Selects all close buttons

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

    // Job Application Modal Elements
    const applyJobsBtn = document.getElementById('apply-jobs-btn');
    const jobApplicationModal = document.getElementById('job-application-modal');
    const jobApplicationForm = document.getElementById('job-application-form');
    const applicationMessage = document.getElementById('application-message');

    // Review Thank You Modal
    const reviewThankYouModal = document.getElementById('review-thank-you-modal');

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
        if (event.target === jobApplicationModal) {
            jobApplicationModal.style.display = 'none';
        }
        // Close Review Thank You Modal if clicked outside
        if (event.target === reviewThankYouModal) {
            reviewThankYouModal.style.display = 'none';
        }
    });

    // Open Job Application Modal
    if (applyJobsBtn) {
        applyJobsBtn.addEventListener('click', () => {
            jobApplicationModal.style.display = 'block';
            applicationMessage.textContent = ''; // Clear previous messages
            jobApplicationForm.reset(); // Clear form fields
        });
    }

    // --- Service Modals ---
    const serviceModal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const learnMoreBtns = document.querySelectorAll('.learn-more-btn');

    const serviceDetails = {
        residential: {
            title: "Residential Cleaning",
            description: "Our residential cleaning service covers everything from dusting and vacuuming to kitchen and bathroom sanitization. We offer flexible scheduling options (weekly, bi-weekly, monthly) to fit your lifestyle. Our team uses high-quality, eco-friendly products to ensure a safe and sparkling clean home for you and your family."
        },
        commercial: {
            title: "Commercial Cleaning",
            description: "Maintain a professional and hygienic workspace with our commercial cleaning services. We cater to offices, retail spaces, and other businesses, providing services like floor care, waste removal, restroom cleaning, and common area maintenance. A clean environment boosts productivity and leaves a great impression on clients."
        },
        deep: {
            title: "Deep Cleaning",
            description: "When your space needs an intensive refresh, our deep cleaning service is the answer. This comprehensive clean goes beyond the surface, tackling grime, dirt, and dust in hard-to-reach areas. It includes detailed cleaning of appliances, scrubbing grout, extensive dusting, and thorough sanitization, leaving your property immaculately clean."
        },
        move: {
            title: "Move-in/Move-out Cleaning",
            description: "Simplify your moving process with our specialized move-in/move-out cleaning. For tenants, this service helps ensure you get your full deposit back. For landlords or new homeowners, we prepare the property for its next occupants, ensuring it's spotless and welcoming. We cover all aspects, from deep cleaning kitchens and bathrooms to wiping down all surfaces and cleaning inside cabinets."
        },
        pressure: {
            title: "Pressure Pipe Cleaning",
            description: "Our pressure pipe cleaning service uses high-pressure water jets to effectively clear stubborn blockages and buildup in your drainage systems. This method is highly efficient for removing grease, debris, and roots, restoring optimal flow and preventing future issues. It's a non-invasive solution that protects your pipes while ensuring long-term efficiency."
        }
    };

    learnMoreBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const serviceType = event.target.dataset.service;
            const details = serviceDetails[serviceType];
            if (details) {
                modalTitle.textContent = details.title;
                modalDescription.textContent = details.description;
                serviceModal.style.display = 'block';
            }
        });
    });

    // --- Public Appointments Display (UPDATED TO TABLE) ---
    const appointmentsListContainer = document.getElementById('appointments-list');

    async function fetchPublicAppointments() {
        if (!appointmentsListContainer) return;

        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const appointments = await response.json();
            // ✅ ADDED: Log the appointments from the API to see their structure
            console.log("Appointments from API:", appointments);
            displayPublicAppointments(appointments);
        } catch (error) {
            console.error('Error fetching public appointments:', error);
            appointmentsListContainer.innerHTML = '<p class="error-message">Failed to load appointments. Please try again later.</p>';
        }
    }

    function displayPublicAppointments(appointments) {
        if (!appointmentsListContainer) return;

        appointmentsListContainer.innerHTML = ''; // Clear previous content

        const now = new Date();
        // Filter for appointments that are in the future.
        // ✅ FIX: Combine date and time from backend response
        const futureAppointments = appointments.filter(app => {
            // OLD ❌: const appDateTime = new Date(app.dateTime);
            const appDateTime = new Date(`${app.date}T${app.time}:00`); // NEW ✅
            return appDateTime > now;
        }).sort((a, b) => {
            // OLD ❌: const dateA = new Date(a.dateTime);
            // OLD ❌: const dateB = new Date(b.dateTime);
            const dateA = new Date(`${a.date}T${a.time}:00`); // NEW ✅
            const dateB = new Date(`${b.date}T${b.time}:00`); // NEW ✅
            return dateA - dateB;
        });

        if (futureAppointments.length === 0) {
            appointmentsListContainer.innerHTML = '<p>No upcoming appointments scheduled at the moment. Check back soon!</p>';
            return;
        }

        const table = document.createElement('table');
        table.id = 'appointments-table'; // Add ID for responsive styles

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Notes</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        futureAppointments.forEach(appointment => {
            const row = tbody.insertRow();

            // ✅ FIX: Combine date and time from backend response
            // OLD ❌: const dateTimeObj = new Date(appointment.dateTime);
            const dateTimeObj = new Date(`${appointment.date}T${appointment.time}:00`); // NEW ✅
            const displayDate = dateTimeObj.toLocaleDateString('en-NZ', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
            });
            const displayTime = dateTimeObj.toLocaleTimeString('en-NZ', {
                hour: '2-digit', minute: '2-digit'
            });

            row.insertCell().textContent = appointment.service;
            row.insertCell().textContent = displayDate;
            row.insertCell().textContent = displayTime;
            row.insertCell().textContent = appointment.notes || 'N/A';
        });
        table.appendChild(tbody);
        appointmentsListContainer.appendChild(table);
    }

    // --- Star Review System Logic ---
    const starRatingContainer = document.querySelector('.star-rating');
    const stars = document.querySelectorAll('.star-rating .star');
    let currentRating = parseInt(starRatingContainer.dataset.rating);

    function highlightStars(rating) {
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            highlightStars(parseInt(star.dataset.value));
        });

        star.addEventListener('mouseout', () => {
            highlightStars(currentRating); // Revert to current rating
        });

        star.addEventListener('click', async () => {
            currentRating = parseInt(star.dataset.value);
            starRatingContainer.dataset.rating = currentRating;
            highlightStars(currentRating);

            // Send rating to backend
            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating: currentRating })
                });

                if (response.ok) {
                    console.log('Review submitted successfully:', currentRating);
                    reviewThankYouModal.style.display = 'block'; // Show thank you modal
                } else {
                    const errorData = await response.json();
                    console.error('Failed to submit review:', errorData.message);
                    alert('Failed to submit review. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                alert('An error occurred while submitting your review.');
            }
        });
    });

    // Initialize stars based on currentRating (if any, though for public it starts at 0)
    highlightStars(currentRating);

    // --- Contact Form (Complaint/Report) Logic ---
    const complaintReportForm = document.getElementById('complaint-report-form');
    const formMessage = document.getElementById('form-message');

    if (complaintReportForm) {
        complaintReportForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                senderName: document.getElementById('senderName').value,
                senderEmail: document.getElementById('senderEmail').value,
                senderPhone: document.getElementById('senderPhone').value,
                type: document.getElementById('messageType').value,
                message: document.getElementById('message').value
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
                    formMessage.textContent = 'Message sent successfully! We will get back to you soon.';
                    complaintReportForm.reset();
                } else {
                    formMessage.className = 'error-message';
                    formMessage.textContent = result.message || 'Failed to send message. Please try again.';
                }
            } catch (error) {
                console.error('Error sending message:', error);
                formMessage.className = 'error-message';
                formMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // Job Application Form Submission Logic
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
                const response = await fetch('/api/applications', { // New API endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    applicationMessage.className = 'success-message';
                    applicationMessage.textContent = 'Application submitted successfully! We will review it and get back to you.';
                    jobApplicationForm.reset();
                } else {
                    applicationMessage.className = 'error-message';
                    applicationMessage.textContent = result.message || 'Failed to submit application. Please try again.';
                }
            } catch (error) {
                console.error('Error submitting job application:', error);
                applicationMessage.className = 'error-message';
                applicationMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // Initial calls on page load
    fetchPublicAppointments();
    // Removed: fetchComments();
});