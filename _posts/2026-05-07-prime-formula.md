---
layout: post
title: "소수 패턴 탐구와 무한 소수 생성 공식"
date: 2026-05-07 10:57:00 +0900
categories: [math, prime]
tags: [소수, 수학, 공식, MathJax]
permalink: /prime-formula/
excerpt: "소수 패턴, n번째 소수 공식, 무한 소수 생성 재귀식을 MathJax로 읽기 좋게 정리한 글"
---

<link rel="stylesheet" href="/assets/css/prime-formula.css">

<script>
  window.MathJax = {
    tex: {
      inlineMath: [['\\(', '\\)']],
      displayMath: [['\\[', '\\]']],
      processEscapes: true
    },
    svg: { fontCache: 'global' }
  };
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>

<div class="prime-formula-post" markdown="1">

# 소수 패턴 탐구와 무한 소수 생성 공식

작성일: 2026-05-07  
작성 목적: 소수가 나타나는 패턴을 계산해 보고, 그 패턴을 바탕으로 소수를 정확히 걸러내는 수학적 공식과 무한히 많은 소수를 생성하는 공식을 정리한다.

> 정직한 한계: 이 문서는 “세계 최초의 소수 공식 발견”을 주장하지 않는다. 소수의 모든 구조를 닫힌형 초등식으로 간단히 설명하는 문제는 매우 깊다. 대신 여기서는 직접 계산에서 보이는 패턴을 바탕으로, 증명 가능한 정확한 공식과 무한 생성 절차를 만든다.

---

## 1. 계산 관찰

10,000 이하의 소수를 계산하면 총 1,229개가 나온다.

처음 25개의 소수는 다음과 같다.

\[
2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97
\]

### 1.1. \(6\)으로 나눈 나머지 패턴

\(3\)보다 큰 소수는 모두 다음 둘 중 하나이다.

\[
p \equiv 1 \pmod 6
\quad\text{또는}\quad
p \equiv 5 \pmod 6
\]

10,000 이하 소수 중 \(3\)보다 큰 것들을 세면 다음과 같다.

| 나머지 | 개수 |
|---:|---:|
| \(1 \pmod 6\) | 611 |
| \(5 \pmod 6\) | 616 |

왜냐하면 정수의 \(\bmod 6\) 나머지는

\[
0,1,2,3,4,5
\]

뿐인데, \(0,2,4\)는 짝수이고, \(3\)은 3의 배수이다. 따라서 \(3\)보다 큰 소수가 될 수 있는 나머지는 \(1,5\)뿐이다.

즉, \(3\)보다 큰 모든 소수 후보는

\[
6k-1,\quad 6k+1
\]

꼴이다.

주의할 점은 이것이 충분조건은 아니라는 것이다. 예를 들어

\[
25=6\cdot 4+1
\]

이지만 소수가 아니다.

따라서 패턴은 다음과 같다.

\[
\boxed{\text{소수 후보는 }6k\pm1\text{이고, 그중 약수를 갖지 않는 수만 소수이다.}}
\]

---

## 2. 나머지 기반 약수 판별 함수

정수 \(a,b\)에 대해 다음 함수를 정의한다.

\[
D(a,b)=1-\left\lceil \frac{a\bmod b}{b}\right\rceil
\]

그러면

\[
D(a,b)=
\begin{cases}
1, & b\mid a,\\
0, & b\nmid a.
\end{cases}
\]

즉 \(D(a,b)\)는 “\(b\)가 \(a\)의 약수인가?”를 나타내는 함수이다.

---

## 3. 소수 판별 공식

자연수 \(m\ge 2\)에 대해 다음 함수를 정의한다.

\[
\Phi(m)
=
\prod_{d=2}^{\lfloor \sqrt m\rfloor}
\left(1-D(m,d)\right)
\]

빈 곱은 \(1\)로 둔다. 그러면

\[
\Phi(m)=
\begin{cases}
1, & m\text{이 소수},\\
0, & m\text{이 합성수}.
\end{cases}
\]

### 증명

합성수 \(m\)은 어떤 약수 \(d\)를 가지며, 그중 하나는 반드시

\[
2\le d\le \sqrt m
\]

범위 안에 있다. 이때 \(D(m,d)=1\)이므로

\[
1-D(m,d)=0
\]

이 되어 곱 전체가 \(0\)이 된다.

반대로 \(2\le d\le \sqrt m\)인 어떤 정수로도 나누어떨어지지 않으면 \(m\)은 합성수가 아니므로 소수이다. 따라서 모든 항이 \(1\)이 되어 \(\Phi(m)=1\)이다.

---

## 4. \(n\)번째 소수를 구하는 정확한 공식

\(n\)번째 소수 \(p_n\)은 다음과 같이 쓸 수 있다.

\[
\boxed{
p_n
=
\min\left\{
M\in\mathbb N:
\sum_{m=2}^{M}\Phi(m)\ge n
\right\}
}
\]

여기서

\[
\Phi(m)
=
\prod_{d=2}^{\lfloor \sqrt m\rfloor}
\left(1-\left(1-\left\lceil \frac{m\bmod d}{d}\right\rceil\right)\right)
\]

이므로 더 직접적으로 쓰면

