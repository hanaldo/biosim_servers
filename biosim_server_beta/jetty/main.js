const cp = require("child_process");

var javaProcess = cp.exec('java -jar start.jar', (error, stdout, stderr) => {
  console.log("Never called bye");
});

javaProcess.stdout.on("data", function(data) {
  if (data.includes("Thank you! You server is ready")) {
    console.log("Java server ready!");

    setTimeout(function() {
      mainWindow.loadURL("http://localhost:8080/index.html");
    }, 1000);
  }
});

process.on("SIGINT", function() {
  console.log("Kill javaProcess");
  javaProcess.kill("SIGINT");
  process.exit();
});

let mainWindow;

const {
  app,
  BrowserWindow
} = require('electron')
app.commandLine.appendSwitch("disable-http-cache");

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  console.log("createWindow");
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  });

  mainWindow.on("closed", function() {
    mainWindow = null
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  console.log("Bye BioSim");
  app.quit();
});

app.on("quit", function() {
  console.log("Kill javaProcess");
  javaProcess.kill("SIGINT");
  javaProcess = null;
});
