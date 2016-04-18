var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './decorators', './global'], factory);
    }
})(function (require, exports) {
    "use strict";
    const decorators_1 = require('./decorators');
    const global_1 = require('./global');
    var Shim;
    (function (Shim) {
        const DELETED = {};
        function getUID() {
            return Math.floor(Math.random() * 100000000);
        }
        let generateName = (function () {
            let startId = Math.floor(Date.now() % 100000000);
            return function generateName() {
                return '__wm' + getUID() + (startId++ + '__');
            };
        })();
        class WeakMap {
            constructor(iterable) {
                Object.defineProperty(this, '_name', {
                    value: generateName()
                });
                if (iterable) {
                    for (const [key, value] of iterable) {
                        this.set(key, value);
                    }
                }
            }
            delete(key) {
                const entry = key[this._name];
                if (entry && entry.key === key && entry.value !== DELETED) {
                    entry.value = DELETED;
                    return true;
                }
                return false;
            }
            get(key) {
                const entry = key[this._name];
                if (entry && entry.key === key && entry.value !== DELETED) {
                    return entry.value;
                }
            }
            has(key) {
                const entry = key[this._name];
                return Boolean(entry && entry.key === key && entry.value !== DELETED);
            }
            set(key, value) {
                if (!key || (typeof key !== 'object' && typeof key !== 'function')) {
                    throw new TypeError('Invalid value used as weak map key');
                }
                let entry = key[this._name];
                if (!entry || entry.key !== key) {
                    entry = Object.create(null, {
                        key: { value: key }
                    });
                    Object.defineProperty(key, this._name, {
                        value: entry
                    });
                }
                entry.value = value;
                return this;
            }
        }
        Shim.WeakMap = WeakMap;
    })(Shim || (Shim = {}));
    let WeakMap = class WeakMap {
        /* istanbul ignore next */
        constructor(iterable) {
        }
        /* istanbul ignore next */
        delete(key) { throw new Error(); }
        /* istanbul ignore next */
        get(key) { throw new Error(); }
        /* istanbul ignore next */
        has(key) { throw new Error(); }
        /* istanbul ignore next */
        set(key, value) { throw new Error(); }
    };
    WeakMap = __decorate([
        decorators_1.hasClass('weakmap', global_1.default.WeakMap, Shim.WeakMap)
    ], WeakMap);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = WeakMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2Vha01hcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9XZWFrTWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztJQUFBLDZCQUF5QixjQUFjLENBQUMsQ0FBQTtJQUN4Qyx5QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFFOUIsSUFBTyxJQUFJLENBd0VWO0lBeEVELFdBQU8sSUFBSSxFQUFDLENBQUM7UUFDWixNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFPeEI7WUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELElBQUksWUFBWSxHQUFHLENBQUM7WUFDbkIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFFakQsTUFBTSxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRUw7WUFHQyxZQUFZLFFBQWM7Z0JBQ3pCLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtvQkFDcEMsS0FBSyxFQUFFLFlBQVksRUFBRTtpQkFDckIsQ0FBQyxDQUFDO2dCQUNILEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2QsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFFLEdBQUcsRUFBRSxLQUFLLENBQUUsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDdEIsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVE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QU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2VBQUE7SUFDbEQ7NkJBWUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGhhc0NsYXNzIH0gZnJvbSAnLi9kZWNvcmF0b3JzJztcbmltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuXG5tb2R1bGUgU2hpbSB7XG5cdGNvbnN0IERFTEVURUQ6IGFueSA9IHt9O1xuXG5cdGludGVyZmFjZSBFbnRyeTxLLCBWPiB7XG5cdFx0a2V5OiBLO1xuXHRcdHZhbHVlOiBWO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0VUlEKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMCk7XG5cdH1cblxuXHRsZXQgZ2VuZXJhdGVOYW1lID0gKGZ1bmN0aW9uICgpIHtcblx0XHRsZXQgc3RhcnRJZCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAlIDEwMDAwMDAwMCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gZ2VuZXJhdGVOYW1lKCk6IHN0cmluZyB7XG5cdFx0XHRyZXR1cm4gJ19fd20nICsgZ2V0VUlEKCkgKyAoc3RhcnRJZCsrICsgJ19fJyk7XG5cdFx0fTtcblx0fSkoKTtcblxuXHRleHBvcnQgY2xhc3MgV2Vha01hcDxLLCBWPiB7XG5cdFx0cHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xuXG5cdFx0Y29uc3RydWN0b3IoaXRlcmFibGU/OiBhbnkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX25hbWUnLCB7XG5cdFx0XHRcdHZhbHVlOiBnZW5lcmF0ZU5hbWUoKVxuXHRcdFx0fSk7XG5cdFx0XHRpZiAoaXRlcmFibGUpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBbIGtleSwgdmFsdWUgXSBvZiBpdGVyYWJsZSkge1xuXHRcdFx0XHRcdHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZGVsZXRlKGtleTogYW55KTogYm9vbGVhbiB7XG5cdFx0XHRjb25zdCBlbnRyeTogRW50cnk8SywgVj4gPSBrZXlbdGhpcy5fbmFtZV07XG5cdFx0XHRpZiAoZW50cnkgJiYgZW50cnkua2V5ID09PSBrZXkgJiYgZW50cnkudmFsdWUgIT09IERFTEVURUQpIHtcblx0XHRcdFx0ZW50cnkudmFsdWUgPSBERUxFVEVEO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRnZXQoa2V5OiBhbnkpOiBWIHtcblx0XHRcdGNvbnN0IGVudHJ5OiBFbnRyeTxLLCBWPiA9IGtleVt0aGlzLl9uYW1lXTtcblx0XHRcdGlmIChlbnRyeSAmJiBlbnRyeS5rZXkgPT09IGtleSAmJiBlbnRyeS52YWx1ZSAhPT0gREVMRVRFRCkge1xuXHRcdFx0XHRyZXR1cm4gZW50cnkudmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFzKGtleTogYW55KTogYm9vbGVhbiB7XG5cdFx0XHRjb25zdCBlbnRyeTogRW50cnk8SywgVj4gPSBrZXlbdGhpcy5fbmFtZV07XG5cdFx0XHRyZXR1cm4gQm9vbGVhbihlbnRyeSAmJiBlbnRyeS5rZXkgPT09IGtleSAmJiBlbnRyeS52YWx1ZSAhPT0gREVMRVRFRCk7XG5cdFx0fVxuXG5cdFx0c2V0KGtleTogYW55LCB2YWx1ZT86IGFueSk6IFNoaW0uV2Vha01hcDxLLCBWPiB7XG5cdFx0XHRpZiAoIWtleSB8fCAodHlwZW9mIGtleSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGtleSAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCB2YWx1ZSB1c2VkIGFzIHdlYWsgbWFwIGtleScpO1xuXHRcdFx0fVxuXHRcdFx0bGV0IGVudHJ5OiBFbnRyeTxLLCBWPiA9IGtleVt0aGlzLl9uYW1lXTtcblx0XHRcdGlmICghZW50cnkgfHwgZW50cnkua2V5ICE9PSBrZXkpIHtcblx0XHRcdFx0ZW50cnkgPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcblx0XHRcdFx0XHRrZXk6IHsgdmFsdWU6IGtleSB9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoa2V5LCB0aGlzLl9uYW1lLCB7XG5cdFx0XHRcdFx0dmFsdWU6IGVudHJ5XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZW50cnkudmFsdWUgPSB2YWx1ZTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fVxufVxuXG5AaGFzQ2xhc3MoJ3dlYWttYXAnLCBnbG9iYWwuV2Vha01hcCwgU2hpbS5XZWFrTWFwKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2Vha01hcDxLLCBWPiB7XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGNvbnN0cnVjdG9yKGl0ZXJhYmxlPzogYW55KSB7fVxuXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGRlbGV0ZShrZXk6IEspOiBib29sZWFuIHsgdGhyb3cgbmV3IEVycm9yKCk7IH1cblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0Z2V0KGtleTogSyk6IFYgeyB0aHJvdyBuZXcgRXJyb3IoKTsgfVxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRoYXMoa2V5OiBLKTogYm9vbGVhbiB7IHRocm93IG5ldyBFcnJvcigpOyB9XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdHNldChrZXk6IEssIHZhbHVlPzogVik6IFdlYWtNYXA8SywgVj4geyB0aHJvdyBuZXcgRXJyb3IoKTsgfVxufVxuIl19