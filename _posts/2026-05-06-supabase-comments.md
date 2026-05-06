---
title: "GitHub Pages 블로그에 댓글 기능 붙이기"
date: 2026-05-06 11:22:00 +0900
categories: [IT, Web, Blog]
tags: [Jekyll, Chirpy, GitHub Pages, Supabase, RLS, RPC, Comments]
---

# GitHub Pages 블로그에 댓글 기능 붙이기

이번에는 이 블로그에 **댓글 기능**을 붙인 과정을 정리해보려고 한다. 내 블로그는 GitHub Pages 위에서 돌아가는 Jekyll/Chirpy 기반 정적 사이트다. 정적 사이트는 빠르고 관리가 편하지만, 댓글처럼 데이터를 저장해야 하는 기능을 넣으려면 갑자기 고민이 많아진다.

처음 목표는 단순했다.

```text
방문자가 GitHub 로그인을 하지 않아도
이름 + 비밀번호만으로 댓글을 남기고,
나중에 같은 비밀번호로 수정/삭제할 수 있게 만들기
```

그런데 막상 구현하려고 보니 단순한 입력 폼 문제가 아니었다. 댓글은 저장되어야 하고, 비밀번호는 안전하게 검증되어야 하고, 브라우저에 공개되는 Supabase 키로는 절대 테이블이 마음대로 열리면 안 됐다.

![댓글 기능 UI 캡처](/assets/img/blog-comments-ui.png)

---

## 1. 왜 Supabase를 썼는가

GitHub Pages는 정적 호스팅이다. 서버 코드가 없기 때문에 댓글을 저장하거나 비밀번호를 검증하는 일을 GitHub Pages 자체에서 할 수 없다.

처음에 생각할 수 있는 선택지는 몇 가지 있었다.

| 방식 | 고민한 점 |
|---|---|
| Giscus / Utterances | GitHub 계정 기반이라 익명 댓글 느낌이 약함 |
| 댓글을 GitHub 저장소에 저장 | 쓰기 권한이나 토큰을 노출할 위험이 있음 |
| 클라이언트에서 비밀번호 검증 | 해시나 검증 로직이 브라우저에 노출됨 |
| 별도 백엔드 서버 운영 | 블로그 댓글 하나 때문에 서버를 계속 관리해야 함 |
| Supabase RPC 사용 | 정적 사이트와 잘 맞고 DB 쪽에서 검증 가능 |

그래서 최종적으로는 **Supabase Postgres + RPC 함수** 구조로 갔다. 브라우저는 공개 가능한 publishable key만 들고 있고, 실제 댓글 저장/수정/삭제 판단은 Supabase DB 함수가 맡는다.

---

## 2. 핵심 구조

구조는 이렇게 잡았다.

![댓글 기능 아키텍처 캡처](/assets/img/blog-comments-architecture.png)

브라우저에서는 Supabase 클라이언트를 만들고, 직접 테이블을 만지지 않는다. 대신 아래 RPC 함수만 호출한다.

```text
blog_get_comments
blog_create_comment
blog_update_comment
blog_delete_comment
```

댓글 테이블은 `public.blog_comments` 하나로 시작했다. 여기에 글 주소, 작성자 이름, 비밀번호 해시, 댓글 내용, 생성/수정 시간을 저장한다.

```sql
create table public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null,
  password_hash text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

여기서 중요한 점은 **비밀번호 원문을 저장하지 않는 것**이다. 비밀번호는 Supabase DB 안에서 `pgcrypto`의 `crypt()`와 bcrypt salt를 사용해서 해시로 저장한다.

```sql
crypt(v_password, gen_salt('bf'))
```

수정과 삭제도 브라우저가 판단하지 않는다. 사용자가 입력한 비밀번호를 RPC 함수에 보내면, DB 함수가 저장된 해시와 비교해서 맞을 때만 수정하거나 삭제한다.

---

## 3. 공개 키는 숨기는 것이 아니라 권한을 막는 것

Supabase를 웹에서 쓰면 URL과 publishable key는 결국 브라우저로 내려간다. 그래서 이 키를 “숨기는 것”은 불가능하다. 중요한 것은 공개 키를 가진 사용자가 무엇을 할 수 있는지를 제한하는 것이다.

그래서 SQL에서 다음을 적용했다.

```sql
alter table public.blog_comments enable row level security;
revoke all on table public.blog_comments from anon, authenticated;
```

브라우저 역할인 `anon`, `authenticated`가 테이블을 직접 읽거나 쓰지 못하게 막았다. 그리고 필요한 RPC 함수에만 실행 권한을 열었다.

```sql
grant execute on function public.blog_get_comments(text) to anon, authenticated;
grant execute on function public.blog_create_comment(text, text, text, text) to anon, authenticated;
grant execute on function public.blog_update_comment(uuid, text, text) to anon, authenticated;
grant execute on function public.blog_delete_comment(uuid, text) to anon, authenticated;
```

정리하면 이런 방향이다.

```text
브라우저 → 테이블 직접 접근 ❌
브라우저 → 검증된 RPC 호출 ✅
RPC 함수 → 필요한 테이블 작업 ✅
```

이렇게 해야 publishable key가 공개되어도 댓글 테이블 전체가 열리지 않는다.

---

## 4. Chirpy 댓글 provider 확장하기

Chirpy에는 기존 댓글 provider 설정이 있다. 그래서 `_config.yml`의 댓글 provider에 `supabase`를 추가했다.

```yml
comments:
  provider: supabase
  supabase:
    url: https://YOUR_PROJECT_REF.supabase.co
    anon_key: YOUR_PUBLISHABLE_KEY
    min_password_length: 4
    max_content_length: 2000
