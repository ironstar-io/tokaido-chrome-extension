var button = {
  active: false,
  status: null
};

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    if (
      details.type === "main_frame" &&
      Array.isArray(details.responseHeaders)
    ) {
      for (const header of details.responseHeaders) {
        if (header.name === "Via" && header.value.includes("varnish")) {
          button.active = true;
        }
        if (header.name === "X-Varnish-Cache") {
          button.status = header.value;
        }
      }
    }
  },
  {
    urls: ["*://*/*"]
  },
  ["responseHeaders"]
);

chrome.webNavigation.onCompleted.addListener(details => {
  if (details.frameId === 0) {
    let color = button.active ? "green" : "grey";
    switch (button.status) {
      case "HIT":
        color = "green";
        chrome.browserAction.setBadgeText({
          text: "HIT",
          tabId: details.tabId
        });
        break;
      case "MISS":
        color = "red";
        chrome.browserAction.setBadgeText({
          text: "MISS",
          tabId: details.tabId
        });
        break;
      case "BYPASS":
        color = "grey";
        chrome.browserAction.setBadgeText({
          text: "BYPASS",
          tabId: details.tabId
        });
        break;
    }
    chrome.browserAction.setIcon({
      path: "icons/icon128_" + color + ".png",
      tabId: details.tabId
    });
  }
});
