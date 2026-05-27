---
title: "Viser 제작기 #3 - GitHub에 공개하기 전 마지막 점검"
date: 2026-05-27 21:10:00 +0900
categories: [IT, App, Open Source]
tags: [Viser, GitHub, Open Source, Security, Privacy, README, Release, Jekyll]
---

# Viser 제작기 #3 - GitHub에 공개하기 전 마지막 점검

Viser 제작기의 마지막 글이다. 앞선 두 글에서는 로컬 AI CLI 기반 비서 런타임을 만들고, prompt injection과 로컬 권한 경계를 다듬은 과정을 정리했다.

이번 글은 “이제 GitHub에 public으로 올려도 되는가?”라는 질문에 답하는 과정이다.

코드가 동작하는 것과 공개해도 되는 것은 다르다. 특히 Viser처럼 로컬 세션, 메모리, 메신저 token, service log, provider 설정이 얽힌 도구는 공개 직전 점검이 매우 중요했다.

---

## 1. 공개하면 안 되는 것부터 정했다

먼저 공개 금지 대상을 명확히 적었다.

```text
.env
.viser/
.omx/
.npmrc
viser.config.json
node_modules/
.DS_Store
service logs
session history
memory state
job/scheduler/action/access state
real Telegram/Discord token
local machine path
personal handles/email/chat IDs
```

Viser의 runtime state는 기본적으로 `.viser/` 아래에 저장된다. 세션 로그, 메모리, queue, scheduler, action, access pairing, backup, service log 등이 들어갈 수 있다.

OMX 작업 상태는 `.omx/` 아래에 있었다. 이것도 작업 로그와 session state가 들어갈 수 있으므로 공개 대상이 아니다.

그래서 `.gitignore`와 `.npmignore`를 모두 강화했다.

```gitignore
.viser/
.omx/
viser.config.json
.env
.npmrc
node_modules/
.DS_Store
```

npm package 쪽도 `package.json`의 `files` allowlist를 사용했다. public package에 들어갈 파일을 명시하고, local runtime state는 구조적으로 빠지게 했다.

---

## 2. README를 “처음 받는 사람” 기준으로 고치기

처음 README는 명령이 너무 많았다. 만든 사람 입장에서는 유용하지만, 처음 보는 사람에게는 무엇부터 해야 할지 애매했다.

그래서 상단에 **설치와 첫 실행** 섹션을 따로 만들었다.

```bash
git clone https://github.com/K-Mokky/mokky.viser.io.git
cd mokky.viser.io

node --version   # Node.js 22.6 이상 필요
node src/index.ts setup
node src/index.ts doctor
node src/index.ts verify
node src/index.ts chat
```

그리고 개발/검증용 명령은 따로 분리했다.

```bash
npm ci
npm test
npm run typecheck
```

Gateway도 바로 실행하라고 쓰지 않고, dry-run gate를 먼저 안내했다.

```bash
node src/index.ts gateway --dry-run --strict --live --probe-all-providers
node src/index.ts gateway
```

마지막에는 clone URL도 실제 공개 저장소 주소로 고쳤다. placeholder 문서는 공개 직후 첫 사용자에게 바로 불편을 준다.

---

## 3. SECURITY, PRIVACY, CONTRIBUTING 문서

공개 저장소는 코드만 있으면 부족하다. 어떤 경계를 지켜야 하는지 문서로 남겨야 한다.

그래서 세 문서를 추가했다.

| 문서 | 역할 |
|---|---|
| `SECURITY.md` | local CLI-only, prompt guard, token 비공개, 제보 지침 |
| `PRIVACY.md` | public identity 범위, `.viser/` state, token/handle/path 비공개 원칙 |
| `CONTRIBUTING.md` | 기여자가 지켜야 할 local CLI/no model API/key hygiene |

특히 Viser의 핵심은 **모델 API 키를 쓰지 않는 것**이라서, 기여자가 나중에 편의상 HTTP model client를 붙이지 않도록 문서에 반복해서 적었다.

또 GitHub issue/PR template도 만들었다.

- bug report template에서 real token, `.env`, `.viser/`, `.omx`, local path 금지
- PR template에서 local CLI-only provider boundary 확인
- blank issue 비활성화

이건 단순한 예의 문서가 아니라, 공개 이후 실수로 private data가 issue/PR에 올라오는 것을 줄이기 위한 장치다.

---

## 4. release evidence 만들기

공개 전 점검을 매번 사람이 기억하기는 어렵다. 그래서 Viser 자체에 release evidence 명령을 만들었다.

```bash
node src/index.ts release-evidence
```

이 명령은 safe-to-paste 형태의 공개 릴리스 증거를 출력한다.

확인하는 항목은 대략 이렇다.

- package name/license/private flag
- README/SECURITY/PRIVACY/CONTRIBUTING 존재
- `.gitignore`, `.npmignore`, package files allowlist
- `.env.example`에 model API key 변수가 없는지
- config example이 local CLI route를 유지하는지
- prompt guard source가 있는지
- Telegram/Discord connector source가 있는지
- public text file에 token-like 값이나 local path가 없는지
- npm pack dry-run에서 private state가 빠지는지

