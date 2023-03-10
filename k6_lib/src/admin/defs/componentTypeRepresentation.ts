import type { ConfigPropertyRepresentation } from './configPropertyRepresentation.js';
export default interface ComponentTypeRepresentation {
    id: string;
    helpText: string;
    properties: ConfigPropertyRepresentation[];
    metadata: {
        [index: string]: any;
    };
}
