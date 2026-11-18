#!/usr/bin/env node
/**
 * Verify spec/fixtures against spec/errors.json.
 * A fixture may only reference error codes that exist in the taxonomy, must
 * match the current spec version, and must not contain live credentials.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const taxonomy = JSON.parse(readFileSync(join(ROOT, "spec/errors.json"), "utf8"));
const valid = new Set([
    ...Object.keys(taxonomy.errors || {}),
    ...Object.keys(taxonomy.envelope_codes || {}),
]);

const dir = join(ROOT, "spec/fixtures");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
let failed = 0;

for (const file of files) {
    const fx = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const problems = [];
    if (fx.spec !== taxonomy.spec) problems.push(`spec ${fx.spec} != ${taxonomy.spec}`);
    if (!fx.name || !fx.request || !fx.response) problems.push("missing name/request/response");

    const body = JSON.stringify(fx);
    for (const m of body.matchAll(/(ERROR_[A-Z0-9_]+)/g)) {
        if (!valid.has(m[1])) problems.push(`unknown code ${m[1]}`);
    }
    for (const m of body.matchAll(/"request":\s*"([A-Z_]{6,})"/g)) {
        const code = m[1];
        if (code !== "CAPCHA_NOT_READY" && !valid.has(code) && !code.startsWith("03AG")) {
            problems.push(`unclassified response token ${code}`);
        }
    }
    if (/"key"|"clientKey"/.test(body) && /"key":\s*"(?!REDACTED)[^"]{20,}"/.test(body)) {
        problems.push("looks like a live key (expected REDACTED)");
    }

    if (problems.length) {
        failed++;
        console.error(`FAIL ${file}: ${problems.join("; ")}`);
    } else {
        console.log(`ok   ${file}`);
    }
}

if (failed) {
    console.error(`${failed} fixture(s) invalid`);
    process.exit(1);
}
console.log(`${files.length} fixtures valid against ${taxonomy.spec}`);
