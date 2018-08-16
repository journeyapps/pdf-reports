import { generatePdf, PdfGeneratorOptions, PdfResult } from "./pdf";
import fetch from "node-fetch";


/**
 * Generate a PDF and upload to S3.
 *
 * This has roughly the same effect as (await generatePdf(options)).uploadToS3(s3options).
 * However, this version is more efficient, since the service uploads directly to the S3 bucket
 * when generating the PDF, instead of first downloading it locally and then uploading it again.
 *
 * @param options - pdf options
 * @param upload - s3 options
 */
export async function generateAndUploadPdf(options: PdfGeneratorOptions, upload: S3UploadOptions) {
  const AWS = require('aws-sdk');

  const bucketName = upload.bucket;
  const credentials = upload.credentials;
  const s3 = new AWS.S3(credentials);

  const path = (upload.prefix || '') + upload.name;
  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: path,
    ContentType: 'application/pdf'
  });

  const result = await generatePdf({uploadTo: url, ...options});

  return new S3UploadResult(path, upload);
}


/**
 * Upload the PDF to S3.
 *
 * Note: It is more efficient to use the generateAndUploadPdf method, which
 * uploads to S3 directly from the PDF service, instead of first downloading
 * and then uploading again.
 *
 * When using DocRaptor, this is the only option for uploading to S3.
 *
 * @param options - S3 details and credentials
 */
export async function uploadToS3(pdf: Buffer | PdfResult, options: S3UploadOptions): Promise<S3UploadResult> {
  const AWS = require('aws-sdk');

  let buffer: Buffer;
  if (pdf instanceof Buffer) {
    buffer = pdf;
  } else {
    buffer = await pdf.toBuffer();
  }

  const bucketName = options.bucket;
  const credentials = options.credentials;
  const s3 = new AWS.S3(credentials);

  const path = (options.prefix || '') + options.name;

  await s3.putObject({
    Bucket: options.bucket,
    Key: path,
    Body: buffer,
    ContentType: 'application/pdf'
  }).promise();

  return new S3UploadResult(path, options, buffer);
}

export class S3UploadResult extends PdfResult {
  readonly path: string;
  readonly name: string;
  readonly bucket: string;
  private readonly s3Options: S3Credentials;

  constructor(path: string, options: S3UploadOptions, buffer?: Buffer) {
    super();
    this.s3Options = options.credentials;
    this.bucket = options.bucket;
    this.path = path;
    this.name = options.name;
    if (buffer) {
      this._buffer = buffer;
    }
  }

  /**
   * Return a signed URL, that can be used in an email for example.
   *
   * @param expiresAfterSeconds - number of seconds after which the URL will expire. Defaults to 7 days.
   */
  getSignedUrl(expiresAfterSeconds?: number) {
    const AWS = require('aws-sdk');

    const bucketName = this.bucket;
    const s3Options = this.s3Options;
    const s3 = new AWS.S3(s3Options);
    const urlExpiresAfterSeconds = expiresAfterSeconds || 86400 * 7;
    const path = this.path;

    const params = {
      Bucket: bucketName,
      Key: path,
      Expires: urlExpiresAfterSeconds
    };

    const url = s3.getSignedUrl('getObject', params);
    return url;
  }

  protected async download(): Promise<Buffer> {
    const pdfResponse = await fetch(this.getSignedUrl(300));
    if (!pdfResponse.ok) {
      throw new Error(pdfResponse.statusText + ": " + await pdfResponse.text());
    }
    return pdfResponse.buffer();
  }
}


export interface S3Credentials {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

export interface S3UploadOptions {
  /**
   * S3 Bucket name
   */
  bucket: string;

  /**
   * Prefix for path on S3
   */
  prefix?: string;

  /**
   * Filename on S3 (including the extension)
   */
  name: string;

  /**
   * S3 credentials
   */
  credentials: S3Credentials;
}
