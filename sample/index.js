
const pdf = require("@journeyapps/pdf-reports");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_KEY);
pdf.setApiToken(process.env.JOURNEY_PDF_KEY);
const emailAddress = process.env.TEST_EMAIL;

async function test() {
    const [pdf1, pdf2] = await Promise.all([
      pdf.generatePdf({ url: 'https://journeyapps.com' }),
      pdf.generatePdf({ html: 'Plain html pdf' })
    ]);

    const email = {
        to: emailAddress,
        from: emailAddress,
        subject: 'Test email',
        text: 'Test email',
        attachments: [
            await pdf1.toEmailAttachment('pdf1.pdf'),
            await pdf2.toEmailAttachment('pdf2.pdf')
        ]
    };
    try {
      await sgMail.send(email);
    } catch(error) {
      // This helps for debugging
      if (error.response) {
        console.error(error.response.body);
      }
      throw error;
    }
}

test().catch(console.error);
