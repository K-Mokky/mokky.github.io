---
title: Navigate 앱 웹 앱 전환기
date: 2026-04-29 23:50:00 +0900
categories: [IT, App, APP 제작]
tags: [Flutter, Flutter Web, Supabase, Vercel, Cafe24, DNS]
---

# Navigate 앱 웹 앱 전환기

---

이전에 만들었던 **친추 : 친구 추적기** 앱을 이번에는 웹에서도 실행할 수 있도록 바꿨다.

처음에는 iOS 앱 중심으로 만들고 있었다.

친구들의 위치를 지도 위에서 보고,

이동 경로를 확인하고,

근처에 친구가 있으면 알림을 받고,

필요하면 FaceTime까지 연결하는 앱이었다.

그런데 앱을 설치해야만 쓸 수 있으면 접근성이 조금 떨어진다.

그래서 이번에는 같은 Flutter 프로젝트를 **Flutter Web**으로 빌드해서,

브라우저에서 바로 접속 가능한 웹 앱으로 배포하기로 했다.

최종 목표는 이거였다.

```text
내가 설정한 하위 도메인에 접속하면
누구나 친구 찾기 웹 앱을 사용할 수 있게 만들기
```

> 보안 및 개인정보 보호를 위해 이 글에서는 실제 도메인, GitHub 저장소 이름, Vercel 프로젝트 주소, Supabase 프로젝트 주소, API 키 등은 일부 마스킹했다.
{: .prompt-info }

![Navigate 웹 앱 화면 - 개인정보 모자이크 처리](/assets/img/navigate-web-1.png)

---

## 기존 프로젝트 구조 확인

먼저 이 프로젝트가 단순 HTML/CSS 프로젝트인지 확인했다.

처음에는 Vercel에 올리려고 하다 보니,

프레임워크 설정을 뭘로 해야 하는지 헷갈렸다.

프로젝트를 확인해보니 구조는 이랬다.

```text
lib/
  main.dart
  app.dart
web/
  index.html
  manifest.json
pubspec.yaml
supabase/
  schema.sql
  rls_policies.sql
```

즉, 이건 HTML/CSS로 직접 만든 사이트가 아니라 **Flutter 프로젝트**였다.

`web/index.html`은 그냥 Flutter Web이 실행될 때 사용하는 진입 파일이고,

실제 화면은 Dart/Flutter 코드에서 만들어진다.

정리하면 이렇다.

| 항목 | 내용 |
|---|---|
| 프론트엔드 | Flutter |
| 웹 빌드 | Flutter Web |
| 백엔드 | Supabase |
| 배포 | Vercel |
| 도메인 | Cafe24에서 구매한 개인 도메인의 하위 도메인 |

---

## Vercel에서 Flutter Web 배포하기

Vercel은 Next.js, React, Vite 같은 프레임워크는 자동으로 잘 잡아준다.

하지만 Flutter는 기본 프레임워크 목록에 없다.

그래서 Vercel 설정은 이렇게 잡았다.

```text
Framework Preset: Other
Output Directory: build/web
```

문제는 Vercel 빌드 서버에 Flutter가 기본 설치되어 있지 않다는 점이었다.

처음에는 이런 에러가 났다.

```text
sh: line 1: flutter: command not found
```

원인은 간단했다.

Vercel 서버에는 `flutter` 명령어가 없는데,

그냥 `flutter build web`을 실행하려고 했기 때문이다.

그래서 Install Command에서 Flutter SDK를 직접 설치하도록 했다.

```bash
if [ ! -d "$HOME/flutter" ]; then git clone https://github.com/flutter/flutter.git -b stable --depth 1 $HOME/flutter; fi && $HOME/flutter/bin/flutter config --enable-web && $HOME/flutter/bin/flutter pub get
```

그리고 Build Command는 이렇게 설정했다.

```bash
$HOME/flutter/bin/flutter build web --release --dart-define=SUPABASE_URL=$SUPABASE_URL --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
```

정리하면 Vercel 설정은 아래와 같다.

```text
Framework Preset:
Other

Install Command:
if [ ! -d "$HOME/flutter" ]; then git clone https://github.com/flutter/flutter.git -b stable --depth 1 $HOME/flutter; fi && $HOME/flutter/bin/flutter config --enable-web && $HOME/flutter/bin/flutter pub get

Build Command:
$HOME/flutter/bin/flutter build web --release --dart-define=SUPABASE_URL=$SUPABASE_URL --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

Output Directory:
build/web
```

![Vercel 빌드 설정 - 프로젝트명과 계정 정보 모자이크 처리](/assets/img/navigate-web-2.png)

---

## 환경 변수 설정

Supabase URL과 anon key는 코드에 직접 넣지 않았다.

