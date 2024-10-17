import { Transporter } from 'nodemailer';

class EmailRepository {
    transporter: Transporter;

    constructor(transporter: Transporter) {
        this.transporter = transporter;
    }

    async sendEmail(from: string, targetEmails: string[], subject: string, htmlContent: string) {
        const emailPromises = targetEmails.map((email) => {
            const mailOptions = {
                from: from,
                to: email,
                subject: subject,
                html: htmlContent,
            };

            return this.transporter.sendMail(mailOptions);
        });

        const results = await Promise.allSettled(emailPromises);

        // Process the results
        results.forEach((result, index) => {
            if (result.status !== 'fulfilled') {
                console.error(`Failed to send email to ${targetEmails[index]}:`, result.reason.message);
            }
        });

    }
}

export default EmailRepository;