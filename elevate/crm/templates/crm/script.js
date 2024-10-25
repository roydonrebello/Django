class TabManager {
    constructor(maxTabs) {
        this.tabs = [];
        this.maxTabs = maxTabs;
    }

    async openTab(url) {
        const now = new Date();
        let existingTab = this.tabs.find(tab => tab.url === url);

        if (existingTab) {
            // Update access time if the tab already exists
            existingTab.accessedAt = now;
            this.setActiveTab(url);
        } else {
            if (this.tabs.length >= this.maxTabs) {
                // Find and remove the least recently used (LRU) tab
                this.removeLeastRecentlyUsedTab();
            }

            // Add the new tab with the current access time
            this.tabs.push({ url, accessedAt: now });
            this.displayTabs(); // Display the updated list of tabs
            this.setActiveTab(url);
        }

        // Fetch and display the content of the new tab
        await this.fetchAndDisplayContent(url);
    }

    removeLeastRecentlyUsedTab() {
        // Sort tabs by access time and remove the oldest one
        this.tabs.sort((a, b) => a.accessedAt - b.accessedAt);
        const removedTab = this.tabs.shift(); // Remove the first element (oldest tab)
        this.removeTabElement(removedTab.url);
    }

    // Function to get the short name of the URL
    getShortName(url) {
        try {
            const hostname = new URL(url).hostname;
            const shortName = hostname.replace('www.', '');
            return shortName.length > 15 ? shortName.slice(0, 12) + '...' : shortName; // Limit length and add ellipsis if needed
        } catch (error) {
            return url;
        }
    }

    displayTabs() {
        const tabDisplay = document.getElementById('tabDisplay');
        tabDisplay.innerHTML = '';
        this.tabs.forEach(tab => {
            const tabButton = document.createElement('div');
            tabButton.className = 'tab-button adding'; // Add animation class
            tabButton.innerHTML = `
                ${this.getShortName(tab.url)}
                <button class="close-btn" onclick="event.stopPropagation(); tabManager.closeTab('${tab.url}');">x</button>
            `;
            tabButton.onclick = () => this.handleTabClick(tab.url);
            tabDisplay.appendChild(tabButton);

            // Trigger reflow to apply entering animation
            tabButton.offsetWidth; // Trigger reflow
        });
    }

    handleTabClick(url) {
        this.setActiveTab(url);
        this.fetchAndDisplayContent(url);
    }

    setActiveTab(url) {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.innerText.includes(this.getShortName(url))) {
                button.classList.add('active', 'switching');
            } else {
                button.classList.remove('active');
            }
        });

        // Update the accessed time for the clicked tab
        const tab = this.tabs.find(tab => tab.url === url);
        if (tab) {
            tab.accessedAt = new Date();
        }
    }

    async fetchAndDisplayContent(url) {
        const tabContentDisplay = document.getElementById('tabContentDisplay');
        tabContentDisplay.innerHTML = '';

        try {
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const fetchUrl = proxyUrl + encodeURIComponent(url);

            const response = await fetch(fetchUrl);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }

            const data = await response.json();
            tabContentDisplay.innerHTML = `<iframe src="data:text/html;charset=utf-8,${encodeURIComponent(data.contents)}" style="width: 100%; height: 100%; border: none;"></iframe>`;
            tabContentDisplay.classList.add('show');
        } catch (error) {
            tabContentDisplay.innerHTML = `<p>Error fetching content: ${error.message}</p>`;
        }
    }

    removeTabElement(url) {
        const tabButton = [...document.querySelectorAll('.tab-button')].find(button => button.innerText.includes(this.getShortName(url)));
        if (tabButton) {
            tabButton.classList.add('removing');
            tabButton.addEventListener('animationend', function() {
                tabButton.remove(); // Remove after animation completes
            }, { once: true });
        }
    }

    closeTab(url) {
        this.tabs = this.tabs.filter(tab => tab.url !== url);
        this.removeTabElement(url);

        // Update the tab display
        this.displayTabs();

        // Hide content if the closed tab was active
        const tabContentDisplay = document.getElementById('tabContentDisplay');
        if (!this.tabs.length) {
            tabContentDisplay.innerHTML = '';
            tabContentDisplay.classList.remove('show');
        } else {
            const lastTab = this.tabs[this.tabs.length - 1];
            this.setActiveTab(lastTab.url);
            this.fetchAndDisplayContent(lastTab.url);
        }
    }
}

const tabManager = new TabManager(5); // Maximum 5 tabs

function addTab() {
    const tabInput = document.getElementById('tabInput').value;
    if (tabInput) {
        tabManager.openTab(tabInput);
        document.getElementById('tabInput').value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    tabManager.displayTabs();
});
