# Summary Agent

This is a google chrome extension.
It summarizes text in html files.
In html you can select text which you would like to summarize.
If no text is selected summarize will work for the whole page.
If you see "No active tab" error - click on the current tab to select it and then click Summarize in the extension.
For PDF files API key is required for text extraction.
            
## How to run

- download the repository
- run `npm i`
- run `npm run build`
- unpack extension in Google Chrome browser: go to chrome://extensions/, select "Load unpacked" and select folder with the extension
- extension is ready to (in Chrome Canary with Summarization API and Translation API experimental features turned on)

## Features

- Summarization of the text from a webpage
- Summarization of the custom text
- Ability to change summary settings (length, type, language)
- Opening extension from the context menu (when text is selected on web page)
- Voice over of the summary
- Coping summary to the clipboard
- Sharing summary through email/other channels

## Known bugs

For now Summarization API is not able to process large chunks of text and chunking long text into smaller chunks gives very long waiting times.
Thus summarization of the whole page for now gives error in AI summarizer (NotSupportedError or NotReadableError).
I beleive in the future API will improve and allow for summarization of long texts.

## Additional info

The app is built with usage of Summarizer API and Translation API.

NOTE: For PDF text extraction external API is used https://api.apyhub.com/extract/text/pdf-file. API KEY is required for this API.
Create .env file and put api key in PDF_API_KEY variable in this file.

## Attribution

Extension logo is taken from https://www.freepik.com.

Share icon is taken from https://icons8.com/icon/98959/share.
