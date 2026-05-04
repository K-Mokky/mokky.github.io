---
title: "Navigate 앱 제작기 #2 -웹 앱으로 전환-"
date: 2026-05-04 20:40:00 +0900
categories: [IT, App, APP 제작]
tags: [Flutter, Flutter Web, Supabase, Vercel, Web App, CSP, RLS]
---

# Navigate 앱 제작기 #2 -웹 앱으로 전환-

이번 글은 **Navigate 앱을 웹 앱으로 전환하면서 지금까지 진행한 과정**을 정리한 기록이다. 처음에는 iOS 앱 중심으로 만들고 있었지만, 앱을 설치하지 않아도 링크 하나로 바로 들어와 사용할 수 있게 만들고 싶었다. 그래서 기존 Flutter 프로젝트를 유지한 채 Flutter Web으로 빌드하고, Vercel과 Supabase를 붙여 실제 운영 가능한 웹 앱 형태로 바꿔갔다.

> 보안과 개인정보 보호를 위해 실제 도메인, Supabase 프로젝트 주소, anon key, Vercel 프로젝트명, GitHub 저장소명은 글에서 직접 노출하지 않는다. 캡처 이미지도 개인 계정 콘솔 화면 대신 앱 화면과 배포 설정 요약 화면 위주로 준비했다.
{: .prompt-info }

![Navigate 웹 앱 시작 화면](/assets/img/navigate-web-startup.png)

---

## 1. 먼저 확인한 것: 이건 웹사이트가 아니라 Flutter 앱이었다

웹으로 옮긴다고 해서 HTML/CSS를 새로 짜는 일부터 시작한 것은 아니었다. 프로젝트 구조를 다시 보니 핵심은 여전히 Flutter였다.

```text
lib/
  main.dart
  app.dart
  screens/
  providers/
  services/
web/
  index.html
  manifest.json
pubspec.yaml
supabase/
  schema.sql
  rls_policies.sql
```

`web/index.html`은 Flutter Web이 브라우저에서 시작될 때 쓰는 진입점이고, 실제 화면은 `lib/` 아래 Dart 코드가 만든다. 그래서 방향을 이렇게 정했다.

| 항목 | 선택 |
|---|---|
| 프론트엔드 | 기존 Flutter 앱 유지 |
| 웹 전환 | Flutter Web 빌드 |
| 백엔드 | Supabase Auth / Postgres / Realtime / Storage |
| 배포 | Vercel 정적 웹 앱 배포 |
| 도메인 | 개인 도메인의 하위 도메인을 Vercel에 연결 |

이 결정을 하니 할 일이 명확해졌다. 앱을 다시 만드는 것이 아니라, **기존 앱을 브라우저에서 안정적으로 실행되게 만드는 작업**이었다.

---

## 2. Vercel에서 Flutter Web 빌드하기

Vercel은 Next.js, React, Vite 같은 프레임워크는 자동으로 잘 알아보지만 Flutter는 기본 프리셋이 아니다. 그래서 Vercel 프로젝트 설정은 직접 잡았다.

```text
Framework Preset: Other
Output Directory: build/web
```

처음 부딪힌 문제는 빌드 서버에 Flutter가 없다는 점이었다.

```text
flutter: command not found
```

Vercel 서버에서 `flutter build web`을 실행하려면 Flutter SDK를 먼저 설치해야 했다. 그래서 `vercel.json`에 install/build 명령을 명시했다.

```json
{
  "installCommand": "Flutter SDK 설치 후 flutter pub get",
  "buildCommand": "flutter build web --release ...",
  "outputDirectory": "build/web"
}
```

현재 배포 설정은 다음 방향으로 정리되어 있다.

- Flutter SDK는 검증한 버전인 **3.24.5**를 별도 경로에 설치한다.
- 빌드는 `build/web`으로 출력한다.
- SPA 라우팅을 위해 모든 경로를 `/index.html`로 되돌린다.
- 브라우저 렌더링 안정성을 위해 HTML renderer를 사용한다.
- 오래된 Flutter service worker 캐시를 피하려고 PWA service worker 전략을 끈다.

![Navigate 웹 배포 설정 요약](/assets/img/navigate-web-build-config.png)

---

