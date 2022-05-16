console.log("background.js");
const settings = {
  language: "Espanyol",
  langCode: "es",
  color: "yellow",
  enabled: true,
};

chrome.runtime.onInstalled.addListener(() => {
  const { language, color, langCode, enabled } = settings;
  console.log("After installation web extension. Default settings are set: ", {
    language,
    color,
    langCode,
    enabled,
  });
  chrome.storage.sync.set({ language });
  chrome.storage.sync.set({ color });
  chrome.storage.sync.set({ langCode });
  chrome.storage.sync.set({ enabled });
});

chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const tabId = tabs[0].id;
    chrome.storage.sync.get(["enabled"], function (result) {
      const enabled = !result.enabled;
      updateExtensionIcon(tabId, enabled);
      chrome.storage.sync.set({ enabled }, function () {
        console.log({ enabled });
      });
    });
  });
});

function updateExtensionIcon(tabId, enabled) {
  if (enabled) {
    chrome.action.setIcon({
      path: {
        19: "icon/on19.png",
        24: "icon/on24.png",
        32: "icon/on32.png",
      },
    });
  } else {
    chrome.action.setIcon({
      path: {
        19: "icon/off19.png",
        24: "icon/off24.png",
        32: "icon/off32.png",
      },
    });
  }
}
