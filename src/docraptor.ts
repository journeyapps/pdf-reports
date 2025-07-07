import { PdfOptions, PdfResult } from './pdf';

var docRaptorToken: string = null;

export function setDocRaptorToken(token: string) {
  docRaptorToken = token;
}

/**
 * Generate a PDF using Docraptor, and download it as a Buffer.
 *
 * @param options - Generic PDF options
 * @param docraptor - Docraptor-specific options
 */
export async function generatePdfDocRaptor(options: DocRaptorGenerateOptions) {
  const docraptor = options.docraptor;
  const apiKey = (docraptor && docraptor.user_credentials) || docRaptorToken;
  const body: DocRaptorOptions = {
    type: 'pdf',
    javascript: true,
    test: options.test || apiKey == null,
    prince_options: {
      no_compress: false
    }
  };
  if (apiKey) {
    body.user_credentials = apiKey;
  }
  if (docraptor && docraptor) {
    Object.assign(body, docraptor);
  }

  if (options.html) {
    body.document_content = options.html;
  } else if (options.url) {
    body.document_url = options.url;
  }

  const response = await fetch('https://docraptor.com/docs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF: ' + response.statusText + '\n' + (await response.text()));
  }

  return new PdfResult(Buffer.from(await response.arrayBuffer()));
}

export interface DocRaptorGenerateOptions extends PdfOptions {
  docraptor?: DocRaptorOptions;
}

export interface DocRaptorOptions {
  name?: string;
  pipeline?: number;
  prince_options?: any;
  javascript?: boolean;
  ignore_console_messages?: boolean;
  ignore_resource_errors?: boolean;
  strict?: boolean;
  help?: boolean;
  tag?: string;

  // Our library already configures these options
  test?: boolean;
  user_credentials?: string;
  document_content?: string;
  document_url?: string;

  // These options are not supported by us, but we document it anyway
  type?: string;
  referrer?: string;
  async?: boolean;
  callback_url?: string;
}
