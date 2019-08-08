import { expect } from 'chai';
import 'mocha';
import { generatePdfDocRaptor, setDocRaptorToken } from './docraptor';

setDocRaptorToken(process.env.DOCRAPTOR_TOKEN || 'YOUR_API_KEY_HERE');

describe('pdfs - docraptor', function() {
  it('should generate a PDF from static text', async function() {
    const pdf = await generatePdfDocRaptor({
      html: 'Test',
      test: true,
      docraptor: {
        tag: 'pdf-reports-test'
      }
    });
    const buffer = await pdf.toBuffer();
    expect(buffer.byteLength).to.gt(1000);
    expect(buffer.slice(0, 7).toString('utf-8')).to.eq('%PDF-1.'); // %PDF-1.4 or %PDF-1.5
  }).timeout(30000);

  it('should generate a PDF from a URL', async function() {
    const pdf = await generatePdfDocRaptor({
      url: 'https://en.wikipedia.org/wiki/Portable_Document_Format',
      test: true,
      docraptor: {
        ignore_console_messages: true,
        tag: 'pdf-reports-test'
      }
    });
    const buffer = await pdf.toBuffer();
    expect(buffer.byteLength).to.gt(1000);
    expect(buffer.slice(0, 7).toString('utf-8')).to.eq('%PDF-1.'); // %PDF-1.4 or %PDF-1.5
  }).timeout(30000);
});
