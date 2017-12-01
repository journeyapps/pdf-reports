import { generatePdf, PdfGeneratorOptions, PdfResult } from "./pdf";
import fetch from "node-fetch";


/**
 * Generate a PDF and upload to S3.
 *
 * @param options - pdf options
 * @param upload - s3 options
 */
export async function generateAndUploadPdf(options: PdfGeneratorOptions, upload: S3UploadOptions) {
  const AWS = require('aws-sdk');

  const bucketName = upload.bucket;
  const s3Options = upload.s3Options;
  const s3 = new AWS.S3(s3Options);

  const path = (upload.prefix || '') + upload.name;
  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: path,
    ContentType: 'application/pdf'
  });

  const result = await generatePdf({uploadTo: url, ...options});

  return new S3UploadResult(path, upload);
}


export class S3UploadResult extends PdfResult {
  readonly path: string;
  readonly name: string;
  readonly bucket: string;
  private readonly s3Options: S3Options;

  constructor(path: string, options: S3UploadOptions) {
    super();
    this.bucket = options.bucket;
    this.path = path;
    this.name = options.name;
  }

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


export interface S3Options {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
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
  s3Options: S3Options;
}
