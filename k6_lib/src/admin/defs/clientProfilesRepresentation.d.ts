import type ClientProfileRepresentation from './clientProfileRepresentation.js';
export default interface ClientProfilesRepresentation {
    globalProfiles?: ClientProfileRepresentation[];
    profiles?: ClientProfileRepresentation[];
}
