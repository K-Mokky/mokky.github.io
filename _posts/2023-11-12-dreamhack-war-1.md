---
title: "웹 해킹 #devtools-sources ( by Dreamhack ) [ Web ]"
categories: [IT, Dreamhack]
---


# 워게임 (devtools-sources) #Web Hacking

**날짜:** Dreamhack
---

워게임 (devtools-sources) #Web Hacking

문제 해답은 맨 아래쪽에...

​

​

​

먼저, 형광펜이 칠해져있는 문제 파일을 다운받는다.

그 후, 해당 파일의 압축을 풀어주면

아래와 같이 다양한 HTML 파일들을 확인해볼 수 있다.

우리가 문제를 푸는데 필요한 것들은 내가 위에 형광팬으로 칠해둔 부분이다.

이제, 가장 기본 페이지인 'index.html'부터 열어보자.

웹 브라우저로 실행을 하면 된다.

​

index.html

이러한 화면이 뜰 것이다.

여기서, F12를 눌러준다.

​

맨 위의 빨간색 동그라미가 쳐져있는 'Source' 부분을 클릭해보면

이와 같은 화면이 나올 것이다.

​

이제, FLAG를 찾아보도록 하자.

왼쪽 아래에 있는 빨간색 동그라미 부분을 보자.

그 부분이 이번 페이지의 소스코드들이다.

index.html, main.4c6e144e.js, main.3da94fde.css

위의 파일들을 모두 들어가서 하나하나 읽어보며 FLAG를 찾으면 되는 것이다.

​

ctrl + f를 누른 뒤, DH{ 를 입력하면 바로 찾을 수가 있다.

드림핵의 FLAG 형식은 DH{~}이기 때문이다.

​

먼저, index.html에서 찾아보자.

나오지 않는다.

​

그렇다면, 바로 다음으로 넘어간다.

main.4c6e144e.js 이다.

여기도 없다... 젠장....

​

이번엔 main.3da94fde.css 이다.

허허... 여기도 없네?

​

뭐야? 그러면 답이 없는거야?

​

아니다.

우리의 문제 파일에는 무려 4개의 HTML 파일이 존재했다.

그렇다면?

그렇다. 이와 같은 방법으로 4개의 HTML 파일을 모두 확인해봐야 한다.

​

라고 나는 생각했다.

하지만, 이렇게 해서는 절대 답을 찾을 수 없었다.

왜? 실제 정답은 webpack://에 있었기 때문이다.

이 부분에 말이다.

허허... 대놓고 주석처리로 FLAG가 나와있었다...

​

내가 FLAG가 저기에 위치한다는 것을 알게된 계기는 바로

ctrl + shift + F 였다.

ctrl + f는 해당 파일에서만 문자열을 검색하는 것이지만,

이 커맨드는 모든 파일에서의 문자열을 찾는 것이기 때문이다.



그렇다.

결론은 그냥

ctrl + shift + f

였다.

DH{ 를 입력하니 바로 찾아줬다...

너무 허무했다...

​

이제, FLAG를 답안란에 넣으면 끝나게 된다.

​

우와...

ㅔ...

끝이다.

​

끝

​

---

## 이미지

![이미지 1](/assets/img/2023-11-12-dreamhack-war-1-01.png)

![이미지 2](/assets/img/2023-11-12-dreamhack-war-1-02.png)

![이미지 3](/assets/img/2023-11-12-dreamhack-war-1-03.png)

![이미지 4](/assets/img/2023-11-12-dreamhack-war-1-04.png)

![이미지 5](/assets/img/2023-11-12-dreamhack-war-1-05.png)

![이미지 6](/assets/img/2023-11-12-dreamhack-war-1-06.png)

![이미지 7](/assets/img/2023-11-12-dreamhack-war-1-07.png)

![이미지 8](/assets/img/2023-11-12-dreamhack-war-1-08.png)

![이미지 9](/assets/img/2023-11-12-dreamhack-war-1-09.png)

![이미지 10](/assets/img/2023-11-12-dreamhack-war-1-10.png)

---
