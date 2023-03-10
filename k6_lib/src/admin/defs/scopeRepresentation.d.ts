import type PolicyRepresentation from './policyRepresentation.js';
import type ResourceRepresentation from './resourceRepresentation.js';
export default interface ScopeRepresentation {
    displayName?: string;
    iconUri?: string;
    id?: string;
    name?: string;
    policies?: PolicyRepresentation[];
    resources?: ResourceRepresentation[];
}
