import type AuthenticationExecutionExportRepresentation from './authenticationExecutionExportRepresentation.js';
export default interface AuthenticationFlowRepresentation {
    id?: string;
    alias?: string;
    description?: string;
    providerId?: string;
    topLevel?: boolean;
    builtIn?: boolean;
    authenticationExecutions?: AuthenticationExecutionExportRepresentation[];
}
