## Prerequisite
1. In order to run the BeeSim server, you need to install [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html) on your computer, and a fairly modern browser (such as Google Chrome). You can type "java -version" at your terminal to confirm the Java version.

2. Download and uncompress the entire github zip file, this contains the entire BeeSim Java server program.

## Steps for running the BeeSim Java server
1. The XBee (ID: A001) module should be plugged into your computer.

<img width="300" alt="beesim_xbee_server_device" src="https://user-images.githubusercontent.com/4184020/35123718-6bdf9b3a-fc71-11e7-83f4-7341f77f3ff3.png"/>

2. Open your terminal (Mac) or command prompt (Windows). Make sure you are under the directory of ../jetty/. To easily do this, type the command “cd “ and drag the jetty folder into the prompt window after it.

3. Start the server by typing command "java -jar start.jar".

4. The server will then prompt you to enter your serial port name (for the XBee module). For Windows, this will look like COM4, for example, and for Mac it will look like /dev/tty.uusbserial-A5025MPP. You can find the correct name by searching the device details in your computer's control panel - If you are using Windows, please make sure you have the FTDI driver installed, you can consult a [tutorial](https://learn.sparkfun.com/tutorials/how-to-install-ftdi-drivers/windows---quick-and-easy) and the [driver page](http://www.ftdichip.com/Drivers/VCP.htm). If there is any error when connecting the serial port, you just need to stop the process by pressing "ctrl+c" and start the server again. After that the terminal will prompt you the sever is ready such as: "Thank you! You server is ready."

5. Open a browser and access the web app at your local IP address, followed by port “:8080” For example: "http://192.168.1.109:8080". You can access the web app at your public IP address from other computers. If you do not have any network connection, you can still always access the web app at "http://127.0.0.1:8080" or "http://localhost:8080".

## Stopping/restarting the BioSim Java server
1. Press "ctrl+c" in your terminal to end the server process. And type "java -jar start.jar" to start again if you wish.

## Steps for starting a BeeSim game
1. Click the setting icon (<img width="24" alt="setting_button" src="https://user-images.githubusercontent.com/4184020/35249320-8b24163e-ff9f-11e7-96d1-e581775ab1d3.png"/>), then click “Create game from file” button. Your file explorer will open, and you can choose desired game file to begin.

2. Make sure all honey bee puppets are switched ON.

3. Link all participating bee puppets:
   * Click the eye button (<img width="24" alt="eye_button" src="https://user-images.githubusercontent.com/4184020/35249247-461928b8-ff9f-11e7-939c-6c6de4f44b34.png"/>), unlinked bees will show a red exclamation triangle (<img width="24" alt="not_linked_icon" src="https://user-images.githubusercontent.com/4184020/35250094-e5e647ec-ffa2-11e7-926d-259dbe25ed4c.png"/>) under him, this means the bee objects in the game are not linked to the physical bee puppet yet.
   * You can then click the setting icon, and go under "Simulation Control" tab, and click "Start Linking Active Devices" button. The system should recognize all the bees. The red exclamation triangles will disappear on the bees that have been linked.

4. Click on the red exclamation triangle of a flower or hive (passive devices) to link it. Use any one of the linked bees to touch the passive device. It should be recognized automatically.

5. Once this is done for every passive device, click “start game.” Play will start right away.

## Configuring a BeeSim game before start
1. An example game file in MS Excel format is provided. To start a game with the file you just need to click “Create game from file” button and choose this file.

2. The first row in the game file is for defining some overall game properties. The "Space Width" item and the "Space Height" item are used to describe how big the game space is virtually. e.g. "5w x 5h" can be thought of a virtual squre space with 25 grids.

3. Under the blue row ("Group Name") is all the information about all the different game objects, and they are configured by groups. A group with Object Type "bee" and Number of Objects of "4" means there will be 4 bees in the game.

## Demos
1) Start the BioSim Java server<br/>
https://www.youtube.com/watch?v=RgT3--2Oo7U

2) BioSim Client Simulation<br/>
https://www.youtube.com/watch?v=CVW3ei4aUKQ
