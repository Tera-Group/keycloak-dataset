import { RefinedResponse, ResponseType } from "k6/http";

import { TaskResponse } from "./responses";

export class DatasetServiceError extends Error {
  public task: TaskResponse;
  public status: number;

  constructor(response: RefinedResponse<ResponseType | undefined>) {
    super(
      `DatasetServiceError: ${response.status} ${response.status_text}: ${response.body}`
    );
    this.task = response.json() as TaskResponse;
    this.status = response.status;
  }
}
