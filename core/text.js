(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './has', './request', './Promise'], factory);
    }
})(function (require, exports) {
    "use strict";
    const has_1 = require('./has');
    const request_1 = require('./request');
    const Promise_1 = require('./Promise');
    /*
     * Strips <?xml ...?> declarations so that external SVG and XML
     * documents can be added to a document without worry. Also, if the string
     * is an HTML document, only the part inside the body tag is returned.
     */
    function strip(text) {
        if (!text) {
            return '';
        }
        text = text.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, '');
        let matches = text.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
        text = matches ? matches[1] : text;
        return text;
    }
    /*
     * Host-specific method to retrieve text
     */
    let getText;
    if (has_1.default('host-browser')) {
        getText = function (url, callback) {
            request_1.default(url).then(function (response) {
                callback(response.data);
            });
        };
    }
    else if (has_1.default('host-node')) {
        const nodeReq = require.nodeRequire || require;
        const fs = nodeReq('fs');
        getText = function (url, callback) {
            fs.readFile(url, { encoding: 'utf8' }, function (error, data) {
                if (error) {
                    throw error;
                }
                callback(data);
            });
        };
    }
    else {
        getText = function () {
            throw new Error('dojo/text not supported on this platform');
        };
    }
    /*
     * Cache of previously-loaded text resources
     */
    let textCache = {};
    /*
     * Cache of pending text resources
     */
    let pending = {};
    function get(url) {
        let promise = new Promise_1.default(function (resolve, reject) {
            getText(url, function (text) {
                resolve(text);
            });
        });
        return promise;
    }
    exports.get = get;
    function normalize(id, toAbsMid) {
        let parts = id.split('!');
        let url = parts[0];
        return (/^\./.test(url) ? toAbsMid(url) : url) + (parts[1] ? '!' + parts[1] : '');
    }
    exports.normalize = normalize;
    function load(id, require, load, config) {
        let parts = id.split('!');
        let stripFlag = parts.length > 1;
        let mid = parts[0];
        let url = require.toUrl(mid);
        let text;
        function finish(text) {
            load(stripFlag ? strip(text) : text);
        }
        if (mid in textCache) {
            text = textCache[mid];
        }
        else if (url in textCache) {
            text = textCache[url];
        }
        if (!text) {
            if (pending[url]) {
                pending[url].push(finish);
            }
            else {
                let pendingList = pending[url] = [finish];
                getText(url, function (value) {
                    textCache[mid] = textCache[url] = value;
                    for (let i = 0; i < pendingList.length;) {
                        pendingList[i++](value);
                    }
                    delete pending[url];
                });
            }
        }
        else {
            finish(text);
        }
    }
    exports.load = load;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLHNCQUFnQixPQUFPLENBQUMsQ0FBQTtJQUN4QiwwQkFBa0MsV0FBVyxDQUFDLENBQUE7SUFDOUMsMEJBQW9CLFdBQVcsQ0FBQyxDQUFBO0lBRWhDOzs7O09BSUc7SUFDSCxlQUFlLElBQVk7UUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQywwREFBMEQsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwRixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDakUsSUFBSSxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRW5DLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLE9BQWlFLENBQUM7SUFFdEUsRUFBRSxDQUFDLENBQUMsYUFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixPQUFPLEdBQUcsVUFBUyxHQUFXLEVBQUUsUUFBaUM7WUFDaEUsaUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxRQUEwQjtnQkFDcEQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQztJQUNILENBQUM7SUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLE9BQU8sR0FBVSxPQUFRLENBQUMsV0FBVyxJQUFXLE9BQVEsQ0FBQztR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Q0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNQLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVMsS0FBYTtvQkFDbEMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7b0JBQ3hDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBSSxDQUFDO3dCQUMxQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekIsQ0FBQztvQkFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckIsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDO1FBQ0YsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2QsQ0FBQztJQUNGLENBQUM7SUFsQ2UsWUFBSSxPQWtDbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBoYXMgZnJvbSAnLi9oYXMnO1xuaW1wb3J0IHJlcXVlc3QsIHsgUmVzcG9uc2UgfSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnLi9Qcm9taXNlJztcblxuLypcbiAqIFN0cmlwcyA8P3htbCAuLi4/PiBkZWNsYXJhdGlvbnMgc28gdGhhdCBleHRlcm5hbCBTVkcgYW5kIFhNTFxuICogZG9jdW1lbnRzIGNhbiBiZSBhZGRlZCB0byBhIGRvY3VtZW50IHdpdGhvdXQgd29ycnkuIEFsc28sIGlmIHRoZSBzdHJpbmdcbiAqIGlzIGFuIEhUTUwgZG9jdW1lbnQsIG9ubHkgdGhlIHBhcnQgaW5zaWRlIHRoZSBib2R5IHRhZyBpcyByZXR1cm5lZC5cbiAqL1xuZnVuY3Rpb24gc3RyaXAodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcblx0aWYgKCF0ZXh0KSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0dGV4dCA9IHRleHQucmVwbGFjZSgvXlxccyo8XFw/eG1sKFxccykrdmVyc2lvbj1bXFwnXFxcIl0oXFxkKSouKFxcZCkqW1xcJ1xcXCJdKFxccykqXFw/Pi9pbSwgJycpO1xuXHRsZXQgbWF0Y2hlcyA9IHRleHQubWF0Y2goLzxib2R5W14+XSo+XFxzKihbXFxzXFxTXSspXFxzKjxcXC9ib2R5Pi9pbSk7XG5cdHRleHQgPSBtYXRjaGVzID8gbWF0Y2hlc1sxXSA6IHRleHQ7XG5cblx0cmV0dXJuIHRleHQ7XG59XG5cbi8qXG4gKiBIb3N0LXNwZWNpZmljIG1ldGhvZCB0byByZXRyaWV2ZSB0ZXh0XG4gKi9cbmxldCBnZXRUZXh0OiAodXJsOiBzdHJpbmcsIGNhbGxiYWNrOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCkgPT4gdm9pZDtcblxuaWYgKGhhcygnaG9zdC1icm93c2VyJykpIHtcblx0Z2V0VGV4dCA9IGZ1bmN0aW9uKHVybDogc3RyaW5nLCBjYWxsYmFjazogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkIHtcblx0XHRyZXF1ZXN0KHVybCkudGhlbihmdW5jdGlvbihyZXNwb25zZTogUmVzcG9uc2U8c3RyaW5nPikge1xuXHRcdFx0Y2FsbGJhY2socmVzcG9uc2UuZGF0YSk7XG5cdFx0fSk7XG5cdH07XG59XG5lbHNlIGlmIChoYXMoJ2hvc3Qtbm9kZScpKSB7XG5cdGNvbnN0IG5vZGVSZXEgPSAoPGFueT4gcmVxdWlyZSkubm9kZVJlcXVpcmUgfHwgKDxhbnk+IHJlcXVpcmUpO1xuXHRjb25zdCBmcyA9IG5vZGVSZXEoJ2ZzJyk7XG5cdGdldFRleHQgPSBmdW5jdGlvbih1cmw6IHN0cmluZywgY2FsbGJhY2s6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkKTogdm9pZCB7XG5cdFx0ZnMucmVhZEZpbGUodXJsLCB7IGVuY29kaW5nOiAndXRmOCcgfSwgZnVuY3Rpb24oZXJyb3I6IEVycm9yLCBkYXRhOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdH1cblxuXHRcdFx0Y2FsbGJhY2soZGF0YSk7XG5cdFx0fSk7XG5cdH07XG59XG5lbHNlIHtcblx0Z2V0VGV4dCA9IGZ1bmN0aW9uKCk6IHZvaWQge1xuXHRcdHRocm93IG5ldyBFcnJvcignZG9qby90ZXh0IG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBwbGF0Zm9ybScpO1xuXHR9O1xufVxuXG4vKlxuICogQ2FjaGUgb2YgcHJldmlvdXNseS1sb2FkZWQgdGV4dCByZXNvdXJjZXNcbiAqL1xubGV0IHRleHRDYWNoZTogeyBba2V5OiBzdHJpbmddOiBhbnk7IH0gPSB7fTtcblxuLypcbiAqIENhY2hlIG9mIHBlbmRpbmcgdGV4dCByZXNvdXJjZXNcbiAqL1xubGV0IHBlbmRpbmc6IHsgW2tleTogc3RyaW5nXTogYW55OyB9ID0ge307XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlIDxzdHJpbmc+IHtcblx0bGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSA8c3RyaW5nPiAoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGdldFRleHQodXJsLCBmdW5jdGlvbiAodGV4dCkge1xuXHRcdFx0cmVzb2x2ZSh0ZXh0KTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHByb21pc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUoaWQ6IHN0cmluZywgdG9BYnNNaWQ6IChtb2R1bGVJZDogc3RyaW5nKSA9PiBzdHJpbmcpOiBzdHJpbmcge1xuXHRsZXQgcGFydHMgPSBpZC5zcGxpdCgnIScpO1xuXHRsZXQgdXJsID0gcGFydHNbMF07XG5cblx0cmV0dXJuICgvXlxcLi8udGVzdCh1cmwpID8gdG9BYnNNaWQodXJsKSA6IHVybCkgKyAocGFydHNbMV0gPyAnIScgKyBwYXJ0c1sxXSA6ICcnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoaWQ6IHN0cmluZywgcmVxdWlyZTogRG9qb0xvYWRlci5SZXF1aXJlLCBsb2FkOiAodmFsdWU/OiBhbnkpID0+IHZvaWQsIGNvbmZpZz86IERvam9Mb2FkZXIuQ29uZmlnKTogdm9pZCB7XG5cdGxldCBwYXJ0cyA9IGlkLnNwbGl0KCchJyk7XG5cdGxldCBzdHJpcEZsYWcgPSBwYXJ0cy5sZW5ndGggPiAxO1xuXHRsZXQgbWlkID0gcGFydHNbMF07XG5cdGxldCB1cmwgPSByZXF1aXJlLnRvVXJsKG1pZCk7XG5cdGxldCB0ZXh0OiBzdHJpbmc7XG5cblx0ZnVuY3Rpb24gZmluaXNoKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuXHRcdGxvYWQoc3RyaXBGbGFnID8gc3RyaXAodGV4dCkgOiB0ZXh0KTtcblx0fVxuXG5cdGlmIChtaWQgaW4gdGV4dENhY2hlKSB7XG5cdFx0dGV4dCA9IHRleHRDYWNoZVttaWRdO1xuXHR9XG5cdGVsc2UgaWYgKHVybCBpbiB0ZXh0Q2FjaGUpIHtcblx0XHR0ZXh0ID0gdGV4dENhY2hlW3VybF07XG5cdH1cblxuXHRpZiAoIXRleHQpIHtcblx0XHRpZiAocGVuZGluZ1t1cmxdKSB7XG5cdFx0XHRwZW5kaW5nW3VybF0ucHVzaChmaW5pc2gpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgcGVuZGluZ0xpc3QgPSBwZW5kaW5nW3VybF0gPSBbZmluaXNoXTtcblx0XHRcdGdldFRleHQodXJsLCBmdW5jdGlvbih2YWx1ZTogc3RyaW5nKSB7XG5cdFx0XHRcdHRleHRDYWNoZVttaWRdID0gdGV4dENhY2hlW3VybF0gPSB2YWx1ZTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwZW5kaW5nTGlzdC5sZW5ndGg7ICkge1xuXHRcdFx0XHRcdHBlbmRpbmdMaXN0W2krK10odmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRlbGV0ZSBwZW5kaW5nW3VybF07XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0ZmluaXNoKHRleHQpO1xuXHR9XG59XG4iXX0=