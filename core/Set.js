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
        define(["require", "exports", './decorators', './global', './iterator', './Symbol'], factory);
    }
})(function (require, exports) {
    "use strict";
    const decorators_1 = require('./decorators');
    const global_1 = require('./global');
    const iterator_1 = require('./iterator');
    const Symbol_1 = require('./Symbol');
    var Shim;
    (function (Shim) {
        class Set {
            constructor(iterable) {
                this._setData = [];
                this[Symbol_1.default.toStringTag] = 'Set';
                if (iterable) {
                    iterator_1.forOf(iterable, (value) => this.add(value));
                }
            }
            ;
            add(value) {
                if (this.has(value)) {
                    return this;
                }
                this._setData.push(value);
                return this;
            }
            ;
            clear() {
                this._setData.length = 0;
            }
            ;
            delete(value) {
                const idx = this._setData.indexOf(value);
                if (idx === -1) {
                    return false;
                }
                this._setData.splice(idx, 1);
                return true;
            }
            ;
            entries() {
                return new iterator_1.ShimIterator(this._setData.map((value) => [value, value]));
            }
            ;
            forEach(callbackfn, thisArg) {
                const iterator = this.values();
                let result = iterator.next();
                while (!result.done) {
                    callbackfn.call(thisArg, result.value, result.value, this);
                    result = iterator.next();
                }
            }
            ;
            has(value) {
                return this._setData.indexOf(value) > -1;
            }
            ;
            keys() {
                return new iterator_1.ShimIterator(this._setData);
            }
            ;
            get size() {
                return this._setData.length;
            }
            ;
            values() {
                return new iterator_1.ShimIterator(this._setData);
            }
            ;
            [Symbol_1.default.iterator]() {
                return new iterator_1.ShimIterator(this._setData);
            }
            ;
        }
        Shim.Set = Set;
    })(Shim = exports.Shim || (exports.Shim = {}));
    let Set = class Set {
        /* istanbul ignore next */
        constructor(iterable) {
            /* istanbul ignore next */
            this[Symbol_1.default.toStringTag] = 'Set';
        }
        ;
        /* istanbul ignore next */
        add(value) { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        clear() { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        delete(value) { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        entries() { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        forEach(callbackfn, thisArg) { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        has(value) { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        keys() { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        get size() { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        values() { throw new Error('Abstract method'); }
        ;
        /* istanbul ignore next */
        [Symbol_1.default.iterator]() { throw new Error('Abstract method'); }
        ;
    };
    Set = __decorate([
        decorators_1.hasClass('es6-set', global_1.default.Set, Shim.Set)
    ], Set);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Set;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7SUFBQSw2QkFBeUIsY0FBYyxDQUFDLENBQUE7SUFDeEMseUJBQW1CLFVBQVUsQ0FBQyxDQUFBO0lBQzlCLDJCQUFnRSxZQUFZLENBQUMsQ0FBQTtJQUM3RSx5QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFFOUIsSUFBaUIsSUFBSSxDQWtFcEI7SUFsRUQsV0FBaUIsSUFBSSxFQUFDLENBQUM7UUFDdEI7WUFHQyxZQUFZLFFBQXFDO2dCQUZ6QyxhQUFRLEdBQVEsRUFBRSxDQUFDO2dCQThEM0IsS0FBQyxnQkFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFXLEtBQUssQ0FBQztnQkEzRHBDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2QsZ0JBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO1lBQ0YsQ0FBQzs7WUFFRCxHQUFHLENBQUMsS0FBUTtnQkFDWCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckIsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDYixDQUFDO2dCQUNELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2IsQ0FBQzs7WUFFRCxLQUFLO2dCQUNKLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUMxQixDQUFDOztZQUVELE1BQU0sQ0FBQyxLQUFRO2dCQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxFQUFFLENB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QUMxQixJQUFJLEtBQTBCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7O1FBQ25FLDBCQUEwQjtRQUMxQixJQUFJLElBQUksS0FBYSxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDOztRQUMxRCwwQkFBMEI7UUFDMUIsTUFBTSxLQUEwQixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDOztRQUNyRSwwQkFBMEI7UUFDMUIsQ0FBQyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxLQUEwQixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUdqRixDQUFDO0lBM0JEO1FBQUMscUJBQVEsQ0FBQyxTQUFTLEVBQUUsZ0JBQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztXQUFBO0lBQzFDO3lCQTBCQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaGFzQ2xhc3MgfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgeyBmb3JPZiwgSXRlcmFibGVJdGVyYXRvciwgSXRlcmFibGUsIFNoaW1JdGVyYXRvciB9IGZyb20gJy4vaXRlcmF0b3InO1xuaW1wb3J0IFN5bWJvbCBmcm9tICcuL1N5bWJvbCc7XG5cbmV4cG9ydCBuYW1lc3BhY2UgU2hpbSB7XG5cdGV4cG9ydCBjbGFzcyBTZXQ8VD4ge1xuXHRcdHByaXZhdGUgX3NldERhdGE6IFRbXSA9IFtdO1xuXG5cdFx0Y29uc3RydWN0b3IoaXRlcmFibGU/OiBJdGVyYWJsZTxUPiB8IEFycmF5TGlrZTxUPikge1xuXHRcdFx0aWYgKGl0ZXJhYmxlKSB7XG5cdFx0XHRcdGZvck9mKGl0ZXJhYmxlLCAodmFsdWUpID0+IHRoaXMuYWRkKHZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGFkZCh2YWx1ZTogVCk6IHRoaXMge1xuXHRcdFx0aWYgKHRoaXMuaGFzKHZhbHVlKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblx0XHRcdHRoaXMuX3NldERhdGEucHVzaCh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9O1xuXG5cdFx0Y2xlYXIoKTogdm9pZCB7XG5cdFx0XHR0aGlzLl9zZXREYXRhLmxlbmd0aCA9IDA7XG5cdFx0fTtcblxuXHRcdGRlbGV0ZSh2YWx1ZTogVCk6IGJvb2xlYW4ge1xuXHRcdFx0Y29uc3QgaWR4ID0gdGhpcy5fc2V0RGF0YS5pbmRleE9mKHZhbHVlKTtcblx0XHRcdGlmIChpZHggPT09IC0xKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX3NldERhdGEuc3BsaWNlKGlkeCwgMSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0ZW50cmllcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFtULCBUXT4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTaGltSXRlcmF0b3I8W2FueSwgYW55XT4odGhpcy5fc2V0RGF0YS5tYXA8W2FueSwgYW55XT4oKHZhbHVlKSA9PiBbIHZhbHVlLCB2YWx1ZSBdKSk7XG5cdFx0fTtcblxuXHRcdGZvckVhY2goY2FsbGJhY2tmbjogKHZhbHVlOiBULCBpbmRleDogVCwgc2V0OiBTZXQ8VD4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpOiB2b2lkIHtcblx0XHRcdGNvbnN0IGl0ZXJhdG9yID0gdGhpcy52YWx1ZXMoKTtcblx0XHRcdGxldCByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XG5cdFx0XHR3aGlsZSAoIXJlc3VsdC5kb25lKSB7XG5cdFx0XHRcdGNhbGxiYWNrZm4uY2FsbCh0aGlzQXJnLCByZXN1bHQudmFsdWUsIHJlc3VsdC52YWx1ZSwgdGhpcyk7XG5cdFx0XHRcdHJlc3VsdCA9IGl0ZXJhdG9yLm5leHQoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aGFzKHZhbHVlOiBUKTogYm9vbGVhbiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fc2V0RGF0YS5pbmRleE9mKHZhbHVlKSA+IC0xO1xuXHRcdH07XG5cblx0XHRrZXlzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fc2V0RGF0YSk7XG5cdFx0fTtcblxuXHRcdGdldCBzaXplKCk6IG51bWJlciB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fc2V0RGF0YS5sZW5ndGg7XG5cdFx0fTtcblxuXHRcdHZhbHVlcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcblx0XHRcdHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX3NldERhdGEpO1xuXHRcdH07XG5cblx0XHRbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcblx0XHRcdHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX3NldERhdGEpO1xuXHRcdH07XG5cblx0XHRbU3ltYm9sLnRvU3RyaW5nVGFnXTogc3RyaW5nID0gJ1NldCc7XG5cdH1cbn1cblxuQGhhc0NsYXNzKCdlczYtc2V0JywgZ2xvYmFsLlNldCwgU2hpbS5TZXQpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXQ8VD4ge1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRjb25zdHJ1Y3RvcihpdGVyYWJsZT86IEl0ZXJhYmxlPFQ+IHwgQXJyYXlMaWtlPFQ+KSB7IH07XG5cblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0YWRkKHZhbHVlOiBUKTogdGhpcyB7IHRocm93IG5ldyBFcnJvcignQWJzdHJhY3QgbWV0aG9kJyk7IH07XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGNsZWFyKCk6IHZvaWQgeyB0aHJvdyBuZXcgRXJyb3IoJ0Fic3RyYWN0IG1ldGhvZCcpOyB9O1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRkZWxldGUodmFsdWU6IFQpOiBib29sZWFuIHsgdGhyb3cgbmV3IEVycm9yKCdBYnN0cmFjdCBtZXRob2QnKTsgfTtcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0ZW50cmllcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFtULCBUXT4geyB0aHJvdyBuZXcgRXJyb3IoJ0Fic3RyYWN0IG1ldGhvZCcpOyB9O1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRmb3JFYWNoKGNhbGxiYWNrZm46ICh2YWx1ZTogVCwgaW5kZXg6IFQsIHNldDogU2V0PFQ+KSA9PiB2b2lkLCB0aGlzQXJnPzogYW55KTogdm9pZCB7IHRocm93IG5ldyBFcnJvcignQWJzdHJhY3QgbWV0aG9kJyk7IH07XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGhhcyh2YWx1ZTogVCk6IGJvb2xlYW4geyB0aHJvdyBuZXcgRXJyb3IoJ0Fic3RyYWN0IG1ldGhvZCcpOyB9O1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRrZXlzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4geyB0aHJvdyBuZXcgRXJyb3IoJ0Fic3RyYWN0IG1ldGhvZCcpOyB9O1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRnZXQgc2l6ZSgpOiBudW1iZXIgeyB0aHJvdyBuZXcgRXJyb3IoJ0Fic3RyYWN0IG1ldGhvZCcpOyB9O1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHR2YWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjxUPiB7IHRocm93IG5ldyBFcnJvcignQWJzdHJhY3QgbWV0aG9kJyk7IH07XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4geyB0aHJvdyBuZXcgRXJyb3IoJ0Fic3RyYWN0IG1ldGhvZCcpOyB9O1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRbU3ltYm9sLnRvU3RyaW5nVGFnXTogc3RyaW5nID0gJ1NldCc7XG59XG4iXX0=