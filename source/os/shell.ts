///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
 Shell.ts

 The OS Shell - The "command line interface" (CLI) for the console.

 Note: While fun and learning are the primary goals of all enrichment center activities,
 serious injuries may occur when trying to write your own Operating System.
 ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module PotatOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public promptXPosition = _Console.currentXPosition;
        public promptYPosition = _Console.currentYPosition;

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                "ver",
                "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                "help",
                "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                "shutdown",
                "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                "cls",
                "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                "man",
                "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                "trace",
                "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                "rot13",
                "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                "prompt",
                "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            //date
            sc = new ShellCommand(this.shellDate,
                "date",
                " - Displays current date and time.");
            this.commandList[this.commandList.length] = sc;

            //whereami
            sc = new ShellCommand(this.shellWhere,
                "whereami",
                " - Displays user's current location.");
            this.commandList[this.commandList.length] = sc;

            //facts
            sc = new ShellCommand(this.shellFacts,
                "facts",
                " - Displays a random fact about potatoes.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "<number> - Validates code located in 'User Program Input' and writes it to memory.");
            this.commandList[this.commandList.length] = sc;

            //bsod
            sc = new ShellCommand(this.shellBSOD,
                "bsod",
                " - Initiates Blue Screen of Death.");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "<string> - Sets the status at the top of the page.");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.shellRun,
                "run",
                "<number> - Executes a given process from memory.");
            this.commandList[this.commandList.length] = sc;

            //programs
            sc = new ShellCommand(this.shellPrograms,
                "ps",
                " - Lists active programs in the ready queue.");
            this.commandList[this.commandList.length] = sc;

            //kill <pid>
            sc = new ShellCommand(this.shellKill,
                "kill",
                "<pid> - Terminates a given program.");
            this.commandList[this.commandList.length] = sc;

            //runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                " - Runs all loaded programs via Round-Robin scheduling.");
            this.commandList[this.commandList.length] = sc;

            //quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "<number> - Sets Round-Robin quantum to a given value.");
            this.commandList[this.commandList.length] = sc;

            //clearMem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                " - Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;

            //create
            sc = new ShellCommand(this.shellCreate,
                "create",
                "<string> - Creates a new file in HDD with the given name.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();

        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
            this.promptXPosition = _Console.currentXPosition;
            this.promptYPosition = _Console.currentYPosition;
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            _Console.originalScreenshot = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            if (!_CPU.isExecuting)
                this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
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
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }


        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate() {
            var currentDate = new Date();
            _StdOut.putText(currentDate.toString());
        }

        public shellWhere() {
            _StdOut.putText("Probably in front of a computer if I had to guess. (More creative response TBD)");
        }

        public shellFacts() {
            _StdOut.putText(factGenerator(factList));
        }

        public shellLoad(priority: number) {
            var userInput =(<HTMLInputElement>document.getElementById('taProgramInput')).value;
            if (userInput) {
                // Decided to use regex because the valueType of 'taProgramInput' was being returned as 'undefined'...
                // ...I got sick of trying to figure out how to make the value a string/compare it to a string, and...
                // thought that this would be easier (Hint: It was)

                userInput = userInput.toUpperCase();
                if (!userInput.match(/^[A-F0-9\s]+$/))
                    _StdOut.putText("User input is invalid. Please use hex, digits, or spaces.");
                else {
                    // Sets the PCB's priority and adds it to the list of ready PCBs
                    if (_MM.checkMem() != null) {
                        var PCB = new PotatOS.PCB();
                        if (priority)
                            PCB.priority = priority;
                        else
                            PCB.priority = 0;
                        _PCBList.push(PCB);
                        _MM.write(userInput, PCB);
                        PotatOS.Control.updateProcessDisplay();
                    }
                    else
                        _StdOut.putText('No more free memory.');
                }
            }
                else
                    _StdOut.putText("User input is invalid. Please use hex, digits, or spaces.");
        }

        // This is only a simulated Kernel Panic for now. EDIT: Now calls krnTrapError to initiate a real BSOD.
        public shellBSOD() {
            _OsShell.promptStr = '';
            _Kernel.krnTrapError("test");
        }

        public shellStatus(newStatus) {
            if (newStatus.length > 0) {
                document.getElementById("status").innerHTML = "Status: " + newStatus.join(' ');
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }

        public shellRun(pid: number) {
            var ifExists = false;
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].PID == pid) {
                    if (_cpuScheduling.runAll == true)
                        _PCBList[i].state = 'READY';
                    else
                        _PCBList[i].state = 'NEW';
                    _MM.run(_PCBList[i]);
                    ifExists = true;
                }
            }
            if (!ifExists)
                _StdOut.putText("This program does not exist.");
        }

        public shellPrograms() {
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].state != 'NEW') {
                    _StdOut.putText('PID: ' + _PCBList[i].PID);
                    _StdOut.advanceLine();
                }
            }
        }

        public shellKill(pid: number) {
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].PID == pid) {
                    _CPU.terminate(_PCBList[i]);
                    PotatOS.Control.updateCPUDisplay();
                    PotatOS.Control.updateProcessDisplay();
                    PotatOS.Control.updateMemoryDisplay();
                }
            }
        }

        public shellRunAll() {
            _cpuScheduling.runAll = true;
            for (var i = 0; i < _PCBList.length; i++)
                _PCBList[i].state = 'READY';
            _MM.run(_PCBList[0]);
        }

        public shellQuantum(newVal: number) {
            if (newVal > 0)
                _cpuScheduling.quantum = newVal;
            else
                _StdOut.putText('Please stop trying to break the scheduler, it\'s very fragile.');
        }

        public shellClearMem() {
            while (_PCBList.length > 0) {
                _CPU.terminate(_PCBList[0]);
            }
            PotatOS.Control.updateProcessDisplay();
        }

        public shellCreate(fName: string) {
            if (fName == '') {
                _StdOut.putText("Please supply a file name.");
            }
            else {
                _krnDiskDriver.createFile(fName);
            }
        }

    }
}
