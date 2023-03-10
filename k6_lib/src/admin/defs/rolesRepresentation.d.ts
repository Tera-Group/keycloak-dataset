import type RoleRepresentation from './roleRepresentation.js';
export default interface RolesRepresentation {
    realm?: RoleRepresentation[];
    client?: {
        [index: string]: RoleRepresentation[];
    };
    application?: {
        [index: string]: RoleRepresentation[];
    };
}
