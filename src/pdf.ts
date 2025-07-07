var globalToken: string = null;

export function setApiToken(token: string) {
  globalToken = token;
}

/**
 * Generate a PDF.
 *
 * @param options - PDF options
 */
export async function generatePdf(options: PdfGeneratorOptions): Promise<PdfResult> {
  const token = options.token || globalToken;
  if (token == null) {
    throw new Error('token is required');
  }

  const url = options.serviceUrl || getUrl(options);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF: ' + response.statusText + '\n' + (await response.text()));
  }

  const { location } = (await response.json()) as { location: string };
  return new GeneratedPdfResult(location);
}

function autoRegion() {
  const awsRegion = process.env.AWS_REGION;
  if (/^us/.test(awsRegion)) {
    return 'us';
  } else if (/^eu/.test(awsRegion)) {
    return 'eu';
  } else if (/^ap/.test(awsRegion)) {
    return 'ap';
  } else {
    // Default to 'us'.
    return 'us';
  }
}

function getUrl(options?: { region?: string; version?: string }) {
  const region = options?.region ?? autoRegion();
  const version = options?.version ?? 'v3';
  return `https://pdf-${region}.journeyapps.com/${version}/generate-pdf`;
}

/**
 * Class represening the result of a generated PDF.
 *
 * Depending on the method used to generate the DPF, the buffer may be
 * in memory already, or may have to be downloaded first.
 */
export class PdfResult {
  protected _buffer: Buffer;

  constructor(buffer?: Buffer) {
    this._buffer = buffer;
  }

  /**
   * Return a Buffer with the PDF data.
   *
   * The data is downloaded if required.
   */
  async toBuffer(): Promise<Buffer> {
    if (!this._buffer) {
      this._buffer = await this.download();
      if (!(this._buffer instanceof Buffer)) {
        throw new Error('Not a buffer!');
      }
    }

    return this._buffer;
  }

  /**
   * Same as toBuffer(), but converts the data to a base64-encoded string.
   */
  async toBase64(): Promise<string> {
    return (await this.toBuffer()).toString('base64');
  }

  /**
   * Formats the generated for inclusion in an email as an attachment.
   *
   * @param name - the name for the file
   */
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

export class GeneratedPdfResult extends PdfResult {
  readonly location: string;

  constructor(location: string) {
    super();
    this.location = location;
  }

  protected async download() {
    const pdfResponse = await fetch(this.location);
    if (!pdfResponse.ok) {
      throw new Error(pdfResponse.statusText + ': ' + (await pdfResponse.text()));
    }
    return Buffer.from(await pdfResponse.arrayBuffer());
  }
}

export interface PrintSetup {
  landscape?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
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
   * PDF service version, defaults to v3.
   */
  version?: string;

  /**
   * Custom URL for the PDF service.
   */
  serviceUrl?: string;
}
