var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PotatOS;
(function (PotatOS) {
    var DeviceDriverDisk = (function (_super) {
        __extends(DeviceDriverDisk, _super);
        function DeviceDriverDisk() {
            var _this = _super.call(this) || this;
            _this.driverEntry = _this.krnDiskDriverEntry;
            return _this;
        }
        DeviceDriverDisk.prototype.krnDiskDriverEntry = function () {
            this.status = "loaded";
        };
        return DeviceDriverDisk;
    }(PotatOS.DeviceDriver));
    PotatOS.DeviceDriverDisk = DeviceDriverDisk;
})(PotatOS || (PotatOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map