import { Transporter } from 'nodemailer';

class EmailRepository {
    transporter: Transporter;

    constructor(transporter: Transporter) {
        this.transporter = transporter;
    }

    public async SendEmail(from: string, targetEmails: string[], subject: string, htmlContent: string) {
        const mailOptions = {
            from: from,
            to: targetEmails.join(','),
            subject: subject,
            html: htmlContent,
        };

        try {
            return this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error(error)
        }
    }
}

export default EmailRepository;