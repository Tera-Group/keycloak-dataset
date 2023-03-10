export type CreateRealmsOptions = {
  realmPrefix?: string;
  count?: number;
  realmRolePrefix?: string;
  realmRolesPerRealm?: number;
  clientPrefix?: string;
  clientsPerRealm?: number;
  clientsPerTransaction?: number;
  entriesPerTransaction?: number;
  clientRolePrefix?: string;
  clientAccessType?: string;
  isServiceAccountClient?: boolean;
  clientRolesPerClient?: number;
  groupPrefix?: string;
  groupsPerRealm?: number;
  groupsPerTransaction?: number;
  userPrefix?: string;
  usersPerRealm?: number;
  groupsPerUser?: number;
  realmRolesPerUser?: number;
  clientRolesPerUser?: number;
  passwordHashIterations?: number;
  eventsEnabled?: boolean;
  transactionTimeoutInSeconds?: number;
  threadsCount?: number;
  usersPerTransaction?: number;
  taskTimeout?: number;
};

export type CreateEventsOptions = {
  realmPrefix?: string;
  count?: number;
  transactionTimeoutInSeconds?: number;
  threadsCount?: number;
  taskTimeout?: number;
};

export type CreateOfflineSessionsOptions = {
  realmPrefix?: string;
  clientPrefix?: string;
  count?: number;
  userPrefix?: string;
  transactionTimeoutInSeconds?: number;
  threadsCount?: number;
  taskTimeout?: number;
};

export type RemoveRealmsOptions = {
  realmPrefix?: string;
  removeAll?: boolean;
  firstToRemove?: number;
  lastToRemove?: number;
  transactionTimeoutInSeconds?: number;
  threadsCount?: number;
  taskTimeout?: number;
};

export type GetLastRealmOptions = {
  realmPrefix?: string;
};

export type CreateUsersOptions = {
  realmName?: string;
  clientPrefix?: string;
  realmRolePrefix?: string;
  count?: number;
  clientRolePrefix?: string;
  groupPrefix?: string;
  userPrefix?: string;
  groupsPerUser?: number;
  realmRolesPerUser?: number;
  clientRolesPerUser?: number;
  transactionTimeoutInSeconds?: number;
  threadsCount?: number;
  usersPerTransaction?: number;
  taskTimeout?: number;
  grantRealmRoles?: string;
  grantClientRoles?: string;
  joinGroups?: string;
  attributes?: string;
};

export type RemoveUsersOptions = {
  realmName?: string;
  removeAll?: boolean;
  firstToRemove?: number;
  lastToRemove?: number;
  transactionTimeoutInSeconds?: number;
  threadsCount?: number;
  taskTimeout?: number;
};

export type GetRunningJobStatusOptions = {};

export type GetCompletedJobStatusOptions = {};

export type ClearCompletedJobOptions = {};

export type GetLastClientOptions = {
  realmName?: string;
  clientPrefix?: string;
};

export type GetLastUserOptions = {
  realmName?: string;
  userPrefix?: string;
};

export type CreateAuthzResources = {
  realmName?: string;
  clientId?: string;
  resourcePrefix?: string;
  scopesPerResource?: number;
  scopePrefix?: string;
  usersPerUserPolicy?: number;
  count?: number;
  clientsPerTransaction?: number;
  entriesPerTransaction?: number;
  userPrefix?: string;
  usersPerRealm?: number;
  transactionTimeoutInSeconds?: number;
  threadsCount?: number;
  taskTimeout?: number;
};

export type CreateClientsOptions = {
  realmName?: string;
  count?: number;
  clientPrefix?: string;
  clientsPerTransaction?: number;
  entriesPerTransaction?: number;
  clientRolePrefix?: string;
  clientAccessType?: string;
  isServiceAccountClient?: boolean;
  clientRolesPerClient?: number;
  transactionTimeoutInSeconds?: number;
  threadsCount?: number;
  taskTimeout?: number;
};

export interface PollingOptions {
  pollIntervalSeconds?: number;
  maxRetries?: number;
}
