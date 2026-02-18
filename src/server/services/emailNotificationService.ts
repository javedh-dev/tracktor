import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { EmailProviderConfig } from '$lib/domain/notification-provider';
import { getDefaultProvider } from './notificationProviderService';
import logger from '$server/config/logger';
import { AppError, Status } from '../exceptions/AppError';

interface EmailOptions {
  subject: string;
  text?: string;
  html?: string;
}

const createTransporter = (config: EmailProviderConfig): Transporter => {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    }
  });
};

export const sendEmail = async (
  emailOptions: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Get the default email provider
    const provider = await getDefaultProvider('email');

    if (!provider) {
      throw new AppError('No email provider configured', Status.BAD_REQUEST);
    }

    if (!provider.isEnabled) {
      throw new AppError('Email provider is disabled', Status.BAD_REQUEST);
    }

    const config = provider.config as EmailProviderConfig;
    const transporter = createTransporter(config);

    // Send the email
    const info = await transporter.sendMail({
      from: config.fromName ? `"${config.fromName}" <${config.from}>` : config.from,
      to: Array.isArray(config.recepient) ? config.recepient.join(', ') : config.recepient,
      subject: emailOptions.subject,
      text: emailOptions.text,
      html: emailOptions.html
    });

    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: config.recepient
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to send email', {
      error: err.message,
      to: 'unknown recipient'
    });

    return {
      success: false,
      error: err.message
    };
  }
};

export const testEmailProvider = async (
  config: EmailProviderConfig,
  testEmail: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter(config);

    // Verify the connection
    await transporter.verify();

    // Send a test email
    const info = await transporter.sendMail({
      from: config.fromName ? `"${config.fromName}" <${config.from}>` : config.from,
      to: config.recepient,
      subject: 'Tracktor - Email Provider Test',
      text: 'This is a test email from Tracktor. Your email provider is configured correctly!',
      html: '<p>This is a test email from <strong>Tracktor</strong>.</p><p>Your email provider is configured correctly!</p>'
    });

    logger.info('Test email sent successfully', { messageId: info.messageId, to: testEmail });

    return { success: true };
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to send test email', { error: err.message, to: testEmail });

    return {
      success: false,
      error: err.message
    };
  }
};
