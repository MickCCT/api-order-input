# Excel to Json Overview

This is a node.js program that runs locally in the terminal to change .csv and .txt files into JSON.

## How Does It Work

When running, it keeps a check on the download folder for a new Ebay or Amazon order file. If it finds one it turns all orders into JSON. It then checks to make sure the order is not a duplicate and appends it to either the Ebay or Amazon master JSON file. These master JSON files reside in their respective folders in OneDrive. 

## Set Up

Currently, both Ebay and an Amazon have a script that needs to run.

Do the following to get each script running.

First, to start the Ebay program: 

- Using the terminal, navigate to the excel-to-json folder located in the Order Input Master Files. 

- Type "node amazon-script.js" to start checking for new Amazon files.

Next, to start the Amazon program:

- Open a second terminal and navigate to the excel-to-json folder located in the Order Input Master Files.

- Type "node ebay-script.js" to start checking for new Amazon files.

Once either of those programs are running, you should see all new files being processed show up in the individual terminals. Also, if the file being downloaded is the same as the last it will say "Same File".


