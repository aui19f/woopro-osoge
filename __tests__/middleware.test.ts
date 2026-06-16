/**
 * 실행: pnpm --filter osoge test:middleware
 * 또는: cd apps/osoge && npx tsx __tests__/middleware.test.ts
 */
import assert from "node:assert/strict";
import {
  getRoleFromUser,
  getRequiredRole,
  ROLE_DASHBOARDS,
  PUBLIC_AUTH_PATHS,
} from "../middleware.utils";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${(e as Error).message}`);
    failed++;
  }
}

// ----------------------------------------------------------------
// getRoleFromUser
// ----------------------------------------------------------------
console.log("\n[ getRoleFromUser ]");

test("null 유저 → null", () => {
  assert.equal(getRoleFromUser(null), null);
});

test("app_metadata 없는 유저 → null", () => {
  assert.equal(getRoleFromUser({}), null);
});

test("알 수 없는 role → null", () => {
  assert.equal(getRoleFromUser({ app_metadata: { role: "UNKNOWN" } }), null);
});

test("ADMIN (대문자)", () => {
  assert.equal(getRoleFromUser({ app_metadata: { role: "ADMIN" } }), "ADMIN");
});

test("admin (소문자) → ADMIN", () => {
  assert.equal(getRoleFromUser({ app_metadata: { role: "admin" } }), "ADMIN");
});

test("MASTER", () => {
  assert.equal(getRoleFromUser({ app_metadata: { role: "MASTER" } }), "MASTER");
});

test("GUEST", () => {
  assert.equal(getRoleFromUser({ app_metadata: { role: "GUEST" } }), "GUEST");
});

// ----------------------------------------------------------------
// getRequiredRole
// ----------------------------------------------------------------
console.log("\n[ getRequiredRole ]");

test("/admin → ADMIN", () => {
  assert.equal(getRequiredRole("/admin"), "ADMIN");
});

test("/admin/users → ADMIN (prefix 매칭)", () => {
  assert.equal(getRequiredRole("/admin/users"), "ADMIN");
});

test("/master → MASTER", () => {
  assert.equal(getRequiredRole("/master"), "MASTER");
});

test("/master/dashboard → MASTER", () => {
  assert.equal(getRequiredRole("/master/dashboard"), "MASTER");
});

test("/guest → GUEST", () => {
  assert.equal(getRequiredRole("/guest"), "GUEST");
});

test("/login → null (보호되지 않음)", () => {
  assert.equal(getRequiredRole("/login"), null);
});

test("/signup → null", () => {
  assert.equal(getRequiredRole("/signup"), null);
});

test("/apply → null", () => {
  assert.equal(getRequiredRole("/apply"), null);
});

test("/ → null", () => {
  assert.equal(getRequiredRole("/"), null);
});

// ----------------------------------------------------------------
// ROLE_DASHBOARDS
// ----------------------------------------------------------------
console.log("\n[ ROLE_DASHBOARDS ]");

test("ADMIN 대시보드 경로 = /admin", () => {
  assert.equal(ROLE_DASHBOARDS["ADMIN"], "/admin");
});

test("MASTER 대시보드 경로 = /master", () => {
  assert.equal(ROLE_DASHBOARDS["MASTER"], "/master");
});

test("GUEST 대시보드 경로 = /guest", () => {
  assert.equal(ROLE_DASHBOARDS["GUEST"], "/guest");
});

// ----------------------------------------------------------------
// PUBLIC_AUTH_PATHS
// ----------------------------------------------------------------
console.log("\n[ PUBLIC_AUTH_PATHS ]");

test("/login 포함", () => {
  assert.ok(PUBLIC_AUTH_PATHS.includes("/login"));
});

test("/signup 포함", () => {
  assert.ok(PUBLIC_AUTH_PATHS.includes("/signup"));
});

test("/apply 포함", () => {
  assert.ok(PUBLIC_AUTH_PATHS.includes("/apply"));
});

// ----------------------------------------------------------------
// 결과
// ----------------------------------------------------------------
console.log(`\n총 ${passed + failed}개 테스트: ✅ ${passed}개 통과, ❌ ${failed}개 실패\n`);
if (failed > 0) process.exit(1);
