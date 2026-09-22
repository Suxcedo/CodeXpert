const searchInput = document.getElementById("searchInput");
const pathCards = document.querySelectorAll(".path-card");

searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase().trim();

    pathCards.forEach(function (card) {
        const cardContent = card.textContent.toLowerCase();

        if (cardContent.includes(searchValue)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        searchInput.value = "";

        pathCards.forEach(function (card) {
            card.style.display = "block";
        });

        searchInput.blur();
    }
});