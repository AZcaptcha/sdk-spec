# SDK release runbook

Decisions taken 2026-11-18:
- **Namespace**: the GitHub account `azcaptcha` (owned by us). An org named
  `azcaptcha` cannot be created because that name is already this user account;
  a user namespace serves repos, packages and Go module paths identically.
- **Shared version**: every SDK ships `1.0.0` against `spec-v1.0.0`; contract
  changes bump the spec, SDK patch releases stay independent.
- **C++**: deferred. Revisit only if issue/demand data justifies it.

## 0. Authenticate as the azcaptcha account
`gh auth login` → GitHub.com → choose the **azcaptcha** account (or export a PAT
with `repo`, `workflow`, `write:packages`). Verify:
```bash
gh api user --jq .login   # must print azcaptcha
```

## 1. Create the repos
```bash
for r in sdk-spec azcaptcha-python azcaptcha-php azcaptcha-javascript \
         azcaptcha-go azcaptcha-java azcaptcha-csharp azcaptcha-ruby; do
  gh repo create azcaptcha/$r --public --description "AZcaptcha SDK: $r" \
    --license MIT --add-readme=false || true
done
```
Push `sdk-spec` first, tag it, then the SDK repos.

## 2. Registry accounts and secrets

| Registry | Account step | Secret | Rotation |
|---|---|---|---|
| PyPI | pypi.org → Publishing → pending trusted publisher for `azcaptcha`, workflow `release.yml`, env `pypi` | none (OIDC) | — |
| Packagist | submit repo URL, install GitHub App | none | — |
| npm | org `@azcaptcha`; granular token, publish scope | `NPM_TOKEN` | 90d |
| NuGet | API key glob `AZcaptcha.Sdk`, push permission | `NUGET_API_KEY` | 365d |
| Maven Central | central.sonatype.com namespace `io.azcaptcha`; DNS TXT `_mavencentral-challenge.io.azcaptcha`; GPG key; portal user token | `MAVEN_USERNAME`, `MAVEN_PASSWORD`, `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE` | GPG 2y, token yearly |
| RubyGems | API key scope push_rubygem, MFA on | `RUBYGEMS_API_KEY` | 90d |
| Go | nothing — push tag `v1.0.0` | none | never re-tag |

`gh secret set NAME -R azcaptcha/<repo>` for each.

## 3. Release order
1. `sdk-spec` → tag `spec-v1.0.0`.
2. python → php → javascript → go → java → csharp → ruby (each tag `v1.0.0`).
3. After every SDK is live, enable `/lang` pages in the website (plan phase 7).

## 4. Pre-tag checklist (per SDK)
- [ ] fixture suite green (copied from `spec/fixtures`)
- [ ] live smoke run once with a real key (not in CI logs)
- [ ] version + CHANGELOG updated
- [ ] README links: docs, `/lang/<lang>`, registry page
- [ ] license + package metadata (icon, description, homepage)
