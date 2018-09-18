const cp = require("child_process");
const fs = require("fs");
const os = require("os");
const psTree = require("ps-tree");

let javaProcess;

process.on("SIGINT", function() { // for dev
  console.log("Kill javaProcess");
  javaProcess.kill("SIGINT");
  process.exit();
});

function killProcess(pid) {
  switch (process.platform) {
    case "win32":
      cp.execSync("taskkill /pid " + pid + " /T /F");
      break;
    default:
      cp.execSync("kill -9 " + pid);
      break;
  }
}

let mainWindow;

const {
  app,
  BrowserWindow,
  dialog
} = require("electron");
app.commandLine.appendSwitch("disable-http-cache");

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function() {
  var path = app.getAppPath();
  //var path = app.getAppPath().replace("default_app.asar", "") + "app/";
  console.log(path);

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  });

  mainWindow.loadFile("loading.html");

  mainWindow.on("closed", function() {
    mainWindow = null
  });

  javaProcess = cp.exec("java -jar start.jar", {
    cwd: path
  }, (error, stdout, stderr) => {
    console.log("Java command finished");
  });

  // javaProcess.stderr.pipe(fs.createWriteStream(path + "/log.txt", {
  //   flags: "w"
  // }));

  var log = fs.createWriteStream(path + "/log.txt", {
    flags: "w"
  });
  log.write("path: " + path + "\n")
  log.write("javaProcess.pid: " + javaProcess.pid + "\n");
  log.write("process.pid: " + process.pid + "\n");
  log.write("os.platform: " + os.platform + "\n");

  psTree(javaProcess.pid, function(err, children) {
    children.map(function(p) {
      log.write("child: " + p.PID + "\n");
    });
  });

  javaProcess.stdout.on("data", function(data) {
    if (data.includes("Thank you! You server is ready")) {
      console.log("Java server ready!");
      console.log("Wait 1 second to load index page...");
      setTimeout(function() {
        mainWindow.loadURL("http://localhost:8080/index.html");
      }, 1000);
    }
  });

  //mainWindow.webContents.openDevTools();
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  console.log("Bye BioSimer");
  app.quit();
});

app.on("quit", function() {
  console.log("Try kill javaProcess");
  killProcess(javaProcess.pid);
  //javaProcess.kill("SIGINT");
  // psTree(javaProcess.pid, function(err, children) {
  //   children.map(function(p) {
  //     log.write("kill grandchild: " + p.PID + "\n");
  //     killProcess(p.PID);
  //   });
  // });
  process.exit();
});
