---
layout: post
title: "About Me"
categories: [About]
---

<div class="custom-intro-section">
  <div class="intro-item">
    <div class="img-container">
      <img src="/assets/images/캐릭터.png" alt="Profile Image 1">
    </div>
    <div class="text-container">
      <h2>안녕하세요! 👋</h2>
      <p>이런저런 딴짓들 하고 있는 아주대학교 학생입니다~! 💻📊</p>
      <h3 style="margin-top: 20px;">딴짓 분야</h3>
      <ul style="line-height: 1.8;">
        <li><strong>Taking photos</strong></li>
        <li><strong>Making a home key using NFC</strong></li>
        <li><strong>pawnable.kr</strong></li>
        <li><strong>Dreamhack</strong></li>
        <li><strong>Create Web Service</strong></li>
        <li><strong>Web Hacking Study</strong></li>
      </ul>
    </div>
  </div>

  <div class="intro-item">
    <div class="img-container">
      <img src="/assets/images/아주대학교 로고.png" alt="Profile Image 2">
    </div>
    <div class="text-container">
      <h2>Contact 📬</h2>
      <p>궁금한 점이 있으시면, 언제든 아래 메일로 연락주세요~!</p>
      <ul style="list-style: none; padding-left: 0; line-height: 1.8;">
        <li>📧 Email: <a href="mailto:mokky@mokky.store">mokky@mokky.store</a></li>
        <li>🐙 GitHub: <a href="https://github.com/K-Mokky" target="_blank">https://github.com/K-Mokky</a></li>
      </ul>
      <blockquote style="margin-top: 25px; border-left: 4px solid #007bff; padding-left: 15px; color: #555; background: #f8f9fa; padding: 15px; border-radius: 5px;">
        <p style="margin-bottom: 10px;"><strong>"기록은 기억을 지배한다."</strong> - 꾸준히 딴짓한 내용들을 정리하고 있습니다~!</p>
        <p style="font-size: 0.85em; color: #888; margin-bottom: 0;">Assistance : Gemini PRO, ChatGPT PRO, Claude Code, Codex, etc.</p>
      </blockquote>
    </div>
  </div>
</div>

<style>
  .custom-intro-section {
    max-width: 900px;
    margin: 30px auto;
  }

  .intro-item {
    display: flex;
    align-items: center;
    margin-bottom: 60px;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .intro-item {
      flex-direction: column;
      text-align: center;
    }
  }

  .img-container {
    flex: 0 0 220px;
    margin-right: 40px;
    display: flex;
    justify-content: center;
  }

  .img-container img {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }

  .text-container {
    flex: 1;
    min-width: 300px;
  }

  @media (max-width: 768px) {
    .text-container {
      margin-top: 25px;
    }
    .img-container {
      margin-right: 0;
    }
    .text-container ul {
      text-align: left;
      display: inline-block;
    }
  }

  .text-container h2 {
    font-size: 1.8rem;
    margin-bottom: 10px;
    font-weight: bold;
  }

  .text-container h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
    color: #444;
  }

  .text-container p {
    font-size: 1.05rem;
    line-height: 1.6;
  }
</style>
