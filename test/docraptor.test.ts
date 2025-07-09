import { describe, expect, it } from 'vitest';
import { generatePdfDocRaptor, setDocRaptorToken } from '../src/docraptor';

setDocRaptorToken(process.env.DOCRAPTOR_TOKEN || 'YOUR_API_KEY_HERE');

describe('pdfs - docraptor', () => {
  it(
    'should generate a PDF from static text',
    async () => {
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
    },
    {
      timeout: 30000
    }
  );

  it(
    'should generate a PDF from a URL',
    async () => {
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
    },
    {
      timeout: 30000
    }
  );
});
