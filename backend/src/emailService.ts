import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using standard SMTP (e.g. Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendAppointmentEmail = async (clientEmail: string, clientName: string, serviceName: string, date: string, time: string, tenantName: string) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_PASS === '12345') {
    console.log('Skipping client email due to dummy or missing credentials');
    return false;
  }
  try {
    const mailOptions = {
      from: `"TurneraApp - ${tenantName}" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Confirmación de Turno en ${tenantName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #3b82f6; padding: 20px; text-align: center; color: white;">
            <h2>Turno Confirmado</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hola <strong>${clientName}</strong>,</p>
            <p>Tu turno en <strong>${tenantName}</strong> ha sido reservado con éxito.</p>
            
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Servicio:</strong> ${serviceName}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
            </div>
            
            <p>¡Te esperamos!</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent to client: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email to client:', error);
    return false;
  }
};

export const sendAdminNotificationEmail = async (adminEmail: string, clientName: string, serviceName: string, date: string, time: string) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_PASS === '12345') {
    console.log('Skipping admin email due to dummy or missing credentials');
    return false;
  }
  try {
    const mailOptions = {
      from: `"TurneraApp Alertas" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `¡Nuevo Turno Reservado! - ${clientName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
            <h2>¡Tenés un nuevo turno! 🎉</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hola,</p>
            <p>El cliente <strong>${clientName}</strong> acaba de reservar un turno en tu web.</p>
            
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Servicio:</strong> ${serviceName}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${date}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
            </div>
            
            <p>Revisá tu Panel de Control para más detalles.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
};
