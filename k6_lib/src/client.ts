import { sleep } from "k6";
import http, { RefinedResponse, ResponseType } from "k6/http";
import { URLSearchParams } from "https://jslib.k6.io/url/1.0.0/index.js";

import * as options from "./options";
import { DatasetServiceError } from "./errors";
import { Task, TaskResponse } from "./responses";

export class Client {
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

  public createRealms(opts?: options.CreateRealmsOptions) {
    const res = http.request("GET", this.url("/create-realms", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public removeRealms(opts?: options.RemoveRealmsOptions) {
    const res = http.request("GET", this.url("/remove-realms", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public createClients(opts?: options.CreateClientsOptions) {
    const res = http.request("GET", this.url("/create-clients", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public createUsers(opts?: options.CreateUsersOptions) {
    const res = http.request("GET", this.url("/create-users", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public removeUsers(opts?: options.RemoveUsersOptions) {
    const res = http.request("GET", this.url("/remove-users", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public createEvents(opts?: options.CreateEventsOptions) {
    const res = http.request("GET", this.url("/create-events", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public createOfflineSessions(opts?: options.CreateOfflineSessionsOptions) {
    const res = http.request("GET", this.url("/create-offline-sessions", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public getRunningJobStatus(opts?: options.GetRunningJobStatusOptions) {
    const res = http.request("GET", this.url("/status", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public getCompletedJobStatus(opts?: options.GetCompletedJobStatusOptions) {
    const res = http.request("GET", this.url("/status-completed", opts));
    this.handleError(res);
    console.log({ body: res.body, status: res.status });
    return res.json() as TaskResponse;
  }

  public clearCompletedJob(opts?: options.ClearCompletedJobOptions) {
    const res = http.request("DELETE", this.url("/status-completed", opts));
    this.handleError(res);
    return null;
  }

  public getLastRealm(opts?: options.GetLastRealmOptions) {
    const res = http.request("GET", this.url("/last-realm", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public getLastClient(opts?: options.GetLastClientOptions) {
    const res = http.request("GET", this.url("/last-client", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public getLastUser(opts?: options.GetLastUserOptions) {
    const res = http.request("GET", this.url("/last-user", opts));
    this.handleError(res);
    return res.json() as TaskResponse;
  }

  public createAuthzResources(opts?: options.CreateAuthzResources) {
    const res = http.request("GET", this.url("/authz/create-resources", opts));
    this.handleError(res);
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
