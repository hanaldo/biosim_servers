## Prerequisite
In order to run the position server, you need to install [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html) on your computer, and a fairly modern browser (such as Google Chrome) to see the position live page.

<img width="600" alt="biosim_position" src="https://user-images.githubusercontent.com/4184020/29588169-7f68b336-875e-11e7-8dc2-1988d71707ef.png">


Regarding the hardware, you will need at least 4 of our positioning boards, because we need at least 3 anchors to achieve trilateration within a 2D dimension, and the other board can act as the tag which to be tracked. Please note that we currently only support maximum of 4 anchors and 8 tags, and 4 anchors have much better positioning quality than having 3 anchors due to the least squares algorithm we adopted.

## Position Board Introduction
<img width="600" alt="biosim position board" src="https://user-images.githubusercontent.com/4184020/32562351-6f10fb82-c47c-11e7-986a-0bf4a30917f2.png">

This is the position board we made to incorporate the [DWM1000](https://www.decawave.com/products/dwm1000-module) chip in order to achieve precise distance measuring, and by combining a few of distances we can then achieve positioning. This board has similar functions as the [EVB1000](https://www.decawave.com/products/trek1000) board but much smaller and cheaper.

There are a few switches on the board which allow to configure the positioning communication. For a simple starter, please keep switch-1 ON, switch-2 and switch-3 OFF all the time for all boards. Switch-4 configures the board to be either anchor or tag. Switch-5 to switch-7 are binary values to define this board ID within the positioning system, please note that no boards should have the same ID. For anchors to work together, their IDs should be starting from 0 and assigned consecutively. For example, "anchor-0 anchor-1 anchor-2" will work but "anchor-0 anchor-1 anchor-3" will not.

## Start Position Server
To start the server program, download the [server](https://github.com/hanaldo/biosim_servers/tree/master/position_server/server) folder and go under this folder from your local command line tool, and then type "java -jar start.jar". Then open your browser and go to this address "http://127.0.0.1:8080/" to see the position live page.

## Set Up The Area (dimension)
Before start to track tag positions, you need to specify the width and the height of the tracked area, otherwise the indoor positions are meaningless. You can measure your area BY HAND, or our program can help you ease the process.

First, start the server program and go to the position live page, and then plug in the anchor-0 to your computer, and then start the serial port as prompted. Please note that we always assume anchor-0 is at the top-left corner of your positioning area.

Right now power up anchor-1 and put it at the position of the top-right corner of your positioning area, power up anchor-2 and put it at the position of the bottom-right corner of your positioning area. Wait a few seconds then there will be constantly updating dimension values appear on your position live page, such as this:
<img width="300" alt="live dimension" src="https://user-images.githubusercontent.com/4184020/32579106-bb72eda6-c4ad-11e7-8791-222fea004337.gif">

After about 10 seconds or so when you think the distances are accurate (keep the anchor boards away from metal objects and clear in LOS), click the "Set Dimension" button. You can always manually change the dimension values by not powering on the anchor-1 and anchor-2 boards, so that the dimension values will not update automatically.

Our server program can work with both 3 anchors or 4 anchors, the 4th anchor should sit at the bottom-left corner of your area, having 4 anchors may reduce more location computation error due to the [trilateration](https://github.com/lemmingapex/trilateration) algorithm we used.

## Start Tracking Positions
1. Start the server program (Java) on your computer and open the live page
2. Put your anchors at the corners and power them on, connect anchor-0 to your computer
3. Measure and set your area dimensions
4. Power on your tags and start moving!

## Raw Data
Actually you don't need our server program at all if you want to do the computation yourself. When connect anchor-0 to your computer on USB port, you can always read all the raw distance messages from port by using any serial tool or program.

<img width="500" alt="ranging format" src="https://user-images.githubusercontent.com/4184020/32630321-48ec4b5c-c56a-11e7-91fd-ff69d52910db.png">
