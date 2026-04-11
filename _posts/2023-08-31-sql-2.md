---
title: "SQL Injection #2"
categories: [IT, Web Hacking]
---

# SQL Injection #2 ( Time based SQL Injection ) Ubuntu(20.04.06 LTS) [Apache, MariaDB, PHP]

**날짜:** Web Hacking
**URL:** https://blog.naver.com/PostView.naver?blogId=ththth03&logNo=223198539733&categoryNo=&parentCategoryNo=1&from=thumbnailList

---

SQL Injection #2 ( Time based SQL Injection ) Ubuntu(20.04.06 LTS) [Apache, MariaDB, PHP]

저번에 SQL Injection에 대해 간단하게 공부했었다.

이번엔 실습을 해보려고 하는데,

저번에도 말했듯이 나는 time based Blind SQL Injection을 실습할 계획이다.

​

먼저, Blind SQL Injection이란,

Blind라는 뜻 그대로 보이지 않는 SQL 삽입 공격이다.

여기서 '보이지 않는'다는 것은 SQL Injection을 진행할 때,

DB의 메시지가 공격자에게 보이지 않을 때를 뜻한다.

​

그렇다면,  여기서 하나의 의문이 생길 것이다.

아니, 공격이 성공했는지 어쨌는지 확인을 모다면 공격을 어떻게 한다는거야?

라는 궁금증이 말이다.

이 질문에 대한 해답은 'Time based'에 존재한다.

Time based라는건

말 그대로 시간을 이용한다는 뜻이다.

메세지가 보이지 않으니 다른 방식, 즉 시간으로

웹의 반응을 받아보겠다는 것이다.

​

우리가 이번 실습에 웹의 반응을 확인하기 위해 사용할 명령어는 sleep()이다!

sleep()... 딱봐도 뭔가 시간을 길게 늘어뜨려주는 것 같이 생기지 않았는가!

그 예상대로!!!

이는 괄호 안에 있는 시간만큼 페이지 응답을 대기시키는 명령어다.

이 sleep()을 SQL 취약점이 있는 웹에서 조건에 따라 작하도록 한 뒤,

페이지 응답의 지연 유무를 확인해 정보를 유추해볼 수 있는 것이다!

​

무언가 입력하여 서버에 보낼 수 있는 페이지에서 실습을 진행하면 되는데,

이번엔 로그인 페이지에서 진행해보도록 하겠다.

​

먼저, 아래와 같이 항상 참인 조건문을 이용해 SQL 취약점이 있는지 확인해야 한다.

비밀번호를 입력하지 않으면 진행되지 않으니

같은 쿼리문을 아이디와 비밀번호 칸에 작성해주고 로그인 버튼을 눌러준다.

된다!!!

SQL 취약점이 존재한다!!

​

이제 조건을 바꿔서 DB의 이름을 알아내보자!

먼저, 위 커리문에서 '숫자' 부분을 바꿔가며 DB 이름의 길이를 찾아야 한다.

1을 입력해보면 sleep()이 작동하지 않는 것을 볼 수 있다.

그렇다면? DB 이름은 1자리가 아니라는 뜻이다.

1부터 계속 숫자를 늘려가면서 시도 해보면, DB 길이가 5라는 것을 알 수 있다.

다음 동영상

subject

author

죄송합니다. 문제가 발생했습니다. 다시 시도해 주세요.

고화질 재생이 가능한 영상입니다.
				설정에서 해상도를 변경해보세요.

알아냈다!

​

그 다음에는 DB 이름 중 첫 글자를 이와같은 방식으로 알아내야 한다.

또 그 다음에는 두 번째 글자를, 그 다음에는 세 번째, ...

이렇게 모든 정보를 알아낼 때까지 '무한반복'하면 된다.

계속해서 조건을 바꿔가며

table 이름, 항목 이름, 아이디, 비번 등을 알아내면 되는 것이다.

​

다른 방법 없나요? 정말 무작정 하나하나 다 해봐야 되는건가요?

그렇다, 우리가 자물쇠 비밀번호를 까먹었을 때,

0000부터 9999까지 하나하나 다 해보는 것처럼 이 또한 '노 가 다' 해야된다.

언제까지? 원하는 정보를 다 알아낼 때까지~

​

오늘은 DB 이름까지만 알아보자.

​

첫 번째 글자가 h이면, 아래와 같은 쿼리문을 입력했을 때, sleep()이 작동한다.

​

다음으로, 두 번째 글자가 a이면, 아래와 같은 쿼리문을 입력했을 때, sleep()이 작동한다.

​

또, 세 번째 글자가 m이면, 아래와 같은 쿼리문을 입력했을 때, sleep()이 작동한다.

​

이번엔, 네 번째 글자가 e이면, 아래와 같은 쿼리문을 입력했을 때, sleep()이 작동한다.

​

마지막으로, 다섯 번 째 글자가 r이면, 아래와 같은 쿼리문을 입력했을 때, sleep()이 작동한다.



이렇게 DB의 이름을 알아냈으면, 마지막으로 아래의 쿼리문을 이용해

내가 알아낸 DB의 이름이 맞는지 확인해볼 수 있다.

된다!!

우리는 드디어 '해킹'을 해낸 것이다!!!

