document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector("[data-hospital-menu]");
    const nav = document.querySelector("[data-hospital-nav]");

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!isExpanded));
            nav.classList.toggle("is-open", !isExpanded);
        });
    }
});
