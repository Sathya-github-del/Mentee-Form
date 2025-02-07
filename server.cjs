const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Mentee, Mentor, Application, Admin } = require('./db.cjs'); // Add Admin to imports
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
  origin: [
    'https://mentee-form-six.vercel.app/' // Replace with your Vercel domain
  ],
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = 'jnof238u982huibsdjbf23'; // In production, use environment variable

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Add admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || user.type !== 'admin') return res.status(403).json({ error: 'Invalid admin token' });
    req.user = user;
    next();
  });
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mentee routes
app.post('/api/mentee/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const mentee = new Mentee({ username, email, password: hashedPassword });
    await mentee.save();
    res.status(201).json({ message: 'Mentee registered successfully' });
  } catch (error) {
    console.error('Error registering mentee:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Modify the mentee login route to include email in token
app.post('/api/mentee/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const mentee = await Mentee.findOne({ email });
    if (!mentee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, mentee.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: mentee._id,
        type: 'mentee',
        email: mentee.email  // Include email in token
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, userType: 'mentee' });
  } catch (error) {
    console.error('Error logging in mentee:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Modify application submission to include menteeId and email
app.post('/api/mentee/application', authenticateToken, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      fullName,
      dob,
      education,
      email,
      phone,
      mentorshipGoals,
      skillsKnown,
      skillsToImprove,
      experienceLevel,
      whyMentorship,
      linkedin,
      github
    } = req.body;

    const resumePath = req.files['resume'] ? req.files['resume'][0].path : null;
    const photoPath = req.files['photo'] ? req.files['photo'][0].path : null;
    const videoPath = req.files['video'] ? req.files['video'][0].path : null;

    const application = new Application({
      fullName,
      dob,
      education,
      email: req.user.email,    // Add email
      phone,
      mentorshipGoals,
      skillsKnown,
      skillsToImprove,
      experienceLevel,
      whyMentorship,
      linkedin,
      github,
      resumePath,
      photoPath,
      videoPath,
      menteeId: req.user.id    // Add menteeId
    });

    await application.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Application submission failed' });
  }
});

// Add this new route
app.get('/api/mentee/check-application', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findOne({
      email: req.user.email,  // Match by email
      menteeId: req.user.id   // And menteeId
    });

    res.json({
      hasApplication: !!application,
      application: application
    });
  } catch (error) {
    console.error('Error checking application:', error);
    res.status(500).json({ error: 'Failed to check application status' });
  }
});

