# pdf-reports

Node library to generate PDF reports from HTML.

# Installation

    yarn add @journeyapps/pdf-reports

# Usage

## Basic Usage

```js
const pdf = require("@journeyapps/pdf-reports");
const fs = require("fs");
pdf.setApiToken(process.env.JOURNEY_PDF_KEY);

async function test() {
  const result = await pdf.generatePdf({ html: "<h1>Test Pdf</h1>" });
  const buffer = await result.toBuffer();
  fs.writeFileSync("out.pdf", buffer);
}
test().catch(console.error);
```

## Upload to S3

```js
const pdf = require("@journeyapps/pdf-reports");
const fs = require("fs");
pdf.setApiToken(process.env.JOURNEY_PDF_KEY);

const BASE_UPLOAD_CONFIG = {
  bucket: process.env.JOURNEY_PDF_BUCKET,
  prefix: 'test-reports/',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  }
};

async function test() {
  // This function uploads the PDF directly to S3 from the service,
  // no intermediate download is required.
  const result = await pdf.generateAndUploadPdf({
    html: "<h1>Test PDF</h1>",
    {name: 'test1.pdf', ...BASE_UPLOAD_CONFIG}
  });
  // URL is valid for 7 days by default
  const url = result.getSignedUrl();
  console.log('url', url);
}
test().catch(console.error);
```

## Other Options

```js
// Generate from an online URL
await pdf.generatePdf({ url: "https://en.wikipedia.org/wiki/Portable_Document_Format" });

// Specify print options

await pdf.generatePdf({
  html: "<h1>Test PDF</h1>",
  print: {
    // These are the defaults used by the service.
    // Specify any of these to override the value.
    landscape: false,
    displayHeaderFooter: false,
    printBackground: true,
    scale: 1,
    paperWidth: 8.27, // A4
    paperHeight: 11.69, // A4
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    pageRanges: ''
  }
});
```

## Using DocRaptor

By default, a Chrome rendering service is used. To use DocRaptor instead,
use the `generatePdfDocRaptor` function instead:

```js
const pdf = require("@journeyapps/pdf-reports");
const fs = require("fs");
pdf.setDocRaptorToken(process.env.DOCRAPTOR_TOKEN);

async function test() {
  const result = await pdf.generatePdfDocRaptor({
    html: "<h1>Test Pdf</h1>",
    docraptor: {
      // Any additional DocRaptor API options here
    }
  });
  const buffer = await result.toBuffer();
  fs.writeFileSync("out.pdf", buffer);

  // The PDF may be uploaded to S3 afterwards:
  const s3result = await pdf.uploadToS3(result, {name: 'test1.pdf', ...BASE_UPLOAD_CONFIG}});
  const url = s3result.getSignedUrl();
  console.log('url', url);
}
test().catch(console.error);
```

# Development

## Setup

Clone this repo, then run:

    yarn

## Tests

To run the tests, the following environment variables are required:

    JOURNEY_PDF_KEY # Key for the PDF service
    JOURNEY_PDF_BUCKET # AWS bucket name to store test reports
    # AWS Credentials
    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY

Then run:

    yarn test
