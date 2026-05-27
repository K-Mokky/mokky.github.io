---
title: "Viser 제작기 #1 - API 키 없는 로컬 AI 비서 만들기"
date: 2026-05-27 21:00:00 +0900
categories: [IT, App, AI]
tags: [Viser, TypeScript, Node.js, Local First, Codex, Gemini, Claude, Telegram, Discord]
---

# Viser 제작기 #1 - API 키 없는 로컬 AI 비서 만들기

이번 글부터는 며칠 동안 만든 **Viser**라는 개인 비서 런타임 제작 과정을 정리해보려고 한다. Viser는 이름 그대로 “비서”를 영어 발음처럼 적은 프로젝트다. 목표는 단순했다.

```text
이미 로그인해 둔 로컬 AI CLI를 이용해서
터미널, Telegram, Discord에서 쓸 수 있는
개인 비서 런타임을 만든다.
```

여기서 가장 중요한 조건은 **모델 API 키를 직접 쓰지 않는 것**이었다. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` 같은 키를 넣어서 HTTP API를 호출하는 구조가 아니라, 사용자가 이미 로그인해 둔 `codex`, `gemini`, `claude` CLI를 로컬 프로세스로 실행해서 답변을 받는 구조로 가고 싶었다.

결과물은 public repository로 올려두었다.

- <https://github.com/K-Mokky/mokky.viser.io>

이 시리즈는 구현 결과보다는 **어떤 문제를 어떤 순서로 풀었는지**를 중심으로 쓴다.

---

## 1. 처음 목표: API 클라이언트가 아니라 “로컬 비서”

처음에는 단순한 CLI wrapper처럼 생각했다. 입력을 받으면 AI CLI에 넘기고, 출력을 다시 보여주는 정도면 될 것 같았다.

하지만 “개인 비서”라고 부르려면 단순 질의응답만으로는 부족했다.

필요한 기능을 적어보니 대략 이랬다.

| 영역 | 필요했던 것 |
|---|---|
| AI 호출 | Codex/Gemini/Claude를 API가 아니라 로컬 CLI로 실행 |
| CLI | `chat`, `ask`, `doctor`, `setup` 같은 명령 |
| 메신저 | Telegram/Discord에서 같은 비서에게 메시지 보내기 |
| 기억 | 세션 기록, 장기 메모리, profile 요약 |
| 도구 | 명시적으로 허용한 read-only local tool |
| 액션 | 파일 쓰기/URL 열기/메시지 발송은 승인 후 실행 |
| 운영 | gateway, scheduler, job queue, service runner |
| 검증 | audit, verify, smoke, release evidence |

즉, 만들고 싶은 것은 “AI 호출 스크립트”가 아니라 **로컬-first control plane**에 가까웠다.

---

## 2. TypeScript-first로 시작한 이유

구현은 TypeScript로 잡았다. 별도 빌드 없이 Node.js의 native TypeScript stripping으로 바로 실행할 수 있게 하고 싶어서 Node 22.6 이상을 전제로 했다.

실행 형태는 이런 식이다.

```bash
node src/index.ts chat
node src/index.ts ask --provider gemini "오늘 할 일을 정리해줘"
node src/index.ts doctor
```

초기 구조는 역할별로 나눴다.

```text
src/
  index.ts                 CLI entrypoint
  config.ts                설정 로딩과 기본값
  providers/cli-provider.ts 로컬 AI CLI 실행
  core/assistant.ts        대화 runtime
  connectors/telegram.ts   Telegram bridge
  connectors/discord.ts    Discord bridge
  core/history.ts          세션 기록
```

처음부터 모든 기능을 크게 설계한 것은 아니지만, 최소한 provider, connector, core runtime은 분리해두었다. 나중에 기능이 늘어나면서 이 분리가 꽤 도움이 됐다.

---

## 3. Provider 설계: shell이 아니라 spawn

Viser의 핵심은 provider였다. provider는 실제 모델 API를 부르는 객체가 아니라, 로컬 CLI를 안전하게 실행하는 wrapper다.

초기 provider는 세 가지 prompt 전달 방식을 지원하게 만들었다.

| 방식 | 설명 | 예 |
|---|---|---|
| `stdin` | prompt를 stdin으로 전달 | Codex CLI |
| `template` | args 안의 `{prompt}`를 치환 | Gemini/Claude CLI |
| `argument` | prompt를 마지막 인자로 추가 | 단순 CLI |

중요한 원칙은 **shell을 쓰지 않는 것**이었다.

```text
spawn(command, args, { shell: false })
```

이 구조를 선택한 이유는 prompt가 로컬 명령으로 해석되는 일을 막기 위해서였다. 사용자가 입력한 문장이 `rm -rf ...`처럼 생겼더라도, 그것은 provider CLI에 전달되는 문자열이어야 하지 shell 명령이 되면 안 된다.

기본 provider는 다음 방향으로 잡았다.

```text
codex  -> codex exec --sandbox read-only -
gpt    -> codex CLI alias
gemini -> gemini --prompt "{prompt}" --approval-mode plan
claude -> claude -p "{prompt}"
```

여기서 `gpt`도 별도 API가 아니라 Codex CLI alias다. Viser의 원칙은 끝까지 “logged-in local CLI”였다.

---

## 4. AssistantRuntime: slash command와 일반 대화 분리

다음 단계는 `AssistantRuntime`이었다. 일반 메시지는 provider로 보내고, `/status`, `/provider`, `/remember` 같은 slash command는 runtime 내부에서 처리한다.

이 구분은 나중에 매우 중요해졌다.

```text
사용자 입력
  ├─ slash command면 내부 처리
  └─ 일반 메시지면 provider로 전달
