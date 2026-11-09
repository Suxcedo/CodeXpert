
const REELS_SEARCH_API = "http://localhost:5000/api/reels/search";

let searchTimeout = null;
let searchController = null;

const searchForm = document.getElementById("reelSearchForm");
const searchInput = document.getElementById("reelSearchInput");

if (searchForm && searchInput) {

    // Create the suggestions dropdown.
    const suggestionsBox = document.createElement("div");
    suggestionsBox.id = "reelSearchSuggestions";
    suggestionsBox.className = "reel-search-suggestions";

    searchForm.insertAdjacentElement("afterend", suggestionsBox);

    // Add dropdown styling.
    const searchStyle = document.createElement("style");

    searchStyle.textContent = `
        .reel-search-suggestions {
            display: none;
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            right: 0;
            z-index: 1000;
            background: #151922;
            border: 1px solid #303746;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 12px 30px rgba(0,0,0,0.4);
            max-height: 380px;
            overflow-y: auto;
        }

        .reel-search-wrapper {
            position: relative;
        }

        .reel-search-suggestion {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px 15px;
            border: none;
            border-bottom: 1px solid #252c38;
            background: transparent;
            color: #ffffff;
            text-align: left;
            cursor: pointer;
        }

        .reel-search-suggestion:hover {
            background: #222a37;
        }

        .reel-search-suggestion:last-child {
            border-bottom: none;
        }

        .reel-search-suggestion img,
        .reel-search-avatar {
            width: 42px;
            height: 42px;
            min-width: 42px;
            border-radius: 50%;
            object-fit: cover;
            background: #343d50;
        }

        .reel-search-avatar {
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
        }

        .reel-search-details {
            display: flex;
            flex-direction: column;
            min-width: 0;
            gap: 4px;
        }

        .reel-search-username {
            font-weight: 600;
            font-size: 14px;
        }

        .reel-search-caption {
            color: #aab3c2;
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 260px;
        }

        .reel-search-status {
            padding: 15px;
            color: #aab3c2;
            font-size: 13px;
            text-align: center;
        }
    `;

    document.head.appendChild(searchStyle);

    // Make sure the dropdown is positioned relative to the search form.
    searchForm.style.position = "relative";

    function closeSuggestions() {
        suggestionsBox.style.display = "none";
        suggestionsBox.innerHTML = "";
    }

    function showSearchStatus(message) {
        suggestionsBox.innerHTML = "";

        const status = document.createElement("div");
        status.className = "reel-search-status";
        status.textContent = message;

        suggestionsBox.appendChild(status);
        suggestionsBox.style.display = "block";
    }

    function createSuggestion(video) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "reel-search-suggestion";

        const creator = video.creator || {};

        const username =
            creator.username ||
            `${creator.first_name || ""} ${creator.last_name || ""}`.trim() ||
            "CodeXperts User";

        // Profile picture or initial.
        if (creator.profile_picture_url) {
            const image = document.createElement("img");

            image.src = creator.profile_picture_url;
            image.alt = username;

            image.onerror = () => {
                const placeholder = document.createElement("div");

                placeholder.className = "reel-search-avatar";
                placeholder.textContent = username.charAt(0).toUpperCase();

                image.replaceWith(placeholder);
            };

            button.appendChild(image);
        } else {
            const placeholder = document.createElement("div");

            placeholder.className = "reel-search-avatar";
            placeholder.textContent = username.charAt(0).toUpperCase();

            button.appendChild(placeholder);
        }

        const details = document.createElement("div");
        details.className = "reel-search-details";

        const creatorName = document.createElement("span");
        creatorName.className = "reel-search-username";
        creatorName.textContent = `@${creator.username || username}`;

        const caption = document.createElement("span");
        caption.className = "reel-search-caption";
        caption.textContent = video.caption || "Reel by this creator";

        details.append(creatorName, caption);
        button.appendChild(details);

        button.addEventListener("click", () => {
            searchInput.value = searchInput.value.trim();

            closeSuggestions();

            // Use the existing search functionality in reels.js.
            searchForm.requestSubmit();
        });

        return button;
    }

    async function searchSuggestions(query) {
        if (searchController) {
            searchController.abort();
        }

        searchController = new AbortController();

        const token = sessionStorage.getItem("supabaseAccessToken");

        if (!token) {
            closeSuggestions();
            return;
        }

        try {
            showSearchStatus("Searching...");

            const response = await fetch(
                `${REELS_SEARCH_API}?q=${encodeURIComponent(query)}&limit=6&offset=0`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    signal: searchController.signal
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Unable to search.");
            }

            const videos = result.videos || [];

            suggestionsBox.innerHTML = "";

            if (videos.length === 0) {
                showSearchStatus("No matching creators or Reels found.");
                return;
            }

            videos.forEach(video => {
                suggestionsBox.appendChild(createSuggestion(video));
            });

            suggestionsBox.style.display = "block";

        } catch (error) {
            if (error.name === "AbortError") return;

            console.error("Search suggestions error:", error);
            showSearchStatus("Unable to load suggestions.");
        }
    }

    // Search automatically as the user types.
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();

        clearTimeout(searchTimeout);

        if (query.length < 1) {
            closeSuggestions();
            return;
        }

        searchTimeout = setTimeout(() => {
            searchSuggestions(query);
        }, 300);
    });

    // Close suggestions when clicking outside.
    document.addEventListener("click", event => {
        if (
            !searchForm.contains(event.target) &&
            !suggestionsBox.contains(event.target)
        ) {
            closeSuggestions();
        }
    });

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSuggestions();
        }
    });

    searchForm.addEventListener("submit", () => {
        closeSuggestions();
    });
}
