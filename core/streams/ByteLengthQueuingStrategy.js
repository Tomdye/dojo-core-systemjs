(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './QueuingStrategy', './util'], factory);
    }
})(function (require, exports) {
    "use strict";
    const QueuingStrategy_1 = require('./QueuingStrategy');
    const util_1 = require('./util');
    class ByteLengthQueuingStrategy extends QueuingStrategy_1.default {
        size(chunk) {
            if (chunk.byteLength !== undefined) {
                return chunk.byteLength;
            }
            else {
                return util_1.getApproximateByteSize(chunk);
            }
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ByteLengthQueuingStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL0J5dGVMZW5ndGhRdWV1aW5nU3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBQUEsa0NBQTRCLG1CQUFtQixDQUFDLENBQUE7SUFDaEQsdUJBQXVDLFFBQVEsQ0FBQyxDQUFBO0lBRWhELHdDQUEwRCx5QkFBZTtRQUN4RSxJQUFJLENBQUMsS0FBUTtZQUNaLEVBQUUsQ0FBQyxDQUFRLEtBQU0sQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFRLEtBQU0sQ0FBQyxVQUFVLENBQUM7WUFDakMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNMLE1BQU0sQ0FBQyw2QkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFURDsrQ0FTQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFF1ZXVpbmdTdHJhdGVneSBmcm9tICcuL1F1ZXVpbmdTdHJhdGVneSc7XG5pbXBvcnQgeyBnZXRBcHByb3hpbWF0ZUJ5dGVTaXplIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneTxUPiBleHRlbmRzIFF1ZXVpbmdTdHJhdGVneTxUPiB7XG5cdHNpemUoY2h1bms6IFQpOiBudW1iZXIge1xuXHRcdGlmICgoPGFueT4gY2h1bmspLmJ5dGVMZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuICg8YW55PiBjaHVuaykuYnl0ZUxlbmd0aDtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gZ2V0QXBwcm94aW1hdGVCeXRlU2l6ZShjaHVuayk7XG5cdFx0fVxuXHR9XG59XG4iXX0=