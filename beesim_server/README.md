### Steps for installing the BioSim Java server
1)
Make sure you have [Java 7](https://www.java.com/) (at least 7) installed on your computer. You can type "java -version" at your terminal to confirm the Java version.

2)
Download and uncompress the entire github zip file.

3) You may need to download JDK - java development kit - to run java commands in your terminal or command prompt.

### Steps for running the BioSim Java server
1)	The XBee module should be plugged into your computer.

2)	Open your terminal (Mac) or command prompt (Windows). Make sure you are under the directory of ../jetty/jetty-distribution-9.2.4.v20141103/
a.	To do this, type the command “cd “ and drag the jetty folder into the prompt window after it

3)	Start the server by typing command "java -jar start.jar".

4)	The server will then prompt you to enter your serial port name (for the XBee). For Windows, this will look like COM4, for example, and for Mac it will look like /dev/tty.uusbserial-A5025MPP. You can find the correct name by searching the device details in your computer's control panel - If you are using Windows, please make sure you have the FTDI driver installed, you can consult a [tutorial](https://learn.sparkfun.com/tutorials/how-to-install-ftdi-drivers/windows---quick-and-easy) and the [driver page](http://www.ftdichip.com/Drivers/VCP.htm). If there is any error when connecting the serial port, you just need to stop the process by pressing "ctrl+c" and start the server again. After that the terminal will prompt you the sever is ready such as: "Thank you! You server is ready."

5)	Open a browser and access the web app at your local IP address, followed by “:8080” For example: "http://192.168.1.109:8080". You can access the web app at your public IP address from other computers. If you do not have any network connection, you can still always access the web app at "127.0.0.1" or "localhost".

6)	Click “create new game from file.” Your file explorer will open, and you can choose desired file to begin.

7)	Make sure all honey bee puppets are switched ON

8)	Click “begin linking active devices.” The system should recognize all the bees. The red exclamation points will disappear on the bees that have been linked.

9)	Click on a flower or hive (passive devices) to link it. Use any one of the linked bees to touch the passive device. It should be recognized automatically.

10)	Once this is done for every passive device, click “start game.” Play will start right away.


### Steps for stopping/restarting the BioSim Java server
1)
Press "ctrl+c" in your terminal to end the server process. And type "java -jar start.jar" to start again if you wish.

### Demos
1) Start the BioSim Java server<br/>
https://www.youtube.com/watch?v=RgT3--2Oo7U

2) BioSim Client Simulation<br/>
https://www.youtube.com/watch?v=CVW3ei4aUKQ
