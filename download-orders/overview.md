# Download Orders Overview

This is an extension that is currently working in the Chrome browser on Mick's computer. Also, it should be able to work in other browsers like Edge if necessary.

## How Does It Work

To get it started, click the puzzle piece next to the address bar in the Chrome browser. Select "Download Orders" and then click the start button. This will open the order download pages for both Ebay and Amazon. These need to stay open. Then the program will click the download button or link on each page to download any current orders. Currently, it downloads the orders to a folder on Mick's computer at c:/Users/mick.CROSSCREEK100/OneDrive/Documents/Downloads.

The program currently depends on another component that is an extension running in Chrome on Mick's computer called Tab Refresher (tab-refresher) to refesh both pages every 15 minutes. When the pages get refreshed the program runs again and downloads any new orders.

Also, there is a third party extension to runs to overwrite a current file so that copies of files aren't added over and over. It's called "Downloads Overwrite Already Existing Files". Currently, the program is not dependent on it to run, but it keeps the number of files down that are being added to the downloads folder. Additionaly, if the program does see that there is a new file it will not run.

## Set Up

To load this extension go to extensions in the Chrome browser and click load unpacked. Then select the folder to upload. (Be sure that Developer Mode is turned on.)

Next, be sure the tab-refresher extension is installed and running.

Optionally, but for better performance, install and run the "Downloads Overwrite Already Existing Files" third party extension.

## Troubleshooting

-Check to be sure the download URLs are still the correct download pages by opening them in the browser. Amazon especially likes to change the URL of the download page. If it's different you'll need to make this change in 4 places: download-orders/manifest.js, download-orders/index.js, download-orders/script.js, tab-refresher/index.js
