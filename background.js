chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarize") {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
            try {
                const tab = tabs[0];
                if (!tab && !request.data) {
                    sendResponse({ summary: 'No active tab selected. Please select an active tab' });
                    return;
                }

                chrome.storage.local.set({ length: request.length });
                chrome.storage.local.set({ summaryType: request.summaryType });

                const url = tab?.url;
                let content = null;
    
                const isPdf = url?.endsWith('.pdf') && !request.data;
                if (isPdf) {
                    let pdfData = null;
                    try {
                        pdfData = await extractPdfText(url);
                    } catch (e) {
                        sendResponse({ summary: 'Error occurred in PDF API' });
                        console.log('fetch error', e);
                        return;
                    }
                    const summary = await summarizeText(pdfData, request.length, request.summaryType);
                    sendResponse({ summary });
                } else {
                    content = request.data ? request.data : (await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: extractTextContent
                    }))[0]?.result;

                    try {
                        let summary = await summarizeText(content, request.length, request.summaryType);
                        sendResponse({ summary });
                    } catch (err) {
                        console.log('Error in ai summarizer: ', err);
                        sendResponse({ summary: 'Error occurred in ai summarizer' });
                    }
                }
            } catch (error) {
                console.log('error', error);
                sendResponse({ summary: 'Some error occurred' });
            }
        });
    }
    return true;
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "sendToExtension",
        title: "Summarize",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToExtension") {
        const selectedText = info.selectionText;
        chrome.windows.create(
            {
                url: chrome.runtime.getURL("popup.html"),
                type: "popup",
                width: 600,
                height: 600,
            },
            () => {
                setTimeout(() => {
                    chrome.runtime.sendMessage({ action: "sendText", text: selectedText })
                }, 1000);
            }
        );
    }
});

async function extractPdfText(url) {
    const response = await fetch(url);
    const fileBlob = await response.blob();

    const formData = new FormData();
    formData.append("file", fileBlob, "file.pdf");
    const config = {
        method: 'POST',
        headers: { 
            'apy-token': process.env.PDF_API_KEY, 
        },
        body: formData,
    };

    let r2 = null;
    const r = await fetch('https://api.apyhub.com/extract/text/pdf-file', config);
    r2 = await r.json();

    return r2.data
}

async function summarizeText(text, length, type) {
    const summarizer = await ai.summarizer.create({
        sharedContext: "This is either an article or text from the internet page",
        length: length || 'short',
        type: type || "tl;dr",
    });
    const summary = await summarizer.summarize(text);
    return summary;
}

function extractTextContent() {
    return window.getSelection().toString() || document.body.textContent;
}

async function translateToEnglish(text) {
    const detector = await ai.languageDetector.create();
    const resultLang = (await detector.detect(text?.substr(0, 10)))[0]?.detectedLanguage;
    console.log('after detect language', resultLang)
    const langPair = {
        sourceLanguage: resultLang,
        targetLanguage: 'en',
    };
    if (resultLang === 'en') {
        return text;
    }
    const translatorObj = await window.translation.createTranslator(langPair);
    const translationText = await translatorObj.translate(text);
    return translationText;
}

// function extractLinks() {
//     return Array(document.body.querySelectorAll('a'));
// }