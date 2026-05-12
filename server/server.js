/* ═══════════════════════════════════════════════════════════════
   Eduryx Email Server
   Node.js + Express + Nodemailer
   Endpoints:
     POST /api/contact   → "Send us a Message" form
     POST /api/enroll    → "Reserve Your Seat" form
   All submissions forwarded to contact@eduryx.com
═══════════════════════════════════════════════════════════════ */

require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Middleware ─────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow requests from your frontend (update origin in production)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    // Add your production domain here, e.g.:
    // 'https://eduryx.com',
    // 'https://www.eduryx.com'
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

/* ── Rate Limiting (security) ────────────────────────────────── */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 submissions per IP per window
  message: { success: false, message: 'Too many submissions. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Nodemailer Transporter ─────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.zoho.in',
  port:   parseInt(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true' || true, // Zoho requires SSL on port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify((err) => {
  if (err) {
    console.error('❌ SMTP connection failed:', err.message);
    console.error('   Check your .env credentials (SMTP_USER, SMTP_PASS)');
  } else {
    console.log('✅ SMTP connected — ready to send emails');
  }
});

/* ── Validation Helpers ─────────────────────────────────────── */
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
const sanitize     = (str)   => String(str || '').trim().replace(/[<>]/g, '');

/* ═══════════════════════════════════════════════════════════════
   POST /api/contact
   Fields: name, email, phone, message
═══════════════════════════════════════════════════════════════ */
app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    /* — Validation — */
    const errors = [];
    if (!name    || sanitize(name).length < 2)   errors.push('Name must be at least 2 characters.');
    if (!email   || !isValidEmail(email))         errors.push('Please enter a valid email address.');
    if (!phone   || !isValidPhone(phone))         errors.push('Please enter a valid phone number.');
    if (!message || sanitize(message).length < 5) errors.push('Message must be at least 5 characters.');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const safeName    = sanitize(name);
    const safeEmail   = sanitize(email);
    const safePhone   = sanitize(phone);
    const safeMessage = sanitize(message);

    /* — Email to Admin (contact@eduryx.com) — */
    const adminMail = {
      from: `"Eduryx Website" <${process.env.SMTP_USER}>`,
      to:   process.env.TO_EMAIL || 'contact@eduryx.com',
      replyTo: safeEmail,
      subject: `📬 New Contact Message from ${safeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
            .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px;
                    border: 1px solid #eef2f7; overflow: hidden; }
            .header { background: #12355B; padding: 28px 32px; }
            .header h1 { color: #fff; font-size: 20px; margin: 0; }
            .header p  { color: rgba(255,255,255,.6); font-size: 13px; margin: 4px 0 0; }
            .body { padding: 32px; }
            .field { margin-bottom: 20px; }
            .field label { display: block; font-size: 11px; font-weight: 700; letter-spacing: .08em;
                           text-transform: uppercase; color: #667085; margin-bottom: 6px; }
            .field .val { font-size: 15px; color: #0A1423; font-weight: 500; }
            .message-box { background: #f8fafc; border: 1px solid #eef2f7; border-radius: 8px;
                           padding: 16px; font-size: 15px; color: #0A1423; line-height: 1.65; }
            .footer { padding: 20px 32px; border-top: 1px solid #eef2f7;
                      font-size: 12px; color: #667085; text-align: center; }
            .badge { display: inline-block; background: rgba(212,160,23,.12); color: #8B6914;
                     padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="header">
              <h1>📬 New Contact Form Submission</h1>
              <p>Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
            </div>
            <div class="body">
              <div class="field">
                <label>Name</label>
                <div class="val">${safeName}</div>
              </div>
              <div class="field">
                <label>Email</label>
                <div class="val"><a href="mailto:${safeEmail}" style="color:#12355B;">${safeEmail}</a></div>
              </div>
              <div class="field">
                <label>Phone Number</label>
                <div class="val">${safePhone}</div>
              </div>
              <div class="field">
                <label>Message</label>
                <div class="message-box">${safeMessage.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <span class="badge">EDURYX</span> · Submitted via website contact form<br>
              Reply directly to this email to respond to ${safeName}.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `New Contact from: ${safeName}\nEmail: ${safeEmail}\nPhone: ${safePhone}\n\nMessage:\n${safeMessage}`,
    };

    /* — Auto-Reply to User — */
    const userReply = {
      from: `"Eduryx Team" <${process.env.SMTP_USER}>`,
      to:   safeEmail,
      subject: `We received your message, ${safeName.split(' ')[0]}! ✅`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
            .wrap { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 12px;
                    border: 1px solid #eef2f7; overflow: hidden; }
            .header { background: linear-gradient(135deg, #12355B 0%, #0D2948 100%);
                      padding: 36px 32px; text-align: center; }
            .header h1 { color: #fff; font-size: 22px; margin: 0 0 8px; }
            .header p  { color: rgba(255,255,255,.7); font-size: 14px; margin: 0; }
            .body { padding: 32px; }
            .body p { font-size: 15px; color: #374151; line-height: 1.7; margin-bottom: 16px; }
            .highlight { background: rgba(212,160,23,.08); border-left: 3px solid #D4A017;
                         border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 20px 0; }
            .highlight p { margin: 0; font-size: 14px; color: #374151; }
            .cta { display: block; text-align: center; margin: 24px 0; }
            .cta a { background: #12355B; color: #fff; text-decoration: none; padding: 13px 28px;
                     border-radius: 8px; font-weight: 700; font-size: 14px; }
            .footer { padding: 20px 32px; border-top: 1px solid #eef2f7;
                      font-size: 12px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="header">
              <h1>Message Received! ✅</h1>
              <p>We'll get back to you within 24 hours.</p>
            </div>
            <div class="body">
              <p>Hi <strong>${safeName.split(' ')[0]}</strong>,</p>
              <p>Thank you for reaching out to <strong>Eduryx</strong>. We've received your message and our team will respond within <strong>24 hours</strong>.</p>
              <div class="highlight">
                <p><strong>Your message:</strong><br>"${safeMessage.substring(0, 200)}${safeMessage.length > 200 ? '…' : ''}"</p>
              </div>
              <p>While you wait, feel free to explore our AI programs or chat with us on WhatsApp for immediate help.</p>
              <div class="cta">
                <a href="https://wa.me/917337222775?text=Hi%20EDURYX%2C%20I%20have%20a%20question" target="_blank">
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>
            <div class="footer">
              © 2026 EDURYX · <a href="mailto:contact@eduryx.com" style="color:#12355B;">contact@eduryx.com</a>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    /* — Send both emails — */
    await transporter.sendMail(adminMail);
    await transporter.sendMail(userReply);

    console.log(`✅ Contact form: email sent from ${safeEmail} (${safeName})`);

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been sent. We\'ll get back to you shortly.',
    });

  } catch (err) {
    console.error('❌ /api/contact error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or email us at contact@eduryx.com.',
    });
  }
});

/* ═══════════════════════════════════════════════════════════════
   POST /api/enroll
   Fields: firstName, lastName, email, phone, program, college, notes
═══════════════════════════════════════════════════════════════ */
app.post('/api/enroll', formLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, program, college, notes } = req.body;

    /* — Validation — */
    const errors = [];
    if (!firstName || sanitize(firstName).length < 2) errors.push('First name is required.');
    if (!lastName  || sanitize(lastName).length < 2)  errors.push('Last name is required.');
    if (!email     || !isValidEmail(email))            errors.push('Please enter a valid email address.');
    if (!phone     || !isValidPhone(phone))            errors.push('Please enter a valid phone number.');
    if (!program   || sanitize(program).length < 3)   errors.push('Please select a program.');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const safeFirst   = sanitize(firstName);
    const safeLast    = sanitize(lastName);
    const safeEmail   = sanitize(email);
    const safePhone   = sanitize(phone);
    const safeProgram = sanitize(program);
    const safeCollege = sanitize(college || 'Not provided');
    const safeNotes   = sanitize(notes   || 'None');

    /* — Email to Admin — */
    const adminMail = {
      from: `"Eduryx Website" <${process.env.SMTP_USER}>`,
      to:   process.env.TO_EMAIL || 'contact@eduryx.com',
      replyTo: safeEmail,
      subject: `🎓 New Seat Reservation — ${safeFirst} ${safeLast}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
            .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px;
                    border: 1px solid #eef2f7; overflow: hidden; }
            .header { background: linear-gradient(135deg, #12355B 0%, #0D2948 100%); padding: 28px 32px; }
            .header h1 { color: #fff; font-size: 20px; margin: 0; }
            .header p  { color: rgba(255,255,255,.6); font-size: 13px; margin: 4px 0 0; }
            .body { padding: 32px; }
            .field { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9; }
            .field:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .field label { display: block; font-size: 11px; font-weight: 700; letter-spacing: .08em;
                           text-transform: uppercase; color: #667085; margin-bottom: 5px; }
            .field .val { font-size: 15px; color: #0A1423; font-weight: 500; }
            .program-badge { display: inline-block; background: rgba(212,160,23,.12); color: #8B6914;
                             padding: 5px 14px; border-radius: 99px; font-size: 13px; font-weight: 700; }
            .footer { padding: 20px 32px; border-top: 1px solid #eef2f7;
                      font-size: 12px; color: #667085; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="header">
              <h1>🎓 New Seat Reservation</h1>
              <p>Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST · June 2026 Batch</p>
            </div>
            <div class="body">
              <div class="field">
                <label>Full Name</label>
                <div class="val">${safeFirst} ${safeLast}</div>
              </div>
              <div class="field">
                <label>Email Address</label>
                <div class="val"><a href="mailto:${safeEmail}" style="color:#12355B;">${safeEmail}</a></div>
              </div>
              <div class="field">
                <label>Phone Number</label>
                <div class="val">${safePhone}</div>
              </div>
              <div class="field">
                <label>Selected Program</label>
                <div class="val"><span class="program-badge">${safeProgram}</span></div>
              </div>
              <div class="field">
                <label>College / University</label>
                <div class="val">${safeCollege}</div>
              </div>
              <div class="field">
                <label>Additional Notes</label>
                <div class="val" style="font-weight:400;color:#374151;line-height:1.65;">${safeNotes.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <strong>Action needed:</strong> Contact ${safeFirst} within 24 hours to confirm seat &amp; share batch details.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `New Enrollment:\n${safeFirst} ${safeLast}\nEmail: ${safeEmail}\nPhone: ${safePhone}\nProgram: ${safeProgram}\nCollege: ${safeCollege}\nNotes: ${safeNotes}`,
    };

    /* — Auto-Reply to Student — */
    const studentReply = {
      from: `"Eduryx Team" <${process.env.SMTP_USER}>`,
      to:   safeEmail,
      subject: `🎓 Seat Reserved! Welcome to Eduryx, ${safeFirst}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
            .wrap { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 12px;
                    border: 1px solid #eef2f7; overflow: hidden; }
            .header { background: linear-gradient(135deg, #12355B 0%, #0D2948 100%);
                      padding: 36px 32px; text-align: center; }
            .header .icon { font-size: 36px; margin-bottom: 12px; }
            .header h1 { color: #fff; font-size: 22px; margin: 0 0 8px; }
            .header p  { color: rgba(255,255,255,.7); font-size: 14px; margin: 0; }
            .body { padding: 32px; }
            .body p { font-size: 15px; color: #374151; line-height: 1.7; margin-bottom: 16px; }
            .program-box { background: rgba(212,160,23,.07); border: 1px solid rgba(212,160,23,.25);
                           border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
            .program-box .label { font-size: 11px; font-weight: 700; letter-spacing: .08em;
                                  text-transform: uppercase; color: #667085; margin-bottom: 5px; }
            .program-box .name { font-size: 16px; font-weight: 700; color: #12355B; }
            .steps { counter-reset: step; margin: 20px 0; }
            .step { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
            .step-num { width: 28px; height: 28px; border-radius: 50%; background: #12355B;
                        color: #fff; font-size: 13px; font-weight: 700; display: flex;
                        align-items: center; justify-content: center; flex-shrink: 0; }
            .step-text { font-size: 14px; color: #374151; line-height: 1.6; padding-top: 4px; }
            .cta { display: block; text-align: center; margin: 24px 0; }
            .cta a { background: #12355B; color: #fff; text-decoration: none; padding: 13px 28px;
                     border-radius: 8px; font-weight: 700; font-size: 14px; }
            .footer { padding: 20px 32px; border-top: 1px solid #eef2f7;
                      font-size: 12px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="header">
              <div class="icon">🎓</div>
              <h1>You're on the list, ${safeFirst}!</h1>
              <p>Your seat reservation has been received.</p>
            </div>
            <div class="body">
              <p>Hi <strong>${safeFirst}</strong>,</p>
              <p>Thank you for enrolling with <strong>Eduryx</strong>! We're thrilled to have you. Your seat has been reserved for the <strong>June 2026 batch</strong>.</p>
              <div class="program-box">
                <div class="label">Selected Program</div>
                <div class="name">${safeProgram}</div>
              </div>
              <p><strong>What happens next?</strong></p>
              <div class="steps">
                <div class="step">
                  <div class="step-num">1</div>
                  <div class="step-text">Our team will call or email you within <strong>24 hours</strong> to confirm your seat.</div>
                </div>
                <div class="step">
                  <div class="step-num">2</div>
                  <div class="step-text">You'll receive batch schedule, payment details, and WhatsApp group link.</div>
                </div>
                <div class="step">
                  <div class="step-num">3</div>
                  <div class="step-text">Complete payment to officially secure your spot (only <strong>25 seats available</strong>).</div>
                </div>
              </div>
              <p>For urgent queries, reach us on WhatsApp:</p>
              <div class="cta">
                <a href="https://wa.me/917337222775?text=Hi%20EDURYX%2C%20I%20just%20enrolled%20in%20the%20${encodeURIComponent(safeProgram)}%20program" target="_blank">
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>
            <div class="footer">
              © 2026 EDURYX · <a href="mailto:contact@eduryx.com" style="color:#12355B;">contact@eduryx.com</a><br>
              You are receiving this because you submitted an enrollment form on eduryx.com
            </div>
          </div>
        </body>
        </html>
      `,
    };

    /* — Send both emails — */
    await transporter.sendMail(adminMail);
    await transporter.sendMail(studentReply);

    console.log(`✅ Enrollment: ${safeFirst} ${safeLast} — ${safeProgram}`);

    return res.status(200).json({
      success: true,
      message: 'You\'re on the list! Check your email. Our team will reach out within 24 hours.',
    });

  } catch (err) {
    console.error('❌ /api/enroll error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or email us at contact@eduryx.com.',
    });
  }
});

/* ── Health Check ────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Eduryx Email Server', time: new Date().toISOString() });
});

/* ── Start Server ────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 Eduryx Email Server running on http://localhost:${PORT}`);
  console.log(`   POST /api/contact  — Contact form`);
  console.log(`   POST /api/enroll   — Enrollment form`);
  console.log(`   GET  /api/health   — Health check\n`);
});
