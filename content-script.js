console.log("content-script.js loaded");
let synth;
const cfg = {
  maxSentencesToBeTranslated: 10,
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("onMessage", message, sender, sendResponse);
  switch (message.type) {
    case "updateSettings":
      updateSettings(sender, sendResponse);
      break;
  }
});

main();

async function getEnabledSetting() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(
      ["enabledExtensionSelectTranslate"],
      function (result) {
        resolve(result.enabledExtensionSelectTranslate);
      }
    );
  });
}

function speakTelegramHistory(targetLang = "nl") {
  let texts = getMessages();
  texts.forEach((t) => speak(t, targetLang));
}

function speakTranslatedTelegramHistory(targetLang, sourceLang = "nl") {
  let texts = getMessages();
  const translatedTexts = texts.map((text) =>
    getTranslation(text, targetLang, sourceLang)
  );
  Promise.all(translatedTexts).then((values) => {
    values.forEach((t) => speak(t, targetLang));
  });
}

function getMessages(chatApp) {
  const queryWhatsapp = ".message-out span.copyable-text > span";
  const queryTelegram = ".bubble-content > .message";
  const query = chatApp === "whatsapp" ? queryWhatsapp : queryTelegram;
  let messages = document.querySelectorAll(queryWhatsapp);
  let texts = [];
  for (let i = 0; i < messages.length; i++) {
    texts.push(messages[i].childNodes[0].textContent);
  }
  return texts;
}

async function translate(text, source, target) {
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&hl=en-US&dt=qca&dt=t&dt=bd&dj=1&source=icon&sl=${source}&tl=${target}&q=${text}`
  );
  const json = await response.json();
  if (!json || !json.sentences) return "";
  const translated = json.sentences[0].trans;
  return translated;
}

function speak(text, language) {
  if (!language)
    return console.log("no language in speak function 2nd argument");
  synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.7;
  utterance.voice = synth
    .getVoices()
    .find(
      (voice) =>
        voice.lang.split("-")[0].toLowerCase() ===
        language.split("-")[0].toLowerCase()
    );
  synth.speak(utterance);
}

function getSelectionText() {
  var text = "";
  var activeEl = document.activeElement;
  var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
  if (
    activeElTagName == "textarea" ||
    (activeElTagName == "input" &&
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
      typeof activeEl.selectionStart == "number")
  ) {
    text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
  } else if (window.getSelection) {
    console.log("window.getSelection()", window.getSelection());
    text = window.getSelection().toString();
  }
  return text;
}

async function processSelection() {
  const text = getSelectionText().replace(/\n+/g, " ");
  if (!text) return synth && synth.cancel();
  const enabled = await getEnabledSetting();
  if (!enabled) return;

  const langCode = await getLangCodeFromChromeStorage();

  sentences = text.split(/\.|\?|!/g);

  const promises = sentences
    .slice(0, cfg.maxSentencesToBeTranslated)
    .map((sentence) => translate(sentence, "auto", langCode));
  const translatedSentences = await Promise.all(promises);
  const translated = translatedSentences.join(". ");
  markSelectionYellow(translated);
  console.log("reading the page contents in langCode " + langCode, translated);
  speak(translated, langCode);
}

function flipBack() {
  const element = window.event.target || window.event.srcElement;
  console.log({ element });
  if (element.previousElementSibling) {
    element.previousElementSibling.outerHTML =
      element.previousElementSibling.innerHTML;
    // element.previousElementSibling.style.display = "block";
    element.parentNode.removeChild(element);
  }
}

function unwrap(selector) {
  var nodelist = document.querySelectorAll(selector);
  Array.prototype.forEach.call(nodelist, function (item, i) {
    item.outerHTML = item.innerHTML; // or item.innerText if you want to remove all inner html tags
  });
}

function click123(e) {
  console.log({ src });
  //src element is the eventsource
}

function markSelectionYellow(text) {
  var selection = window.getSelection().getRangeAt(0);
  var selectedText = selection.extractContents();
  var span = document.createElement("span");
  span.style.backgroundColor = "yellow";
  span.classList.add("translated-text");
  span.innerHTML = text;
  span.onclick = flipBack;
  span.style.cursor = "alias";
  var span2 = document.createElement("span");
  span2.style.display = "none";
  span2.classList.add("original-text");
  span2.appendChild(selectedText);
  selection.insertNode(span);
  selection.insertNode(span2);
}

async function getLangCodeFromChromeStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("langCode", ({ langCode }) => {
      resolve(langCode);
    });
  });
}

async function main() {
  document.onmouseup = () => processSelection();
}
