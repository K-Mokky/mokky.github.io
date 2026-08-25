(function () {
  const ATTR_TIMEOUT = "timeout";
  const ATTR_TITLE_ORIGIN = "data-bs-original-title";
  const ATTR_TITLE_SUCCEED = "data-title-succeed";
  const TIMEOUT = 2000;
  const FALLBACK_IMAGE = "https://mokky.store/assets/img/og-cover.png";

  function isLocked(node) {
    if (!node.hasAttribute(ATTR_TIMEOUT)) return false;
    return Number(node.getAttribute(ATTR_TIMEOUT)) > Date.now();
  }

  function lock(node) {
    node.setAttribute(ATTR_TIMEOUT, String(Date.now() + TIMEOUT));
  }

  function unlock(node) {
    node.removeAttribute(ATTR_TIMEOUT);
  }

  function showSucceed(btn) {
    const succeedTitle = btn.getAttribute(ATTR_TITLE_SUCCEED);
    if (!succeedTitle || typeof bootstrap === "undefined" || !bootstrap.Tooltip) {
      return;
    }

    const tooltip = bootstrap.Tooltip.getOrCreateInstance(btn);
    const defaultTitle = btn.getAttribute(ATTR_TITLE_ORIGIN) || btn.getAttribute("title") || "";

    btn.setAttribute(ATTR_TITLE_ORIGIN, succeedTitle);
    tooltip.show();
    lock(btn);

    window.setTimeout(() => {
      if (defaultTitle) {
        btn.setAttribute(ATTR_TITLE_ORIGIN, defaultTitle);
      } else {
        btn.removeAttribute(ATTR_TITLE_ORIGIN);
      }
      unlock(btn);
    }, TIMEOUT);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();

      try {
        document.execCommand("copy");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        area.remove();
      }
    });
  }

  function metaContent(name) {
    const el = document.querySelector(
      'meta[property="' + name + '"], meta[name="' + name + '"]'
    );
    return el ? el.getAttribute("content") || "" : "";
  }

  function sharePayload() {
    return {
      title: document.title,
      text: metaContent("og:description") || metaContent("description") || document.title,
      url: window.location.href,
      image: metaContent("og:image") || FALLBACK_IMAGE
    };
  }

  function openWindow(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function shareInstagram(btn) {
    const payload = sharePayload();

    copyText(payload.url)
      .catch(() => undefined)
      .finally(() => {
        showSucceed(btn);
        openWindow("https://www.instagram.com/");
      });
  }

  function initKakao() {
    const key = window.MOKKY_KAKAO_JS_KEY;
    if (!key || typeof Kakao === "undefined" || !Kakao.init) return false;
    if (!Kakao.isInitialized()) Kakao.init(key);
    return Kakao.isInitialized();
  }

  function copyFallback(btn, url) {
    copyText(url).then(() => showSucceed(btn));
  }

  function shareKakaoTalk(btn) {
    const payload = sharePayload();

    if (initKakao() && Kakao.Share && typeof Kakao.Share.sendDefault === "function") {
      try {
        Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: payload.title,
            description: payload.text,
            imageUrl: payload.image,
            link: {
              mobileWebUrl: payload.url,
              webUrl: payload.url
            }
          },
          buttons: [
            {
              title: "글 보러 가기",
              link: {
                mobileWebUrl: payload.url,
                webUrl: payload.url
              }
            }
          ]
        });
        showSucceed(btn);
        return;
      } catch (error) {
        copyFallback(btn, payload.url);
        return;
      }
    }

    if (navigator.share) {
      navigator
        .share({
          title: payload.title,
          text: payload.text,
          url: payload.url
        })
        .then(() => showSucceed(btn))
        .catch(() => copyFallback(btn, payload.url));
      return;
    }

    copyFallback(btn, payload.url);
  }

  document.addEventListener("click", (event) => {
    const btn = event.target.closest(".share-native");
    if (!btn || isLocked(btn)) return;

    event.preventDefault();

    if (btn.dataset.shareKind === "instagram") {
      shareInstagram(btn);
      return;
    }

    if (btn.dataset.shareKind === "kakaotalk") {
      shareKakaoTalk(btn);
    }
  });
})();
