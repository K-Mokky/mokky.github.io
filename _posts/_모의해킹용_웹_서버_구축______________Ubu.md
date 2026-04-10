---
title: "모의해킹용 웹 서버 구축  Ubuntu(20.04.06 LTS) [Apache, MariaDB, PHP]"
categories: [IT, Web Hacking]
---

# 모의해킹용 웹 서버 구축              Ubuntu(20.04.06 LTS) [Apache, MariaDB, PHP]

**날짜:** Web Hacking
**URL:** https://blog.naver.com/PostView.naver?blogId=ththth03&logNo=223159484275&categoryNo=&parentCategoryNo=1&from=thumbnailList

---

모의해킹용 웹 서버 구축              Ubuntu(20.04.06 LTS) [Apache, MariaDB, PHP]

참고 자료

https://gomguk.tistory.com/57

https://blog.lael.be/post/10608

​

이래저래 우분투 따로 설치하는건 귀찮으니 마소 스토어를 이용해 우분투 설치.

​

해당 명령어를 이용하여 root 권한 획득. ( sudo를 사용해도 되지만, 명령어 칠때마다 매번 앞에 붙여줘야 되기 때문에 귀찮다. )

​

​

언어가 영어로 설정돼있는지 확인.

아무 의미 없는 'qwerty' 입력 후, 오류가 영어로 뜨는지 확인.

​

​

업데이트

​

​

아파치 설치

​

아파치 버전 확인.

Server version: Apache/2.4.41 (Ubuntu)

Server built:   2023-03-08T17:32:54

​

​

PHP 설치

​

해당 명령어를 입력하면 vi 창이 뜬다.

i 키를 눌러 입력 모드로 전환한 뒤,

<?php phpinfo(); ?> 를 입력.

ESC를 누르고, : 를 누른 뒤 wq를 입력하고 Enter.

​

웹 브라우저에

localhost/info.php

를 입력하여 PHP 설치 확인.

​

​

Maria DB 설치

​

를 입력하여 설정을 진행하면 된다.

​

Enter current password for root (enter for none):

이 문구가 나올텐데, 아마 비밀번호를 설정한게 없으니 Enter를 누르면 된다.

​

나는 여기서 Enter를 입력하자 오류가 발생했다.

ERROR 2002 (HY000)으로, MySQL 서버에 연결할 수 없다는 오류였다.

해결책은 간단하다.

서버를 시작해주기만 하면 된다.

서버 실행.

​

후에 다시

해당 명령어를 입력해준 뒤, 설정 진행.

​

설치 확인.

​

​

PHPMyAdmin 설치

선택사항이라고 하는데, 나는 뭐가 뭔지 몰라서 일단 설치했다.

PHP와 SQL DB의 연결과 관리를 쉽게 해주는 것이라고 한다.

​

웹 브라우저에

localhost/phpmyadmin

를 입력하여 설치 확인.

​

나는 404 ERROR가 발생했다.

해당 명령어로 다음 경로에

phpmyadmin.conf

파일이 존재하는지 확인.

나는 없어서 아래와 같은 명령어를 이용해 새 구성 파일을 생성해주었다.

​

해당 명령어를 이용하여 vi를 열어준다.

<Directory /var/www/>

</Directory>

를 찾아, 기존에 있던 문장들 앞에 #을 붙여 주석처리를 해준 뒤, 아래 문장들을 넣어준다.

​

​

서버를 재시작해준다.

​

확장자 보호를 위해 vi를 생성하고 아래와 같은 문장들을 입력해준 뒤 저장한다.

( i를 눌러 입력모드로 전환 후, 아래 명령어 입력 후 ESC, :, wq, Enter )

​

해당 명령어를 사용하여 아이피 주소를 확인할 수 있다.

'inet' 오른쪽 숫자를 웹 브라우저 주소창에 입력하면 된다!

​

을 이용하여 root 권한에서 나갈 수 있다.

이래도 안 나가진다면 ctrl + d 를 이용하자!

​

( root 권한이 없을 때 ) 해당 명령어로 서버를 키고 끌 수 있다.

​

​

현재 나는

아는 것 하나 없이

여러 자료들을 따라하는 중이다.

그래서

지금 내가 하고있는 것이 어떠한 기능을 위한 것인지, 잘못되진 않았는지 확신할 수 없다.

하지만, 따라하면서,

반복되는 구문이나 예측 가능한 구문 등을

저절로 배울 수 있을거라 믿는다.

​

오늘의 교훈

뭐든지 일단 시작하고 부딪혀보자!

​

끝

---

## 이미지

![이미지 1](https://postfiles.pstatic.net/MjAyMzA3MThfMjE0/MDAxNjg5NjUyNzgwNjY0.lu4kVqKI1-F9FKVCiN6X1o8hKCIe6dgl_Y__F_rXv30g.UsrRwrvAWFCCtOELsnC-UxpZVVdpVbq55E70WPvYhdEg.PNG.ththth03/image.png?type=w773)

![이미지 2](https://postfiles.pstatic.net/MjAyMzA3MThfNjcg/MDAxNjg5NjU1MTA4MjQ3.5cNAbZi-MNavmAlju3USeXIex5BMvEuqeTH7_hZA620g.TR6tRe_xBnqFvjhZJzzhqK4F-ohCc07VdbeGcxVSXPcg.PNG.ththth03/image.png?type=w80_blur)

---
*크롤링 시간: 2026-04-10T15:04:18.898Z*
