document.addEventListener("DOMContentLoaded", () => {
    const cookieConsentKey = "misemi_cookie_consent_v1";
    const menuButton = document.querySelector("[data-hospital-menu]");
    const nav = document.querySelector("[data-hospital-nav]");
    const resetButtons = document.querySelectorAll("[data-reset-site]");

    const clearSiteData = () => {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (error) {
        }

        document.cookie.split(";").forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
            if (!name) {
                return;
            }

            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });
    };

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!isExpanded));
            nav.classList.toggle("is-open", !isExpanded);
        });
    }

    if (!localStorage.getItem(cookieConsentKey)) {
        const banner = document.createElement("div");
        banner.className = "hospital-cookie-banner";
        banner.innerHTML = `
            <p>当サイトでは、表示の安定化や利便性向上のためにCookie等を利用しています。「同意する」または「必要なもののみ」を選択してください。</p>
            <div class="hospital-cookie-banner__actions">
                <button class="hospital-cookie-banner__button hospital-cookie-banner__button--accept" type="button" data-cookie-action="accept">同意する</button>
                <button class="hospital-cookie-banner__button hospital-cookie-banner__button--reject" type="button" data-cookie-action="reject">必要なもののみ</button>
            </div>
        `;

        document.body.appendChild(banner);

        banner.querySelectorAll("[data-cookie-action]").forEach((button) => {
            button.addEventListener("click", () => {
                localStorage.setItem(cookieConsentKey, button.getAttribute("data-cookie-action") || "accept");
                banner.remove();
            });
        });
    }

    resetButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const shouldReset = window.confirm("このサイトの保存データを削除して再読み込みしますか？");
            if (!shouldReset) {
                return;
            }

            clearSiteData();
            window.location.reload();
        });
    });
});
