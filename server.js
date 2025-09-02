console.log("server.js has started")
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv')

// Load environment variables from .env
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json request bodies
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
  notes: { type: String }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const complaintReportSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String },
  senderPhone: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ['complaint', 'report'], required: true } // 'complaint' or 'report'
}, { timestamps: true });

// NEW ADDITION: Job Application Schema
const jobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  experienceYears: { type: Number, required: true, min: 0 },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  motivation: { type: String, required: true }
}, { timestamps: true });

// NEW ADDITION: Review Schema
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  // You might want to add a userId or IP address here to prevent multiple reviews from the same person
  // For this demo, we'll keep it simple.
}, { timestamps: true });

// NEW ADDITION: Comment Schema
const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  email: { type: String }, // Optional email
  text: { type: String, required: true }
}, { timestamps: true });


const Appointment = mongoose.model('Appointment', appointmentSchema);
const ComplaintReport = mongoose.model('ComplaintReport', complaintReportSchema);
// NEW ADDITION: Job Application Model
const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
// NEW ADDITION: Review Model
const Review = mongoose.model('Review', reviewSchema);
// NEW ADDITION: Comment Model
const Comment = mongoose.model('Comment', commentSchema);


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
// In a real application, this would verify a session token or JWT.
const isAdminAuthenticated = (req, res, next) => {
    // For this demo, we rely on the client-side admin.js to only send requests
    // if the user has successfully "logged in". A real app needs server-side session/token validation.
    next();
};

// Create Appointment (Admin only)
app.post('/api/appointments', isAdminAuthenticated, async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
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
app.post('/api/applications', async (req, res) => {
  try {
    const newApplication = new JobApplication(req.body);
    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
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

// NEW ADDITION: Get All Reviews (Admin only - or for calculating average)
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
app.get('/*admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});