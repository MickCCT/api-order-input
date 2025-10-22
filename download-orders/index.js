setTimeout(function() {
    
    //This clicks the first download button to get the most recent new orders from Amazon

    let locationAmz = window.location.href;

    if (locationAmz.indexOf("https://sellercentral.amazon.com/order-reports-and-feeds/reports/newOrders") !== -1) {

        let newOrders = document.querySelectorAll("div#myo-reports-reportStatus table tr")[1];

         let newOrdersReport = newOrders.querySelectorAll("span")[newOrders.querySelectorAll("span").length - 1];

        let buttonClick = document.querySelector("span.a-button-inner a.a-button-text");
        
        buttonClick.click();
    }  

    //This clicks the first download link to get the most recent orders awaiting shipment from Ebay
    
    let locationEbay = document.getElementById("widget-platform").innerHTML = window.location.href;

    if (locationEbay === "https://www.ebay.com/sh/reports/downloads") {

        let buttonClick = document.querySelector("div.download-feed-action button");
        buttonClick.click();
    }
   
}, 3000); 
    