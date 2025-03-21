// ==UserScript==
// @name        Small script for dai.eu tests
// @namespace   Violentmonkey Scripts
// @match       https://dai.eu.com/pdr-exam-new#
// @grant       none
// @version     1.0
// @downloadURL https://github.com/fxhxyz4/userscripts/raw/main/dai-script.js
// @author      fxhxyz
// @description Click Start examination for start
// ==/UserScript==

let counter = 0;
const skipIndexes = [4, 13];

const startBtn = document.querySelector('.mode-start');

startBtn.addEventListener('click', async () => {
  console.clear();

  setInterval(() => {
    startProcess();
  }, 1000);

  const observer = new MutationObserver(async () => {
    let okBtn = document.querySelector('.icon-ok');

    if (okBtn) {
      okBtn.addEventListener('click', async () => {
        counter++;

        if (!skipIndexes.includes(counter)) {
          let rightBigBtn = await waitForElement('.icon-right-big');
          rightBigBtn.click();
        }

        modifyElements();
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

function waitForElement(selector) {
  return new Promise(resolve => {
    const observer = new MutationObserver(() => {
      let element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    let existingElement = document.querySelector(selector);

    if (existingElement) {
      observer.disconnect();
      resolve(existingElement);
    }
  });
}

const modifyElements = () => {
  let rejectElements = document.querySelectorAll('.question-number-wrong');

  rejectElements.forEach(el => {
    let questionIndex = parseInt(el.textContent.trim());

    if (skipIndexes.includes(questionIndex)) {
      return;
    } else {
      el.classList.remove('question-number-wrong');
      el.classList.add('question-number-correct');
    }
  });

  let wrongElements = document.querySelectorAll('.wrong');

  wrongElements.forEach(el => {
    let input = el.querySelector("input[type='radio']");

    if (input) {
      input.checked = false;
    }

    el.classList.remove('wrong');
  });

  let correctElements = document.querySelectorAll('.correct');

  correctElements.forEach(el => {
    let input = el.querySelector("input[type='radio']");

    if (input) {
      input.checked = true;
    }
  });

  let questionHelp = document.querySelectorAll('.question-help');

  questionHelp.forEach(que => {
    que.style.display = 'none';
  });
};

const checkPercentage = (ok, err, na) => {
  let total = ok + err + na;

  return {
    okPercent: (ok / total) * 100,
    errPercent: (err / total) * 100,
    naPercent: ((ok + err) / total) * 100,
  };
};

const startProcess = () => {
  const int = setInterval(() => {}, 100);

  let lastBtn = document.querySelector('.icon-award');

  if (lastBtn) {
    clearInterval(int);
    lastBtn.addEventListener('click', changeStyle);
  }
};
