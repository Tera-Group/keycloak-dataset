import http, { RefinedResponse, ResponseType } from "k6/http";
import { URLSearchParams } from "https://jslib.k6.io/url/1.0.0/index.js";

import ClientRepresentation from "./defs/clientRepresentation";
import RoleRepresentation from "./defs/roleRepresentation";
import { AdminAPIError } from "./errors";
import GroupRepresentation from "./defs/groupRepresentation";
import UserRepresentation from "./defs/userRepresentation";
import RealmRepresentation from "./defs/realmRepresentation";

export class KeycloakAdminClient {
  private baseURL: string;
  private accessToken: string;

  constructor(baseURL: string, accessToken: string) {
    this.baseURL = baseURL;
    this.accessToken = accessToken;
  }

  public static authenticate(
    baseURL: string,
    username: string,
    password: string
  ): KeycloakAdminClient {
    const accessToken = authenticateKeycloakAdmin(baseURL, username, password);
    return new KeycloakAdminClient(baseURL, accessToken);
  }

  private headers(isJSON: boolean) {
    const result: { [name: string]: string } = {
      Authorization: "Bearer " + this.accessToken,
    };
    if (isJSON) {
      result["Content-Type"] = "application/json";
    }
    return result;
  }

  private handleError(response: RefinedResponse<ResponseType | undefined>) {
    if (response.status >= 400) {
      throw new AdminAPIError(response);
    }
  }

  private request(method: string, path: string, jsonObj?: any) {
    const res = http.request(
      method,
      this.baseURL + path,
      JSON.stringify(jsonObj),
      {
        headers: this.headers(!!jsonObj),
      }
    );
    console.debug(`[KeycloakAdminClient] ${method} ${path} - ${res.status}`);
    this.handleError(res);
    return res;
  }

  public createRealm(realm: RealmRepresentation) {
    this.request("POST", `/admin/realms/`, realm);
    return null;
  }

  public createClient(realm: string, client: ClientRepresentation) {
    this.request("POST", `/admin/realms/${realm}/clients`, client);
    return null;
  }

  public listClients(realm: string, query?: ClientQuery) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/clients${this.encodeQuery(query)}`
    );
    return res.json() as ClientRepresentation[];
  }

  public fetchClientsByClientId(realm: string, clientIds: string[]) {
    const clients = this.listClients(realm);
    const result: { [key: string]: ClientRepresentation } = {};
    const idSet = new Set(clientIds);
    for (let client of clients) {
      if (idSet.has(client.clientId as string)) {
        result[client.clientId as string] = client;
      }
    }
    return result;
  }

  public createClientRole(
    realm: string,
    clientId: string,
    role: RoleRepresentation
  ) {
    this.request(
      "POST",
      `/admin/realms/${realm}/clients/${clientId}/roles`,
      role
    );
    return null;
  }

  public listClientRoles(realm: string, clientId: string) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/clients/${clientId}/roles`
    );
    return res.json() as RoleRepresentation[];
  }

  public addClientRolesToUser(
    realm: string,
    userId: string,
    clientId: string,
    roles: RoleRepresentation[]
  ) {
    this.request(
      "POST",
      `/admin/realms/${realm}/users/${userId}/role-mappings/clients/${clientId}`,
      roles
    );
    return null;
  }

  public listUserClientRoles(realm: string, userId: string, clientId: string) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/users/${userId}/role-mappings/clients/${clientId}`
    );
    return res.json() as RoleRepresentation[];
  }

  public listUserRealmRoles(realm: string, userId: string) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/users/${userId}/role-mappings/realm`
    );
    return res.json() as RoleRepresentation[];
  }

  public listUserGroups(realm: string, userId: string, query?: GroupQuery) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/users/${userId}/groups${this.encodeQuery(query)}`
    );
    return res.json() as GroupRepresentation[];
  }

  public createRealmRole(realm: string, role: RoleRepresentation) {
    this.request("POST", `/admin/realms/${realm}/roles`, role);
    return null;
  }

  public createGroup(realm: string, group: GroupRepresentation) {
    this.request("POST", `/admin/realms/${realm}/groups`, group);
    return null;
  }

  public listGroups(realm: string, query?: GroupQuery) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/groups${this.encodeQuery(query)}`
    );
    return res.json() as GroupRepresentation[];
  }

  public getUsersCount(realm: string, query?: UserQuery) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/users/count${this.encodeQuery(query)}`
    );
    return res.json() as number;
  }

  public listUsers(realm: string, query?: UserQuery) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/users${this.encodeQuery(query)}`
    );
    return res.json() as UserRepresentation[];
  }

  private encodeQuery(query?: {
    [key: string]: string | number | boolean | undefined;
  }) {
    if (!query) {
      return "";
    }
    return `?${new URLSearchParams(
      Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)]))
    ).toString()}`;
  }
}

export interface UserQuery {
  email?: string;
  first?: number;
  firstName?: string;
  lastName?: string;
  max?: number;
  search?: string;
  username?: string;
  exact?: boolean;
  [key: string]: string | number | undefined | boolean;
}

export interface ClientQuery {
  clientId?: string;
  first?: number;
  max?: number;
  q?: string;
  search?: boolean;
  viewableOnly?: boolean;
  [key: string]: string | number | undefined | boolean;
}

export interface GroupQuery {
  briefRepresentation?: boolean;
  first?: number;
  max?: number;
  search?: string;
  [key: string]: string | number | undefined | boolean;
}

const authenticateKeycloakAdmin = (
  baseURL: string,
  username: string,
  password: string
) => {
  let res = http.get(`${baseURL}/realms/master/.well-known/uma2-configuration`);
  const discovery = res.json() as { token_endpoint: string };
  res = http.post(
    discovery["token_endpoint"],
    {
      grant_type: "password",
      username,
      password,
      client_id: "admin-cli",
    },
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return (res.json() as { access_token: string })["access_token"];
};
