import {
  describe,
  expect,
} from "https://jslib.k6.io/k6chaijs/4.3.4.1/index.js";

import { Client, KeycloakAdminClient } from "../build/index.js";

export function clientTestSuite(data) {
  const baseURL = "http://localhost:9292";
  const client = new Client(baseURL);
  const realmName = "my-realm";
  const adminClient = KeycloakAdminClient.authenticate(
    baseURL,
    "admin",
    "admin"
  );

  describe("createUsers", () => {
    adminClient.createRealm({
      realm: realmName,
      enabled: true,
      registrationAllowed: true,
      resetPasswordAllowed: true,
    });
    expect(adminClient.getUsersCount(realmName)).to.equal(0);

    client.waitForTaskToComplete(
      client.createUsers({
        count: 1000,
        userPrefix: "test-user",
        realmName,
      })
    );

    expect(adminClient.getUsersCount(realmName)).to.equal(1000);
  });
}
