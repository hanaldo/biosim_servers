## Prerequisite
1. In order to run the BeeSim server, you need to install [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html) on your computer, and a fairly modern browser (such as Google Chrome). You can type "java -version" at your terminal to confirm the Java version.

2. Download and uncompress the entire github zip file, this contains the entire BeeSim Java server program.

## Steps for running the BeeSim Java server
1. The XBee module should be plugged into your computer.

<img width="600" alt="biosim_position" style="display: block; margin: 0 auto;" src="https://user-images.githubusercontent.com/4184020/29588169-7f68b336-875e-11e7-8dc2-1988d71707ef.png">

2. Open your terminal (Mac) or command prompt (Windows). Make sure you are under the directory of ../jetty/. To do this, type the command “cd “ and drag the jetty folder into the prompt window after it.

3. Start the server by typing command "java -jar start.jar".

4. The server will then prompt you to enter your serial port name (for the XBee). For Windows, this will look like COM4, for example, and for Mac it will look like /dev/tty.uusbserial-A5025MPP. You can find the correct name by searching the device details in your computer's control panel - If you are using Windows, please make sure you have the FTDI driver installed, you can consult a [tutorial](https://learn.sparkfun.com/tutorials/how-to-install-ftdi-drivers/windows---quick-and-easy) and the [driver page](http://www.ftdichip.com/Drivers/VCP.htm). If there is any error when connecting the serial port, you just need to stop the process by pressing "ctrl+c" and start the server again. After that the terminal will prompt you the sever is ready such as: "Thank you! You server is ready."

5. Open a browser and access the web app at your local IP address, followed by “:8080” For example: "http://192.168.1.109:8080". You can access the web app at your public IP address from other computers. If you do not have any network connection, you can still always access the web app at "http://127.0.0.1:8080" or "http://localhost:8080".

## Steps for starting a BeeSim game
1. Click “create new game from file.” Your file explorer will open, and you can choose desired file to begin.

2. Make sure all honey bee puppets are switched ON

3. Click “begin linking active devices.” The system should recognize all the bees. The red exclamation points will disappear on the bees that have been linked.

4. Click on a flower or hive (passive devices) to link it. Use any one of the linked bees to touch the passive device. It should be recognized automatically.

5. Once this is done for every passive device, click “start game.” Play will start right away.

## Steps for stopping/restarting the BioSim Java server
1. Press "ctrl+c" in your terminal to end the server process. And type "java -jar start.jar" to start again if you wish.

## Steps for configuring a BeeSim game before start
1. ...

## Demos
1) Start the BioSim Java server<br/>
https://www.youtube.com/watch?v=RgT3--2Oo7U

2) BioSim Client Simulation<br/>
https://www.youtube.com/watch?v=CVW3ei4aUKQ
