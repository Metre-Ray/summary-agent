import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { WEBSITE_PAGE_MODE, CUSTOM_TEXT_MODE } from './model';

let mode = WEBSITE_PAGE_MODE;

document.getElementById('summarize').addEventListener('click', async () => {
    document.querySelector('.loader').classList.add('visible');
    document.getElementById('summary').innerHTML = '';
    const length = document.getElementById('summary-length').value;
    const summaryType = document.getElementById('summary-type').value;
    const data = mode === WEBSITE_PAGE_MODE ? null : document.getElementById('custom-text-input').value;

    chrome.runtime.sendMessage({ action: 'summarize', length, summaryType, data }, async (response) => {
        await setSummary(response);
    });
});

document.getElementById('voice-over').addEventListener('click', async () => {
    voiceOver();
});

document.querySelector('.copy-button').addEventListener('click', () => {
    copySummaryToClipboard();
});

document.querySelector('.share-button').addEventListener('click', () => {
    shareSummary();
});

document.getElementById('website-page-option').addEventListener('click', async () => {
    mode = WEBSITE_PAGE_MODE;
    document.getElementById('website-page-option').classList.add('selected');
    document.getElementById('custom-text-option').classList.remove('selected');
    document.getElementById('custom-text-input').classList.add('hidden');
});

document.getElementById('custom-text-option').addEventListener('click', async () => {
    mode = CUSTOM_TEXT_MODE;
    document.getElementById('custom-text-option').classList.add('selected');
    document.getElementById('website-page-option').classList.remove('selected');
    document.getElementById('custom-text-input').classList.remove('hidden');
});





chrome.storage.local.get(["length"]).then((result) => {
    document.getElementById('summary-length').value = result.length || 'short';
});
chrome.storage.local.get(["summaryType"]).then((result) => {
    document.getElementById('summary-type').value = result.summaryType || 'tl;dr';
});
chrome.storage.local.get(["summaryLang"]).then((result) => {
    document.getElementById('summary-language').value = result.summaryLang || 'en';
});



async function translateFromEnglish(text, lang) {
    const langPair = {
        sourceLanguage: "en",
        targetLanguage: lang,
    };
    const translatorObj = await window.translation.createTranslator(langPair);
    const translationText = await translatorObj.translate(text);
    return translationText;
}

function voiceOver() {
    const summary = document.getElementById('summary').textContent || 'No summary present';
    const utterance = new SpeechSynthesisUtterance(summary);
    speechSynthesis.speak(utterance);
}

function copySummaryToClipboard() {
    const copyText = document.getElementById('summary');
    navigator.clipboard.writeText(copyText.textContent);

    const button = document.querySelector('.copy-button');
    button.classList.add('copied');
    setTimeout(() => {
        button.classList.remove('copied');
    }, 2000);
}

async function setSummary(response) {
    const lang = document.getElementById('summary-language').value;
    chrome.storage.local.set({ summaryLang: lang });
    if (lang !== 'en') {
        try {
            response.summary = await translateFromEnglish(response.summary, lang);
        } catch(err) {
            console.log('Error in translation', err);
        }
    }

    document.querySelector('.loader').classList.remove('visible');
    const cleanHTML = DOMPurify.sanitize(marked.parse(response.summary));
    document.getElementById('summary').innerHTML = cleanHTML || 'Summary failed';
}

function shareSummary() {
    const text = document.getElementById('summary').innerText;
    window.navigator.share({ text });
}
