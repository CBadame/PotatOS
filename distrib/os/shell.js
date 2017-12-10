var PotatOS;
(function (PotatOS) {
    var Shell = (function () {
        function Shell() {
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.promptXPosition = _Console.currentXPosition;
            this.promptYPosition = _Console.currentYPosition;
        }
        Shell.prototype.init = function () {
            var sc;
            sc = new PotatOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellDate, "date", " - Displays current date and time.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellWhere, "whereami", " - Displays user's current location.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellFacts, "facts", " - Displays a random fact about potatoes.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellLoad, "load", "<number> - Validates code located in 'User Program Input' and writes it to memory.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellBSOD, "bsod", " - Initiates Blue Screen of Death.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the status at the top of the page.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellRun, "run", "<number> - Executes a given process from memory.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellPrograms, "ps", " - Lists active programs in the ready queue.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellKill, "kill", "<pid> - Terminates a given program.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellRunAll, "runall", " - Runs all loaded programs via Round-Robin scheduling.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellQuantum, "quantum", "<number> - Sets Round-Robin quantum to a given value.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellClearMem, "clearmem", " - Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellCreate, "create", "<filename> - Creates a new file in HDD with the given name.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellWrite, "write", "<filename> \"data\" - Writes the data to the given file.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellRead, "read", "<filename> - Prints contents of the given file.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellDelete, "delete", "<filename> - Deletes a given file from storage.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellFormat, "format", " - Reformats the hard drive.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellList, "ls", " - Lists all files on disk.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellGetSchedule, "getschedule", " - Returns the current CPU scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            sc = new PotatOS.ShellCommand(this.shellSetSchedule, "setschedule", "<schedule> - Changes the scheduling algorithm to either fcfs, rr, or priority.");
            this.commandList[this.commandList.length] = sc;
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
            this.promptXPosition = _Console.currentXPosition;
            this.promptYPosition = _Console.currentYPosition;
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            var userCommand = this.parseInput(buffer);
            var cmd = userCommand.command;
            var args = userCommand.args;
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                if (this.curses.indexOf("[" + PotatOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        Shell.prototype.execute = function (fn, args) {
            _StdOut.advanceLine();
            fn(args);
            _Console.originalScreenshot = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            if (!_CPU.isExecuting)
                this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new PotatOS.UserCommand();
            buffer = PotatOS.Utils.trim(buffer);
            buffer = buffer.toLowerCase();
            var tempList = buffer.split(" ");
            var cmd = tempList.shift();
            cmd = PotatOS.Utils.trim(cmd);
            retVal.command = cmd;
            for (var i in tempList) {
                var arg = PotatOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            _Kernel.krnShutdown();
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "ver":
                        _StdOut.putText("Ver displays the name and version number of the OS " +
                            "(If this still confuses you then you are hopelessly lost).");
                        break;
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown turns off the virtual OS. It can then only be restarted by either " +
                            "hitting the 'Reset' button or reloading the page and hitting the 'Start' button.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears all text from the terminal.");
                        break;
                    case "man":
                        _StdOut.putText("Man displays a manual page for incompetent users who don't know how to use " +
                            "context clues to figure out what a given command's function is.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace toggles the OS tracing for viewing in the Host Log.");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 shifts each letter in a given string 13 places down the alphabet. " +
                            "This basically exists so that Alan could store curse words in the OS without leaving " +
                            "them in plain text.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt allows the user to change the cursor, or 'prompt', to whatever " +
                            "string they prefer.");
                        break;
                    case "date":
                        _StdOut.putText("Displays current date and time. What did you think it did?");
                        break;
                    case "whereami":
                        _StdOut.putText("Tells the user where they are currently located...sorta.");
                        break;
                    case "load":
                        _StdOut.putText("Ensures that the user is only trying to use hex, digits, and/or spaces " +
                            "with their program, then writes it to memory.");
                        break;
                    case "bsod":
                        _StdOut.putText("Tests the Blue Screen of Death function...everyone's favorite part of " +
                            "an OS.");
                        break;
                    case "status":
                        _StdOut.putText("Sets the status to whatever the user wishes. Let's try and keep this " +
                            "PG.");
                        break;
                    case "run":
                        _StdOut.putText("Grabs one of the programs stored in a segment of memory and executes " +
                            "for the WHOLE world to see. Pretty exciting stuff here.");
                        break;
                    case "ps":
                        _StdOut.putText("Lists all programs in the ready queue.");
                        break;
                    case "kill":
                        _StdOut.putText("Kills the desired program...you monster.");
                        break;
                    case "runall":
                        _StdOut.putText("Runs all loaded programs via Round-Robin scheduling. *gulp*");
                        break;
                    case "quantum":
                        _StdOut.putText("Sets the Round-Robin scheduling quantum to whatever your little heart " +
                            "desires.");
                        break;
                    case "clearmem":
                        _StdOut.putText("This will remove everything from memory. I would tell you to save " +
                            "first, but that\'s not really an option here.");
                        break;
                    case "create":
                        _StdOut.putText("This will create a new file in HDD storage with whatever name you " +
                            "would like. Let's keep this PG please.");
                        break;
                    case "write":
                        _StdOut.putText("Allows you to write some stuff to a given file.");
                        break;
                    case "read":
                        _StdOut.putText("Prints the contents of the file given.");
                        break;
                    case "delete":
                        _StdOut.putText("Deletes filename and contents of the given file from storage.");
                        break;
                    case "ls":
                        _StdOut.putText("Lists all files stored on the disk.");
                        break;
                    case "getschedule":
                        _StdOut.putText("Tells you which scheduling algorithm is currently being used. Haven't" +
                            "implemented a calendar yet for other 'schedules'.");
                        break;
                    case "setschedule":
                        _StdOut.putText("Sets the CPU scheduling algorithm to what is given. Can choose between " +
                            "[fcfs, rr, priority].");
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                _StdOut.putText(args.join(' ') + " = '" + PotatOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function () {
            var currentDate = new Date();
            _StdOut.putText(currentDate.toString());
        };
        Shell.prototype.shellWhere = function () {
            _StdOut.putText("Probably in front of a computer if I had to guess. (More creative response TBD)");
        };
        Shell.prototype.shellFacts = function () {
            _StdOut.putText(factGenerator(factList));
        };
        Shell.prototype.shellLoad = function (priority) {
            var userInput = document.getElementById('taProgramInput').value;
            if (userInput) {
                userInput = userInput.toUpperCase();
                if (!userInput.match(/^[A-F0-9\s]+$/))
                    _StdOut.putText("User input is invalid. Please use hex, digits, or spaces.");
                else {
                    var pcb = new PotatOS.PCB();
                    if (priority) {
                        pcb.priority = priority;
                    }
                    else {
                        pcb.priority = 0;
                    }
                    _PCBList.push(pcb);
                    if (_MM.checkMem() != null) {
                        _MM.write(userInput, pcb);
                    }
                    else {
                        pcb.location = "HDD";
                        pcb.segment = -1;
                        var newTsb = _krnDiskDriver.createFile(pcb.PID.toString());
                        _krnDiskDriver.write(newTsb, userInput);
                    }
                    _StdOut.putText('The process successfully loaded and has a PID of: ' + pcb.PID);
                    PotatOS.Control.updateProcessDisplay();
                }
            }
            else
                _StdOut.putText("User input is invalid. Please use hex, digits, or spaces.");
        };
        Shell.prototype.shellBSOD = function () {
            _OsShell.promptStr = '';
            _Kernel.krnTrapError("test");
        };
        Shell.prototype.shellStatus = function (newStatus) {
            if (newStatus.length > 0) {
                document.getElementById("status").innerHTML = "Status: " + newStatus.join(' ');
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellRun = function (pid) {
            var ifExists = false;
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].PID == pid) {
                    if (_cpuScheduling.runAll == true) {
                        _PCBList[i].state = 'READY';
                    }
                    else {
                        _PCBList[i].state = 'NEW';
                    }
                    if (_PCBList[i].location == "HDD") {
                        if (_MM.checkMem() == null) {
                            var pcbMem;
                            for (var j = 0; j < _PCBList.length; j++) {
                                if (_PCBList[j].segment == 2) {
                                    pcbMem = _PCBList[j];
                                    j = _PCBList.length;
                                }
                            }
                            _krnDiskDriver.swap(pcbMem, _PCBList[i]);
                        }
                        else {
                            var tsb = _krnDiskDriver.checkFile(_PCBList[i].PID.toString());
                            _MM.write(_krnDiskDriver.read(tsb), _PCBList[i]);
                            _krnDiskDriver["delete"](tsb);
                        }
                    }
                    _MM.run(_PCBList[i]);
                    ifExists = true;
                }
            }
            if (!ifExists)
                _StdOut.putText("This program does not exist.");
        };
        Shell.prototype.shellPrograms = function () {
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].state != 'NEW') {
                    _StdOut.putText('PID: ' + _PCBList[i].PID);
                    _StdOut.advanceLine();
                }
            }
        };
        Shell.prototype.shellKill = function (pid) {
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].PID == pid) {
                    for (var j = 0; j < _DISK.FileList.length; j++) {
                        if (_DISK.FileList[j][1] == pid.toString()) {
                            _krnDiskDriver["delete"](_DISK.FileList[j][0]);
                            PotatOS.Control.updateHDDDisplay();
                        }
                    }
                    _CPU.terminate(_PCBList[i]);
                    PotatOS.Control.updateCPUDisplay();
                    PotatOS.Control.updateProcessDisplay();
                    PotatOS.Control.updateMemoryDisplay();
                }
            }
        };
        Shell.prototype.shellRunAll = function () {
            _cpuScheduling.runAll = true;
            for (var i = 0; i < _PCBList.length; i++)
                _PCBList[i].state = 'READY';
            _MM.run(_PCBList[0]);
        };
        Shell.prototype.shellQuantum = function (newVal) {
            if (newVal > 0)
                _cpuScheduling.quantum = newVal;
            else
                _StdOut.putText('Please stop trying to break the scheduler, it\'s very fragile.');
        };
        Shell.prototype.shellClearMem = function () {
            while (_PCBList.length > 0) {
                _CPU.terminate(_PCBList[0]);
            }
            PotatOS.Control.updateProcessDisplay();
        };
        Shell.prototype.shellCreate = function (fName) {
            if (fName == "") {
                _StdOut.putText("Please supply a file name.");
            }
            else {
                if (_krnDiskDriver.toHex(fName[0]).length > 120) {
                    _StdOut.putText("File name is too long.");
                }
                else {
                    var tsb = _krnDiskDriver.createFile(fName[0]);
                    _StdOut.putText("File '" + fName + "' created at " + tsb);
                }
            }
        };
        Shell.prototype.shellWrite = function (contents) {
            var fileTsb = _krnDiskDriver.checkFile(contents[0]);
            var data = contents[1];
            if (contents.length >= 2) {
                for (var i = 2; i < contents.length; i++) {
                    data += " " + contents[i];
                }
                if (fileTsb != "") {
                    if (data.charCodeAt(0) != 34 || data.charCodeAt(data.length - 1) != 34) {
                        _StdOut.putText("Please make sure to use quotation marks around the data for the file.");
                    }
                    else {
                        var data = data.replace(/['"]+/g, '');
                        _krnDiskDriver.write(fileTsb, data);
                        _StdOut.putText("Successfully wrote to " + contents[0] + "!");
                    }
                }
                else {
                    _StdOut.putText("File does not exists. Please check the spelling of the file name or create " +
                        "a new file.");
                }
            }
            else if (contents.length < 2) {
                _StdOut.putText("Please supply a file name AND data.");
            }
        };
        Shell.prototype.shellRead = function (fName) {
            var tsb = _krnDiskDriver.checkFile(fName);
            if (tsb == "") {
                _StdOut.putText("File does not exists. Please check the spelling of the file name or create " +
                    "a new file.");
            }
            else {
                _StdOut.putText(_krnDiskDriver.read(tsb));
            }
        };
        Shell.prototype.shellDelete = function (fName) {
            var tsb = _krnDiskDriver.checkFile(fName);
            if (tsb == "") {
                _StdOut.putText("File does not exists. Please check the spelling of the file name.");
            }
            else {
                _krnDiskDriver["delete"](tsb);
                for (var i = 0; i < _PCBList.length; i++) {
                    if (_PCBList[i].PID == fName) {
                        _PCBList.splice(i, 1);
                    }
                }
                PotatOS.Control.updateProcessDisplay();
                _StdOut.putText("Successfully deleted " + fName[0] + "!");
            }
        };
        Shell.prototype.shellFormat = function () {
            _krnDiskDriver.format();
            _StdOut.putText("Hard drive successfully formatted!");
        };
        Shell.prototype.shellList = function () {
            _StdOut.putText("Files on HDD: ");
            _StdOut.advanceLine();
            for (var i = 0; i < _DISK.FileList.length; i++) {
                _StdOut.putText(_DISK.FileList[i][1]);
                _StdOut.advanceLine();
            }
        };
        Shell.prototype.shellGetSchedule = function () {
            _StdOut.putText(_cpuScheduling.schedule);
        };
        Shell.prototype.shellSetSchedule = function (type) {
            if (type[0] == "fcfs" || type[0] == "rr" || type[0] == "priority") {
                _cpuScheduling.schedule = type[0];
                _StdOut.putText("Scheduler changed to " + type[0]);
            }
        };
        return Shell;
    }());
    PotatOS.Shell = Shell;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=shell.js.map