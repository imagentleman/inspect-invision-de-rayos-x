const activeTabs = {};
const readyTabs = {};

function start(tab) {
  if (activeTabs[tab.id]) {
    activeTabs[tab.id] = false;

    chrome.browserAction.setIcon({
      path: {
        "16": "off-16.png",
        "24": "off-24.png",
        "32": "off-32.png"
      }
    });

    chrome.tabs.sendMessage(tab.id, { type: "stop" });
  } else {
    if (!readyTabs[tab.id]) {
      chrome.tabs.insertCSS(tab.id, {
        file: "styles.css"
      });
      chrome.tabs.executeScript(tab.id, {
        file: "content.js"
      });

      readyTabs[tab.id] = true;
    }

    activeTabs[tab.id] = true;
    chrome.browserAction.setIcon({
      path: {
        "16": "on-16.png",
        "24": "on-24.png",
        "32": "on-32.png"
      }
    });
    chrome.tabs.sendMessage(tab.id, { type: "start" });
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  if (!readyTabs[tab.id]) {
    chrome.tabs.insertCSS(tab.id, {
      file: "styles.css"
    });
    chrome.tabs.executeScript(tab.id, {
      file: "content.js"
    });

    readyTabs[tab.id] = true;
  }

  start(tab);
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  if (activeTabs[activeInfo.tabId]) {
    chrome.browserAction.setIcon({
      path: {
        "16": "on-16.png",
        "24": "on-24.png",
        "32": "on-32.png"
      }
    });
  } else {
    chrome.browserAction.setIcon({
      path: {
        "16": "off-16.png",
        "24": "off-24.png",
        "32": "off-32.png"
      }
    });
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    readyTabs[tabId] = false;
    activeTabs[tabId] = false;

    chrome.browserAction.setIcon({
      path: {
        "16": "off-16.png",
        "24": "off-24.png",
        "32": "off-32.png"
      }
    });
  }
});
