# API contract — spec-v1.0.0

Base URL: `https://azcaptcha.com`. All SDKs speak the **2Captcha-compatible**
API (legacy) and the modern JSON API, and hide the difference.

## 1. Legacy API (`in.php` / `res.php`)

### Submit — `POST /in.php`
Common fields:

| Field | Required | Notes |
|---|---|---|
| `key` | yes | API key |
| `method` | yes | `base64`, `userrecaptcha`, `hcaptcha`, `turnstile`, `funcaptcha`, `geetest`, `geetest_v4`, `mtcaptcha`, `friendlycaptcha`, `altcha`, `cf_clearance`, `aws_waf`, `filecrypt`, … (full list in `/docs`) |
| `json` | recommended | `1` → JSON envelope (`{"status":1,"request":"<id>"}`) |
| `soft_id` | no | stable AZcaptcha id; SDKs send it automatically |
| `proxy` / `proxytype` | conditional | `host:port` or `user:pass@host:port`, type `HTTP`/`SOCKS4`/`SOCKS5` |
| `pingback` | no | per-task user pingback URL |
| `body` | image | base64 (no data: prefix) |
| `googlekey` / `sitekey` | token | sitekey (both accepted; `publickey` deprecated alias) |
| `pageurl` | token | page containing the widget (`enterprise=1` for reCAPTCHA Enterprise) |
| `action`, `min_score` | v3 | reCAPTCHA v3 |
| `data-s`, `useragent` | Turnstile | passthrough |

### Poll — `GET|POST /res.php`
| Field | Value |
|---|---|
| `key` | API key |
| `action` | `get`, `getbalance`, `reportbad`, `check_recaptcha_thead`, `check_images_thead` |
| `id` | task id for `get`/`reportbad` |
| `json` | `1` for JSON envelope |

Responses:
- ready: `{"status":1,"request":"<solution>"}` (grid → JSON string in `request`)
- processing: `{"status":0,"request":"CAPCHA_NOT_READY"}` — spelling is part of the contract
- error: `{"status":0,"request":"ERROR_<CODE>"}`

## 2. Modern API
- `POST /createTask` — `{clientKey, task:{type, websiteURL, websiteKey, …}, softId?}`
  → `{errorId, taskId}`
- `POST /getTaskResult` — `{clientKey, taskId}` →
  `{errorId, status:"processing"|"ready", solution:{…}}`
- `POST /getBalance` — `{clientKey}` → `{errorId, balance}`

`errorId = 0` means success; otherwise `errorCode` is one of the taxonomy codes
(or the type-specific aliases documented per method).

## 3. Polling rules (all SDKs)
| Rule | Value |
|---|---|
| Initial delay | 1s |
| Interval | 5s |
| Interval after `NO_SLOT_AVAILABLE` | 10s, backoff ×1.5, cap 60s |
| Overall timeout | per type, matching server settings: image 120s, reCAPTCHA 300s, hCaptcha 120s, Turnstile 180s, others 300s |
| Retryable codes | only `retryable:true` in `errors.json` |
| Abort | callers can pass their own deadline/cancellation; SDKs must honour it |

## 4. Proxy handling
SDKs accept the proxy as a single string (`scheme://user:pass@host:port`,
`host:port:user:pass`, or `user:pass@host:port`) and normalise to the two fields
the API expects. Never send the scheme in `proxy` (upstream rejects
`NS_ERROR_UNKNOWN_PROXY_HOST`).

## 5. Pingback
SDKs may register a per-task `pingback` URL; the server POSTs
`id=<task_id>&code=<solution>` with retries. SDKs do not need to expose the
server-side HMAC.

## 6. Soft id
Every submit sends `soft_id` (legacy) / `softId` (modern). One constant per SDK,
documented in its README so upstream attribution stays accurate.

## 7. Out of scope for spec v1.0.0
- Token pre-solve pools (server-side only).
- Subscription/plan APIs.