## 3. Supabase 값은 코드가 아니라 환경 변수로 주입하기

웹 배포에서 가장 조심해야 했던 부분은 Supabase 설정이었다. Supabase URL과 anon key는 Flutter Web 번들 안에 들어갈 수밖에 없다. anon key는 원래 클라이언트에서 사용하는 공개 키 성격이지만, 그렇다고 저장소에 실제 값을 커밋하면 안 된다.

그래서 앱 설정은 `String.fromEnvironment`로만 읽게 했다.

```dart
static const String url = String.fromEnvironment(
  'SUPABASE_URL',
  defaultValue: '',
);

static const String anonKey = String.fromEnvironment(
  'SUPABASE_ANON_KEY',
  defaultValue: '',
);
```

로컬 실행과 Vercel 배포에서는 각각 `--dart-define`과 Vercel Environment Variables로 값을 넣는다.

```bash
flutter build web \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=...
```

중요한 점은, 키를 숨기는 것만으로는 보안이 완성되지 않는다는 것이다. Flutter Web에서는 클라이언트 번들이 사용자 브라우저로 내려가기 때문에 **실제 보안은 Supabase RLS 정책과 RPC 권한 설계로 지켜야 한다.**

---

## 4. 앱 아이콘과 웹 앱 정체성 정리

웹 앱으로 전환하면서 앱 아이콘도 정리했다. 기존에는 아이콘 파일이 여러 위치에 흩어져 있었고 이름도 통일되어 있지 않았다. 그래서 `navigateIcon.png`를 기준으로 웹, 앱, 빌드 산출물에서 같은 브랜드 이미지를 쓰도록 맞췄다.

대표적으로 정리한 파일은 이런 것들이다.

```text
navigateIcon.png
assets/branding/navigateIcon.png
web/navigateIcon.png
web/icons/navigateIcon-192.png
web/icons/navigateIcon-512.png
web/icons/navigateIcon-maskable-192.png
web/icons/navigateIcon-maskable-512.png
```

중간에 재미있는 문제도 있었다. 파일 확장자는 `.png`였는데 실제 포맷은 HEIC인 파일이 있었다. 브라우저와 앱 아이콘에서 안정적으로 쓰려면 진짜 PNG여야 하므로 변환해서 다시 생성했다.

웹에서는 `manifest.json`, favicon, apple touch icon도 같은 아이콘을 바라보도록 맞췄다. 이렇게 해야 홈 화면에 추가했을 때도 앱처럼 보이고, 브라우저 탭에서도 Navigate의 정체성이 유지된다.

---

## 5. 웹 화면에서 Supabase 초기화 실패를 흰 화면으로 두지 않기

웹 배포 후 가장 신경 쓰인 문제는 **흰 화면**이었다. 모바일 앱에서는 크래시나 권한 문제가 비교적 눈에 보이지만, 웹에서는 초기화 중 오류가 나면 사용자는 그냥 아무것도 없는 화면만 볼 수 있다.

그래서 `main.dart` 시작 흐름을 보강했다.

- `runZonedGuarded`로 앱 시작 중 오류를 잡는다.
- Supabase 설정이 없으면 안내 화면을 띄운다.
- Supabase나 알림 서비스 초기화에 실패하면 오류 안내 화면을 띄운다.
- Flutter가 아예 부팅되기 전에는 `web/index.html`의 `startup-status`가 “앱을 불러오는 중이에요…”를 보여준다.

이전에는 실패가 “아무것도 안 보임”으로 느껴질 수 있었다면, 이제는 최소한 사용자가 상태를 볼 수 있다.

![Navigate 웹 로그인 화면](/assets/img/navigate-web-login.png)

---

## 6. CSP와 startup.js 문제 해결

보안 헤더를 추가하면서 또 다른 문제가 생겼다. Content Security Policy를 엄격하게 잡으면 인라인 스크립트가 막힌다. 그런데 처음에는 캐시 초기화와 Flutter 부트스트랩 로직 일부가 `index.html` 안에 들어가 있었다.

엄격한 CSP에서는 이런 구성이 위험했다.

```text
script-src 'self' ...
```

`unsafe-inline`을 열어버리면 간단하긴 하지만, 보안을 낮추는 방식이라 선택하지 않았다. 대신 `web/startup.js`를 따로 만들고, `index.html`에서는 외부 스크립트로만 불러오게 바꿨다.

