import {
  describe,
  expect,
} from "https://jslib.k6.io/k6chaijs/4.3.4.1/index.js";

import { DatasetClient, KeycloakAdminClient } from "../dist/index.js";

export function clientTestSuite(data) {
  const baseURL = "http://localhost:9292";
  const realmName = "my-realm";
  const adminClient = KeycloakAdminClient.authenticate(
    baseURL,
    "admin",
    "admin"
  );

  adminClient.createClient("master", {
    id: "keycloak-dataset",
    name: "keycloak-dataset",
    enabled: true,
    serviceAccountsEnabled: true,
    authorizationServicesEnabled: true,
    publicClient: false,
    clientAuthenticatorType: "client-secret",
    secret: "keycloak-dataset",
  });
  const client = DatasetClient.authenticate(baseURL, "keycloak-dataset");

  describe("createUsers", () => {
    adminClient.createRealm({
      realm: realmName,
      enabled: true,
      registrationAllowed: true,
      resetPasswordAllowed: true,
    });

    adminClient.createRealmRole(realmName, { name: "role2" });
    adminClient.createRealmRole(realmName, { name: "role3" });

    adminClient.createGroup(realmName, { name: "group1" });
    adminClient.createGroup(realmName, { name: "group2" });

    adminClient.createClient(realmName, {
      id: "client1",
      name: "client1",
      enabled: true,
      standardFlowEnabled: true,
      directAccessGrantsEnabled: true,
      bearerOnly: false,
      serviceAccountsEnabled: true,
      authorizationServicesEnabled: true,
      publicClient: false,
    });
    adminClient.createClient(realmName, {
      id: "client2",
      name: "client2",
      enabled: true,
      standardFlowEnabled: true,
      directAccessGrantsEnabled: true,
      bearerOnly: false,
      serviceAccountsEnabled: true,
      authorizationServicesEnabled: true,
      publicClient: false,
    });
    const { client1, client2 } = adminClient.fetchClientsByClientId(realmName, [
      "client1",
      "client2",
    ]);
    adminClient.createClientRole(realmName, client1.id, {
      name: "role1",
    });
    adminClient.createClientRole(realmName, client1.id, {
      name: "role4",
    });

    adminClient.createClientRole(realmName, client2.id, {
      name: "role5",
    });
    adminClient.createClientRole(realmName, client2.id, {
      name: "role6",
    });

    expect(adminClient.getUsersCount(realmName)).to.equal(0);

    client.waitForTaskToComplete(
      client.createUsers({
        count: 1000,
        userPrefix: "test-user",
        realmName,
        grantClientRoles: "client1:role1;client1:role4;client2:role6",
        grantRealmRoles: "role2;role3",
        joinGroups: "group1;group2",
        attributes: "phoneNo:12345678;address:123 3rd street",
      })
    );

    expect(adminClient.getUsersCount(realmName)).to.equal(1000);

    const users = adminClient.listUsers(realmName, { max: 1 });
    expect(users[0].firstName).to.match(/^test-user\d+-first$/);
    expect(users[0].lastName).to.match(/^test-user\d+-last$/);
    expect(users[0].email).to.match(/^test-user\d+@my-realm\.com$/);
    expect(users[0].username).to.match(/^test-user\d+$/);
    expect(users[0].attributes).to.deep.equal({
      phoneNo: ["12345678"],
      address: ["123 3rd street"],
    });

    const client1Roles = adminClient.listUserClientRoles(
      realmName,
      users[0].id,
      client1.id
    );
    expect(client1Roles.map((c) => c.name).sort()).to.deep.equal([
      "role1",
      "role4",
    ]);
    const client2Roles = adminClient.listUserClientRoles(
      realmName,
      users[0].id,
      client2.id
    );
    expect(client2Roles.map((c) => c.name).sort()).to.deep.equal(["role6"]);

    const realmRoles = adminClient.listUserRealmRoles(realmName, users[0].id);
    expect(realmRoles.map((r) => r.name).sort()).to.deep.equal([
      "default-roles-my-realm",
      "role2",
      "role3",
    ]);

    const groups = adminClient.listUserGroups(realmName, users[0].id);
    expect(groups.map((g) => g.name).sort()).to.deep.equal([
      "group1",
      "group2",
    ]);
  });

  describe("removeUsers", () => {
    client.waitForTaskToComplete(
      client.removeUsers({
        realmName,
        userPrefix: "test-user",
        firstToRemove: 100,
        lastToRemove: 200,
      })
    );

    expect(adminClient.getUsersCount(realmName)).to.equal(900);

    client.waitForTaskToComplete(
      client.createUsers({
        count: 200,
        userPrefix: "test2-user",
        realmName,
      })
    );

    expect(adminClient.getUsersCount(realmName)).to.equal(1100);

    // ensure it is only removing users with correct prefix
    client.waitForTaskToComplete(
      client.removeUsers({
        realmName,
        userPrefix: "test-user",
        removeAll: true,
      })
    );

    expect(adminClient.getUsersCount(realmName)).to.equal(200);
  });
}
