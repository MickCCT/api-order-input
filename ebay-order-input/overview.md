## How Does It Work

This fetches the master-ebay-order-data.json file from within the same folder on OneDrive. But in order to do so the folder at "Ebay Order Input Program" must be pulled up in VS Code and the Live server extension for VS Code must be turned on. 

Next, it makes sure there are orders, if so it adds the order info to the top of the "Order Entry Page" located in P21. The user can then enter an order using the instructions below.

### Instructions for Operation

1. Your first click into the Customer ID field will automatically add the Ebay or Amazon number. 
2. Next, you will click into the PO Number box and click ctrl v to paste. 
- Note: After pasting the po number, the first item(sku number) should automatically be copied to your clipboard. So, every time you press ctrl v to paste something the next item will be copied to your clipboard. You will also see that the boxes at the top will change to red as you paste your items. 
3. Go select Free Freight on the carrier (this hasn't been programmed in yet, but it will be)
4. Click in the Item ID box and paste your first item. Hit tab to take you to the quantity and paste again.
5. Look up at the top right to see if you have multiple items and determine if your pricing matches(change your pricing as needed)
6. If you have another item then it should be on the clipboard. Just paste on the next item ID line and tab again for quantity and paste. 
- Note: Repeat for each item you see
7. Click the "Ship To" link at the top. This will allow you to copy and paste the shipping info. 
8. When done pasting the shipping info, click Save as usual.  
9. After printing the order, click the Next button at the left of the order info at the top. This will get the next order set up and save the PO Number in the local storage. 

## Set Up

To load this extension go to extensions in the Chrome browser and click load unpacked. Then select the folder to upload. (Be sure that Developer Mode is turned on.)


## Troubleshooting

Sometimes if the old tab for the last live server is still up in your browser it may change the address of the live server. For instance this should be the normal address: http://127.0.0.1:5500/master-ebay-order-data.json. However, if the last server tab is still open it will change the 5500 to 5501. At this point either change the code in the index.js file or close your live server and all server tabs and restart.