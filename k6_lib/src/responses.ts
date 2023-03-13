export type Task = {
  success: string;
  endTimeMs: string;
  message: string;
  startTimeMs: string;
};

export type TaskResponse = {
  error: string;
  status: string;
  task?: Task;
  "task-status-url": string;
};
