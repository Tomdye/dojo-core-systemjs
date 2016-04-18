(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './QueuingStrategy'], factory);
    }
})(function (require, exports) {
    "use strict";
    const QueuingStrategy_1 = require('./QueuingStrategy');
    class CountQueuingStrategy extends QueuingStrategy_1.default {
        size(chunk) {
            return 1;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CountQueuingStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ291bnRRdWV1aW5nU3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9Db3VudFF1ZXVpbmdTdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFBQSxrQ0FBNEIsbUJBQW1CLENBQUMsQ0FBQTtJQUVoRCxtQ0FBcUQseUJBQWU7UUFDbkUsSUFBSSxDQUFDLEtBQVE7WUFDWixNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQztJQUNGLENBQUM7SUFKRDswQ0FJQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFF1ZXVpbmdTdHJhdGVneSBmcm9tICcuL1F1ZXVpbmdTdHJhdGVneSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvdW50UXVldWluZ1N0cmF0ZWd5PFQ+IGV4dGVuZHMgUXVldWluZ1N0cmF0ZWd5PFQ+IHtcblx0c2l6ZShjaHVuazogVCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cbn1cbiJdfQ==