// Mentor routes
app.post('/api/mentor/register', upload.single('resume'), async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      expertise,
      yearsOfExperience,
      currentRole,
      company,
      linkedIn,
      github,
      portfolio,
      bio,
      availability,
      preferredMenteeLevel,
      expectations,
      mentorshipStyle,
      pastMentorshipExperience,
      certificates
    } = req.body;

    // Parse expertise back to array
    let parsedExpertise;
    try {
      parsedExpertise = JSON.parse(expertise);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid expertise format' });
    }

    if (!parsedExpertise || !Array.isArray(parsedExpertise) || parsedExpertise.length === 0) {
      return res.status(400).json({ error: 'Expertise is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const mentor = new Mentor({
      username,
      email,
      password: hashedPassword,
      fullName,
      expertise: parsedExpertise,
      yearsOfExperience,
      currentRole,
      company,
      linkedIn,
      github,
      portfolio,
      bio,
      availability,
      preferredMenteeLevel,
      expectations,
      mentorshipStyle,
      pastMentorshipExperience,
      certificates,
      resume: req.file ? req.file.filename : null
    });

    await mentor.save();
    res.status(201).json({ message: 'Mentor registered successfully' });
  } catch (error) {
    console.error('Error registering mentor:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/mentor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const mentor = await Mentor.findOne({ email });
    if (!mentor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, mentor.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: mentor._id, type: 'mentor' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, userType: 'mentor' });
  } catch (error) {
    console.error('Error logging in mentor:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/mentor/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ assignedMentor: req.user.id });
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/mentor/download/:fileType/:applicationId', async (req, res) => {
  try {
    const { fileType, applicationId } = req.params;
    const application = await Application.findById(applicationId);
    if (application) {
      const filePath = application[`${fileType}Path`];
      if (filePath) {
        res.download(filePath);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } else {
      res.status(404).json({ error: 'Application not found' });
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Admin routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { pin } = req.body;

    // Check admin PIN (in production, use environment variable)
    const ADMIN_PIN = '123456';

    if (pin !== ADMIN_PIN) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const token = jwt.sign(
      { type: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, userType: 'admin' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

app.get('/api/admin/mentors', authenticateAdmin, async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

app.get('/api/admin/mentees', authenticateAdmin, async (req, res) => {
  try {
    const mentees = await Mentee.find();
    res.json(mentees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentees' });
  }
});

// Add this new route
app.get('/api/admin/applications', authenticateAdmin, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('menteeId', 'email')  // Include mentee details if needed
      .populate('assignedMentor', 'fullName email'); // Include mentor details if assigned
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update the assign-mentee route
app.post('/api/admin/assign-mentee', authenticateAdmin, async (req, res) => {
  try {
    const { applicationId, mentorId } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.assignedMentor = mentorId;
    application.status = 'assigned';
    await application.save();

    if (application.menteeId) {
      await Mentee.findByIdAndUpdate(application.menteeId, {
        assignedMentor: mentorId
      });
    }

    res.json({ message: 'Mentee assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign mentee' });
  }
});

app.put('/api/admin/approve-mentor/:id', authenticateAdmin, async (req, res) => {
  try {
    await Mentor.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ message: 'Mentor approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve mentor' });
  }
});

// Add this new route
app.put('/api/mentor/update-application-status/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courseId, courseName } = req.body;

    const application = await Application.findOne({
      _id: id,
      assignedMentor: req.user.id
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found or not assigned to you' });
    }

    application.status = status;
    if (courseId) {
      application.assignedCourse = courseId;
      application.courseName = courseName;
    }

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      status: application.status
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Add this new route for deleting all data
app.delete('/api/admin/delete-all-data', authenticateAdmin, async (req, res) => {
  try {
    // Delete all documents from all collections
    await Promise.all([
      Mentee.deleteMany({}),
      Mentor.deleteMany({}),
      Application.deleteMany({})
    ]);

    // Optionally, delete all uploaded files
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      fs.readdirSync(uploadsDir).forEach((file) => {
        const curPath = path.join(uploadsDir, file);
        fs.unlinkSync(curPath);
      });
    }

    res.json({ message: 'All data deleted successfully' });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

// Add these new routes
app.get('/api/admin/all-mentors', authenticateAdmin, async (req, res) => {
  try {
    const mentors = await Mentor.find().select('-password');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

app.get('/api/admin/all-mentees', authenticateAdmin, async (req, res) => {
  try {
    const mentees = await Mentee.find().select('-password');
    res.json(mentees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentees' });
  }
});

app.get('/api/admin/all-applications', authenticateAdmin, async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/admin/all-files', authenticateAdmin, async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    const files = await bucket.find().toArray();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Add these new routes
app.get('/api/admin/mentor-credentials', authenticateAdmin, async (req, res) => {
  try {
    const mentors = await Mentor.find().select('email fullName isApproved');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentor credentials' });
  }
});

app.get('/api/admin/mentee-credentials', authenticateAdmin, async (req, res) => {
  try {
    const mentees = await Mentee.find().select('email username assignedMentor');
    res.json(mentees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentee credentials' });
  }
});

// Add new route to server.cjs:
app.post('/api/mentor/approve-application', authenticateToken, async (req, res) => {
  try {
    const { applicationId, courseId, courseName } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      assignedMentor: req.user.id
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found or not assigned to you' });
    }

    // Update application status and course details
    application.status = 'approved';
    application.assignedCourse = courseId;
    application.courseName = courseName;

    await application.save();

    res.json({
      message: 'Application approved and course assigned successfully',
      application
    });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

app.get('/api/mentee/my-application', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findOne({ menteeId: req.user.id });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

app.get('/api/mentor/resume/:filename', authenticateToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'Resume not found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