대신 Vercel의 Environment Variables에 추가했다.

```text
SUPABASE_URL=https://<프로젝트-ref>.supabase.co
SUPABASE_ANON_KEY=<마스킹된-anon-key>
```

실제 글이나 스크린샷에는 위 값이 그대로 보이면 안 된다.

특히 `SUPABASE_ANON_KEY`는 Supabase에서 클라이언트에 공개될 수 있는 anon key이긴 하지만,

그래도 블로그 글에는 전체 값을 노출하지 않는 편이 좋다.

Flutter에서는 이 값을 `--dart-define`으로 받아서 사용한다.

```dart
String.fromEnvironment('SUPABASE_URL')
String.fromEnvironment('SUPABASE_ANON_KEY')
```

주의할 점은 Flutter Web에서 `--dart-define` 값은 결국 클라이언트 번들에 들어간다는 것이다.

Supabase anon key 자체는 공개되어도 되는 키지만,

대신 RLS 정책이 제대로 설정되어 있어야 한다.

즉, 보안은 키를 숨기는 방식이 아니라,

Supabase의 Row Level Security 정책으로 지키는 방식이다.

---

## 앱 아이콘 변경

웹 앱으로 올리는 김에 앱 아이콘도 정리했다.

기존에는 여러 곳에 아이콘이 흩어져 있었다.

```text
assets/branding/app_icon.png
web/favicon.png
web/icons/Icon-192.png
web/icons/Icon-512.png
ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-*.png
```

이번에는 모든 앱 아이콘을 `navigateIcon.png` 기준으로 통일했다.

```text
navigateIcon.png
assets/branding/navigateIcon.png
web/navigateIcon.png
web/icons/navigateIcon-192.png
web/icons/navigateIcon-512.png
web/icons/navigateIcon-maskable-192.png
web/icons/navigateIcon-maskable-512.png
ios/Runner/Assets.xcassets/AppIcon.appiconset/navigateIcon-*.png
```

중간에 알게 된 점도 있었다.

내가 가지고 있던 `navigateIcon.png` 파일은 확장자는 `.png`였지만,

실제로는 HEIC 포맷이었다.

그래서 이 파일을 진짜 PNG로 변환한 뒤,

웹용 192px, 512px 아이콘과 iOS용 앱 아이콘 크기별 파일을 다시 생성했다.

![Navigate 앱 아이콘](/assets/img/navigate-web-icon.png)

---

## GitHub에 반영

아이콘 변경과 웹 설정을 마친 뒤 GitHub에 커밋했다.

```text
Branch: main
Commit: 90705b3
Repository: K-*****/m****.navigate.io
```

여기서 저장소 이름은 공개 블로그에 그대로 적지 않기 위해 일부 마스킹했다.

Vercel은 GitHub `main` 브랜치와 연결되어 있어서,

`main`에 push하면 자동으로 새 배포가 시작된다.

---

## 내 도메인 연결하기

처음에는 Vercel 기본 도메인으로 접속할 수 있었다.

하지만 최종적으로는 내가 가진 도메인을 쓰고 싶었다.

메인 도메인은 이미 블로그에 사용 중이었다.

그래서 메인 도메인은 건드리지 않고,

하위 도메인을 새로 만들었다.

```text
f********d.m****.store
```

실제 주소는 블로그 공개 범위에 따라 공개할 수도 있지만,

이 글에서는 개인정보 보호를 위해 일부 마스킹했다.

Vercel에서는 프로젝트 설정에서 Domains로 들어가서,

하위 도메인을 추가했다.

```text
Project → Settings → Domains → Add Domain
```

그리고 Environment는 Production으로 연결했다.

```text
Connect to an environment: Production
```

실제 사용자가 접속할 주소이기 때문에 Production으로 설정하는 게 맞다.

---

## Cafe24 DNS 설정

도메인은 Cafe24에서 구매했기 때문에,

Cafe24 도메인 관리에서 DNS를 설정했다.

하위 도메인은 CNAME으로 연결하면 된다.

Cafe24 DNS 설정은 아래처럼 했다.

```text
타입: CNAME
호스트: f********d
값: cname.vercel-dns.com
```

여기서 중요한 점은 메인 도메인은 건드리지 않는 것이다.

메인 도메인은 블로그용으로 계속 사용하고,

새로 만든 하위 도메인만 Vercel로 보내는 방식이다.

![Cafe24 CNAME 설정 - 도메인 정보 모자이크 처리](/assets/img/navigate-web-3.png)

---

## Supabase Redirect URL 설정

웹 주소가 바뀌었으니 Supabase Auth 설정도 수정해야 한다.

Supabase Dashboard에서 아래 메뉴로 이동했다.

