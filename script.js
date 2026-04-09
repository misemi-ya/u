document.addEventListener("DOMContentLoaded", () => {
    const cookieConsentKey = "misemi_cookie_consent_v1";
    const header = document.querySelector("[data-header]");
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-nav]");
    const copyButton = document.getElementById("copyButton");
    const copyEmail = document.getElementById("copyEmail");
    const copyMessage = document.getElementById("copyMessage");
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

    const syncHeaderState = () => {
        if (header) {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }
    };

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!isExpanded));
            nav.classList.toggle("is-open", !isExpanded);
        });

        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                if (window.innerWidth <= 1080) {
                    menuToggle.setAttribute("aria-expanded", "false");
                    nav.classList.remove("is-open");
                }
            });
        });
    }

    document.querySelectorAll("[data-tabs]").forEach((tabRoot) => {
        const buttons = Array.from(tabRoot.querySelectorAll("[data-tab-target]"));
        const panels = Array.from(tabRoot.querySelectorAll(".tab-panel__content"));

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const targetId = button.dataset.tabTarget;
                buttons.forEach((item) => {
                    const isCurrent = item === button;
                    item.classList.toggle("is-active", isCurrent);
                    item.setAttribute("aria-selected", String(isCurrent));
                });

                panels.forEach((panel) => {
                    const isCurrent = panel.id === targetId;
                    panel.classList.toggle("is-active", isCurrent);
                    panel.hidden = !isCurrent;
                });
            });
        });
    });

    document.querySelectorAll("[data-accordion-group]").forEach((group) => {
        const triggers = Array.from(group.querySelectorAll(".accordion-trigger"));
        triggers.forEach((trigger) => {
            trigger.addEventListener("click", () => {
                const item = trigger.closest(".accordion-item");
                const content = item ? item.querySelector(".accordion-content") : null;
                const isExpanded = trigger.getAttribute("aria-expanded") === "true";

                triggers.forEach((otherTrigger) => {
                    const otherItem = otherTrigger.closest(".accordion-item");
                    const otherContent = otherItem ? otherItem.querySelector(".accordion-content") : null;
                    otherTrigger.setAttribute("aria-expanded", "false");
                    if (otherContent) {
                        otherContent.hidden = true;
                    }
                });

                trigger.setAttribute("aria-expanded", String(!isExpanded));
                if (content) {
                    content.hidden = isExpanded;
                }
            });
        });
    });

    if (copyButton && copyEmail) {
        copyButton.addEventListener("click", async () => {
            const emailAddress = (copyEmail.textContent || "").trim();
            try {
                await navigator.clipboard.writeText(emailAddress);
                if (copyMessage) {
                    copyMessage.textContent = "メールアドレスをコピーしました。";
                }
            } catch (error) {
                if (copyMessage) {
                    copyMessage.textContent = `コピーできなかったため、手動でご利用ください: ${emailAddress}`;
                }
            }
        });
    }

    if (!localStorage.getItem(cookieConsentKey)) {
        const banner = document.createElement("div");
        banner.className = "cookie-banner";
        banner.innerHTML = `
            <p>当サイトでは、表示の安定化や利便性向上のためにCookie等を利用しています。「同意する」または「必要なもののみ」を選択してください。</p>
            <div class="cookie-banner__actions">
                <button class="cookie-banner__button cookie-banner__button--accept" type="button" data-cookie-action="accept">同意する</button>
                <button class="cookie-banner__button cookie-banner__button--reject" type="button" data-cookie-action="reject">必要なもののみ</button>
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