우리가 해킹하고자 하는 웹의 DB 이름은 'hamer'라는 것을

time baed - blind - SQL Injection을 통해 알아낸 것이다!!

​

다른 사용자의 아이디나 비밀번호를 알아내고 싶으면 알아낼 때까지

무한으로 '노 가 다'하면 된다.

나는 DB 이름을 구한것에만 만족하려고 한다.

아이디나 비밀번호까지 시도해보려고 하는 사람에게는 응원하겠다!



​

​

+

​

아래는 table 이름의 길이를 구하는 쿼리문이다.

​

아래는 table의 첫 번째 문자를 구하는 쿼리문이다.

아까 DB 이름을 구할 때, 사용했던 쿼리문과 비슷하기에

두 번째, 세 번째 문자를 구할 때,

어떻게 쿼리문을 수정해야하는지에 대해서는

본인이 알거라고 믿는다.

​

내 포스팅을 보고 DB를 그대로 만들었다면,

DB 이름은 'hamer'

로그인 정보가 있는 table의 이름은 'member'

첫 번째 컬럼명은 'id'

두 번째 컬럼명은 'password'

일 것이다.

​

​

오늘의 교훈

time based SQL Injection을 방어하기 위해서는

SQL 취약점이 발생하지 않도록 코딩하는것도 있지만,

DB 이름부터 각 항목들을 유추하기 어렵고 길게 설정해야한다는 것을

이번 실습을 통해 알 수 있었다.

학교에서 배운 정보보안의 3요소(CIA) 중 하나인

기밀성(Confidentiality)의 중요성에 대해 알 수 있었던 활동이었다.

끝

​

​

​

참고자료료

https://blog.naver.com/kihyun1998/222549315105

https://tkdrms568.tistory.com/148

https://blog.naver.com/wldms6269/222806554350

https://blog.naver.com/jjeongs_etc/223058772980

​

---

## 이미지

![이미지 1](https://postfiles.pstatic.net/MjAyMzA4MzFfMTkz/MDAxNjkzNDUyNDM2ODk0.pHTmUAK3m136ZkwBpXDk90Uki6g5ipCIs-Zoz2waaHMg.Ja4N85OMj6UH-SEziwaxYM5lY9aBM-ltMsjWrnHwBNkg.PNG.ththth03/image.png?type=w80_blur)

![이미지 2](https://postfiles.pstatic.net/MjAyMzA4MzFfMTQz/MDAxNjkzNDUyNTM0MzM1.lPRJzlYDkO22boaLXIyRt0haTXmu3FmR_UvSzSdGHmIg.Qy9uStu5AJwak4Hpv8xbKt8fMniwbheZDFX0BWv4s2og.PNG.ththth03/image.png?type=w80_blur)

![이미지 3](https://postfiles.pstatic.net/MjAyMzA4MzFfNTYg/MDAxNjkzNDUzNTAzMDk4.mHPTi75xtFk4FpdT5pLUeGozqSNAxjnfnvLcZTPrmtAg.khpOWpk3aPfxV89dyYiSX_fXCCy0MjU41F_1G0t7hnIg.PNG.ththth03/image.png?type=w80_blur)

![이미지 4](https://postfiles.pstatic.net/MjAyMzA4MzFfNDcg/MDAxNjkzNDUzNzI5NDI1.xWmNl25XwrAGZx26jXB_3FdSPBVkSllL10sXKK-UFkwg.6l-se634FJ1qycIcDA0bCEpwsWNzkCSzqzvyrNebUvgg.PNG.ththth03/image.png?type=w80_blur)

![이미지 5](https://postfiles.pstatic.net/MjAyMzA4MzFfMTk1/MDAxNjkzNDUzNzg1MTAx._qExkfA9Gs9DMSQphp0eBsCMywp1b41w4OwjDarrOxYg.GnPdDKMLNOQ0hc7dQo0SoDEeKfMkqTwRZYDB0pk-7VYg.PNG.ththth03/image.png?type=w80_blur)

![이미지 6](https://postfiles.pstatic.net/MjAyMzA4MzFfMjI1/MDAxNjkzNDUzODE2NjA2.6Pm80DPr6boAC7d-u4nJZJN2OePu_xkAgUW0I4Htg2Ug.2wSaM3DMgdK1BsgNu6psyDG9AknVVgFCg5CuF_RkOmMg.PNG.ththth03/image.png?type=w80_blur)

![이미지 7](https://postfiles.pstatic.net/MjAyMzA4MzFfMjA2/MDAxNjkzNDUzODQ3ODYz.c5b-2ur-4C8oPKSfUI2jg-lbsoUiaIBuQzY2BNWGuUUg.ukUZ_tAnBrUy16TuaPIhG_5aWcJNKdN_pSzzjkdlmX8g.PNG.ththth03/image.png?type=w80_blur)

![이미지 8](https://postfiles.pstatic.net/MjAyMzA4MzFfNDcg/MDAxNjkzNDUzOTczNjQ0.u0g6ENxEt0TO254AFcrCIHsE7Rpi9yEKMci6i-JGWwsg.kztcYbsAbV1Dm4n346EArkR4Jd-oewVUZtOt3wzqHTAg.PNG.ththth03/image.png?type=w80_blur)

---
*크롤링 시간: 2026-04-10T15:03:53.876Z*
