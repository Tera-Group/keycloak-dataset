# Keycloak-dataset

This library manages test data for benchmark purpose. It consists of a Keycloak extension written in Java and a K6 client library. The Keycloak extension is a fork of the [keycloak-benchmark/dataset](https://github.com/keycloak/keycloak-benchmark/tree/main/dataset) module to make it more useful to performance test a system end-to-end, not just Keycloak.

## Installation

1. Install the Keycloak extension.

   ```bash
   cd ${KC_HOME_DIR}/providers/ && { curl -O https://github.com/Tera-Group/keycloak-dataset/releases/download/20.0.0/keycloak-benchmark-dataset-20.0.0.jar ; cd -; }
   ${KC_HOME_DIR}/bin/kc.sh build
   ```

## Usage

1. In realm master, create a confidential client named "keycloak-dataset" with
   "authorization service" enabled. Note this client's secret.
2. Use the k6 library in your load test scripts

   ```javascript
   import { DatasetClient } from "https://cdn.jsdelivr.net/npm/@teravn/k6-keycloak-dataset@20.0.0/dist/index.js";

   const client = DatasetClient.authenticate(baseURL, __ENV.KEYCLOAK_DATASET_CLIENT_SECRET);

   export function setup() {
     // create some test users
     client.waitForTaskToComplete(
       client.createUsers({
         count: 1000,
         userPrefix: "test-user",
         realmName: "my-realm",
         grantClientRoles: "client1:role1;client1:role4;client2:role6",
         grantRealmRoles: "role2;role3",
         joinGroups: "group1;group2",
         attributes: "phoneNo:12345678;address:123 3rd street",
       })
     );
   }

   export function teardown(data) {
     // drop all test users
     client.waitForTaskToComplete(
       client.removeUsers({
         realmName: "my-realm",
         userPrefix: "test-user",
         removeAll: true,
       })
     );
   }

   ...
   ```

## Documentation

Most functionalities are inherited from the [keycloak-benchmark/dataset](https://github.com/keycloak/keycloak-benchmark/tree/main/dataset) module. Learn more [here](https://www.keycloak.org/keycloak-benchmark/dataset-guide/latest/).

### Notable changes:

- **Security**: this extension now requires credentials of the client "keycloak-dataset" in "master" realm as an extra layer of security. Note that it is still not a good idea to install it in production environment.
- **Creating users**: The following query parameters are introduced to the path `/create-users`:
  - `grant-realm-roles`: realm roles to grant each user in the format "<role1>;<role2>". Note that in contrast with `realm-roles-per-realm` and `realm-roles-per-user`, the roles specified are not auto-generated and are expected to already exist.
  - `grant-client-roles`: client roles to grant each user in the format "<client1>:<role1>;<client2>:<role2>". Similarly, these client roles are expected to already exist.
  - `join-groups`: groups to add each user to, in the format "<group1>;<group2>". In the same way, these groups expected to already exist.
  - `attributes`: attributes to give each user in the format "<key1>:<value1>;<key2>:<value2>". Note that each key could repeat as it is possible for a key to have multiple values.
- **Removing users**: The new endpoint `/remove-users` is introduced to selectively remove users from a realm. It supports the following query params:
  - `remove-all`: remove all matching users
  - `first-to-remove`: first user index to remove. Use this in combination with `last-to-remove`. For example if "first-to-remove" is 30 and "last-to-remove" is 40, then users "user30", "user31", ... , "user39" will be deleted
  - `last-to-remove`: see above
  - `realm-name`: *required*, the realm to remove users from
  - `user-prefix`: *required*, username prefix of users to remove
  - `transaction-timeout`: timeout in seconds for transactions for removing objects. Default value is 300.
  - `users-per-transaction`: count of users removed per transaction. Default value is 10.
  - `threads-count`: number of threads used to remove users. Default value is 5.
  - `task-timeout`: timeout in seconds for the entire task. Default value is 3600.

## Keycloak version compatibility

The Keycloak extension and the k6 library are versioned independently using semver. However, both major and minor versions must match for them to be compatible. E.g. keycloak extension v20.0.x will be compatible with k6 library v20.0.y but not v20.1.z.

Both packages are compatible with any Keycloak version that share the same major version.