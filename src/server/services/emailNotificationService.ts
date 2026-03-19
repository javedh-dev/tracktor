import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import type { EmailProviderConfig } from '$lib/domain/notification-provider';
import logger from '$server/config/logger';

import { AppError, Status } from '../exceptions/AppError';
import { getEnabledProvidersByType } from './notificationProviderService';

interface EmailOptions {
  subject: string;
  text?: string;
  html?: string;
  providerId?: string;
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

async function resolveEmailProvider(providerId?: string) {
  const providers = await getEnabledProvidersByType('email');

  if (providers.length === 0) {
    throw new AppError('No email provider configured', Status.BAD_REQUEST);
  }

  if (!providerId) {
    return providers[0];
  }

  const provider = providers.find((entry) => entry.id === providerId);

  if (!provider) {
    throw new AppError('Email provider not found or disabled', Status.BAD_REQUEST);
  }

  return provider;
}

export const sendEmail = async (
  emailOptions: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const provider = await resolveEmailProvider(emailOptions.providerId);
    const config = provider.config as EmailProviderConfig;
    const transporter = createTransporter(config);

    const info = await transporter.sendMail({
      from: config.fromName ? `"${config.fromName}" <${config.from}>` : config.from,
      to: Array.isArray(config.recepient) ? config.recepient.join(', ') : config.recepient,
      subject: emailOptions.subject,
      text: emailOptions.text,
      html: emailOptions.html
    });

    logger.info('Email sent successfully', {
      messageId: info.messageId,
      providerId: provider.id,
      to: config.recepient
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to send email', {
      error: err.message
    });

    return {
      success: false,
      error: err.message
    };
  }
};

export const testEmailProvider = async (
  config: EmailProviderConfig,
  testEmail?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter(config);

    await transporter.verify();

    const recipient = testEmail || config.recepient || config.auth.user;

    await transporter.sendMail({
      from: config.fromName ? `"${config.fromName}" <${config.from}>` : config.from,
      to: recipient,
      subject: 'Tracktor - Email Provider Test',
      text: 'This is a test notification from Tracktor. Your email provider is configured correctly!',
      html: '<p>This is a test notification from <strong>Tracktor</strong>.</p><p>Your email provider is configured correctly!</p>'
    });

    logger.info('Test email sent successfully', { to: recipient });

    return { success: true };
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to send test email', {
      error: err.message,
      to: testEmail
    });

    return {
      success: false,
      error: err.message
    };
  }
};
