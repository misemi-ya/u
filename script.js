document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("[data-header]");
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-nav]");
    const copyButton = document.getElementById("copyButton");
    const copyEmail = document.getElementById("copyEmail");
    const copyMessage = document.getElementById("copyMessage");

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
});