\[
\boxed{
p_n
=
\min\left\{
M\in\mathbb N:
\sum_{m=2}^{M}
\prod_{d=2}^{\lfloor \sqrt m\rfloor}
\left\lceil \frac{m\bmod d}{d}\right\rceil
\ge n
\right\}
}
\]

이 식은 모든 \(n\in\mathbb N\)에 대해 \(n\)번째 소수를 정확히 준다.

예를 들면

\[
p_1=2,
\quad p_2=3,
\quad p_3=5,
\quad p_4=7,
\quad p_5=11
\]

이다.

---

## 5. \(6k\pm1\) 패턴을 반영한 후보 압축 공식

\(3\)보다 큰 소수 후보를 순서대로 나열하는 함수 \(c_t\)를 다음처럼 둔다.

\[
\boxed{
c_t=6\left\lfloor\frac{t+1}{2}\right\rfloor+(-1)^t
\quad(t=1,2,3,\dots)
}
\]

그러면

\[
c_1=5,
\quad c_2=7,
\quad c_3=11,
\quad c_4=13,
\quad c_5=17,
\quad c_6=19,
\dots
\]

이다.

후보 \(c_t\)가 진짜 소수인지 판별하는 함수는 다음처럼 둘 수 있다.

\[
\Psi(c_t)
=
\prod_{\substack{j\ge 1\\ c_j\le \sqrt{c_t}}}
\left(1-D(c_t,c_j)\right)
\]

그러면 \(c_t\)가 소수이면 \(\Psi(c_t)=1\), 합성수이면 \(\Psi(c_t)=0\)이다.

따라서 \(n\ge3\)에 대해

\[
\boxed{
p_n
=
c_T
\quad\text{where}\quad
T=
\min\left\{
L\in\mathbb N:
2+\sum_{t=1}^{L}\Psi(c_t)\ge n
\right\}
}
\]

이다. 앞의 \(2\)는 소수 \(2,3\)을 미리 센 것이다.

이 공식은 모든 정수를 보는 대신 \(6k\pm1\) 후보만 검사한다는 점에서 계산 관찰을 반영한다.

---

## 6. 무한히 많은 소수를 생성하는 공식

이번에는 모든 소수를 순서대로 나열하는 공식이 아니라, 서로 다른 소수를 끝없이 만들어내는 공식을 만든다.

\[
\boxed{
e_1=2
}
\]

그리고

\[
\boxed{
e_{n+1}
=
\min\left\{
d\in\mathbb N:
 d\ge2,\ d\mid\left(1+\prod_{i=1}^{n}e_i\right)
\right\}
}
\]

즉, 지금까지 얻은 소수들을 모두 곱하고 \(1\)을 더한 수의 가장 작은 약수를 다음 항으로 잡는다.

계산하면 처음 항들은 다음과 같다.

\[
2,
3,
7,
43,
13,
53,
5,
6221671,
38709183810571,
139,
2801,
11,
\dots
\]

### 증명

\(e_{n+1}\)은 어떤 자연수의 가장 작은 \(2\) 이상의 약수이다. 만약 \(e_{n+1}\)이 합성수라면, \(e_{n+1}\)의 더 작은 소인수가 존재하고, 그 소인수도

\[
1+\prod_{i=1}^{n}e_i
\]

를 나누어야 한다. 이는 \(e_{n+1}\)이 가장 작은 약수라는 정의에 모순이다. 따라서 \(e_{n+1}\)은 소수이다.

또한 기존의 어떤 \(e_i\)도

\[
1+\prod_{i=1}^{n}e_i
\]

를 나눌 수 없다. 왜냐하면 기존 \(e_i\)로 나누면 곱 부분은 \(0\)이고 전체는

\[
1\pmod{e_i}
\]

가 되기 때문이다.

따라서 매번 새로운 소수가 나온다. 그러므로 이 공식은 무한히 많은 서로 다른 소수를 생성한다.

---

## 7. 결론

이 탐구에서 얻은 핵심은 다음과 같다.

1. \(3\)보다 큰 소수는 반드시 \(6k\pm1\) 꼴이다.
2. 하지만 \(6k\pm1\) 꼴이라고 전부 소수는 아니다.
3. 정확한 소수 판별은 \(\sqrt m\) 이하 약수 존재 여부로 결정된다.
4. 이를 곱 공식으로 바꾸면 \(n\)번째 소수를 정확히 표현할 수 있다.
5. 유클리드식 재귀 공식을 사용하면 무한히 많은 서로 다른 소수를 생성할 수 있다.

따라서 최종 공식은 두 가지이다.

### 모든 \(n\)번째 소수를 정확히 주는 공식

\[
\boxed{
p_n
=
\min\left\{
M\in\mathbb N:
\sum_{m=2}^{M}
\prod_{d=2}^{\lfloor \sqrt m\rfloor}
\left\lceil \frac{m\bmod d}{d}\right\rceil
\ge n
\right\}
}
\]

### 무한히 많은 소수를 생성하는 공식

\[
\boxed{
e_1=2,
\qquad
e_{n+1}
=
\min\left\{
d\in\mathbb N:
 d\ge2,\ d\mid\left(1+\prod_{i=1}^{n}e_i\right)
\right\}
}
\]

첫 번째 공식은 모든 소수를 순서대로 정확히 찾는 공식이고, 두 번째 공식은 서로 다른 소수를 무한히 계속 생성하는 공식이다.

</div>
