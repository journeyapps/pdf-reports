import { describe, expect, it } from 'vitest';
import { fetch } from '../src/fetch';
import { generatePdf, setApiToken } from '../src/pdf';
import { generateAndUploadPdf, uploadToS3 } from '../src/s3';

setApiToken(process.env.JOURNEY_PDF_KEY);

const BASE_UPLOAD_CONFIG = {
  bucket: process.env.JOURNEY_PDF_BUCKET,
  prefix: 'test-reports/',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: 'us-east-1'
  }
};

describe('pdf to s3', function () {
  it(
    'should generate and then upload a PDF',
    async function () {
      // Generate
      const pdf = await generatePdf({ html: 'Test' });

      // Upload
      const uploaded = await uploadToS3(pdf, { name: 'test1.pdf', ...BASE_UPLOAD_CONFIG });
      const url = uploaded.getSignedUrl(300);

      // Access original (implicitly downloaded earlier)
      const generated = await pdf.toBuffer();

      // Compare to uploaded one
      const response = await fetch(url);
      expect(response.headers.get('Content-Type')).to.eq('application/pdf');
      const downloaded = await response.buffer();
      expect(downloaded.byteLength).to.eq(generated.byteLength);
    },
    {
      timeout: 30000
    }
  );

  it(
    'should generate and upload in a single step',
    async function () {
      // Generate and upload
      const uploaded = await generateAndUploadPdf({ html: 'Test' }, { name: 'test2.pdf', ...BASE_UPLOAD_CONFIG });
      const url = uploaded.getSignedUrl(300);

      // Check file
      const response = await fetch(url);
      expect(response.headers.get('Content-Type')).to.eq('application/pdf');
      const downloaded = await response.buffer();
      expect(downloaded.byteLength).to.gt(1000);
    },
    {
      timeout: 30000
    }
  );
});
