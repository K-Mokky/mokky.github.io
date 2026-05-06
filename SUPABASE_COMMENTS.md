# Supabase 댓글 설정

이 블로그는 Chirpy의 댓글 provider를 `supabase`로 확장해서 이름/비밀번호 기반 댓글을 사용합니다.

## 1. Supabase 프로젝트 만들기

1. Supabase에서 새 프로젝트를 만듭니다.
2. Dashboard > SQL Editor로 이동합니다.
3. `supabase/comments.sql` 전체를 붙여넣고 실행합니다.

SQL은 다음을 만듭니다.

- `public.blog_comments` 테이블
- 댓글 조회/생성/수정/삭제 RPC 함수
- RLS 활성화
- 브라우저에서 테이블을 직접 읽지 못하도록 table 권한 회수
- `anon`/`authenticated` 역할에는 검증된 RPC 실행 권한만 부여

## 2. 블로그 설정값 채우기

Supabase Dashboard > Project Settings > API에서 다음 값을 확인한 뒤 `_config.yml`에 입력합니다.

```yml
comments:
  provider: supabase
  supabase:
    url: https://YOUR_PROJECT_REF.supabase.co
    anon_key: YOUR_ANON_OR_PUBLISHABLE_KEY
    min_password_length: 4
    max_content_length: 2000
```

`anon_key` 또는 publishable key는 브라우저에 공개되는 값입니다. 대신 RLS와 RPC 권한으로 실제 접근 범위를 제한합니다. `service_role` key는 절대 넣으면 안 됩니다.

## 3. 동작 방식

- 글 URL(`page.url`)을 댓글 묶음 키로 사용합니다.
- 댓글 작성자는 이름, 비밀번호, 내용을 입력합니다.
- 비밀번호는 Supabase DB에서 `pgcrypto`의 bcrypt 기반 `crypt()`로 해시되어 저장됩니다.
- 수정/삭제 시 같은 비밀번호를 RPC 함수가 서버 쪽에서 검증합니다.

## 4. 운영 메모

- 댓글 길이는 기본 2000자입니다.
- 비밀번호는 bcrypt 한계 때문에 최대 72자입니다.
- 스팸이 늘면 Supabase Edge Function 또는 Cloudflare Turnstile을 추가하는 것을 권장합니다.


## 5. 보안 보강 사항

현재 SQL은 다음 방어를 포함합니다.

- 댓글 테이블과 비밀번호 실패 횟수 테이블 모두 RLS를 켭니다.
- 브라우저 역할(`anon`, `authenticated`)의 직접 table 권한을 회수합니다.
- 공개 클라이언트는 허용된 RPC 함수만 실행할 수 있습니다.
- 비밀번호는 `pgcrypto`의 bcrypt 기반 `crypt()`로 해시합니다.
- 수정/삭제 비밀번호 실패가 댓글 1개 기준 15분 안에 5회 누적되면 15분 동안 잠급니다.
- 같은 글에 1분당 5개를 넘는 댓글 생성을 막고, 같은 이름/내용의 10분 내 중복 댓글을 막습니다.

`sb_publishable_...` key는 공개 프론트엔드용 키라서 git에 들어갈 수 있습니다. 단, `sb_secret_...`, `service_role`, DB password, `SUPABASE_ACCESS_TOKEN`, `supabase/.temp`, `.env*` 파일은 커밋하면 안 됩니다.
