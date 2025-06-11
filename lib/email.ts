import * as Brevo from '@getbrevo/brevo';

// Initialize Brevo API instance
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  organization: string
) {
  try {
    const sender = {
      name: process.env.EMAIL_FROM_NAME || 'Medical Admin',
      email: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    };
    
    const receivers = [{ email: to }];
const emailParams = {
  sender,
  to: receivers,
  subject: 'Next Step: Complete Your Payment to Join',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Application Approved – Payment Awaited</h2>
      <p>Dear ${name},</p>
      <p>Thank you for submitting your application to <strong>${organization}</strong>. We’re pleased to inform you that your form has been <strong>received and approved</strong>.</p>
      <p>To finalize your membership, please proceed with the payment. Once we receive your payment, you will officially become a member of our organization.</p>
      <p><strong>Please note:</strong> Your membership will need to be renewed annually to remain active.</p>
      <p>If you have any questions or need assistance, feel free to reach out to us.</p>
      <p>Best regards,<br>The ${organization} Team</p>
    </div>
  `,
  textContent: `
    Dear ${name},
    
    Thank you for submitting your application to ${organization}. Your form has been received and approved.

    Please complete your payment to finalize your membership. Once payment is received, you will officially be part of the organization.

    Note: Your membership must be renewed every year to remain active.

    If you have any questions, feel free to reach out.

    Best regards,
    The ${organization} Team
  `,
};


    const response = await apiInstance.sendTransacEmail(emailParams);
    console.log('Email sent with Brevo, message ID:', response.messageId);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error('Error sending email with Brevo:', error);
    return { success: false, error };
  }
}