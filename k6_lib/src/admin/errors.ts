import { RefinedResponse, ResponseType } from "k6/http";

export class AdminAPIError extends Error {
  public body: string;
  public status: number;

  constructor(response: RefinedResponse<ResponseType | undefined>) {
    super(
      `AdminAPIError: ${response.status} ${response.status_text}: ${response.body}`
    );
    this.body = response.body as string;
    this.status = response.status;
  }
}
