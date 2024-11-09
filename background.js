chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarize") {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
            try {
                const tab = tabs[0];
                if (!tab) {
                    sendResponse({ summary: 'No active tab selected. Please select an active tab' });
                    return;
                }

                chrome.storage.local.set({ length: request.length });
                chrome.storage.local.set({ summaryType: request.summaryType });

                const url = tab.url;
                let content = null;
    
                const isPdf = url.endsWith('.pdf');
                if (isPdf) {
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
                    try {
                        const r = await fetch('https://api.apyhub.com/extract/text/pdf-file', config);
                        r2 = await r.json();
                    } catch (e) {
                        sendResponse({ summary: 'Error occurred in API' });
                        console.log('fetch err', e);
                        return;
                    }
                        const summary = await summarizeText(r2.data, request.length, request.summaryType);
                        sendResponse({ summary });
                } else {
                    content = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: extractTextContent
                    });

                    try {
                        let summary = await summarizeText(content[0]?.result, request.length, request.summaryType);
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

async function summarizeText(text, length, type) {
    const summarizer = await ai.summarizer.create({
        sharedContext: "This is either an article or text from the internet page",
        length: length || 'short',
        type: type || "tl;dr",
    });
    const summary = await summarizer.summarize(text);
    return summary;
}
