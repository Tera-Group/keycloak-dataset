import type RoleRepresentation from './roleRepresentation.js';
export default interface MappingsRepresentation {
    clientMappings?: Record<string, any>;
    realmMappings?: RoleRepresentation[];
}
