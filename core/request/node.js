(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../async/Task', './errors/RequestTimeoutError', 'http', 'https', '../lang', '../streams/adapters/ReadableNodeStreamSource', '../streams/adapters/WritableNodeStreamSink', '../streams/ReadableStream', '../streams/WritableStream', 'url', './util'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Task_1 = require('../async/Task');
    const RequestTimeoutError_1 = require('./errors/RequestTimeoutError');
    const http = require('http');
    const https = require('https');
    const lang_1 = require('../lang');
    const ReadableNodeStreamSource_1 = require('../streams/adapters/ReadableNodeStreamSource');
    const WritableNodeStreamSink_1 = require('../streams/adapters/WritableNodeStreamSink');
    const ReadableStream_1 = require('../streams/ReadableStream');
    const WritableStream_1 = require('../streams/WritableStream');
    const urlUtil = require('url');
    const util_1 = require('./util');
    // TODO: Where should the dojo version come from? It used to be kernel, but we don't have that.
    let version = '2.0.0-pre';
    function normalizeHeaders(headers) {
        const normalizedHeaders = {};
        for (let key in headers) {
            normalizedHeaders[key.toLowerCase()] = headers[key];
        }
        return normalizedHeaders;
    }
    function node(url, options = {}) {
        const requestUrl = util_1.generateRequestUrl(url, options);
        const parsedUrl = urlUtil.parse(options.proxy || requestUrl);
        const requestOptions = {
            agent: options.agent,
            auth: parsedUrl.auth || options.auth,
            ca: options.ca,
            cert: options.cert,
            ciphers: options.ciphers,
            headers: normalizeHeaders(options.headers || {}),
            host: parsedUrl.host,
            hostname: parsedUrl.hostname,
            key: options.key,
            localAddress: options.localAddress,
            method: options.method ? options.method.toUpperCase() : 'GET',
            passphrase: options.passphrase,
            path: parsedUrl.path,
            pfx: options.pfx,
            port: Number(parsedUrl.port),
            rejectUnauthorized: options.rejectUnauthorized,
            secureProtocol: options.secureProtocol,
            socketPath: options.socketPath
        };
        if (!('user-agent' in requestOptions.headers)) {
            requestOptions.headers['user-agent'] = 'dojo/' + version + ' Node.js/' + process.version.replace(/^v/, '');
        }
        if (options.proxy) {
            requestOptions.path = requestUrl;
            if (parsedUrl.auth) {
                requestOptions.headers['proxy-authorization'] = 'Basic ' + new Buffer(parsedUrl.auth).toString('base64');
            }
            let _parsedUrl = urlUtil.parse(requestUrl);
            requestOptions.headers['host'] = _parsedUrl.host;
            requestOptions.auth = _parsedUrl.auth || options.auth;
        }
        if (!options.auth && (options.user || options.password)) {
            requestOptions.auth = encodeURIComponent(options.user || '') + ':' + encodeURIComponent(options.password || '');
        }
        const request = (parsedUrl.protocol === 'https:' ? https : http).request(requestOptions);
        const response = {
            data: null,
            getHeader: function (name) {
                return (this.nativeResponse && this.nativeResponse.headers[name.toLowerCase()]) || null;
            },
            requestOptions: options,
            statusCode: null,
            url: requestUrl
        };
        const promise = new Task_1.default(function (resolve, reject) {
            if (options.socketOptions) {
                if ('timeout' in options.socketOptions) {
                    request.setTimeout(options.socketOptions.timeout);
                }
                if ('noDelay' in options.socketOptions) {
                    request.setNoDelay(options.socketOptions.noDelay);
                }
                if ('keepAlive' in options.socketOptions) {
                    const initialDelay = options.socketOptions.keepAlive;
                    request.setSocketKeepAlive(initialDelay >= 0, initialDelay);
                }
            }
            let timeout;
            request.once('response', function (nativeResponse) {
                response.nativeResponse = nativeResponse;
                response.statusCode = nativeResponse.statusCode;
                // Redirection handling defaults to true in order to harmonise with the XHR provider, which will always
                // follow redirects
                // TODO: This redirect code is not 100% correct according to the RFC; needs to handle redirect loops and
                // restrict/modify certain redirects
                if (response.statusCode >= 300 &&
                    response.statusCode < 400 &&
                    response.statusCode !== 304 &&
                    options.followRedirects !== false &&
                    nativeResponse.headers.location) {
                    resolve(node(nativeResponse.headers.location, options));
                    return;
                }
                options.streamEncoding && nativeResponse.setEncoding(options.streamEncoding);
                if (options.streamTarget) {
                    const responseSource = new ReadableNodeStreamSource_1.default(nativeResponse);
                    const responseReadableStream = new ReadableStream_1.default(responseSource);
                    responseReadableStream.pipeTo(options.streamTarget)
                        .then(function () {
                        resolve(response);
                    }, function (error) {
                        options.streamTarget.abort(error);
                        request.abort();
                        error.response = response;
                        reject(error);
                    });
                }
                let data;
                let loaded;
                if (!options.streamData) {
                    data = [];
                    loaded = 0;
                    nativeResponse.on('data', function (chunk) {
                        data.push(chunk);
                        loaded += (typeof chunk === 'string') ?
                            Buffer.byteLength(chunk, options.streamEncoding) :
                            chunk.length;
                    });
                }
                nativeResponse.once('end', function () {
                    timeout && timeout.destroy();
                    if (!options.streamData) {
                        // TODO: what type should data have?
                        response.data = (options.streamEncoding ? data.join('') : Buffer.concat(data, loaded));
                    }
                    // If using a streamTarget, wait for it to finish in case it throws an error
                    if (!options.streamTarget) {
                        resolve(response);
                    }
                    else {
                        options.streamTarget.close();
                    }
                });
            });
            request.once('error', reject);
            if (options.data) {
                if (options.data instanceof ReadableStream_1.default) {
                    const requestSink = new WritableNodeStreamSink_1.default(request);
                    const writableRequest = new WritableStream_1.default(requestSink);
                    options.data.pipeTo(writableRequest)
                        .catch(function (error) {
                        error.response = response;
                        writableRequest.abort(error);
                        reject(error);
                    });
                }
                else {
                    request.end(options.data);
                }
            }
            else {
                request.end();
            }
            if (options.timeout > 0 && options.timeout !== Infinity) {
                timeout = (function () {
                    const timer = setTimeout(function () {
                        const error = new RequestTimeoutError_1.default('Request timed out after ' + options.timeout + 'ms');
                        error.response = response;
                        reject(error);
                    }, options.timeout);
                    return lang_1.createHandle(function () {
                        clearTimeout(timer);
                    });
                })();
            }
        }, function () {
            request.abort();
        }).catch(function (error) {
            let parsedUrl = urlUtil.parse(url);
            if (parsedUrl.auth) {
                parsedUrl.auth = '(redacted)';
            }
            let sanitizedUrl = urlUtil.format(parsedUrl);
            error.message = '[' + requestOptions.method + ' ' + sanitizedUrl + '] ' + error.message;
            throw error;
        });
        return promise;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = node;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXF1ZXN0L25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBQUEsdUJBQWlCLGVBQWUsQ0FBQyxDQUFBO0lBQ2pDLHNDQUFnQyw4QkFBOEIsQ0FBQyxDQUFBO0lBRS9ELE1BQVksSUFBSSxXQUFNLE1BQU0sQ0FBQyxDQUFBO0lBQzdCLE1BQVksS0FBSyxXQUFNLE9BQU8sQ0FBQyxDQUFBO0lBQy9CLHVCQUE2QixTQUFTLENBQUMsQ0FBQTtJQUV2QywyQ0FBcUMsOENBQThDLENBQUMsQ0FBQTtJQUNwRix5Q0FBbUMsNENBQTRDLENBQUMsQ0FBQTtJQUNoRixpQ0FBMkIsMkJBQTJCLENBQUMsQ0FBQTtJQUN2RCxpQ0FBMkIsMkJBQTJCLENBQUMsQ0FBQTtJQUN2RCxNQUFZLE9BQU8sV0FBTSxLQUFLLENBQUMsQ0FBQTtJQUMvQix1QkFBbUMsUUFBUSxDQUFDLENBQUE7SUFFNUMsK0ZBQStGO0lBQy9GLElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQztJQW1EMUIsMEJBQTBCLE9BQW1DO1FBQzVELE1BQU0saUJBQWlCLEdBQStCLEVBQUUsQ0FBQztRQUN6RCxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0lBQzFCLENBQUM7SUFFRCxjQUFnQyxHQUFXLEVBQUUsT0FBTyxHQUEwQixFQUFFO1FBQy9FLE1BQU0sVUFBVSxHQUFHLHlCQUFrQixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFD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TyxHQUFHLElBQUksQ0FBQyxDQUFDO3dCQUMzRixLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzt3QkFDMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNmLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRXBCLE1BQU0sQ0FBQyxtQkFBWSxDQUFDO3dCQUNuQixZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDTixDQUFDO1FBQ0YsQ0FBQyxFQUFFO1lBQ0YsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQVk7WUFDOUIsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVuQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFZLENBQUM7WUFDL0IsQ0FBQztZQUVELElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFN0MsS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsWUFBWSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQ3hGLE1BQU0sS0FBSyxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUEvTEQ7MEJBK0xDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGFzayBmcm9tICcuLi9hc3luYy9UYXNrJztcbmltcG9ydCBSZXF1ZXN0VGltZW91dEVycm9yIGZyb20gJy4vZXJyb3JzL1JlcXVlc3RUaW1lb3V0RXJyb3InO1xuaW1wb3J0IHsgSGFuZGxlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHsgY3JlYXRlSGFuZGxlIH0gZnJvbSAnLi4vbGFuZyc7XG5pbXBvcnQgeyBSZXF1ZXN0RXJyb3IsIFJlcXVlc3RPcHRpb25zLCBSZXNwb25zZSwgUmVzcG9uc2VQcm9taXNlIH0gZnJvbSAnLi4vcmVxdWVzdCc7XG5pbXBvcnQgUmVhZGFibGVOb2RlU3RyZWFtU291cmNlIGZyb20gJy4uL3N0cmVhbXMvYWRhcHRlcnMvUmVhZGFibGVOb2RlU3RyZWFtU291cmNlJztcbmltcG9ydCBXcml0YWJsZU5vZGVTdHJlYW1TaW5rIGZyb20gJy4uL3N0cmVhbXMvYWRhcHRlcnMvV3JpdGFibGVOb2RlU3RyZWFtU2luayc7XG5pbXBvcnQgUmVhZGFibGVTdHJlYW0gZnJvbSAnLi4vc3RyZWFtcy9SZWFkYWJsZVN0cmVhbSc7XG5pbXBvcnQgV3JpdGFibGVTdHJlYW0gZnJvbSAnLi4vc3RyZWFtcy9Xcml0YWJsZVN0cmVhbSc7XG5pbXBvcnQgKiBhcyB1cmxVdGlsIGZyb20gJ3VybCc7XG5pbXBvcnQgeyBnZW5lcmF0ZVJlcXVlc3RVcmwgfSBmcm9tICcuL3V0aWwnO1xuXG4vLyBUT0RPOiBXaGVyZSBzaG91bGQgdGhlIGRvam8gdmVyc2lvbiBjb21lIGZyb20/IEl0IHVzZWQgdG8gYmUga2VybmVsLCBidXQgd2UgZG9uJ3QgaGF2ZSB0aGF0LlxubGV0IHZlcnNpb24gPSAnMi4wLjAtcHJlJztcblxuaW50ZXJmYWNlIE9wdGlvbnMge1xuXHRhZ2VudD86IGFueTtcblx0YXV0aD86IHN0cmluZztcblx0aGVhZGVycz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZzsgfTtcblx0aG9zdD86IHN0cmluZztcblx0aG9zdG5hbWU/OiBzdHJpbmc7XG5cdGxvY2FsQWRkcmVzcz86IHN0cmluZztcblx0bWV0aG9kPzogc3RyaW5nO1xuXHRwYXRoPzogc3RyaW5nO1xuXHRwb3J0PzogbnVtYmVyO1xuXHRzb2NrZXRQYXRoPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSHR0cHNPcHRpb25zIGV4dGVuZHMgT3B0aW9ucyB7XG5cdGNhPzogYW55O1xuXHRjZXJ0Pzogc3RyaW5nO1xuXHRjaXBoZXJzPzogc3RyaW5nO1xuXHRrZXk/OiBzdHJpbmc7XG5cdHBhc3NwaHJhc2U/OiBzdHJpbmc7XG5cdHBmeD86IGFueTtcblx0cmVqZWN0VW5hdXRob3JpemVkPzogYm9vbGVhbjtcblx0c2VjdXJlUHJvdG9jb2w/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9kZVJlcXVlc3RPcHRpb25zPFQ+IGV4dGVuZHMgUmVxdWVzdE9wdGlvbnMge1xuXHRhZ2VudD86IGFueTtcblx0Y2E/OiBhbnk7XG5cdGNlcnQ/OiBzdHJpbmc7XG5cdGNpcGhlcnM/OiBzdHJpbmc7XG5cdGRhdGFFbmNvZGluZz86IHN0cmluZztcblx0Zm9sbG93UmVkaXJlY3RzPzogYm9vbGVhbjtcblx0a2V5Pzogc3RyaW5nO1xuXHRsb2NhbEFkZHJlc3M/OiBzdHJpbmc7XG5cdHBhc3NwaHJhc2U/OiBzdHJpbmc7XG5cdHBmeD86IGFueTtcblx0cHJveHk/OiBzdHJpbmc7XG5cdHJlamVjdFVuYXV0aG9yaXplZD86IGJvb2xlYW47XG5cdHNlY3VyZVByb3RvY29sPzogc3RyaW5nO1xuXHRzb2NrZXRQYXRoPzogc3RyaW5nO1xuXHRzb2NrZXRPcHRpb25zPzoge1xuXHRcdGtlZXBBbGl2ZT86IG51bWJlcjtcblx0XHRub0RlbGF5PzogYm9vbGVhbjtcblx0XHR0aW1lb3V0PzogbnVtYmVyO1xuXHR9O1xuXHRzdHJlYW1EYXRhPzogYm9vbGVhbjtcblx0c3RyZWFtRW5jb2Rpbmc/OiBzdHJpbmc7XG5cdHN0cmVhbVRhcmdldD86IFdyaXRhYmxlU3RyZWFtPFQ+O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVIZWFkZXJzKGhlYWRlcnM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9KTogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0ge1xuXHRjb25zdCBub3JtYWxpemVkSGVhZGVyczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblx0Zm9yIChsZXQga2V5IGluIGhlYWRlcnMpIHtcblx0XHRub3JtYWxpemVkSGVhZGVyc1trZXkudG9Mb3dlckNhc2UoKV0gPSBoZWFkZXJzW2tleV07XG5cdH1cblxuXHRyZXR1cm4gbm9ybWFsaXplZEhlYWRlcnM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vZGU8VD4odXJsOiBzdHJpbmcsIG9wdGlvbnM6IE5vZGVSZXF1ZXN0T3B0aW9uczxUPiA9IHt9KTogUmVzcG9uc2VQcm9taXNlPFQ+IHtcblx0Y29uc3QgcmVxdWVzdFVybCA9IGdlbmVyYXRlUmVxdWVzdFVybCh1cmwsIG9wdGlvbnMpO1xuXHRjb25zdCBwYXJzZWRVcmwgPSB1cmxVdGlsLnBhcnNlKG9wdGlvbnMucHJveHkgfHwgcmVxdWVzdFVybCk7XG5cdGNvbnN0IHJlcXVlc3RPcHRpb25zOiBIdHRwc09wdGlvbnMgPSB7XG5cdFx0YWdlbnQ6IG9wdGlvbnMuYWdlbnQsXG5cdFx0YXV0aDogcGFyc2VkVXJsLmF1dGggfHwgb3B0aW9ucy5hdXRoLFxuXHRcdGNhOiBvcHRpb25zLmNhLFxuXHRcdGNlcnQ6IG9wdGlvbnMuY2VydCxcblx0XHRjaXBoZXJzOiBvcHRpb25zLmNpcGhlcnMsXG5cdFx0aGVhZGVyczogbm9ybWFsaXplSGVhZGVycyhvcHRpb25zLmhlYWRlcnMgfHwge30pLFxuXHRcdGhvc3Q6IHBhcnNlZFVybC5ob3N0LFxuXHRcdGhvc3RuYW1lOiBwYXJzZWRVcmwuaG9zdG5hbWUsXG5cdFx0a2V5OiBvcHRpb25zLmtleSxcblx0XHRsb2NhbEFkZHJlc3M6IG9wdGlvbnMubG9jYWxBZGRyZXNzLFxuXHRcdG1ldGhvZDogb3B0aW9ucy5tZXRob2QgPyBvcHRpb25zLm1ldGhvZC50b1VwcGVyQ2FzZSgpIDogJ0dFVCcsXG5cdFx0cGFzc3BocmFzZTogb3B0aW9ucy5wYXNzcGhyYXNlLFxuXHRcdHBhdGg6IHBhcnNlZFVybC5wYXRoLFxuXHRcdHBmeDogb3B0aW9ucy5wZngsXG5cdFx0cG9ydDogTnVtYmVyKHBhcnNlZFVybC5wb3J0KSxcblx0XHRyZWplY3RVbmF1dGhvcml6ZWQ6IG9wdGlvbnMucmVqZWN0VW5hdXRob3JpemVkLFxuXHRcdHNlY3VyZVByb3RvY29sOiBvcHRpb25zLnNlY3VyZVByb3RvY29sLFxuXHRcdHNvY2tldFBhdGg6IG9wdGlvbnMuc29ja2V0UGF0aFxuXHR9O1xuXG5cdGlmICghKCd1c2VyLWFnZW50JyBpbiByZXF1ZXN0T3B0aW9ucy5oZWFkZXJzKSkge1xuXHRcdHJlcXVlc3RPcHRpb25zLmhlYWRlcnNbJ3VzZXItYWdlbnQnXSA9ICdkb2pvLycgKyB2ZXJzaW9uICsgJyBOb2RlLmpzLycgKyBwcm9jZXNzLnZlcnNpb24ucmVwbGFjZSgvXnYvLCAnJyk7XG5cdH1cblxuXHRpZiAob3B0aW9ucy5wcm94eSkge1xuXHRcdHJlcXVlc3RPcHRpb25zLnBhdGggPSByZXF1ZXN0VXJsO1xuXHRcdGlmIChwYXJzZWRVcmwuYXV0aCkge1xuXHRcdFx0cmVxdWVzdE9wdGlvbnMuaGVhZGVyc1sncHJveHktYXV0aG9yaXphdGlvbiddID0gJ0Jhc2ljICcgKyBuZXcgQnVmZmVyKHBhcnNlZFVybC5hdXRoKS50b1N0cmluZygnYmFzZTY0Jyk7XG5cdFx0fVxuXG5cdFx0bGV0IF9wYXJzZWRVcmwgPSB1cmxVdGlsLnBhcnNlKHJlcXVlc3RVcmwpO1xuXHRcdHJlcXVlc3RPcHRpb25zLmhlYWRlcnNbJ2hvc3QnXSA9IF9wYXJzZWRVcmwuaG9zdDtcblx0XHRyZXF1ZXN0T3B0aW9ucy5hdXRoID0gX3BhcnNlZFVybC5hdXRoIHx8IG9wdGlvbnMuYXV0aDtcblx0fVxuXG5cdGlmICghb3B0aW9ucy5hdXRoICYmIChvcHRpb25zLnVzZXIgfHwgb3B0aW9ucy5wYXNzd29yZCkpIHtcblx0XHRyZXF1ZXN0T3B0aW9ucy5hdXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KG9wdGlvbnMudXNlciB8fCAnJykgKyAnOicgKyBlbmNvZGVVUklDb21wb25lbnQob3B0aW9ucy5wYXNzd29yZCB8fCAnJyk7XG5cdH1cblxuXHRjb25zdCByZXF1ZXN0ID0gKHBhcnNlZFVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOicgPyBodHRwcyA6IGh0dHApLnJlcXVlc3QocmVxdWVzdE9wdGlvbnMpO1xuXHRjb25zdCByZXNwb25zZTogUmVzcG9uc2U8VD4gPSB7XG5cdFx0ZGF0YTogbnVsbCxcblx0XHRnZXRIZWFkZXI6IGZ1bmN0aW9uIChuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdFx0cmV0dXJuICh0aGlzLm5hdGl2ZVJlc3BvbnNlICYmIHRoaXMubmF0aXZlUmVzcG9uc2UuaGVhZGVyc1tuYW1lLnRvTG93ZXJDYXNlKCldKSB8fCBudWxsO1xuXHRcdH0sXG5cdFx0cmVxdWVzdE9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0c3RhdHVzQ29kZTogbnVsbCxcblx0XHR1cmw6IHJlcXVlc3RVcmxcblx0fTtcblxuXHRjb25zdCBwcm9taXNlID0gbmV3IFRhc2s8UmVzcG9uc2U8VD4+KGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRpZiAob3B0aW9ucy5zb2NrZXRPcHRpb25zKSB7XG5cdFx0XHRpZiAoJ3RpbWVvdXQnIGluIG9wdGlvbnMuc29ja2V0T3B0aW9ucykge1xuXHRcdFx0XHRyZXF1ZXN0LnNldFRpbWVvdXQob3B0aW9ucy5zb2NrZXRPcHRpb25zLnRpbWVvdXQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoJ25vRGVsYXknIGluIG9wdGlvbnMuc29ja2V0T3B0aW9ucykge1xuXHRcdFx0XHRyZXF1ZXN0LnNldE5vRGVsYXkob3B0aW9ucy5zb2NrZXRPcHRpb25zLm5vRGVsYXkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoJ2tlZXBBbGl2ZScgaW4gb3B0aW9ucy5zb2NrZXRPcHRpb25zKSB7XG5cdFx0XHRcdGNvbnN0IGluaXRpYWxEZWxheTogbnVtYmVyID0gb3B0aW9ucy5zb2NrZXRPcHRpb25zLmtlZXBBbGl2ZTtcblx0XHRcdFx0cmVxdWVzdC5zZXRTb2NrZXRLZWVwQWxpdmUoaW5pdGlhbERlbGF5ID49IDAsIGluaXRpYWxEZWxheSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IHRpbWVvdXQ6IEhhbmRsZTtcblx0XHRyZXF1ZXN0Lm9uY2UoJ3Jlc3BvbnNlJywgZnVuY3Rpb24gKG5hdGl2ZVJlc3BvbnNlOiBodHRwLkNsaWVudFJlc3BvbnNlKTogdm9pZCB7XG5cdFx0XHRyZXNwb25zZS5uYXRpdmVSZXNwb25zZSA9IG5hdGl2ZVJlc3BvbnNlO1xuXHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSA9IG5hdGl2ZVJlc3BvbnNlLnN0YXR1c0NvZGU7XG5cblx0XHRcdC8vIFJlZGlyZWN0aW9uIGhhbmRsaW5nIGRlZmF1bHRzIHRvIHRydWUgaW4gb3JkZXIgdG8gaGFybW9uaXNlIHdpdGggdGhlIFhIUiBwcm92aWRlciwgd2hpY2ggd2lsbCBhbHdheXNcblx0XHRcdC8vIGZvbGxvdyByZWRpcmVjdHNcblx0XHRcdC8vIFRPRE86IFRoaXMgcmVkaXJlY3QgY29kZSBpcyBub3QgMTAwJSBjb3JyZWN0IGFjY29yZGluZyB0byB0aGUgUkZDOyBuZWVkcyB0byBoYW5kbGUgcmVkaXJlY3QgbG9vcHMgYW5kXG5cdFx0XHQvLyByZXN0cmljdC9tb2RpZnkgY2VydGFpbiByZWRpcmVjdHNcblx0XHRcdGlmIChcblx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAzMDAgJiZcblx0XHRcdFx0cmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDQwMCAmJlxuXHRcdFx0XHRyZXNwb25zZS5zdGF0dXNDb2RlICE9PSAzMDQgJiZcblx0XHRcdFx0b3B0aW9ucy5mb2xsb3dSZWRpcmVjdHMgIT09IGZhbHNlICYmXG5cdFx0XHRcdG5hdGl2ZVJlc3BvbnNlLmhlYWRlcnMubG9jYXRpb25cblx0XHRcdCkge1xuXHRcdFx0XHRyZXNvbHZlKG5vZGUobmF0aXZlUmVzcG9uc2UuaGVhZGVycy5sb2NhdGlvbiwgb3B0aW9ucykpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnMuc3RyZWFtRW5jb2RpbmcgJiYgbmF0aXZlUmVzcG9uc2Uuc2V0RW5jb2Rpbmcob3B0aW9ucy5zdHJlYW1FbmNvZGluZyk7XG5cdFx0XHRpZiAob3B0aW9ucy5zdHJlYW1UYXJnZXQpIHtcblx0XHRcdFx0Y29uc3QgcmVzcG9uc2VTb3VyY2UgPSBuZXcgUmVhZGFibGVOb2RlU3RyZWFtU291cmNlKG5hdGl2ZVJlc3BvbnNlKTtcblx0XHRcdFx0Y29uc3QgcmVzcG9uc2VSZWFkYWJsZVN0cmVhbSA9IG5ldyBSZWFkYWJsZVN0cmVhbShyZXNwb25zZVNvdXJjZSk7XG5cblx0XHRcdFx0cmVzcG9uc2VSZWFkYWJsZVN0cmVhbS5waXBlVG8oPGFueT4gb3B0aW9ucy5zdHJlYW1UYXJnZXQpXG5cdFx0XHRcdFx0LnRoZW4oXG5cdFx0XHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGZ1bmN0aW9uIChlcnJvcjogUmVxdWVzdEVycm9yPFQ+KSB7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMuc3RyZWFtVGFyZ2V0LmFib3J0KGVycm9yKTtcblx0XHRcdFx0XHRcdFx0cmVxdWVzdC5hYm9ydCgpO1xuXHRcdFx0XHRcdFx0XHRlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuXHRcdFx0XHRcdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBkYXRhOiBhbnlbXTtcblx0XHRcdGxldCBsb2FkZWQ6IG51bWJlcjtcblx0XHRcdGlmICghb3B0aW9ucy5zdHJlYW1EYXRhKSB7XG5cdFx0XHRcdGRhdGEgPSBbXTtcblx0XHRcdFx0bG9hZGVkID0gMDtcblxuXHRcdFx0XHRuYXRpdmVSZXNwb25zZS5vbignZGF0YScsIGZ1bmN0aW9uIChjaHVuazogYW55KTogdm9pZCB7XG5cdFx0XHRcdFx0ZGF0YS5wdXNoKGNodW5rKTtcblx0XHRcdFx0XHRsb2FkZWQgKz0gKHR5cGVvZiBjaHVuayA9PT0gJ3N0cmluZycpID9cblx0XHRcdFx0XHRcdEJ1ZmZlci5ieXRlTGVuZ3RoKGNodW5rLCBvcHRpb25zLnN0cmVhbUVuY29kaW5nKSA6XG5cdFx0XHRcdFx0XHRjaHVuay5sZW5ndGg7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRuYXRpdmVSZXNwb25zZS5vbmNlKCdlbmQnLCBmdW5jdGlvbiAoKTogdm9pZCB7XG5cdFx0XHRcdHRpbWVvdXQgJiYgdGltZW91dC5kZXN0cm95KCk7XG5cblx0XHRcdFx0aWYgKCFvcHRpb25zLnN0cmVhbURhdGEpIHtcblx0XHRcdFx0XHQvLyBUT0RPOiB3aGF0IHR5cGUgc2hvdWxkIGRhdGEgaGF2ZT9cblx0XHRcdFx0XHRyZXNwb25zZS5kYXRhID0gPGFueT4gKG9wdGlvbnMuc3RyZWFtRW5jb2RpbmcgPyBkYXRhLmpvaW4oJycpIDogQnVmZmVyLmNvbmNhdChkYXRhLCBsb2FkZWQpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIElmIHVzaW5nIGEgc3RyZWFtVGFyZ2V0LCB3YWl0IGZvciBpdCB0byBmaW5pc2ggaW4gY2FzZSBpdCB0aHJvd3MgYW4gZXJyb3Jcblx0XHRcdFx0aWYgKCFvcHRpb25zLnN0cmVhbVRhcmdldCkge1xuXHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdG9wdGlvbnMuc3RyZWFtVGFyZ2V0LmNsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0cmVxdWVzdC5vbmNlKCdlcnJvcicsIHJlamVjdCk7XG5cblx0XHRpZiAob3B0aW9ucy5kYXRhKSB7XG5cdFx0XHRpZiAob3B0aW9ucy5kYXRhIGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW0pIHtcblx0XHRcdFx0Y29uc3QgcmVxdWVzdFNpbmsgPSBuZXcgV3JpdGFibGVOb2RlU3RyZWFtU2luayhyZXF1ZXN0KTtcblx0XHRcdFx0Y29uc3Qgd3JpdGFibGVSZXF1ZXN0ID0gbmV3IFdyaXRhYmxlU3RyZWFtKHJlcXVlc3RTaW5rKTtcblx0XHRcdFx0b3B0aW9ucy5kYXRhLnBpcGVUbyh3cml0YWJsZVJlcXVlc3QpXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogUmVxdWVzdEVycm9yPFQ+KSB7XG5cdFx0XHRcdFx0XHRlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuXHRcdFx0XHRcdFx0d3JpdGFibGVSZXF1ZXN0LmFib3J0KGVycm9yKTtcblx0XHRcdFx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0cmVxdWVzdC5lbmQob3B0aW9ucy5kYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXF1ZXN0LmVuZCgpO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLnRpbWVvdXQgPiAwICYmIG9wdGlvbnMudGltZW91dCAhPT0gSW5maW5pdHkpIHtcblx0XHRcdHRpbWVvdXQgPSAoZnVuY3Rpb24gKCk6IEhhbmRsZSB7XG5cdFx0XHRcdGNvbnN0IHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKTogdm9pZCB7XG5cdFx0XHRcdFx0Y29uc3QgZXJyb3IgPSBuZXcgUmVxdWVzdFRpbWVvdXRFcnJvcignUmVxdWVzdCB0aW1lZCBvdXQgYWZ0ZXIgJyArIG9wdGlvbnMudGltZW91dCArICdtcycpO1xuXHRcdFx0XHRcdGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG5cdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0fSwgb3B0aW9ucy50aW1lb3V0KTtcblxuXHRcdFx0XHRyZXR1cm4gY3JlYXRlSGFuZGxlKGZ1bmN0aW9uICgpOiB2b2lkIHtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQodGltZXIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pKCk7XG5cdFx0fVxuXHR9LCBmdW5jdGlvbiAoKSB7XG5cdFx0cmVxdWVzdC5hYm9ydCgpO1xuXHR9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IEVycm9yKTogYW55IHtcblx0XHRsZXQgcGFyc2VkVXJsID0gdXJsVXRpbC5wYXJzZSh1cmwpO1xuXG5cdFx0aWYgKHBhcnNlZFVybC5hdXRoKSB7XG5cdFx0XHRwYXJzZWRVcmwuYXV0aCA9ICcocmVkYWN0ZWQpJztcblx0XHR9XG5cblx0XHRsZXQgc2FuaXRpemVkVXJsID0gdXJsVXRpbC5mb3JtYXQocGFyc2VkVXJsKTtcblxuXHRcdGVycm9yLm1lc3NhZ2UgPSAnWycgKyByZXF1ZXN0T3B0aW9ucy5tZXRob2QgKyAnICcgKyBzYW5pdGl6ZWRVcmwgKyAnXSAnICsgZXJyb3IubWVzc2FnZTtcblx0XHR0aHJvdyBlcnJvcjtcblx0fSk7XG5cblx0cmV0dXJuIHByb21pc2U7XG59XG4iXX0=