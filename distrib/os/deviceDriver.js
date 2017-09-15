var PotatOS;
(function (PotatOS) {
    var DeviceDriver = (function () {
        function DeviceDriver() {
            this.version = '0.07';
            this.status = 'unloaded';
            this.preemptable = false;
            this.driverEntry = null;
            this.isr = null;
        }
        return DeviceDriver;
    }());
    PotatOS.DeviceDriver = DeviceDriver;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=deviceDriver.js.map