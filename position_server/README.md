## Prerequisite
In order to run the position server, you need to install [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html) on your computer, and a fairly modern browser (such as Google Chrome) to see the position live page.

Regarding the hardware, you will need at least 4 of our positioning boards, because we need at least 3 anchors to do the trilateration within a 2D dimension, and the other board can act as the tag which to be tracked. Please note that we currently only support maximum of 4 anchors and 8 tags.

## Position Board Introduction
<img width="600" alt="biosim position board" src="https://user-images.githubusercontent.com/4184020/29587727-d455cf3e-875c-11e7-8a6f-40f64447ba8c.png">

This is the position board we made to incorporate the [DWM1000](https://www.decawave.com/products/dwm1000-module) chip in order to achieve precise distance measuring, and by combining a few of distances we can then achieve positioning. This board has similar functions as the [EVB1000](https://www.decawave.com/products/trek1000) board but much smaller and cheaper.

<img width="450" alt="trek1000_quick_start_guide_pdf _6_ _8_" src="https://user-images.githubusercontent.com/4184020/29436794-69bcedea-837b-11e7-9809-8a21c076be96.png">

## Starting Position Server
To start the server program, download the [server](https://github.com/hanaldo/biosim_servers/tree/master/position_server/server) folder and go under this folder from your local command line tool, and then type "java -jar start.jar".

## Setting up the area (dimension)
Before start to track tag positions, you need to specify the width and the height of the tracked area, otherwise the indoor positions are meaningless. You can measure your area by hand if you have some long rulers, however our program can help you ease the process.

First, start the server program and go to the position live page, and then plug in the anchor 0 to your computer, and then start the serial port as prompted.

Right now you can power up a tag board (any tag, such as tag 0), and put your tag at the position of where you want your anchor 1 to be, so that the server can measure the distance between anchor 0 and anchor 1 (this may be your area width), because in our algorithm the anchors do not capture the distances between each other, the distance has to be between an anchor and a tag.

After about 10 seconds or so when you think the distance is accurate (you kept the tag board steady), power off the tag board. And then setup the anchor 1 to the same position (where your tag was at). After this, use the same tag board to repeat the process again to measure your area height, i.e. put the tag at the position of where you want your anchor 2 to be. When you finish, power off the tag and then setup anchor 2. You can also immediately setup anchor 3 after setup anchor 2, because the width and height are already measured between the 3 anchors.

## Start Tracking Position
In order to track tags, you will need at least 3 anchors. 
