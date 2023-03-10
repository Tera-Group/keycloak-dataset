import type ClientPolicyExecutorRepresentation from './clientPolicyExecutorRepresentation.js';
export default interface ClientProfileRepresentation {
    description?: string;
    executors?: ClientPolicyExecutorRepresentation[];
    name?: string;
}
