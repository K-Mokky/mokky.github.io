---
title: "웹 해킹 #session-basic ( by Dreamhack ) [ Web ]"
categories: [IT, Dreamhack]
---

# 워게임 (session-basic) #Web Hacking

**날짜:** Dreamhack
**URL:** https://blog.naver.com/PostView.naver?blogId=ththth03&logNo=223262730294&categoryNo=&parentCategoryNo=1&from=thumbnailList

---

워게임 (session-basic) #Web Hacking

먼저, 문제에서 제공되는 .py 파일을 살펴봄.

@app.route()라는 명령어가 존재하는 것을 확인.

@app.route(‘/login’)을 보아, http://host3.dreamhack.games:13654/login 라는 주소에서

마지막 부분인 /login을 의미하는게 아닌가 하는 생각을 함.

@app.route(‘/admin’)이라는 딱 봐도 뭔가 답일 것만 같은 것을 확인.

그 후, http://host3.dreamhack.games:13654/admin 을 입력해봄.

해당 주소에 다음과 같은 정보들이 뜨는 것을 확인.

{"0a251be2e6bda214de78a5ad6d060a6ad40ae3efd7fe1f9e009eae988974b634":"admin","650b96705264b43497d2a1a3057e5760b802a0ec8032fa41da88e2bc144bc848":"guest","7f5f471cc0785f7c82180a8daed6b5ab82dcdc11d60cad72309010323288c0a1":"user","cdff453b4fcea95f6a9bedb1a4cce4f5fc542c878e1c435f3d73949df76fbd16":"guest"}

:“admin”이라고 표시돼 있는 부분이 FLAG인가 싶어서 답을 집어넣었지만 실패.

DH{}안에 넣어서도 진행해봤지만 실패.

admin, guest, user가 .py 파일에 있던 유저 테이블과 요소들이 같다는 것을 확인.

혹시나 하는김에 로그인 후, 쿠키 확인.

뭔가 Value 값에 위에서 얻은 값을 집어넣으면 될거 같다는 생각을 하게됨.

값을 넣은 후 새로고침을 해보니 성공.

​

끝

---

## 이미지

![이미지 1](https://postfiles.pstatic.net/MjAyMzExMTJfMjA5/MDAxNjk5NzgzNjk4OTQy.fhR0YRTAOsQog3vaZpzK2BdUNef0MqgcNhW8bAOLuMMg.dsyiYJuYH-xCUChR5oxS6ZK_abn66b1BXrgD33345jgg.PNG.ththth03/image.png?type=w773)

![이미지 2](https://postfiles.pstatic.net/MjAyMzExMTJfMjQ4/MDAxNjk5NzgzNjgzMjY2.EzuLgcMjYQqi0hx4L0fzYk7YsjtD4qTtvs3tfTEXFgMg.OSBCnSoCraAUhgURstIsnAOC8WaCqye7-g2ZskVP8Dgg.PNG.ththth03/image.png?type=w80_blur)

---
*크롤링 시간: 2026-04-10T15:03:45.300Z*
