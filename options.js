let page = document.getElementById("buttonDiv");
let message = document.getElementById("message");
let selectedClassName = "current";
const buttons = [
  { langCode: "ru", language: "Russian", color: "#ff8888" },
  { langCode: "es", language: "Spanish", color: "#fa8888" },
  { langCode: "it", language: "Italian", color: "#8fa888" },
  { langCode: "fr", language: "French", color: "#88fa88" },
  { langCode: "de", language: "German", color: "#888fa8" },
  { langCode: "en", language: "English", color: "#8888fa" },
  { langCode: "ja", language: "Japanese", color: "#a8888f" },
  { langCode: "la", language: "Latin", color: "#a8a88a" },
  { langCode: "nl", language: "Dutch", color: "#a88F88" },
];

function handleButtonClick(event) {
  let current = event.target.parentElement.querySelector(
    `.${selectedClassName}`
  );
  if (current && current !== event.target) {
    current.classList.remove(selectedClassName);
  }

  let { langCode, color, language } = event.target.dataset;
  event.target.classList.add(selectedClassName);
  chrome.storage.sync.set({ langCode });
  chrome.storage.sync.set({ color });
  console.log("set langCode to ", { langCode });
  console.log("set color to ", { color });
  message.innerHTML = `Language set to ${language}`;
}

function constructOptions(buttons) {
  chrome.storage.sync.get("language", (data) => {
    let currentLangCode = data.langCode;
    for (let buttonData of buttons) {
      let button = document.createElement("button");
      button.dataset.color = buttonData.color;
      button.dataset.langCode = buttonData.langCode;
      button.dataset.language = buttonData.language;
      button.innerHTML = buttonData.language;
      button.style.backgroundColor = buttonData.color;

      if (buttonData.langCode === currentLangCode) {
        button.classList.add(selectedClassName);
      }

      button.addEventListener("click", handleButtonClick);
      page.appendChild(button);
    }
  });
}

constructOptions(buttons);
