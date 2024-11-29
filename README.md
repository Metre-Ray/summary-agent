# Summary Agent

This is a google chrome extension.
It summarizes text in html or PDF files.
In html (but not in PDF) you can select text which you would like to summarize.
If no text is selected summarize will work for the whole page.
If you see "No active tab" error - click on the current tab to select it and then click Summarize in the extension.
FOr PDF files API key is required for text extraction.
            
## How to run

- download the repository
- run `npm i`
- run `npm run build`
- unpack extension in Google Chrome browser: got to chrome://extensions/, select "Load unpacked" and select folder with the extension

## Additional info

The app is built with usage of Summarizer API and Translation API.

NOTE: For PDF text extraction external API is used https://api.apyhub.com/extract/text/pdf-file. API KEY is required for this API.

## Attribution

Extension logo is taken from https://www.freepik.com.