또 objective evidence matrix도 넣었다.

```text
assistant-core
identity
messenger
local-cli-no-model-api
build-process-log
prompt-injection-security
open-source-privacy
```

이렇게 한 이유는 단순히 “테스트 통과”가 아니라, 처음 목표였던 “로컬 CLI 기반 개인 비서”가 어떤 증거로 충족되는지 보기 위해서였다.

---

## 5. 마지막 보안 스캔

공개 직전에는 자동 검사와 수동 검사를 모두 했다.

실행한 대표 명령은 다음과 같다.

```bash
node src/index.ts audit
node src/index.ts verify --strict
npm run typecheck
npm test
npm audit
npm pack --dry-run --json
node src/index.ts release-evidence
```

최종 결과는 다음 상태였다.

```text
node src/index.ts audit          -> SAFE, 33 pass
node src/index.ts verify --strict -> PASS
npm run typecheck                -> pass
npm test                         -> 454 pass
npm audit                        -> 0 vulnerabilities
release-evidence                 -> READY
```

그리고 Git에 올라가는 파일도 다시 확인했다.

```text
tracked files: 126
forbidden tracked files: none
```

금지 목록은 올라가지 않았다.

```text
.env
.viser/
.omx/
.npmrc
viser.config.json
node_modules/
.DS_Store
```

이미지 파일도 확인했다. 로고 PNG에는 C2PA/OpenAI 생성 출처 metadata는 있었지만, local path나 token은 없었다.

---

## 6. public repository로 push

최종적으로 GitHub에 public repository를 만들고 push했다.

- <https://github.com/K-Mokky/mokky.viser.io>

초기 commit은 release hygiene 기록을 commit message에 남겼다.

```text
Prepare Viser for public release

Constraint: Public release must exclude .env, .viser/, .omx/, .npmrc,
node_modules, and local config
Rejected: Uploading the whole folder directly | hidden runtime and env files
could be exposed outside .gitignore filtering
Tested: node src/index.ts audit; node src/index.ts verify --strict;
npm run typecheck; npm test
```

그 뒤 README의 clone URL을 실제 repository 주소로 고치는 작은 commit도 추가했다.

```text
Point onboarding at the published repository
```

이 과정에서 다시 확인한 원격 main HEAD는 다음 commit이었다.

```text
16213080d27acac4330a26445e36b4d34e0d2a09
```

---

## 7. 아직 남은 것

공개 가능한 상태와 모든 목표가 완전히 증명된 상태는 조금 다르다.

Viser의 `release-evidence`는 일부 항목을 `remaining proof`로 남긴다.

```text
release-evidence --strict --live --probe-all-providers
```

이 명령은 실제 로컬 환경에서 `codex`, `gemini`, `claude`가 로그인되어 있는지, Telegram/Discord token이 실제 API에서 받아들여지는지까지 확인한다.

공개 저장소에는 real token을 넣으면 안 되기 때문에, 이 live proof는 개인 실행 환경에서만 의미가 있다. 그래서 public release 자체는 READY였지만, 실제 메신저 token proof는 의도적으로 저장소 밖에 남겨두었다.

---

## 8. 만들면서 배운 것

이번 프로젝트에서 가장 크게 느낀 점은 “AI 도구 만들기”가 사실상 **권한 시스템 만들기**라는 점이었다.

처음에는 provider wrapper로 시작했다. 하지만 Telegram/Discord가 붙고, memory와 skill이 붙고, local tool과 action이 붙으면서 질문이 계속 바뀌었다.

```text
이 입력은 신뢰할 수 있는가?
이 출력에 secret이 섞일 수 있는가?
이 파일 경로는 정말 workspace 안인가?
이 action은 사용자가 승인했는가?
이 상태 파일은 public에 올라가지 않는가?
```

그래서 Viser의 최종 형태는 단순한 챗봇이 아니라 다음 요소들의 묶음이 되었다.

- local CLI provider runtime
- prompt guard
- approval-gated action store
- read-only tool runner
- messenger access control
- durable job queue
- scheduler/gateway/service runner
- dashboard/MCP surface
- audit/verify/release evidence

화려한 기능보다 중요한 것은 경계였다. 그리고 그 경계는 코드, 테스트, 문서, ignore 파일, release evidence가 함께 있어야 유지된다.

---

## 마무리

Viser는 아직 거대한 제품은 아니다. 하지만 내가 원했던 핵심 목표는 달성했다.

```text
API 키 없이,
내가 로그인한 로컬 AI CLI를 사용하고,
터미널과 메신저에서 쓸 수 있으며,
로컬 권한은 명시적 승인으로 막고,
공개 저장소에 올릴 수 있는 개인 비서 런타임
```

이제 다음 단계는 실제 사용하면서 workflow를 다듬는 일이다. 특히 장기적으로는 더 나은 UI, 더 안정적인 service 운영, 실제 사용 패턴에 맞는 skill/plugin 개선이 필요할 것 같다.

그래도 이번에는 “그냥 만들었다”에서 끝나지 않고, 마지막에 public release hygiene까지 밀어붙였다는 점이 가장 만족스럽다.