```

초기에는 아래 정도의 명령만 있었다.

```bash
/status
/providers
/provider gemini
/reset
```

하지만 기능이 늘어나면서 slash command는 Viser의 안전한 제어면이 되었다.

예를 들면 이런 명령들이 추가됐다.

```bash
/remember "중요한 사실 #tag"
/memory 검색어
/profile
/tool read-file README.md
/propose write-file notes.txt 내용
/approve <id>
/enqueue 긴 작업
/run-jobs 3 --parallel 2
```

즉, provider에게 숨겨진 tool 권한을 주지 않고, 사용자가 명시적으로 `/tool`, `/propose`, `/approve`를 호출하는 방식으로 경계를 만들었다.

---

## 5. Telegram/Discord 연결

Viser를 터미널에서만 쓰면 “CLI assistant”에 머물지만, Telegram/Discord에서 호출할 수 있으면 훨씬 비서답게 느껴진다.

그래서 connector를 붙였다.

- Telegram: Bot API long polling
- Discord: Gateway WebSocket + REST message send

초기에는 단순히 메시지를 받아 AssistantRuntime에 넘기고 답장을 보내는 구조였다.

```text
Telegram/Discord message
  -> connector
  -> AssistantRuntime.handle()
  -> provider or slash command
  -> connector send
```

하지만 외부 메신저가 붙는 순간 보안 문제가 바로 생겼다.

누군가 봇을 발견하면 아무나 내 로컬 AI CLI를 호출할 수 있는가?  
한 사람이 초대형 prompt를 계속 보내면 어떻게 되는가?  
메신저 token이 로그에 찍히면 어떻게 되는가?

이 질문들은 이후 Viser의 보안 구조를 크게 바꿨다. 처음에는 기능 구현이었지만, 곧 **접근 제어와 rate limit, token redaction**이 필수가 됐다.

---

## 6. 기억, 스킬, 플러그인

개인 비서라면 이전 대화나 장기 기억도 필요했다. 그래서 세션 기록과 메모리 저장소를 추가했다.

```text
.viser/sessions/   세션별 JSONL 기록
.viser/memory/     장기 메모리
```

장기 메모리는 처음에는 단순한 텍스트 저장소였지만, 나중에는 태그와 local lexical vector 방식의 검색을 붙였다. 외부 embedding API를 쓰지 않고도 어느 정도 fuzzy recall이 가능하게 만들었다.

스킬 시스템도 추가했다. `skills/<id>/SKILL.md`를 읽어서 provider prompt에 주입하는 방식이다.

```text
skills/
  daily-brief/SKILL.md
  message-triage/SKILL.md
  safe-automation/SKILL.md
```

나중에는 local plugin manifest도 붙였다.

```text
plugins/
  release-check/plugin.json
```

여기서도 중요한 원칙은 같았다. skill/plugin 본문은 모두 **untrusted local content**로 취급한다. 좋은 의도로 작성된 파일이어도 provider prompt 안에서는 “상위 지시”처럼 행동하면 안 된다.

---

## 7. 첫 번째 전환점: “기능”보다 “경계”가 중요했다

초기 Viser는 빠르게 기능이 붙었다.

- CLI 대화
- provider fallback
- Telegram/Discord bridge
- memory/profile
- skill/plugin
- local tool
- scheduler
- job queue

하지만 어느 순간 깨달은 점은, 개인 비서 런타임에서 진짜 어려운 것은 기능 목록이 아니라 **권한 경계**라는 점이었다.

AI가 답변을 생성하는 것과 로컬 시스템에서 실제 행동을 하는 것은 완전히 다른 문제다. 특히 Telegram/Discord처럼 외부 입력이 들어오고, 세션/메모리/스킬 같은 untrusted content가 prompt로 섞이면 더 그렇다.

그래서 다음 단계의 핵심은 보안이었다.

- prompt injection 방어
- 승인 기반 action workflow
- shell tool allowlist
- symlink/path traversal 방어
- private state 권한
- launch 전 검증 gate

이 이야기는 다음 글에서 이어서 정리한다.

---

## 이번 글 요약

Viser의 첫 번째 단계는 “AI API를 부르는 앱”이 아니라 **로컬 CLI 계정 위에서 돌아가는 개인 비서 런타임**을 만드는 일이었다.

핵심 결정은 다음과 같다.

- GPT/Codex, Gemini, Claude는 모델 API가 아니라 로컬 CLI로 호출한다.
- provider 실행은 shell이 아니라 `spawn(command, args)`로 한다.
- slash command와 일반 대화를 분리한다.
- Telegram/Discord는 transport일 뿐, 모델 호출은 여전히 로컬 CLI가 맡는다.
- memory, skill, plugin을 붙이되 모두 untrusted content로 다룬다.
- 기능이 늘어날수록 권한 경계가 프로젝트의 중심이 된다.

다음 글에서는 Viser를 “그냥 돌아가는 도구”에서 “공개해도 되는 도구”로 만들기 위해 어떤 보안 hardening을 했는지 적어보겠다.
