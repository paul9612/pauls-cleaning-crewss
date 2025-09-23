console.log("server.js has started")
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json request bodies
app.use(express.urlencoded({ extended: true })); // For parsing form submissions (x-www-form-urlencoded)
app.use(cors()); // Enable CORS for development (remove/lock down in production)
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose Schemas
const appointmentSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true }, // Storing as string for simplicity with HTML date input
  time: { type: String, required: true }, // Storing as string for simplicity with HTML time input
  notes: { type: String },
  dateTime: { type: Date, required: true }  // ✅ combined for sorting/filtering
}, { timestamps: true });

const complaintReportSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String },
  senderPhone: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ['complaint', 'report'], required: true } // 'complaint' or 'report'
}, { timestamps: true });

// FIXED: Job Application Schema uses "experience" to match frontend payload.
// We store experience as Number (Mongoose will cast string numbers like "4" to Number).
const jobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  experience: { type: Number, required: true, min: 0 }, // expects numeric years
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  motivation: { type: String, required: true }
}, { timestamps: true });

// NEW ADDITION: Review Schema
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

// NEW ADDITION: Comment Schema
const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  email: { type: String }, // Optional email
  text: { type: String, required: true }
}, { timestamps: true });

// NEW ADDITION: Client Schema (for admin client management)
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Email should be unique for clients
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

// ✅ NEW ADDITION: Booking Schema
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  cleaningType: { type: String, required: true },
  notes: { type: String },
  date: { type: String } // keep date field for bookings
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
const ComplaintReport = mongoose.model('ComplaintReport', complaintReportSchema);
const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
const Review = mongoose.model('Review', reviewSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Client = mongoose.model('Client', clientSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Admin Credentials (FOR DEMONSTRATION PURPOSES ONLY - In a real app, use hashed passwords and JWTs/sessions)
const ADMIN_USERNAME = 'AdminPauls';
const ADMIN_PASSWORD = 'Adminpaul7685';

// API Routes

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Middleware to simulate admin authentication (for this demo, it just passes through)
const isAdminAuthenticated = (req, res, next) => {
    // For this demo, we rely on the client-side admin.js to only send requests
    // if the user has successfully "logged in". A real app needs server-side session/token validation.
    next();
};

// --- Client Management API Endpoints (NEW) ---
// Create Client (Admin only)
app.post('/api/clients', isAdminAuthenticated, async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    // Handle duplicate email error specifically
    if (error.code === 11000) { // MongoDB duplicate key error code
      return res.status(409).json({ message: 'Client with this email already exists.', error: error.message });
    }
    res.status(400).json({ message: 'Error creating client', error: error.message });
  }
});

// Get All Clients (Admin only)
app.get('/api/clients', isAdminAuthenticated, async (req, res) => {
  try {
    const clients = await Client.find().sort({ name: 1 }); // Sort by name
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
});

// Delete Client (Admin only)
app.delete('/api/clients/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Client.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error: error.message });
  }
});

// ✅ NEW ADDITION: Booking Routes
// Create Booking (Public)
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, address, phone, cleaningType, notes, date } = req.body;

    if (!name || !address || !phone || !cleaningType || !date) {
      return res.status(400).json({ message: 'Name, address, phone, cleaning type, and date are required.' });
    }

    const newBooking = new Booking({ name, address, phone, cleaningType, notes, date });
    await newBooking.save();

    res.status(201).json({ message: 'Booking successful!', booking: newBooking });
  } catch (error) {
    res.status(400).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get All Bookings (Admin only)
app.get('/api/bookings', isAdminAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Delete Booking (Admin only) - validate id format and check existence
app.delete('/api/bookings/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const result = await Booking.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

// Create Appointment (Admin only)
app.post('/api/appointments', isAdminAuthenticated, async (req, res) => {
  try {
    const { clientName, contactNumber, service, date, time, notes } = req.body;

    // Build a proper combined Date object
    const dateTime = new Date(`${date}T${time}:00`);

    const newAppointment = new Appointment({
      clientName,
      contactNumber,
      service,
      date,
      time,
      notes,
      dateTime   // ✅ ensure this gets stored
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error: error.message });
  }
});


// Get All Appointments (Public and Admin)
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 }); // Sort by date and time
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Delete Appointment (Admin only)
app.delete('/api/appointments/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Appointment.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
});

// Submit Complaint/Report (Public)
app.post('/api/complaints', async (req, res) => {
  try {
    const newComplaintReport = new ComplaintReport(req.body);
    await newComplaintReport.save();
    res.status(201).json(newComplaintReport);
  } catch (error) {
    res.status(400).json({ message: 'Error submitting complaint/report', error: error.message });
  }
});

