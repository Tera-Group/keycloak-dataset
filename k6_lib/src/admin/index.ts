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
    console.log(`KeycloakAdminClient: ${method} ${path}`);
    const res = http.request(
      method,
      this.baseURL + path,
      JSON.stringify(jsonObj),
      {
        headers: this.headers(!!jsonObj),
      }
    );
    this.handleError(res);
    return res;
  }

  public createRealm(realm: RealmRepresentation) {
    this.request("POST", `/admin/realms/`, realm);
    return null;
  }

  public createClient(realm: string, client: ClientRepresentation) {
    const res = this.request("POST", `/admin/realms/${realm}/clients`, client);
    return res.json() as {
      id: string;
    };
  }

  public createClientRole(
    realm: string,
    clientId: string,
    role: RoleRepresentation
  ) {
    const res = this.request(
      "POST",
      `/admin/realms/${realm}/clients/${clientId}/roles`,
      role
    );
    return res.json() as {
      roleName: string;
    };
  }

  public listClientRoles(realm: string, clientId: string) {
    const res = this.request(
      "GET",
      `/admin/realms/${realm}/clients/${clientId}/roles`
    );
    return res.json() as RoleRepresentation[];
  }

  public addClientRoleToUser(
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

  public createRealmRole(realm: string, role: RoleRepresentation) {
    const res = this.request("POST", `/admin/realms/${realm}/roles`, role);
    return res.json() as {
      roleName: string;
    };
  }

  public createGroup(realm: string, group: GroupRepresentation) {
    const res = this.request("POST", `/admin/realms/${realm}/groups`, group);
    return res.json() as {
      id: string;
    };
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
