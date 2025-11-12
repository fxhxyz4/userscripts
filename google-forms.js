// ==UserScript==
// @name        Google Forms AI Helper
// @namespace   Violentmonkey Scripts
// @match       *://docs.google.com/forms/*
// @grant       GM_xmlhttpRequest
// @version     1.0
// @author      fxhxyz
// @connect 127.0.0.1
// @connect localhost
// @description Collects form questions and gets AI answers via your server
// ==/UserScript==

(() => {
  console.clear();
  let questions = [];

  const getElementText = el =>
    el?.getAttribute("aria-label")?.trim() ||
    el?.dataset?.value?.trim() ||
    el?.textContent?.trim() ||
    "";

  const collectQuestions = () => {
    const items = document.querySelectorAll('div[role="listitem"]');
    if (!items.length) return false;

    const data = [];
    for (const item of items) {
      const question = getElementText(item.querySelector('[role="heading"]'));
      const answers = [...item.querySelectorAll('[role="radio"], [role="checkbox"]')]
        .map(el => getElementText(el))
        .filter(Boolean);
      
      if (question || answers.length) data.push({ question, answers });
    }

    questions = data;
    console.info(`[GoogleFormsAI] Знайдено ${data.length} питань`);
   
    console.table(data.map(q => ({ Вопрос: q.question, Ответы: q.answers.join(' | ') })));
    return data.length > 0;
  };

  const fetchAIAnswers = async () => {
    if (!questions.length) return;

    try {
      const res = await fetch('https://google-forms-script.onrender.com/askAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questions.map(q => q.question) })
      });
     
      const data = await res.json();
      console.info('[GoogleFormsAI] Отримано відповіді від AI');
      
      console.table(data);
      render(data);
    } catch (e) {
      console.error('[GoogleFormsAI] Помилка запиту до сервера:', e);
    }
  };

  const render = (data) => {
    
  };

  const observer = new MutationObserver(() => {
    if (collectQuestions()) {
      observer.disconnect();
      fetchAIAnswers();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    if (collectQuestions()) fetchAIAnswers();
  }, 3e3);
})();
