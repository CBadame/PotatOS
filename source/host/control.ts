///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module PotatOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            //Auto-update date + status bar
            Utils.currentDate();
            setInterval(function{Utils.currentDate()}, 1000);

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnSingleStep")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            _Memory = new PotatOS.Memory();
            _Memory.init();
            _MM = new PotatOS.MM();
            _PCB = new PotatOS.PCB();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _cpuScheduling = new PotatOS.cpuScheduling();
            _cpuScheduling.init();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.


            // Initialize hardware stats
            PotatOS.Control.updateMemoryDisplay();
            PotatOS.Control.updateCPUDisplay();
            PotatOS.Control.updateProcessDisplay();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static updateCPUDisplay(): void {
            var displayIR = '00';
            if (_CPU.IR != '')
                displayIR = _CPU.IR;

            var str: string = '<tr><td>PC</td><td>AC</td><td>IR</td><td>X</td><td>Y</td><td>Z</td></tr>';
            str += '<tr><td>' + _CPU.PC + '</td><td>' + _CPU.Acc + '</td><td>' + displayIR + '</td><td>' + _CPU.Xreg +
                '</td><td>' + _CPU.Yreg + '</td><td>' + _CPU.Zflag + '</td></tr>';
            document.getElementById("tbCPU").innerHTML = str;
        }

        // Builds memory table in UI based of off the memory array
        public static updateMemoryDisplay(): void {
            var str: string = '';
            var count = 0;
            var byteCount = 0;
            while (count < _Memory.memory.length) {
                if (count < 10)
                    str += '<tr><td>0x00' + count.toString() + '</td>';
                else if (count >= 10 && count < 100)
                    str += '<tr><td>0x0' + count.toString() + '</td>';
                else
                    str+= '<tr><td>0x' + count.toString() + '</td>';
                while (byteCount < 8) {
                    str += '<td>' + _Memory.memory[count] + '</td>';
                    byteCount++;
                    count++;
                }
                str += '</tr>';
                byteCount = 0;
            }
            document.getElementById("tbMemory").innerHTML = str;
        }

        public static updateProcessDisplay(): void {
            var str: string = '<tr><td>PID</td><td>PC</td><td>AC</td><td>IR</td><td>X</td><td>Y</td><td>Z</td>' +
                '<td>State</td><td>Segment</td></tr>';
            var i = 0;
            while (i < _PCBList.length) {
                str += '<tr><td>' + _PCBList[i].PID + '</td><td>' + _PCBList[i].PC + '</td><td>' +  _PCBList[i].Acc +
                    '</td><td>' + _PCBList[i].IR + '</td><td>' + _PCBList[i].Xreg + '</td><td>' + _PCBList[i].Yreg +
                    '</td><td>' + _PCBList[i].Zflag + '</td><td>' + _PCBList[i].state + '</td><td>' +
                    _PCBList[i].segment + '</td><td>';
                i++;
            }
            document.getElementById("tbPCB").innerHTML = str;
        }

        // If singleStep is active, turn it off and allow the program to run normally. Otherwise, activate singleStep
        // and require the user to click the 'step' button to continue.
        public static singleStep_click(btn): void {
            if (_CPU.singleStep) {
                (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
                _CPU.singleStep = false;
                _CPU.isExecuting = true;
            }
            else {
                if (_CPU.isExecuting) {
                    (<HTMLButtonElement>document.getElementById("btnStep")).disabled = false;
                    _CPU.singleStep = true;
                }
            }
        }

        // Allow the next step of the program to run during the next CPU cycle
        public static step_click(btn): void {
            if (_CPU.codeArray != [0,0,0]) {
                _CPU.isExecuting = true;
            }
        }
    }
}
