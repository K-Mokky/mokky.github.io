---
title: "SQL Injection #1"
categories: [IT, Web Hacking]
---

# SQL Injection #1 ( SQL Injection이란? ) Ubuntu(20.04.06 LTS) [Apache, MariaDB, PHP]

**날짜:** Web Hacking
**URL:** https://blog.naver.com/PostView.naver?blogId=ththth03&logNo=223193944798&categoryNo=&parentCategoryNo=1&from=thumbnailList

---

SQL Injection #1 ( SQL Injection이란? ) Ubuntu(20.04.06 LTS) [Apache, MariaDB, PHP]

많은 시행착오 끝에 드디어 웹을 만들었다.

비록, 완전한 웹이라고 할 순 없지만,

이를 만들면서 웹의 작동 방식에 대해 조금이나마 이해해보자는 목적은 이뤘던 것 같다.

실습 할 만한 환경을 만들었고, 웹에 조금이나마 발을 담가봤으니,

우리의 최종 목표인 모의해킹 실습을 시작해 볼 때가 다가왔다.

​

먼저, SQL Injection을 실습해보려 한다.

​

Why?

< 가장 흔한 공격이기 때문에 >

아마 이쪽 분야에 관심이 조금이라도 있는 사람들은

SQL Injection이라는 단어가 낯익을 것이다.

​

SQL Injection은 간단하게

DB 해킹

이라고 할 수 있다.

​

이를 길게 설명하자면

웹의 허점을 이용해, 악의적인 SQL문을 실행되게 함으로써

DB를 조작하는 코드 인젝션 공격 방법이라고 한다.

-출처- wikipedia

​

우리가 DB에 Table을 만들고, 그에 대한 정보를 확인할 때 사용했던

SELECT * FROM member;

등의 명령문을 사용하여 DB 정보를 빼오거나 권한을 얻는 것이다.

+ 이처럼 DB에 요청할 때 사용하는 명령문을 쿼리문이라고 한다.

​

예를 들어,

SQL 취약점이 있는 웹에 이와같은 쿼리문을 입력하게 되면,

1 = 1 이 항상 참이기 때문에 비밀번호를 입력하지 않고 로그인할 수 있게 되는 것이다.

​

또다른 예시를 들어보겠다.

이는 SQL Injection을 유머화한 만화인데,

학교에서 입력한 명령어는 아래와 같다.

하지만, 3번째 칸을 보면 아들의 이름이 Robert'); DROP TABLE students;-- 라고 한다.

이를 학생 이름에 대입해보면

라는 쿼리문이 된다는걸 알 수 있다.

이 만화의 4번째 컷을 통해서 DROP TABLE이라는 명령어가

테이블의 모든 정보를 삭제하는 기능을 한다는 것 또한 유추할 수 있다.

​

이처럼 SQL Injection은 DB를 이용해

사용자들의 정보를 빼오거나, 사용자에게 권한을 부여하는 공격이다.

​

SQL Injection에도 여러가지 종류가 있는데,

내가 실습해볼 것은 Blind SQL Injection 중 시간을 이용한 공격이다.

이는 다음 글에서 다뤄보도록 하겠다.

​

오늘의 교훈

SQL Injection은 매우 유명하기에 자료가 많아 공부하기 수월했다.

역시 공부할 땐 유명한게 짱이다!

​

끝

---

## 이미지

![이미지 1](https://postfiles.pstatic.net/MjAyMzA4MjZfNDUg/MDAxNjkzMDE4MTUyMjA3.4griJBV8DUp-IZ0fo7UkXayY5vxO653SBWUtT6wRKmYg.J6DXcqmmllQwkACynnoWqLIDEK2cmBGDQfoBFiAd0sQg.JPEG.ththth03/xrPCq2KkR8i0swiiY4L13sRGOHw8JgHUhEmV7p-1GrStgxRA-eVKWZt728-pi62GgYfk_1XJuI2y.jpg?type=w80_blur)

---
*크롤링 시간: 2026-04-10T15:03:58.140Z*
