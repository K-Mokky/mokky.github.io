---
title: "Pwnable.kr [fd]"
categories: [IT, System Hacking]
---

# Pwnable.kr [fd]

**날짜:** System Hacking
**URL:** https://blog.naver.com/PostView.naver?blogId=ththth03&logNo=224144088904&categoryNo=&parentCategoryNo=1&from=thumbnailList

---

Pwnable.kr [fd]

Pwnable.kr이란?

시스템 해킹을 실습으로 배울 수 있는 아주아주아주 유용한 사이트이다.

사이트에 접속해보면, 각 파트별로 몬스터의 사진과 이름이 있다.

몬스터의 이름은 해당 문제에서 실습해볼 수 있는 분야와 연관이 있다.

​

나는 시스템 해킹에 대해 아는게 없다.

그렇기에,

내 글들은 하나하나 공부해나가는

일련의 과정이라는 점 참고하여 읽어주었으면 한다.

​

오늘은 이 친구를 잡아보자.

​

첫 번째 친구이다 보니, ssh 접속 정도의 튜토리얼이지 않을까 싶다.

​

'Powershell'이나 'Ubuntu'에 위 명령어를 입력하여 ssh 접속을 해보자.

​

​

게임을 시작하기 앞서, 어떻게 플레이해야 하는지 알아보자.

포너블 게임의 최종목표는 'Flag'라는 무기를 찾아내 몬스터를 처치하는 것이다.

어떻게든 'Flag' 파일을 찾아서 읽어낸 뒤,

사이트에 있는 Flag? 부분에 입력하면 몬스터을 수 있는 것이다.

​

​

​

모두 다같이 레벨업 하러 가보도록 하자.

​

위 명령어를 이용하여 해당 디렉토리에 있는 모든 파일들을 한번 살펴보자.

​

flag 파일이 있다!

​

튜토리얼 일지라도 쉽게 잡혀주지는 않는다...

​

​

그렇다면, 우리가 실행할 수 있는 유일한 파일인 fd 파일을 이용해야

'Flag'를 획득할 수 있다.

​

​

우선, fd.c 파일을 읽어보자.

이게 머선 소리고?

​

0x1234라는 값이 보이니 이를 10진수로 변경해서 실행해보자!

​

​

어? 뭔가 입력하는 칸이 뜬다!

fd.c에서 "LETMEWIN" 문자열과 일치하는지 확인하는 코드가 있었기 때문에

한번 입력을 해보자.

​

띠용?

이게 되네?

​

코드를 하나하나 분석해보면서, 왜 된건지 어떠한 원리인건지 알아보자...!

​

먼저, 이름에 대해서 알아보자.

시스템해킹에서 fd(File Descriptor = 파일 서술자)는

유닉스 계열 운영체제에서 파일이나 네트워크 자원에 접근할 때 사용하는 고유 번호라고 한다.

​

위 코드에서 'argc'는 프로그램을 실행할 때, 전달된 '인자의 개수'를 의미한다.

그렇기에, 우리가 ./fd ? 로 실행했을 때, ?가 입력되는 부분은 'argv' 부분이다.

​

"입력된 인자가 1개 이하일 때"를 가정하는 것이라는 것만 인지하고 패스~

​

atoi() 함수는 내부 문자열을 정수로 바꿔주는 함수이다.

즉, 해당 코드는 우리가 입력한 정수 값에서 0x1234를 뺀 값을 'fd'에 입력하는 것이다.

​

재미나이에게 물어보니, 위 코드의 뜻은

fd에서 32바이트까지 읽은 뒤, 해당 문자열을 'buf'에 저장하고

문자열의 길이는 'len'에 저장하는 거라더라고한다.

​

​

'strcmp(A,B)'는 A==B이면 0을, 그렇지 않으면 1을 반환한다.

따라서, 우리는 'buf'에 'LETMEWIN'을 입력해야 한다.

​

"LETMEWIN"을 16진수로 변환하면, '0x4C45544D4557494E'이다.

혹시나 하고, 여기에 0x1234를 더하고 입력해보았지만, 되진 않았다. ㅎㅎ

​

'fd'는 위에서 말했듯, 'File Descriptor'이다.

'fd'는 번호에 따라 이름과 역할이 아래처럼 존재한다.

0

stdin ( 표준 입력 )

키보드 입력

1

