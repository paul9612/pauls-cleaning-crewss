document.addEventListener('DOMContentLoaded', () => {
    // --- Helper utilities ---
    // Safely parse a fetch Response: returns parsed JSON if possible, otherwise returns { text }
    async function parseResponseSafely(response) {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch (err) {
            // Return raw text if it's not JSON
            return { text };
        }
    }

    // Helper to display messages associated with forms. If no message element provided, fallback to alert.
    function showFormMessage(elem, message, type = 'info') {
        if (elem) {
            elem.className = type === 'success' || type === 'success-message' ? 'success-message' :
                             type === 'error' || type === 'error-message' ? 'error-message' :
                             'info-message';
            elem.textContent = message;
        } else {
            alert(message);
        }
    }

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
            if (applicationMessage) applicationMessage.textContent = ''; // Clear previous messages
            if (jobApplicationForm) jobApplicationForm.reset(); // Clear form fields
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

    // --- Booking Form Submission Logic (UPDATED & INTEGRATED) ---
    // Expects form with id="formBooking". Optional message element with id="booking-message".
    const formBooking = document.getElementById('formBooking');
    const bookingMessage = document.getElementById('booking-message');

    if (formBooking) {
        formBooking.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = formBooking.querySelector('button[type="submit"]');

            // Read fields; allow optional time field if present
            const booking = {
                name: (document.getElementById('name')?.value || '').trim(),
                address: (document.getElementById('address')?.value || '').trim(),
                phone: (document.getElementById('phone')?.value || '').trim(),
                cleaningType: (document.getElementById('cleaningType')?.value || '').trim(),
                notes: (document.getElementById('notes')?.value || '').trim(),
                date: (document.getElementById('date')?.value || '').trim(),
                time: (document.getElementById('time')?.value || '').trim() // optional
            };

            // Basic validation
            if (!booking.name || !booking.phone || !booking.cleaningType || !booking.date) {
                showFormMessage(bookingMessage, 'Please fill in the required fields: name, phone, service type and date.', 'error');
                return;
            }

            // Optionally disable submit button while sending
            if (submitBtn) submitBtn.setAttribute('disabled', 'disabled');

            try {
                const res = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(booking)
                });

                const data = await parseResponseSafely(res);

                if (res.ok) {
                    showFormMessage(bookingMessage, (data && (data.message || data.text)) ? (data.message || data.text) : 'Booking submitted successfully!', 'success');
                    formBooking.reset();
                } else {
                    // If backend returned structured message, show it, otherwise fallback to status
                    const errMsg = data && (data.message || data.text) ? (data.message || data.text) : `Failed to submit booking. (${res.status})`;
                    showFormMessage(bookingMessage, errMsg, 'error');
                }
            } catch (err) {
                console.error('Error submitting booking:', err);
                showFormMessage(bookingMessage, 'There was a problem submitting your booking. Please try again.', 'error');
            } finally {
                if (submitBtn) submitBtn.removeAttribute('disabled');
            }
        });
    }

    // --- Public Appointments Display (UPDATED TO TABLE RENDERING) ---
    const appointmentsListContainer = document.getElementById('appointments-list');

    async function fetchPublicAppointments() {
        if (!appointmentsListContainer) return;

        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Use safe parser so non-JSON responses won't break us
            const data = await parseResponseSafely(response);
            // ✅ ADDED: Log the appointments from the API to see their structure
            console.log("Appointments from API:", data);

            // Build table instead of grid/cards
            if (!Array.isArray(data) || data.length === 0) {
                appointmentsListContainer.innerHTML = '<p>No upcoming appointments scheduled at the moment. Check back soon!</p>';
                return;
            }

            let tableHTML = `
  <table id="appointments-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Service</th>
        <th>Client</th>
      </tr>
    </thead>
    <tbody>
`;

            tableHTML += data.map(a => `
              <tr>
                <td>${a.date || 'No date'}</td>
                <td>${a.time || '-'}</td>
                <td>${a.service || a.cleaningType || 'Unknown service'}</td>
                <td>${a.clientName || a.name || 'N/A'}</td>
              </tr>
            `).join('');

            tableHTML += `</tbody></table>`;
            appointmentsListContainer.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error fetching public appointments:', error);
            appointmentsListContainer.innerHTML = '<p class="error-message">Failed to load appointments. Please try again later.</p>';
        }
    }

    // --- Star Review System Logic ---
    const starRatingContainer = document.querySelector('.star-rating');
    const stars = document.querySelectorAll('.star-rating .star');
    let currentRating = parseInt(starRatingContainer?.dataset?.rating || '0');
    const averageRatingDisplay = document.getElementById('average-rating-display');

    function highlightStars(rating) {
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    // NEW: Function to fetch and display average rating
    async function fetchAverageRating() {
        if (!averageRatingDisplay) return;

        try {
            const response = await fetch('/api/reviews/average');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.totalRatings > 0) {
                const avg = parseFloat(data.averageRating) || 0;
                const total = data.totalRatings || 0;

                averageRatingDisplay.textContent = `${avg.toFixed(1)} out of 5 ratings (${total} total)`;

                // Update star highlight based on average rating
                currentRating = Math.round(avg);
                highlightStars(currentRating);
            } else {
                averageRatingDisplay.textContent = 'No ratings yet. Be the first!';
                highlightStars(0);
            }
        } catch (error) {
            console.error('Error fetching average rating:', error);
            averageRatingDisplay.textContent = 'Could not load ratings.';
            highlightStars(0);
        }
    }

    // Event listeners for stars
    stars.forEach(star => {
        star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.value)));
        star.addEventListener('mouseout', () => highlightStars(currentRating));
        star.addEventListener('click', async () => {
            currentRating = parseInt(star.dataset.value);
            starRatingContainer.dataset.rating = currentRating;
            highlightStars(currentRating);

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating: currentRating })
                });

                if (response.ok) {
                    console.log('Review submitted:', currentRating);
                    fetchAverageRating(); // refresh average immediately
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

    // Initialize stars and average rating
    highlightStars(currentRating);
    fetchAverageRating();
    setInterval(fetchAverageRating, 10000); // auto-refresh every 10s

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

    // Job Application Form Submission Logic (FIXED: send keys matching backend schema)
    if (jobApplicationForm) {
        jobApplicationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = jobApplicationForm.querySelector('button[type="submit"]');

            // Map frontend inputs to backend schema keys:
            const fullName = (document.getElementById('applicantName')?.value || '').trim();
            const yearsOfExperienceRaw = (document.getElementById('applicantExperience')?.value || '').trim();
            const yearsOfExperience = yearsOfExperienceRaw === '' ? NaN : parseInt(yearsOfExperienceRaw, 10);
            const address = (document.getElementById('applicantAddress')?.value || '').trim();
            const phoneNumber = (document.getElementById('applicantPhone')?.value || '').trim();
            const email = (document.getElementById('applicantEmail')?.value || '').trim();
            const whyJoin = (document.getElementById('applicantMotivation')?.value || '').trim();

            // Basic validation: require fullName, yearsOfExperience (numeric), and email
            if (!fullName || isNaN(yearsOfExperience) || !email) {
                showFormMessage(applicationMessage, 'Please provide your full name, years of experience (number) and email.', 'error');
                return;
            }

            // FIXED: send keys that match the backend schema (name, experienceYears, phone, motivation)
            const formData = {
                name: fullName,
                experienceYears: yearsOfExperience,
                address: address,
                phone: phoneNumber,
                email: email,
                motivation: whyJoin
            };

            // Disable submit button while sending
            if (submitBtn) submitBtn.setAttribute('disabled', 'disabled');

            try {
                const response = await fetch('/api/applications', { // API endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await parseResponseSafely(response);

                if (response.ok) {
                    showFormMessage(applicationMessage, 'Application submitted successfully! We will review it and get back to you.', 'success');
                    jobApplicationForm.reset();
                    // Optionally close the modal:
                    // if (jobApplicationModal) jobApplicationModal.style.display = 'none';
                } else {
                    const errMsg = result && (result.message || result.text) ? (result.message || result.text) : `Failed to submit application. (${response.status})`;
                    showFormMessage(applicationMessage, errMsg, 'error');
                }
            } catch (error) {
                console.error('Error submitting job application:', error);
                showFormMessage(applicationMessage, 'An error occurred. Please try again.', 'error');
            } finally {
                if (submitBtn) submitBtn.removeAttribute('disabled');
            }
        });
    }

    // Initial calls on page load
    fetchPublicAppointments();
    fetchAverageRating(); // NEW: Fetch average rating on page load
});
