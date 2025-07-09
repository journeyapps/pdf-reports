const globalFetch = globalThis.fetch;

export class FetchResponse extends Response {
  constructor(protected response: Response) {
    super(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  async buffer(): Promise<Buffer> {
    return Buffer.from(await this.response.arrayBuffer());
  }
}

export async function fetch(input: string | URL | globalThis.Request, init?: RequestInit): Promise<FetchResponse> {
  // This is the native node fetch
  const response: Response = await globalFetch(input, init);

  return new FetchResponse(response);
}