stdout ( 표준 출력 )

모니터 출력

2

stderr ( 표준 에러 )

에러 로그 출력

​

우리는 'buf'에 "LETMEWIN"을 입력해야되기 때문에,

'fd = 0'을 만족시켜줘야 한다.

0x1234를 입력하게 되면, 위의 코드로 인해 'fd = 0'이 된다.

​

0x1234 = 4660 ( 10 )

'4660'을 넣어,

입력모드로 변경한 후에 "LETMEWIN"을 입력하면

'Flag'가 출력된다~!

​

​

끗

​

---

## 이미지

![이미지 1](https://postfiles.pstatic.net/MjAyNjAxMDlfMTQw/MDAxNzY3OTQ1MjM0ODUy.7sxKRS_XO8Xa-CMnYA8V8EFxf3f3YYNaT7C6BbCDUNgg.odIV_TOYC_WHY5ENYRCfSC0pa7soybtAdRupHevXflUg.PNG/image.png?type=w773)

![이미지 2](https://postfiles.pstatic.net/MjAyNjAxMDlfMjYx/MDAxNzY3OTQ1MjY5NzY3.Nd9PgY93-IazMzakPFgSQFFkE8eRx6DYpOWA26_1aaIg.oSbJvKxne8cXhMqv4n4wU8-UUVLwLwVafDdqk_nVNMAg.PNG/image.png?type=w80_blur)

![이미지 3](https://postfiles.pstatic.net/MjAyNjAxMDlfNjYg/MDAxNzY3OTQ1NTMxOTA2.PWUorzFqBgM9aQvZ_dciOON7OX0QPJJJK5o0ne-nrbgg.u8veMiplviCeROkMgv5aZFKqSBE8ejqhU46qn0s-bLQg.PNG/image.png?type=w80_blur)

![이미지 4](https://postfiles.pstatic.net/MjAyNjAxMDlfMjU1/MDAxNzY3OTQ1NDk5OTcz.yDfAzqFZY_ufFRVCa5-6MeDoIH3CG8NAcRrPQ__YAMYg.rTNT3Id3ElkCqlmFRzpBdocJ_GTNDFEA5wXO5SvAxyMg.PNG/image.png?type=w80_blur)

![이미지 5](https://postfiles.pstatic.net/MjAyNjAxMDlfNzQg/MDAxNzY3OTQ1NzIwNDQw.iJcQpi4YPUWlUch_g0xyoLvTd4CXLaZ-y3Zt9qgz8OIg.8kORZ5rmed5CCD6q_qkNDaSBmFeZPSvmRNwMV9lCpBUg.PNG/image.png?type=w80_blur)

![이미지 6](https://postfiles.pstatic.net/MjAyNjAxMDlfMjI5/MDAxNzY3OTQ1OTUxMjc3.e4fQlGjeYXHKlI4yRW1mJazqUzHxxNYlluQtEKe7jP0g.CKe0xnS3yDaKrFqGz6yzGYa5TaW_8lKjHPCuamnXx1kg.PNG/image.png?type=w80_blur)

![이미지 7](https://postfiles.pstatic.net/MjAyNjAxMDlfNDcg/MDAxNzY3OTQ2MTU0NzU5.8c6IvGtizvml47NZ08QDhH4XEz05o-i2KAbRxLO_hfUg.gL4SI98REFsXPGpK8uzeTRHgWXd1qrxKWr5iz_9MOHIg.PNG/image.png?type=w80_blur)

![이미지 8](https://postfiles.pstatic.net/MjAyNjAxMDlfMTM1/MDAxNzY3OTQ2MjA4NjAw.QutnYE17nIgQDdK7XLHsj6zwTnLYrfQG7GwbJ6mZSCEg.aGkKnPpmycEeiElzzGbssHIXmGAItMn_AvIN0E3wAiog.PNG/image.png?type=w80_blur)

![이미지 9](https://postfiles.pstatic.net/MjAyNjAxMTJfMjU1/MDAxNzY4MjE4Nzg4MDE4.8iHKbIXsbsNAi9yGSyiHOLMc79PPXJRXHuRgRA_Va5Ug.aypcBWgeyJdSj0saUn8Qsffupfb9S9kWR2bCdklBClcg.PNG/image.png?type=w80_blur)

---
*크롤링 시간: 2026-04-10T15:03:31.761Z*
