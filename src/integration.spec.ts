import { expect } from 'chai';
import 'mocha';
import { generatePdf, setApiToken } from './pdf';

setApiToken(process.env.JOURNEY_PDF_KEY);

describe('pdfs', function() {
  it('should generate a PDF', async function() {
    const pdf = await generatePdf({html: 'Test'});
    const buffer = await pdf.toBuffer();
  }).timeout(30000);
});
