---
title: "웹 해킹 #2 ( by Dreamhack ) [ Web ]"
categories: [IT, Dreamhack]
---

# 웹 해킹 #2 ( by Dreamhack ) [ Web ]

**날짜:** Web Hacking
**URL:** https://blog.naver.com/PostView.naver?blogId=ththth03&logNo=224054285021&categoryNo=&parentCategoryNo=1&from=thumbnailList

---

웹 해킹 #2 ( by Dreamhack ) [ Web ]

컴퓨터의 모든 데이터는 0과 1로 구성된다.

​

0과 1로 우리의 문자를 표현하기 위해,

우리는 '인코딩 표준'이라는 규칙을 정했다.

​

인코딩 표준의 대표적인 예시로,

아스키코드 ( ASCII )와 유니코드 ( Unicode )가 있다.

​

ASCII와 Unicode는 각각 7비트와 32비트로 표현된다.

​

당연하게도, 더 많은 비트수로 표현되는 Unicode가 더 많은 문자를 표현할 수 있다.

​

ASCII는 only 영어, Unicode는 수많은 국가의 언어들도 포함된 인코딩 표준이라 생각하면 된다.

ASCII 코드 표 / 출처 : https://velog.io/@exploit017/아스키-코드표

Unicode 표의 일부 / 출처 : https://www.smashingmagazine.com/2012/06/all-about-unicode-utf8-character-sets/

컴퓨터와의 통신에서 규격화된 상호작용을 위해 적용되는 약속을 프로토콜 ( Protocol )이라 한다.

​

컴퓨터에게 융통성이란 존재하지 않기 때문에 원활한 통신을 위해 대부분의 프로토콜은

'문법'을 포함한다.

​

이러한 문법을 어긴 메시지는 잘못 전송된 것으로 취급하며 오류를 방지하는 것이다.

​

현재까지의 표준 통신 프로토콜의 대표적인 예시로는 네트워크 통신의 기초가 되는 TCP/IP,

웹 어플리케이션의 HTTP,

파일을 주고받을 때 사용하는 FTP가 있다.

​

HTTP ( Hyper Text Transfer Protocol )란, 클라이언트와 서버의 데이터 교환을

'요청'과 '응답' 형식으로 정의한 프로토콜이다.

​

HTTP의 기본 매커니즘은 클라이언트가 서버에게 요청, 서버는 이에 응답하는 것이다.

​

웹 서버는 HTTP 서버를 HTTP 서비스 포트에 대기시킨다.

​

일반적으로, 이 서비스 포트는 TCP/80 or TCP/8080이다.

​

클라이언트가 서비스 포트에 '요청'을 하면, 서버가 이를 해석하여 적절한 응답을 반환하는 것이다.

요청의 예

응답의 예

여기서 네트워크 포트란,

네트워크에서 클라이언트와 서버가 정보를 공유하는 추상화된 장소를 말한다.

​

서비스 포트는 포트들 중에서도 특정 서비스가 점유하고 있는 포트를 말한다.

​

예를 들어,

위의 HTTP의 포트가 TCP/80이라면,

HTTP는 80번 포트를 서비스 포트로 점유하고 있다는 뜻이다.

​

포트로 데이터를 공유하는 방식은 '전송 계층'의 프로토콜을 따른다.

​

대표적으로 TCP와 UDP가 있다.

​

TCP는 인터넷상에서 데이터를 메세지 형태로 보내기 위해 IP와 함께 사용하는 프로토콜,

UDP는 데이터를 데이터그램 단위로 처리하기 위해 사용하는 프로토콜이라고 설명할 수 있다.

출처 : https://mangkyu.tistory.com/15

​

---

## 이미지

![이미지 1](https://images.velog.io/images/exploit017/post/9eb5ba8c-326f-4ede-9706-7c0d260c6301/image.png)

![이미지 2](https://archive.smashing.media/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/45a57cd3-f839-4d7e-9773-3344ed0b8164/unicode-javascript-yellow.png)

![이미지 3](https://postfiles.pstatic.net/MjAyMzA3MjhfMTky/MDAxNjkwNTM5NzA2MDMy.WN9O8KrWhECsSrujJ3KRi68GLvXIuL9V9t_ayiUFBcMg.I6nDaVv51MQ6rxYIr3-AC60p_o61ZgGCIzMrI0un19og.PNG.ththth03/image.png?type=w80_blur)

![이미지 4](https://postfiles.pstatic.net/MjAyMzA3MjhfMTc0/MDAxNjkwNTM5NzE1OTI2.-8LnnewGIy4KwnKMiUEAMIHDf57Zsdxq_551EjtxjHEg.t21fNhTC4hoQ9DjAWSnaaJhQo4Io_EWBGLCQaELKU9og.PNG.ththth03/image.png?type=w80_blur)

---
*크롤링 시간: 2026-04-10T15:03:35.762Z*
