window.onload = (event) => {
    //This listens for the start button click from the popup.html file
    document.getElementById("startBtn").addEventListener("click", openFile);
    
        //This opens the order pages for Ebay and Amazon after the start button is clicked
        function openFile() {
        
        let ebayWindow = window.open("https://www.ebay.com/sh/reports/downloads");
        let amzWindow = window.open("https://sellercentral.amazon.com/order-reports-and-feeds/reports/newOrders");
        
        }    
}




