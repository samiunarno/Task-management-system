import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  static async init() {
    // If we had real credentials, we would use them here.
    // For now, we use a mock/ethereal account or just log if no credentials.
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log('[Email Service] Protocol active');
      } else {
        console.warn('[Email Service] SMTP credentials missing. Defaulting to LOG_ONLY mode.');
      }
    } catch (error) {
      console.error('[Email Service Error]:', error);
    }
  }

  static async sendEmail(to: string, subject: string, body: string) {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"StudyFlow Service" <${process.env.SMTP_FROM || 'no-reply@studyflow.ai'}>`,
          to,
          subject,
          text: body,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #000;">
                  <h2 style="text-transform: uppercase; letter-spacing: 2px;">StudyFlow System Alert</h2>
                  <p>${body}</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                  <small style="color: #888;">AUTOMATED_SIGNAL_V4.2 // REGION_GA_01</small>
                </div>`
        });
        console.log(`[Email Service] Signal transmitted to ${to}`);
      } catch (error) {
        console.error(`[Email Service Failure] Could not transmit to ${to}:`, error);
      }
    } else {
      console.log(`
      [MOCK_EMAIL_TRANSMISSION]
      TO: ${to}
      SUBJECT: ${subject}
      BODY: ${body}
      `);
    }
  }
}
