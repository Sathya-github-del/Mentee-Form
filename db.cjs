const mongoose = require("mongoose");

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://sathyas962:admin@form-cluster.fd1pq.mongodb.net/?retryWrites=true&w=majority&appName=Form-Cluster",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Define Schemas
const menteeSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
});

const mentorSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  fullName: String,
  expertise: {
    type: [String],
    validate: {
      validator: function (array) {
        return array && array.length > 0 && array.every(item => item.trim().length > 0);
      },
      message: 'At least one area of expertise is required'
    },
    required: true
  },
  yearsOfExperience: Number,
  currentRole: String,
  company: String,
  linkedIn: String,
  github: String,
  portfolio: String,
  bio: String,
  availability: String,
  preferredMenteeLevel: String,
  expectations: String,
  mentorshipStyle: String,
  isApproved: { type: Boolean, default: false },
  pastMentorshipExperience: String,
  certificates: String,
  resume: String, // Store the filename of uploaded resume
  createdAt: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
  fullName: String,
  dob: Date,
  education: String,
  email: { type: String, required: true },
  phone: String,
  mentorshipGoals: String,
  skillsKnown: String,
  skillsToImprove: String,
  experienceLevel: String,
  whyMentorship: String,
  linkedin: String,
  github: String,
  resumePath: String,
  photoPath: String,
  videoPath: String,
  createdAt: { type: Date, default: Date.now },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentee',
    required: true
  },
  assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  status: { type: String, enum: ['pending', 'assigned', 'rejected', 'approved'], default: 'pending' },
  assignedCourse: String,
  courseName: String
});

// Add index for faster lookups
applicationSchema.index({ email: 1, menteeId: 1 });

// Create and export models
const Mentee = mongoose.model("Mentee", menteeSchema);
const Mentor = mongoose.model("Mentor", mentorSchema);
const Application = mongoose.model("Application", applicationSchema);

// Export the models
module.exports = {
  Mentee,
  Mentor,
  Application
};