// NEW ROUTE: Submit via /api/messages (Public)
app.post('/api/messages', async (req, res) => {
  try {
    // Accept either name/email/phone or senderName/senderEmail/senderPhone
    const {
      name,
      senderName: senderNameFromBody,
      email,
      senderEmail,
      phone,
      senderPhone,
      type,
      message
    } = req.body;

    // Basic validation: require type and message
    if (!type || !message) {
      return res.status(400).json({ message: 'Type and message are required.' });
    }

    // Map to schema fields. If no sender name provided, default to 'Anonymous' to satisfy schema required field.
    const finalSenderName = name || senderNameFromBody || 'Anonymous';
    const finalSenderEmail = email || senderEmail;
    const finalSenderPhone = phone || senderPhone;

    const newMessage = new ComplaintReport({
      senderName: finalSenderName,
      senderEmail: finalSenderEmail,
      senderPhone: finalSenderPhone,
      message,
      type
    });

    await newMessage.save();

    console.log('📩 New message received via /api/messages:', {
      senderName: finalSenderName,
      senderEmail: finalSenderEmail,
      senderPhone: finalSenderPhone,
      type,
      message
    });

    res.status(201).json({ message: 'Message received successfully!', data: newMessage });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting message', error: error.message });
  }
});

// Get All Complaints/Reports (Admin only)
app.get('/api/complaints', isAdminAuthenticated, async (req, res) => {
  try {
    const complaints = await ComplaintReport.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints/reports', error: error.message });
  }
});

// Delete Complaint/Report (Admin only)
app.delete('/api/complaints/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ComplaintReport.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Report/Complaint not found' });
    }
    res.json({ message: 'Report/Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report/complaint', error: error.message });
  }
});

// NEW ADDITION: Submit Job Application (Public)
// This route now validates the payload and maps either "experience" or "experienceYears".
app.post('/api/applications', async (req, res) => {
  try {
    // Accept either "experience" or legacy "experienceYears"
    const { name, experience, experienceYears, address, phone, email, motivation } = req.body;

    const expRaw = experience !== undefined ? experience : experienceYears;

    // Basic validation
    if (!name || expRaw === undefined || !address || !phone || !email || !motivation) {
      return res.status(400).json({ message: 'All fields are required: name, experience, address, phone, email, motivation' });
    }

    const expNumber = Number(expRaw);
    if (isNaN(expNumber) || expNumber < 0) {
      return res.status(400).json({ message: 'Experience must be a non-negative number' });
    }

    const newApplication = new JobApplication({
      name,
      experience: expNumber,
      address,
      phone,
      email,
      motivation
    });

    await newApplication.save();

    console.log('✅ New Job Application:', {
      name,
      experience: expNumber,
      address,
      phone,
      email,
      motivation
    });

    res.status(201).json({ message: 'Application received successfully', application: newApplication });
  } catch (error) {
    console.error('❌ Error submitting job application:', error);
    res.status(400).json({ message: 'Error submitting job application', error: error.message });
  }
});

// NEW ADDITION: Get All Job Applications (Admin only)
app.get('/api/applications', isAdminAuthenticated, async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job applications', error: error.message });
  }
});

// NEW ADDITION: Delete Job Application (Admin only)
app.delete('/api/applications/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await JobApplication.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job application', error: error.message });
  }
});

// NEW ADDITION: Submit Review (Public)
app.post('/api/reviews', async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    const newReview = new Review({ rating });
    await newReview.save();
    res.status(201).json({ message: 'Review submitted successfully!', review: newReview });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting review', error: error.message });
  }
});

// NEW ADDITION: Get Average Rating and Count (Public)
app.get('/api/reviews/average', async (req, res) => {
  try {
    const reviews = await Review.find({});
    if (reviews.length === 0) {
      return res.json({ averageRating: 0, totalRatings: 0 });
    }

    const totalRatingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRatingSum / reviews.length).toFixed(1); // One decimal place
    const totalRatings = reviews.length;

    res.json({ averageRating: parseFloat(averageRating), totalRatings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching average rating', error: error.message });
  }
});

// Keep the isAdminAuthenticated for the full list of reviews for admin panel
app.get('/api/reviews', isAdminAuthenticated, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// NEW ADDITION: Submit Comment (Public)
app.post('/api/comments', async (req, res) => {
  try {
    const { author, email, text } = req.body;
    if (!author || !text) {
      return res.status(400).json({ message: 'Author and comment text are required.' });
    }
    const newComment = new Comment({ author, email, text });
    await newComment.save();
    res.status(201).json({ message: 'Comment submitted successfully!', comment: newComment });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting comment', error: error.message });
  }
});

// NEW ADDITION: Get All Comments (Public)
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 }); // Newest comments first
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// NEW ADDITION: Delete Comment (Admin only)
app.delete('/api/comments/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Comment.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// Serve admin.html for the /admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
