import { sleep } from "k6";
import http, { RefinedResponse, ResponseType } from "k6/http";
import { URLSearchParams } from "https://jslib.k6.io/url/1.0.0/index.js";

import * as options from "./options";
import { DatasetServiceError } from "./errors";
import { Task, TaskResponse } from "./responses";

export class DatasetClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private url(
    path: string,
    queryParams?: Record<string, string | boolean | number>
  ): string {
    const url = `${this.baseURL}/realms/master/dataset${path}`;
    if (queryParams) {
      return `${url}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(queryParams).map(([k, v]) => [
            camelToKebab(k),
            String(v),
          ])
        )
      ).toString()}`;
    }
    return url;
  }

  private handleError(response: RefinedResponse<ResponseType | undefined>) {
    if (response.status >= 400) {
      throw new DatasetServiceError(response);
    }
  }

  private request(
    method: string,
    path: string,
    queryParams?: Record<string, string | boolean | number>
  ) {
    const res = http.request(method, this.url(path, queryParams));
    console.log(`DatasetClient: ${method} ${path} - ${res.status}`);
    this.handleError(res);
    return res;
  }

  public createRealms(opts?: options.CreateRealmsOptions) {
    const res = this.request("GET", "/create-realms", opts);
    return res.json() as TaskResponse;
  }

  public removeRealms(opts?: options.RemoveRealmsOptions) {
    const res = this.request("GET", "/remove-realms", opts);
    return res.json() as TaskResponse;
  }

  public createClients(opts?: options.CreateClientsOptions) {
    const res = this.request("GET", "/create-clients", opts);
    return res.json() as TaskResponse;
  }

  public createUsers(opts?: options.CreateUsersOptions) {
    const res = this.request("GET", "/create-users", opts);
    return res.json() as TaskResponse;
  }

  public removeUsers(opts?: options.RemoveUsersOptions) {
    const res = this.request("GET", "/remove-users", opts);
    return res.json() as TaskResponse;
  }

  public createEvents(opts?: options.CreateEventsOptions) {
    const res = this.request("GET", "/create-events", opts);
    return res.json() as TaskResponse;
  }

  public createOfflineSessions(opts?: options.CreateOfflineSessionsOptions) {
    const res = this.request("GET", "/create-offline-sessions", opts);
    return res.json() as TaskResponse;
  }

  public getRunningJobStatus(opts?: options.GetRunningJobStatusOptions) {
    const res = this.request("GET", "/status", opts);
    return res.json() as TaskResponse;
  }

  public getCompletedJobStatus(opts?: options.GetCompletedJobStatusOptions) {
    const res = this.request("GET", "/status-completed", opts);
    return res.json() as TaskResponse;
  }

  public clearCompletedJob(opts?: options.ClearCompletedJobOptions) {
    this.request("DELETE", "/status-completed", opts);
    return null;
  }

  public getLastRealm(opts?: options.GetLastRealmOptions) {
    const res = this.request("GET", "/last-realm", opts);
    return res.json() as TaskResponse;
  }

  public getLastClient(opts?: options.GetLastClientOptions) {
    const res = this.request("GET", "/last-client", opts);
    return res.json() as TaskResponse;
  }

  public getLastUser(opts?: options.GetLastUserOptions) {
    const res = this.request("GET", "/last-user", opts);
    return res.json() as TaskResponse;
  }

  public createAuthzResources(opts?: options.CreateAuthzResources) {
    const res = this.request("GET", "/authz/create-resources", opts);
    return res.json() as TaskResponse;
  }

  public waitForTaskToComplete(
    createdTask: TaskResponse,
    opts?: options.PollingOptions
  ): Task {
    if (!createdTask.task?.message) {
      throw new Error(
        `can't extract task message from response ${JSON.stringify(
          createdTask
        )}`
      );
    }
    const expectingTask = createdTask.task?.message as string;
    const pollIntervalSeconds = opts?.pollIntervalSeconds
      ? opts.pollIntervalSeconds
      : 1;
    const maxRetries = opts?.maxRetries ? opts.maxRetries : 60;
    for (let i = 0; i < maxRetries; i++) {
      const job = this.getRunningJobStatus();
      if (job.status === "Task in progress") {
        if (job.task?.message !== expectingTask) {
          throw new Error(
            `expected current task to be ${JSON.stringify(
              expectingTask
            )}, found ${JSON.stringify(job.task?.message)} instead`
          );
        }
        sleep(pollIntervalSeconds);
      } else if (
        job.status === "No task in progress. New task can be started"
      ) {
        const completedJob = this.getCompletedJobStatus();
        if (completedJob.task?.message !== expectingTask) {
          throw new Error(
            `expected completed task to be ${JSON.stringify(
              expectingTask
            )}, found ${JSON.stringify(job.task?.message)} instead`
          );
        }
        if (completedJob.task.success === "false") {
          throw new Error(`task failed: ${JSON.stringify(completedJob.task)}`);
        }
        this.clearCompletedJob();
        return completedJob.task;
      } else {
        throw new Error(`unexpeted job status ${JSON.stringify(job.status)}`);
      }
    }
    throw new Error(
      `timeout waiting for task ${JSON.stringify(expectingTask)} to finish`
    );
  }
}

function camelToKebab(str: string) {
  if (str != str.toLowerCase()) {
    str = str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  }
  return str;
}