```

그리고 `_includes/comments/supabase.html` 파일을 만들어서 실제 댓글 UI와 동작을 넣었다. 이 파일은 글 페이지 하단에 댓글 영역을 만들고, Supabase RPC를 호출한다.

프론트엔드에서 맡은 일은 이 정도다.

- 글의 `page.url`을 댓글 묶음 키로 사용한다.
- 이름, 비밀번호, 댓글 내용을 입력받는다.
- `blog_create_comment` RPC로 댓글을 저장한다.
- `blog_get_comments` RPC로 댓글 목록을 불러온다.
- 수정/삭제 버튼을 누르면 비밀번호를 다시 받아 RPC로 검증한다.
- 댓글 내용은 화면에 넣기 전에 HTML escape 처리한다.

특히 escape 처리는 꼭 필요했다. 댓글은 사용자가 직접 입력하는 값이라서, 그대로 HTML에 넣으면 스크립트 삽입 같은 문제가 생길 수 있다.

```js
function escapeHTML(value) {
  return String(value || '').replace(/[&<>'"]/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char];
  });
}
```

---

## 5. 비밀번호 실패와 스팸 방어도 추가하기

처음 구현은 댓글 생성, 조회, 수정, 삭제가 되는 정도였다. 하지만 바로 보안 보강을 추가했다.

수정/삭제는 비밀번호를 맞혀야 하므로 무차별 대입 시도를 막아야 했다. 그래서 `blog_comment_password_attempts` 테이블을 추가했다.

```text
댓글 1개 기준
15분 안에 비밀번호 실패 5회 누적 → 15분 잠금
```

댓글 생성 쪽도 최소한의 제한을 넣었다.

```text
같은 글에 1분당 댓글 5개 초과 차단
같은 이름 + 같은 내용의 10분 내 중복 댓글 차단
```

완벽한 스팸 방어는 아니지만, 아무 제한 없이 열어두는 것보다는 훨씬 낫다. 나중에 댓글이 많아지면 Supabase Edge Function이나 Cloudflare Turnstile 같은 추가 방어를 붙이면 된다.

---

## 6. 저장소에 들어가면 안 되는 것들

이번 작업에서 가장 조심한 부분 중 하나는 비밀 값이었다.

Supabase publishable key는 브라우저에서 쓰는 공개 키라서 설정에 들어갈 수 있다. 하지만 아래 값들은 절대 저장소에 들어가면 안 된다.

```text
관리자 권한 키
비공개 서버 전용 키
DB 접속 비밀번호
Supabase CLI access token
.env 파일
supabase/.temp 파일
```

그래서 `.gitignore`와 `supabase/.gitignore`도 같이 정리했다. 특히 Supabase CLI를 쓰면 `supabase/.temp` 아래에 연결된 프로젝트 정보가 생길 수 있어서, 이 경로는 확실히 무시하도록 했다.

---

## 7. 검증하면서 확인한 것

기능을 만든 뒤에는 “댓글이 보인다”에서 끝내지 않고, 막아야 하는 접근이 실제로 막히는지도 확인했다.

![댓글 기능 검증 캡처](/assets/img/blog-comments-security-check.png)

확인한 항목은 다음과 같다.

```text
댓글 생성 RPC 정상 동작
댓글 조회 RPC 정상 동작
올바른 비밀번호로 댓글 수정 가능
올바른 비밀번호로 댓글 삭제 가능
틀린 비밀번호로 수정/삭제 실패
댓글 테이블 직접 조회 차단
비밀번호 실패 테이블 직접 조회 차단
중복 댓글 차단 확인
rate limit 경로 확인
비밀 키 패턴 스캔
```

여기서 가장 중요했던 결과는 직접 테이블 접근이 막힌다는 점이었다. 공개 키로 `blog_comments`를 바로 읽을 수 있으면 RPC를 만든 의미가 없기 때문이다.

---

## 8. 작업하면서 배운 점

이번 댓글 기능은 겉으로 보기에는 작은 폼 하나지만, 실제로는 정적 사이트에서 백엔드 기능을 안전하게 붙이는 연습에 가까웠다.

가장 크게 느낀 점은 이거다.

> 공개 프론트엔드 키를 숨기려고 애쓰는 것보다, 그 키로 할 수 있는 일을 정확히 제한하는 것이 더 중요하다.
{: .prompt-info }

정적 블로그라서 서버가 없다는 제약은 있었지만, Supabase RPC를 경계로 세우니 생각보다 깔끔하게 해결됐다. GitHub Pages는 계속 정적으로 두고, 댓글 저장과 비밀번호 검증만 Supabase에 맡기는 구조가 됐다.

---

## 9. 다음에 개선하고 싶은 것

지금 댓글 기능은 기본적인 작성/수정/삭제와 최소한의 보안 장치를 갖춘 상태다. 앞으로 댓글이 실제로 많이 달리면 이런 것들을 추가해보고 싶다.

- 관리자용 댓글 숨김 처리
- 스팸 신고 버튼
- Cloudflare Turnstile 같은 봇 방어
- 댓글 작성 성공/실패 UI 개선
- 답글 기능
- 최근 댓글 모아보기

일단 지금은 내 블로그 글 아래에서 방문자가 바로 댓글을 남길 수 있게 됐다. 정적 블로그에 동적인 기능이 하나 붙으니, 블로그가 조금 더 살아있는 공간이 된 느낌이다.