```html
<script src="startup.js" defer></script>
```

`startup.js`가 맡는 일은 크게 세 가지다.

1. 오래된 Flutter service worker 등록 해제
2. Flutter 관련 캐시 삭제
3. `flutter_bootstrap.js`를 CSP에 맞게 외부 스크립트로 로드

이렇게 바꾸니 보안 헤더를 유지하면서도 앱 부팅 로직을 안정적으로 실행할 수 있었다.

---

## 7. 오래된 service worker 캐시 제거

Flutter Web은 이전 빌드의 service worker나 캐시가 남아 있으면 새 배포를 했는데도 브라우저가 예전 JS나 폰트 매니페스트를 계속 들고 있을 수 있다. 이때 사용자는 배포가 끝났는데도 여전히 오래된 화면, 흰 화면, 글자가 안 보이는 화면을 볼 수 있다.

그래서 배포 빌드에서는 다음을 적용했다.

```bash
--pwa-strategy=none
```

그리고 `startup.js`에서 한 번 더 안전장치를 넣었다.

- 등록된 service worker가 있으면 해제한다.
- `flutter-app-cache` 또는 `flutter` 관련 캐시를 삭제한다.
- 이미 service worker가 현재 페이지를 제어하고 있었다면 `fresh` 파라미터를 붙여 한 번 새로고침한다.

이건 특히 배포 초기에 중요했다. 내가 새로 고친 코드를 올렸는데 사용자는 예전 번들을 보고 있으면 디버깅이 꼬이기 때문이다.

---

## 8. 웹에서 한글이 안 보이는 문제와 HTML renderer

한 번은 앱은 뜨는데 글자가 안 보이는 문제가 있었다. Flutter Web의 CanvasKit/WebGL 렌더링과 브라우저 환경 차이 때문에 한글 폰트 표시가 흔들릴 수 있다고 판단했다.

그래서 두 가지를 적용했다.

첫째, Noto Sans KR 폰트를 앱에 번들했다.

```yaml
flutter:
  fonts:
    - family: NotoSansKR
      fonts:
        - asset: assets/fonts/NotoSansKR.ttf
```

둘째, 배포 빌드는 HTML renderer로 고정했다.

```bash
flutter build web \
  --web-renderer html \
  --no-web-resources-cdn \
  --csp \
  --pwa-strategy=none
```

이 선택은 최고 성능만 보는 결정은 아니었다. 대신 지금 단계에서는 **브라우저마다 글자가 안정적으로 보여야 한다**는 요구가 더 중요했다.

---

## 9. Production 환경 변수와 Vercel 배포 보호 설정

배포가 Ready 상태인데 실제 운영 주소에서 앱이 제대로 동작하지 않는 문제도 있었다. 확인해보니 Supabase 환경 변수가 Preview에는 들어가 있었지만 Production에는 빠져 있었다.

즉, 빌드는 성공했지만 운영 번들에는 필요한 값이 없었다. 그래서 Vercel의 Production Environment Variables에 다음 값을 다시 등록했다.

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

또 일부 배포 URL에서는 Vercel Deployment Protection/SSO 설정 때문에 401이 나왔다. 공개 웹 앱으로 쓰려는 목적과 맞지 않아서 운영 도메인에서는 접근 보호 설정도 정리했다.

이 과정을 거치고 나서야 “배포 성공”과 “사용자가 접속 가능”이 다르다는 걸 다시 느꼈다. Vercel 대시보드의 Ready만 보고 끝내면 안 되고, 실제 도메인에서 HTML, JS, 라우팅, 헤더, 앱 초기화까지 확인해야 했다.

---

## 10. Supabase 운영 DB 보강: RLS, RPC, Storage

웹으로 열면 접근성이 좋아지는 만큼 보안도 더 중요해진다. 그래서 Supabase 쪽도 같이 정리했다.

진행한 핵심 작업은 다음과 같다.

