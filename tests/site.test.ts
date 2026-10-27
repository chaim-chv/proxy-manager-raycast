import { describe, expect, test } from "bun:test";
import { siteDecision } from "../src/lib/site";

const targets = [
  { pattern: "*.example.com", enabled: true },
  { pattern: "disabled.test", enabled: false },
];

describe("siteDecision", () => {
  test("an enabled match on live routing is tunneled", () => {
    expect(siteDecision({ host: "api.example.com", targets, appMode: "TARGETS", routingState: "on" })).toEqual({
      state: "tunneled",
      coveredBy: "*.example.com",
    });
  });

  test("a disabled rule does not make the site look tunneled", () => {
    expect(siteDecision({ host: "disabled.test", targets, appMode: null, routingState: "on" })).toEqual({
      state: "uncovered",
      coveredBy: null,
    });
  });

  test("an app rule set to Direct bypasses a matching target", () => {
    expect(siteDecision({ host: "api.example.com", targets, appMode: "DIRECT", routingState: "on" })).toEqual({
      state: "bypassed",
      coveredBy: "*.example.com",
    });
  });

  test("routing off is reported as such, not as tunneled", () => {
    expect(siteDecision({ host: "api.example.com", targets, appMode: "TARGETS", routingState: "off" })).toEqual({
      state: "routing-off",
      coveredBy: "*.example.com",
    });
    expect(
      siteDecision({
        host: "api.example.com",
        targets,
        appMode: "TARGETS",
        routingState: "stopping",
      }).state,
    ).toBe("routing-off");
  });

  test("a degraded listener still counts as tunneled: the rule is in force", () => {
    expect(
      siteDecision({
        host: "api.example.com",
        targets,
        appMode: "TARGETS",
        routingState: "degraded",
      }).state,
    ).toBe("tunneled");
  });
});
