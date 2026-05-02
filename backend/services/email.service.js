const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'TMS App <noreply@tms.app>',
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email failed: ${error.message}`);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to TMS 🎉',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6366f1">Welcome to TMS, ${user.name}!</h2>
        <p>Your account has been created successfully. Start managing your tasks and projects with ease.</p>
        <a href="${process.env.CLIENT_URL}" 
           style="background:#6366f1;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:16px">
          Get Started
        </a>
        <p style="color:#888;margin-top:24px;font-size:14px">The TMS Team</p>
      </div>
    `,
  });
};

const sendTaskAssignedEmail = async (user, task, assigner) => {
  await sendEmail({
    to: user.email,
    subject: `New Task Assigned: ${task.title}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6366f1">You have a new task!</h2>
        <p><strong>${assigner.name}</strong> assigned you a task:</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
          <h3 style="margin:0 0 8px">${task.title}</h3>
          <p style="margin:0;color:#6b7280">${task.description || 'No description'}</p>
          <p style="margin:8px 0 0;color:#6366f1">Priority: ${task.priority}</p>
          ${task.deadline ? `<p style="margin:4px 0 0;color:#ef4444">Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>` : ''}
        </div>
        <a href="${process.env.CLIENT_URL}/tasks/${task._id}" 
           style="background:#6366f1;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
          View Task
        </a>
      </div>
    `,
  });
};

const sendDeadlineReminderEmail = async (user, task) => {
  await sendEmail({
    to: user.email,
    subject: `⏰ Task Deadline Reminder: ${task.title}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#f59e0b">Deadline Approaching!</h2>
        <p>Your task <strong>${task.title}</strong> is due soon.</p>
        <p style="color:#ef4444">Deadline: ${new Date(task.deadline).toLocaleString()}</p>
        <a href="${process.env.CLIENT_URL}/tasks/${task._id}" 
           style="background:#6366f1;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:16px">
          View Task
        </a>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendTaskAssignedEmail, sendDeadlineReminderEmail };
