import { expect } from 'chai';
import 'mocha';
import { generatePdf, setApiToken } from './pdf';

setApiToken(process.env.JOURNEY_PDF_KEY);

describe('pdfs', function() {
  it('should generate a PDF from static text', async function() {
    const pdf = await generatePdf({html: 'Test'});
    const buffer = await pdf.toBuffer();
    expect(buffer.byteLength).to.gt(1000);
    expect(buffer.slice(0, 8).toString('utf-8')).to.eq('%PDF-1.4');
  }).timeout(30000);

  it('should generate a PDF from a URL', async function() {
    const pdf = await generatePdf({url: 'https://en.wikipedia.org/wiki/Portable_Document_Format'});
    const buffer = await pdf.toBuffer();
    expect(buffer.byteLength).to.gt(1000);
    expect(buffer.slice(0, 8).toString('utf-8')).to.eq('%PDF-1.4');
  }).timeout(30000);
});
