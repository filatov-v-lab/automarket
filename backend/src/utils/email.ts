// Заглушка email-сервиса. В продакшене заменить на nodemailer / SendGrid / и т.д.
export function sendEmail(to: string, subject: string, body: string): void {
  console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}\n${body}\n`);
}
