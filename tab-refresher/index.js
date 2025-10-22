setInterval(function() {

    chrome.tabs.query({url: ["https://sellercentral.amazon.com/order-reports-and-feeds/reports/newOrders", "https://www.ebay.com/sh/reports/downloads"]}, function(tabs) { for (var i = 0; i < tabs.length; i++) {chrome.tabs.reload(tabs[i].id);}});
        
    
}, 1000 * 60 * 15); 