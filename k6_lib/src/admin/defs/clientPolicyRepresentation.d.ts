import type ClientPolicyConditionRepresentation from './clientPolicyConditionRepresentation.js';
export default interface ClientPolicyRepresentation {
    conditions?: ClientPolicyConditionRepresentation[];
    description?: string;
    enabled?: boolean;
    name?: string;
    profiles?: string[];
}
