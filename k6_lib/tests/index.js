import http from "k6/http";
import { chai } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";

import { clientTestSuite } from "./client.js";

chai.config.aggregateChecks = false;
chai.config.logFailures = true;

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 300 }));

export const options = {
  thresholds: {
    http_req_failed: ["rate == 0"],
  },
};

export default function testSuite(data) {
  clientTestSuite(data);
}