- 저장소에 실제 Supabase 기본값이 들어가지 않도록 제거
- 프로필 조회 범위를 공개 필드 중심으로 제한
- 친구 검색과 방 멤버 조회는 직접 테이블 노출 대신 RPC 사용
- 친구 인사 이벤트는 클라이언트 insert가 아니라 `send_friend_greeting` RPC로 생성
- RPC 내부에서 친구 관계, 수신자, 거리 조건을 서버가 검증
- 프로필 사진용 `avatars` Storage bucket과 업로드 정책 보강
- 기존 운영 DB에 누락된 RPC와 Storage 정책을 backfill SQL로 추가

특히 웹 앱에서는 사용자가 브라우저 개발자 도구를 열어 요청을 직접 볼 수 있다. 그래서 클라이언트가 “착하게 요청할 것”이라고 믿으면 안 된다. 클라이언트는 UI만 담당하고, 권한 판단은 Supabase RLS와 서버 함수가 맡게 했다.

![Navigate 웹 설정 화면](/assets/img/navigate-web-settings.png)

---

## 11. 현재 웹 앱 상태

지금까지의 결과를 정리하면 이렇다.

- Flutter 앱을 웹으로 빌드할 수 있다.
- Vercel에서 Flutter SDK 설치부터 빌드까지 자동화했다.
- `build/web` 정적 산출물을 운영 배포한다.
- Supabase URL/anon key는 환경 변수로만 주입한다.
- 웹 라우팅을 위해 SPA fallback을 설정했다.
- CSP, HSTS, Permissions-Policy 등 기본 보안 헤더를 적용했다.
- strict CSP 때문에 인라인 스크립트를 쓰지 않고 `startup.js`로 분리했다.
- 오래된 service worker/cache로 인한 흰 화면 가능성을 줄였다.
- Noto Sans KR + HTML renderer로 한글 렌더링 안정성을 높였다.
- Production 환경 변수, RPC, Storage bucket 누락을 보강했다.
- 앱 시작 실패 시 흰 화면 대신 상태 안내를 보여준다.

코드로 보면 웹 전환의 중심은 이 파일들에 모여 있다.

```text
vercel.json
web/index.html
web/startup.js
lib/main.dart
lib/config/supabase_config.dart
pubspec.yaml
supabase/security_hardening_20260504.sql
supabase/rpc_backfill_20260504.sql
supabase/storage_backfill_20260504.sql
```

---

## 12. 이번 전환에서 배운 점

이번 작업은 단순히 “Flutter build web 한 번 실행하기”가 아니었다. 앱을 웹으로 옮긴다는 건 실행 환경 전체가 바뀌는 일이었다.

가장 크게 배운 건 네 가지다.

첫째, **배포 성공과 사용자 성공은 다르다.** Vercel에서 Ready가 떠도 실제 도메인에서 환경 변수, 라우팅, CSP, 캐시, JS 로딩이 모두 맞아야 한다.

둘째, **웹 보안은 클라이언트를 믿지 않는 구조로 가야 한다.** Flutter Web 번들은 사용자에게 전달되기 때문에 Supabase RLS와 RPC 검증이 핵심이다.

셋째, **캐시는 생각보다 강하다.** 특히 Flutter Web service worker는 한 번 꼬이면 새 배포를 했는데도 사용자가 예전 파일을 볼 수 있다. 운영 초기에는 캐시 전략을 단순하게 두는 편이 안전했다.

넷째, **한글 렌더링도 배포 품질의 일부다.** 내 브라우저에서만 보이는지, 다른 데스크톱 브라우저에서도 보이는지 확인해야 했다. 그래서 폰트를 번들하고 renderer를 고정했다.

---

## 마무리

Navigate는 이제 iOS 앱에서 끝나는 프로젝트가 아니라, 브라우저에서도 바로 접근할 수 있는 웹 앱이 되었다. 아직 앞으로 다듬을 부분은 남아 있다. 실제 사용자 흐름에서 위치 권한 안내를 더 자연스럽게 만들고, 친구 초대와 기록방 공유 경험도 더 매끄럽게 개선해야 한다.

하지만 이번 전환으로 가장 큰 기반은 마련했다. 이제 링크 하나로 앱을 열 수 있고, Flutter 코드베이스 하나로 모바일과 웹을 함께 가져갈 수 있다. 다음 단계에서는 웹에서 실제 사용자 경험을 더 앱답게 만드는 작업을 이어가면 될 것 같다.