```text
Authentication → URL Configuration
```

Site URL에는 최종 도메인을 넣었다.

```text
https://f********d.m****.store
```

Redirect URLs에는 아래 값을 추가했다.

```text
https://f********d.m****.store/**
```

Vercel 기본 도메인에서도 테스트하고 싶다면,

Vercel 주소도 추가할 수 있다.

```text
https://********.vercel.app/**
```

단, Preview 배포 주소까지 전부 허용하려고 아래처럼 너무 넓게 잡는 것은 신중해야 한다.

```text
https://*.vercel.app/**
```

편하긴 하지만,

운영 환경에서는 가능한 한 실제 사용하는 도메인만 등록하는 편이 낫다.

![Supabase Redirect URL 설정 - 프로젝트 URL과 키 정보 모자이크 처리](/assets/img/navigate-web-4.png)

---

## 확인해야 할 점

웹 앱 배포에서 가장 헷갈리는 부분은 DNS와 SSL이다.

Vercel에서 도메인을 추가했다고 바로 끝나는 것은 아니다.

Cafe24 DNS가 제대로 반영되어야 하고,

Vercel에서 SSL 인증서 발급까지 완료되어야 한다.

확인해야 할 상태는 이렇다.

```text
Vercel Domains:
f********d.m****.store → Valid Configuration
```

그리고 브라우저에서 아래 주소가 정상 접속되어야 한다.

```text
https://f********d.m****.store
```

만약 접속했을 때 SSL 오류가 나거나,

엉뚱하게 GitHub Pages 404가 뜬다면,

DNS CNAME이 잘못되었거나 아직 전파 중일 가능성이 크다.

정상 설정은 다시 한 번 아래와 같다.

```text
CNAME
f********d
cname.vercel-dns.com
```

---

## 배포 전 보안 체크리스트

블로그에 글을 올리기 전에 아래 항목은 꼭 확인해야 한다.

```text
Supabase URL 전체가 노출되지 않았는가?
Supabase anon key 전체가 노출되지 않았는가?
Vercel 프로젝트명, 팀명, 빌드 로그에 민감한 값이 보이지 않는가?
GitHub private repository 주소나 계정 정보가 그대로 보이지 않는가?
Cafe24 관리자 화면의 회원정보, 도메인 소유자 정보가 보이지 않는가?
Supabase Dashboard의 Project Ref, JWT Secret, Service Role Key가 보이지 않는가?
환경 변수 값이 스크린샷에 그대로 보이지 않는가?
```

특히 아래 값들은 절대 공개하면 안 된다.

```text
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
Database password
SMTP password
OAuth client secret
Vercel token
GitHub token
Cafe24 계정 정보
```

이 글에는 이런 값들을 넣지 않았다.

스크린샷을 넣을 때도 반드시 모자이크 처리해야 한다.

---

## 최종 결과

이번 작업으로 기존 Flutter 앱을 웹 앱으로 배포할 수 있게 되었다.

정리하면 이런 흐름이었다.

```text
Flutter 앱
→ Flutter Web 빌드
→ Vercel 배포
→ Supabase 환경 변수 연결
→ 앱 아이콘 navigateIcon.png로 통일
→ Cafe24 하위 도메인 연결
→ Supabase Redirect URL 설정
→ 개인 도메인 기반 웹 앱 완성
```

최종 접속 주소는 공개 여부에 따라 아래처럼 표기할 수 있다.

```text
https://f********d.m****.store
```

도메인과 SSL이 정상 반영되면,

누구나 브라우저에서 접속해서 친구 찾기 웹 앱을 사용할 수 있다.

---

## 느낀 점

Flutter 앱을 웹 앱으로 바꾸는 과정 자체는 생각보다 간단했다.

하지만 실제 배포까지 가면 신경 쓸 부분이 많았다.

```text
Flutter SDK 설치
Vercel Build Command
환경 변수
Supabase Redirect URL
DNS CNAME
SSL 인증서
PWA 아이콘 캐시
```

특히 Vercel은 Flutter를 기본 프레임워크로 인식하지 않기 때문에,

Framework Preset을 `Other`로 두고 직접 빌드 명령어를 작성해야 했다.

그리고 도메인 연결은 Vercel만 설정한다고 끝나는 게 아니라,

도메인을 구매한 Cafe24 쪽 DNS도 정확히 맞춰야 했다.

그래도 한 번 흐름을 잡고 나니,

앞으로 Flutter 앱을 웹으로 배포하는 과정은 훨씬 수월할 것 같다.

이번 작업으로 앱은 더 이상 “설치해야만 쓰는 앱”이 아니라,

링크 하나로 접근할 수 있는 웹 앱이 되었다.
