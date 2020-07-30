## Prerequisite
1. In order to run the BioSim server, you need to have [JDK 8 (Java)](http://www.oracle.com/technetwork/java/javase/downloads/index.html) on your computer. You can type "java -version" at your terminal to confirm your current Java version.

2. Be sure to identify your OS (operating system) and download the correspinding executable app from the "MacOS", "Windows" and "Linux" folders.

3. If you want to access the live game page from other computers within your local area network that is fine too, make sure you have a fairly modern browser (such as Google Chrome, Firefox, Safari, Microsoft Edge).

4. XBee Coordinator configuration for BeeSim: FunctionSet->802.15.4, 10ef, ID->8888, MY->A001, RR->6, RN->3, AP->1.

5. XBee Coordinator configuration for AntSim: FunctionSet->802.15.4, 10ef, ID->4321, MY->A001, RR->6, RN->3, AP->1.

## Steps for running the BioSim Java server
1. Start the server by double-click or open the server app.

2. After that a window with a loading page will show the server is starting.

3. After the live game page is shown, click the setting icon (<img width="24" alt="setting_button" src="https://user-images.githubusercontent.com/4184020/35249320-8b24163e-ff9f-11e7-96d1-e581775ab1d3.png"/>) and then go under "Server Control" tab, click "Connect XBee", then plug the XBee (ID: A001) module into your computer as prompted. Now your server is up and ready to talk to those puppets!
- Please note: After you create a new game (from a game file), make sure you come to this setting again and click the "Connect XBee" button to let the server know the XBee module is still connected!

<img width="300" alt="xbee prompt" src="https://user-images.githubusercontent.com/4184020/35751022-f9250f2a-0824-11e8-890a-49c40247de7d.png"><img width="300" alt="xbee prompt" src="https://user-images.githubusercontent.com/4184020/35751071-155756ee-0825-11e8-896e-7d9045efa628.png">

<img width="200" alt="beesim_xbee_server_device" src="https://user-images.githubusercontent.com/4184020/35123718-6bdf9b3a-fc71-11e7-83f4-7341f77f3ff3.png"/>

## Stopping/restarting the BioSim Java server
1. Simply close the app window or quit the app and then start the app again.

## Steps for creating a new BeeSim game
1. Click the setting icon (<img width="24" alt="setting_button" src="https://user-images.githubusercontent.com/4184020/35249320-8b24163e-ff9f-11e7-96d1-e581775ab1d3.png"/>), then click “Create game from file” button. Your file explorer will open, and you can choose desired game file to begin.

2. Make sure all honey bee puppets are switched ON.

3. Link all participating bee puppets:
   * Click the eye button (<img width="24" alt="eye_button" src="https://user-images.githubusercontent.com/4184020/35249247-461928b8-ff9f-11e7-939c-6c6de4f44b34.png"/>), unlinked bees will show a red exclamation triangle (<img width="24" alt="not_linked_icon" src="https://user-images.githubusercontent.com/4184020/35250094-e5e647ec-ffa2-11e7-926d-259dbe25ed4c.png"/>) under him, this means the bee objects in the game are not linked to the physical bee puppet yet.
   * You can then click the setting icon, and go under "Simulation Control" tab, and click "Start Linking Active Devices" button. The system should recognize all the bees. The red exclamation triangles will disappear on the bees that have been linked.

4. Click on the red exclamation triangle of a flower or hive (passive devices) to link it. Use any one of the linked bees to touch the passive device. It should be recognized automatically.

5. Once this is done for every passive device, click “start game.” Play will start right away.

## Configuring a BeeSim game before start
1. An example game file in MS Excel format is provided. To start a game with the file you just need to click “Create game from file” button and choose this file.

2. The first row in the game file is for defining some overall game properties. The "Space Width" item and the "Space Height" item are used to describe how big the game space is virtually. e.g. "5 width x 5 height" can be thought of a virtual squre space with 25 grids.

3. Under the blue row ("Group Name") is all the information about all the different game objects, and they are configured by groups. For example, A group with Object Type "bee" and Number of Objects of "4" means there will be 4 bees in the game.

4. **Group Name** of different objects can be the same, that is how we support two groups of bees with each own hive, but please not we currently only support two groups of bees at the most. e.g.
<table>
<thead><tr><th>Group Name</th><th>Object Type</th><th>Number of Objects</th></tr></thead>
<tbody>
<tr><td>group-1</td><td>bee</td><td>4</td></tr>
<tr><td>group-1</td><td>hive</td><td>1</td></tr>
<tr><td>group-2</td><td>bee</td><td>4</td></tr>
<tr><td>group-2</td><td>hive</td><td>1</td></tr>
</tbody>
</table>
The above table means there will be two groups of bees, and each group has its own hive.


5. The **X and Y Position** means where the objects will be at within the virtual game space at game start.

6. **Max Nectar** is the maximum amount of nectar that one object can carry.

## Demos
1. Start the BioSim server in MacOS<br/>
https://www.youtube.com/watch?v=BaBwmojWeyA
