(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './async/Task', './request/has', './Registry', './load'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Task_1 = require('./async/Task');
    const has_1 = require('./request/has');
    const Registry_1 = require('./Registry');
    const load_1 = require('./load');
    class FilterRegistry extends Registry_1.default {
        register(test, value, first) {
            let entryTest;
            if (typeof test === 'string') {
                entryTest = (response, url, options) => {
                    return test === url;
                };
            }
            else if (test instanceof RegExp) {
                entryTest = (response, url, options) => {
                    return test.test(url);
                };
            }
            else {
                entryTest = test;
            }
            return super.register(entryTest, value, first);
        }
    }
    exports.FilterRegistry = FilterRegistry;
    let defaultProvider = './request/xhr';
    if (has_1.default('host-node')) {
        defaultProvider = './request/node';
    }
    class ProviderRegistry extends Registry_1.default {
        constructor() {
            super();
            const deferRequest = (url, options) => {
                let canceled = false;
                let actualResponse;
                return new Task_1.default((resolve, reject) => {
                    this._providerPromise.then(function (provider) {
                        if (canceled) {
                            return;
                        }
                        actualResponse = provider(url, options);
                        actualResponse.then(resolve, reject);
                    });
                }, function () {
                    if (!canceled) {
                        canceled = true;
                    }
                    if (actualResponse) {
                        actualResponse.cancel();
                    }
                });
            };
            // The first request to hit the default value will kick off the import of the default
            // provider. While that import is in-flight, subsequent requests will queue up while
            // waiting for the provider to be fulfilled.
            this._defaultValue = (url, options) => {
                this._providerPromise = load_1.default(require, defaultProvider).then(([providerModule]) => {
                    this._defaultValue = providerModule.default;
                    return providerModule.default;
                });
                this._defaultValue = deferRequest;
                return deferRequest(url, options);
            };
        }
        register(test, value, first) {
            let entryTest;
            if (typeof test === 'string') {
                entryTest = (url, options) => {
                    return test === url;
                };
            }
            else if (test instanceof RegExp) {
                entryTest = (url, options) => {
                    return test.test(url);
                };
            }
            else {
                entryTest = test;
            }
            return super.register(entryTest, value, first);
        }
    }
    exports.ProviderRegistry = ProviderRegistry;
    /**
     * Request filters, which filter or modify responses. The default filter simply passes a response through unchanged.
     */
    exports.filterRegistry = new FilterRegistry(function (response) {
        return response;
    });
    /**
     * Request providers, which fulfill requests.
     */
    exports.providerRegistry = new ProviderRegistry();
    /**
     * Make a request, returning a Promise that will resolve or reject when the request completes.
     */
    const request = function request(url, options = {}) {
        const promise = exports.providerRegistry.match(url, options)(url, options)
            .then(function (response) {
            return Task_1.default.resolve(exports.filterRegistry.match(response, url, options)(response, url, options))
                .then(function (filterResponse) {
                response.data = filterResponse.data;
                return response;
            });
        });
        return promise;
    };
    ['DELETE', 'GET', 'POST', 'PUT'].forEach(function (method) {
        request[method.toLowerCase()] = function (url, options = {}) {
            options = Object.create(options);
            options.method = method;
            return request(url, options);
        };
    });
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = request;
    /**
     * Add a filter that automatically parses incoming JSON responses.
     */
    exports.filterRegistry.register(function (response, url, options) {
        return typeof response.data && options && options.responseType === 'json';
    }, function (response, url, options) {
        return {
            data: JSON.parse(String(response.data))
        };
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLHVCQUFpQixjQUFjLENBQUMsQ0FBQTtJQUNoQyxzQkFBZ0IsZUFBZSxDQUFDLENBQUE7SUFHaEMsMkJBQStCLFlBQVksQ0FBQyxDQUFBO0lBQzVDLHVCQUFpQixRQUFRLENBQUMsQ0FBQTtJQUsxQiw2QkFBb0Msa0JBQVE7UUFDM0MsUUFBUSxDQUFDLElBQXlDLEVBQUUsS0FBb0IsRUFBRSxLQUFlO1lBQ3hGLElBQUksU0FBZSxDQUFDO1lBRXBCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLFNBQVMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTztvQkFDbEMsTUFBTSxDQUFDLElBQUksS0FBSyxHQUFHLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQztZQUNILENBQUM7WUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLFNBQVMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTztvQkFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQztZQUNILENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQztnQkFDTCxTQUFTLEdBQXVCLElBQUksQ0FBQztZQUN0QyxDQUFDO1lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0YsQ0FBQztJQXBCWSxzQkFBYyxpQkFvQjFCLENBQUE7SUFFRCxJQUFJLGVBQWUsR0FBVyxlQUFlLENBQUM7SUFDOUMsRUFBRSxDQUFDLENBQUMsYUFBRyxDQUFDLFdBQVcs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QUFRLENBQ3RCLFVBQVUsUUFBdUIsRUFBRSxHQUFXLEVBQUUsT0FBdUI7UUFDdEUsTUFBTSxDQUFDLE9BQU8sUUFBUSxDQUFDLElBQUksSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUM7SUFDM0UsQ0FBQyxFQUNELFVBQVUsUUFBdUIsRUFBRSxHQUFXLEVBQUUsT0FBdUI7UUFDdEUsTUFBTSxDQUFDO1lBQ04sSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QyxDQUFDO0lBQ0gsQ0FBQyxDQUNELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGFzayBmcm9tICcuL2FzeW5jL1Rhc2snO1xuaW1wb3J0IGhhcyBmcm9tICcuL3JlcXVlc3QvaGFzJztcbmltcG9ydCB7IEhhbmRsZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICcuL1Byb21pc2UnO1xuaW1wb3J0IFJlZ2lzdHJ5LCB7IFRlc3QgfSBmcm9tICcuL1JlZ2lzdHJ5JztcbmltcG9ydCBsb2FkIGZyb20gJy4vbG9hZCc7XG5pbXBvcnQgeyBQYXJhbUxpc3QgfSBmcm9tICcuL1VybFNlYXJjaFBhcmFtcyc7XG5cbmRlY2xhcmUgdmFyIHJlcXVpcmU6IGFueTtcblxuZXhwb3J0IGNsYXNzIEZpbHRlclJlZ2lzdHJ5IGV4dGVuZHMgUmVnaXN0cnk8UmVxdWVzdEZpbHRlcj4ge1xuXHRyZWdpc3Rlcih0ZXN0OiBzdHJpbmcgfCBSZWdFeHAgfCBSZXF1ZXN0RmlsdGVyVGVzdCwgdmFsdWU6IFJlcXVlc3RGaWx0ZXIsIGZpcnN0PzogYm9vbGVhbik6IEhhbmRsZSB7XG5cdFx0bGV0IGVudHJ5VGVzdDogVGVzdDtcblxuXHRcdGlmICh0eXBlb2YgdGVzdCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdGVudHJ5VGVzdCA9IChyZXNwb25zZSwgdXJsLCBvcHRpb25zKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0ZXN0ID09PSB1cmw7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlIGlmICh0ZXN0IGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRlbnRyeVRlc3QgPSAocmVzcG9uc2UsIHVybCwgb3B0aW9ucykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGVzdC50ZXN0KHVybCk7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGVudHJ5VGVzdCA9IDxSZXF1ZXN0RmlsdGVyVGVzdD4gdGVzdDtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VwZXIucmVnaXN0ZXIoZW50cnlUZXN0LCB2YWx1ZSwgZmlyc3QpO1xuXHR9XG59XG5cbmxldCBkZWZhdWx0UHJvdmlkZXI6IHN0cmluZyA9ICcuL3JlcXVlc3QveGhyJztcbmlmIChoYXMoJ2hvc3Qtbm9kZScpKSB7XG5cdGRlZmF1bHRQcm92aWRlciA9ICcuL3JlcXVlc3Qvbm9kZSc7XG59XG5cbmV4cG9ydCBjbGFzcyBQcm92aWRlclJlZ2lzdHJ5IGV4dGVuZHMgUmVnaXN0cnk8UmVxdWVzdFByb3ZpZGVyPiB7XG5cdHByaXZhdGUgX3Byb3ZpZGVyUHJvbWlzZTogUHJvbWlzZTxSZXF1ZXN0UHJvdmlkZXI+O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHRjb25zdCBkZWZlclJlcXVlc3QgPSAodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFJlc3BvbnNlUHJvbWlzZTxhbnk+ID0+IHtcblx0XHRcdGxldCBjYW5jZWxlZCA9IGZhbHNlO1xuXHRcdFx0bGV0IGFjdHVhbFJlc3BvbnNlOiBSZXNwb25zZVByb21pc2U8YW55Pjtcblx0XHRcdHJldHVybiBuZXcgVGFzazxSZXNwb25zZTxhbnk+PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdHRoaXMuX3Byb3ZpZGVyUHJvbWlzZS50aGVuKGZ1bmN0aW9uIChwcm92aWRlcikge1xuXHRcdFx0XHRcdGlmIChjYW5jZWxlZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhY3R1YWxSZXNwb25zZSA9IHByb3ZpZGVyKHVybCwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0YWN0dWFsUmVzcG9uc2UudGhlbihyZXNvbHZlLCByZWplY3QpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aWYgKCFjYW5jZWxlZCkge1xuXHRcdFx0XHRcdGNhbmNlbGVkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoYWN0dWFsUmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhY3R1YWxSZXNwb25zZS5jYW5jZWwoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdC8vIFRoZSBmaXJzdCByZXF1ZXN0IHRvIGhpdCB0aGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGtpY2sgb2ZmIHRoZSBpbXBvcnQgb2YgdGhlIGRlZmF1bHRcblx0XHQvLyBwcm92aWRlci4gV2hpbGUgdGhhdCBpbXBvcnQgaXMgaW4tZmxpZ2h0LCBzdWJzZXF1ZW50IHJlcXVlc3RzIHdpbGwgcXVldWUgdXAgd2hpbGVcblx0XHQvLyB3YWl0aW5nIGZvciB0aGUgcHJvdmlkZXIgdG8gYmUgZnVsZmlsbGVkLlxuXHRcdHRoaXMuX2RlZmF1bHRWYWx1ZSA9ICh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zKTogUmVzcG9uc2VQcm9taXNlPGFueT4gPT4ge1xuXHRcdFx0dGhpcy5fcHJvdmlkZXJQcm9taXNlID0gbG9hZChyZXF1aXJlLCBkZWZhdWx0UHJvdmlkZXIpLnRoZW4oKFsgcHJvdmlkZXJNb2R1bGUgXTogWyB7IGRlZmF1bHQ6IFJlcXVlc3RQcm92aWRlciB9IF0pOiBSZXF1ZXN0UHJvdmlkZXIgPT4ge1xuXHRcdFx0XHR0aGlzLl9kZWZhdWx0VmFsdWUgPSBwcm92aWRlck1vZHVsZS5kZWZhdWx0O1xuXHRcdFx0XHRyZXR1cm4gcHJvdmlkZXJNb2R1bGUuZGVmYXVsdDtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmZXJSZXF1ZXN0O1xuXHRcdFx0cmV0dXJuIGRlZmVyUmVxdWVzdCh1cmwsIG9wdGlvbnMpO1xuXHRcdH07XG5cdH1cblxuXHRyZWdpc3Rlcih0ZXN0OiBzdHJpbmcgfCBSZWdFeHAgfCBSZXF1ZXN0UHJvdmlkZXJUZXN0LCB2YWx1ZTogUmVxdWVzdFByb3ZpZGVyLCBmaXJzdD86IGJvb2xlYW4pOiBIYW5kbGUge1xuXHRcdGxldCBlbnRyeVRlc3Q6IFRlc3Q7XG5cblx0XHRpZiAodHlwZW9mIHRlc3QgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRlbnRyeVRlc3QgPSAodXJsLCBvcHRpb25zKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0ZXN0ID09PSB1cmw7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlIGlmICh0ZXN0IGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRlbnRyeVRlc3QgPSAodXJsLCBvcHRpb25zKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0ZXN0LnRlc3QodXJsKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZW50cnlUZXN0ID0gPFJlcXVlc3RQcm92aWRlclRlc3Q+IHRlc3Q7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN1cGVyLnJlZ2lzdGVyKGVudHJ5VGVzdCwgdmFsdWUsIGZpcnN0KTtcblx0fVxufVxuXG4vKipcbiAqIFJlcXVlc3QgZmlsdGVycywgd2hpY2ggZmlsdGVyIG9yIG1vZGlmeSByZXNwb25zZXMuIFRoZSBkZWZhdWx0IGZpbHRlciBzaW1wbHkgcGFzc2VzIGEgcmVzcG9uc2UgdGhyb3VnaCB1bmNoYW5nZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBmaWx0ZXJSZWdpc3RyeSA9IG5ldyBGaWx0ZXJSZWdpc3RyeShmdW5jdGlvbiAocmVzcG9uc2U6IFJlc3BvbnNlPGFueT4pOiBSZXNwb25zZTxhbnk+IHtcblx0cmV0dXJuIHJlc3BvbnNlO1xufSk7XG5cbi8qKlxuICogUmVxdWVzdCBwcm92aWRlcnMsIHdoaWNoIGZ1bGZpbGwgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBjb25zdCBwcm92aWRlclJlZ2lzdHJ5ID0gbmV3IFByb3ZpZGVyUmVnaXN0cnkoKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0RXJyb3I8VD4gZXh0ZW5kcyBFcnJvciB7XG5cdHJlc3BvbnNlOiBSZXNwb25zZTxUPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0RmlsdGVyIHtcblx0PFQ+KHJlc3BvbnNlOiBSZXNwb25zZTxUPiwgdXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdEZpbHRlclRlc3QgZXh0ZW5kcyBUZXN0IHtcblx0PFQ+KHJlc3BvbnNlOiBSZXNwb25zZTxhbnk+LCB1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zKTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0T3B0aW9ucyB7XG5cdGF1dGg/OiBzdHJpbmc7XG5cdGNhY2hlQnVzdD86IGFueTtcblx0ZGF0YT86IGFueTtcblx0aGVhZGVycz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZzsgfTtcblx0bWV0aG9kPzogc3RyaW5nO1xuXHRwYXNzd29yZD86IHN0cmluZztcblx0cXVlcnk/OiBzdHJpbmcgfCBQYXJhbUxpc3Q7XG5cdHJlc3BvbnNlVHlwZT86IHN0cmluZztcblx0dGltZW91dD86IG51bWJlcjtcblx0dXNlcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0UHJvdmlkZXIge1xuXHQ8VD4odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFJlc3BvbnNlUHJvbWlzZTxUPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0UHJvdmlkZXJUZXN0IGV4dGVuZHMgVGVzdCB7XG5cdCh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zKTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXNwb25zZTxUPiB7XG5cdGRhdGE6IFQ7XG5cdG5hdGl2ZVJlc3BvbnNlPzogYW55O1xuXHRyZXF1ZXN0T3B0aW9uczogUmVxdWVzdE9wdGlvbnM7XG5cdHN0YXR1c0NvZGU6IG51bWJlcjtcblx0c3RhdHVzVGV4dD86IHN0cmluZztcblx0dXJsOiBzdHJpbmc7XG5cblx0Z2V0SGVhZGVyKG5hbWU6IHN0cmluZyk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaGUgdGFzayByZXR1cm5lZCBieSBhIHJlcXVlc3QsIHdoaWNoIHdpbGwgcmVzb2x2ZSB0byBhIFJlc3BvbnNlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzcG9uc2VQcm9taXNlPFQ+IGV4dGVuZHMgVGFzazxSZXNwb25zZTxUPj4ge31cblxuLyoqXG4gKiBNYWtlIGEgcmVxdWVzdCwgcmV0dXJuaW5nIGEgUHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSBvciByZWplY3Qgd2hlbiB0aGUgcmVxdWVzdCBjb21wbGV0ZXMuXG4gKi9cbmNvbnN0IHJlcXVlc3Q6IHtcblx0PFQ+KHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnMpOiBSZXNwb25zZVByb21pc2U8VD47XG5cdGRlbGV0ZTxUPih1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zKTogUmVzcG9uc2VQcm9taXNlPFQ+O1xuXHRnZXQ8VD4odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFJlc3BvbnNlUHJvbWlzZTxUPjtcblx0cG9zdDxUPih1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zKTogUmVzcG9uc2VQcm9taXNlPFQ+O1xuXHRwdXQ8VD4odXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9ucyk6IFJlc3BvbnNlUHJvbWlzZTxUPjtcbn0gPSA8YW55PiBmdW5jdGlvbiByZXF1ZXN0PFQ+KHVybDogc3RyaW5nLCBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyA9IHt9KTogUmVzcG9uc2VQcm9taXNlPFQ+IHtcblx0Y29uc3QgcHJvbWlzZSA9IHByb3ZpZGVyUmVnaXN0cnkubWF0Y2godXJsLCBvcHRpb25zKSh1cmwsIG9wdGlvbnMpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlOiBSZXNwb25zZTxUPikge1xuXHRcdFx0cmV0dXJuIFRhc2sucmVzb2x2ZShmaWx0ZXJSZWdpc3RyeS5tYXRjaChyZXNwb25zZSwgdXJsLCBvcHRpb25zKShyZXNwb25zZSwgdXJsLCBvcHRpb25zKSlcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGZpbHRlclJlc3BvbnNlOiBhbnkpIHtcblx0XHRcdFx0XHRyZXNwb25zZS5kYXRhID0gZmlsdGVyUmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2U7XG5cdFx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdHJldHVybiBwcm9taXNlO1xufTtcblxuWyAnREVMRVRFJywgJ0dFVCcsICdQT1NUJywgJ1BVVCcgXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcblx0KDxhbnk+IHJlcXVlc3QpW21ldGhvZC50b0xvd2VyQ2FzZSgpXSA9IGZ1bmN0aW9uIDxUPih1cmw6IHN0cmluZywgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMgPSB7fSk6IFJlc3BvbnNlUHJvbWlzZTxUPiB7XG5cdFx0b3B0aW9ucyA9IE9iamVjdC5jcmVhdGUob3B0aW9ucyk7XG5cdFx0b3B0aW9ucy5tZXRob2QgPSBtZXRob2Q7XG5cdFx0cmV0dXJuIHJlcXVlc3QodXJsLCBvcHRpb25zKTtcblx0fTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCByZXF1ZXN0O1xuXG4vKipcbiAqIEFkZCBhIGZpbHRlciB0aGF0IGF1dG9tYXRpY2FsbHkgcGFyc2VzIGluY29taW5nIEpTT04gcmVzcG9uc2VzLlxuICovXG5maWx0ZXJSZWdpc3RyeS5yZWdpc3Rlcihcblx0ZnVuY3Rpb24gKHJlc3BvbnNlOiBSZXNwb25zZTxhbnk+LCB1cmw6IHN0cmluZywgb3B0aW9uczogUmVxdWVzdE9wdGlvbnMpIHtcblx0XHRyZXR1cm4gdHlwZW9mIHJlc3BvbnNlLmRhdGEgJiYgb3B0aW9ucyAmJiBvcHRpb25zLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXHR9LFxuXHRmdW5jdGlvbiAocmVzcG9uc2U6IFJlc3BvbnNlPGFueT4sIHVybDogc3RyaW5nLCBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyk6IE9iamVjdCB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGRhdGE6IEpTT04ucGFyc2UoU3RyaW5nKHJlc3BvbnNlLmRhdGEpKVxuXHRcdH07XG5cdH1cbik7XG4iXX0=