# AZcaptcha SDK specification

Single source of truth for the seven official SDKs
(`azcaptcha/azcaptcha-{python,php,javascript,go,java,csharp,ruby}`).

Shared spec version: **spec-v1.0.0** (all SDKs release 1.0.0 against it).

## Contents
- [`spec/api-contract.md`](spec/api-contract.md) — endpoints, parameters,
  polling rules, timeouts, soft id.
- [`spec/errors.json`](spec/errors.json) — every API error code with
  `category` and `retryable`, generated into each SDK.
- [`spec/fixtures/`](spec/fixtures/) — recorded request/response pairs every SDK
  replays in CI. A fixture change is a spec change.
- [`template/`](template/) — repo boilerplate copied when a new SDK starts.
- [`docs/runbook.md`](docs/runbook.md) — registry accounts, tokens, release
  steps (phase 6 of the plan).
- [`scripts/verify-fixtures.mjs`](scripts/verify-fixtures.mjs) — CI check:
  fixtures match the schema and only use codes present in `errors.json`.

## Change process
1. Open an issue here describing the API change.
2. Update `spec/` + version (semver).
3. Open issues in each SDK repo referencing the spec version.
4. SDKs release within 2 weeks of a minor spec bump.

## Versioning
`spec-vMAJOR.MINOR.PATCH`, independent from SDK patch releases. All SDKs ship
`1.0.0` against `spec-v1.0.0`; the next breaking contract change bumps both.

## License
MIT — see [LICENSE](LICENSE).
