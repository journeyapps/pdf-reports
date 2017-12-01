import fetch from "node-fetch";

var globalToken: string = null;

export function setApiToken(token: string) {
  globalToken = token;
}

/**
 * Generate a PDF.
 *
 * @param options - PDF options
 */
export async function generatePdf(options: PdfGeneratorOptions) {
  const token = options.token || globalToken;
  if (token == null) {
    throw new Error('token is required');
  }

  const url = options.url || getUrl(options.region);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF: ' + response.statusText + "\n" + await response.text());
  }

  return new PdfResult(await response.json());
}

function autoRegion() {
  const awsRegion = process.env.AWS_REGION;
  if (/^us/.test(awsRegion)) {
    return 'us';
  } else if(/^eu/.test(awsRegion)) {
    return 'eu';
  } else if(/^ap/.test(awsRegion)) {
    return 'ap';
  } else {
    // Default to 'us'.
    return 'us';
  }
}

function getUrl(region?: string) {
  if (region == null) {
    region = autoRegion();
  }
  return `https://pdf-${region}.journeyapps.com/v1/generate-pdf`;
}


export class PdfResult {
  private _buffer: Buffer;

  constructor(buffer?: Buffer) {
    this._buffer = buffer;
  }

  async toBuffer(): Promise<Buffer> {
    if (!this._buffer) {
      this._buffer = await this.download();
    }

    return this._buffer;
  }

  async toBase64(): Promise<string> {
    return (await this.toBuffer()).toString('base64');
  }

  async toEmailAttachment(name: string) {
    return {
      content: await this.toBase64(),
      filename: name,
      type: 'application/pdf',
      disposition: 'attachment'
    };
  }

  protected async download(): Promise<Buffer> {
    throw new Error('Cannot download');
  }
}

export class GeneratedPdfResult {
  readonly location: string;

  constructor(location: string) {
    this.location = location;
  }

  protected async download() {
    const pdfResponse = await fetch(this.location);
    if (!pdfResponse.ok) {
      throw new Error(pdfResponse.statusText + ": " + await pdfResponse.text());
    }
    return pdfResponse.buffer();
  }
}



export interface PrintSetup {
  landscape?: boolean;
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
  scale?: number;
  paperWidth?: number;
  paperHeight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  pageRanges?: string;
}

export interface PdfOptions {
  url?: string;
  html?: string;
  test?: boolean;
}

export interface PdfGeneratorOptions extends PdfOptions {
  /**
   * Print layout options.
   */
  print?: PrintSetup;
  uploadTo?: string;

  /**
   * API Token. Required if a global token is not set.
   */
  token?: string;

  /**
   * Service region ('us', 'eu' or 'au')
   */
  region?: string;

  /**
   * Custom URL for the PDF service.
   */
  url?: string;
}
