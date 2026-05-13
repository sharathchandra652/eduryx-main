require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const app  = express();

/* ── Middleware ─────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow requests from your frontend
app.use(cors({
  origin: '*', // Vercel handles CORS usually, but this is safe for a public API
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

/* ── Rate Limiting ─────────────────────────────────────────── */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many submissions. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Nodemailer Transporter ─────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.zoho.in',
  port:   parseInt(process.env.SMTP_PORT) || 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ── Validation Helpers ─────────────────────────────────────── */
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
const sanitize     = (str)   => String(str || '').trim().replace(/[<>]/g, '');

/* ── Endpoints ──────────────────────────────────────────────── */

// POST /api/contact
app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const errors = [];
    if (!name    || sanitize(name).length < 2)   errors.push('Name must be at least 2 characters.');
    if (!email   || !isValidEmail(email))         errors.push('Please enter a valid email address.');
    if (!phone   || !isValidPhone(phone))         errors.push('Please enter a valid phone number.');
    if (!message || sanitize(message).length < 5) errors.push('Message must be at least 5 characters.');

    if (errors.length > 0) return res.status(400).json({ success: false, message: errors[0], errors });

    const safeName    = sanitize(name);
    const safeEmail   = sanitize(email);
    const safePhone   = sanitize(phone);
    const safeMessage = sanitize(message);

    const adminMail = {
      from: `"Eduryx Website" <${process.env.SMTP_USER}>`,
      to:   process.env.TO_EMAIL || 'contact@eduryx.com',
      replyTo: safeEmail,
      subject: `📬 New Contact Message from ${safeName}`,
      html: `<h3>New Contact Submission</h3><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Phone:</strong> ${safePhone}</p><p><strong>Message:</strong><br>${safeMessage.replace(/\n/g, '<br>')}</p>`,
    };

    const userReply = {
      from: `"Eduryx Team" <${process.env.SMTP_USER}>`,
      to:   safeEmail,
      subject: `We received your message, ${safeName.split(' ')[0]}! ✅`,
      html: `<p>Hi ${safeName},</p><p>Thank you for reaching out to Eduryx. We've received your message and will respond within 24 hours.</p>`,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(userReply);

    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// POST /api/enroll
app.post('/api/enroll', formLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, program, college, notes } = req.body;
    const errors = [];
    if (!firstName || sanitize(firstName).length < 2) errors.push('First name is required.');
    if (!lastName  || sanitize(lastName).length < 2)  errors.push('Last name is required.');
    if (!email     || !isValidEmail(email))            errors.push('Please enter a valid email address.');
    if (!phone     || !isValidPhone(phone))            errors.push('Please enter a valid phone number.');
    if (!program   || sanitize(program).length < 3)   errors.push('Please select a program.');

    if (errors.length > 0) return res.status(400).json({ success: false, message: errors[0], errors });

    const safeFirst   = sanitize(firstName);
    const safeLast    = sanitize(lastName);
    const safeEmail   = sanitize(email);
    const safePhone   = sanitize(phone);
    const safeProgram = sanitize(program);
    const safeCollege = sanitize(college || 'Not provided');
    const safeNotes   = sanitize(notes   || 'None');

    const adminMail = {
      from: `"Eduryx Website" <${process.env.SMTP_USER}>`,
      to:   process.env.TO_EMAIL || 'contact@eduryx.com',
      replyTo: safeEmail,
      subject: `🎓 New Seat Reservation — ${safeFirst} ${safeLast}`,
      html: `<h3>New Enrollment</h3><p><strong>Name:</strong> ${safeFirst} ${safeLast}</p><p><strong>Program:</strong> ${safeProgram}</p><p><strong>College:</strong> ${safeCollege}</p>`,
    };

    const studentReply = {
      from: `"Eduryx Team" <${process.env.SMTP_USER}>`,
      to:   safeEmail,
      subject: `🎓 Seat Reserved! Welcome to Eduryx, ${safeFirst}`,
      html: `<p>Hi ${safeFirst},</p><p>Your seat for the ${safeProgram} has been reserved. Our team will reach out within 24 hours.</p>`,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(studentReply);

    return res.status(200).json({ success: true, message: 'Enrollment successful.' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Eduryx API', time: new Date().toISOString() });
});

module.exports = app;
