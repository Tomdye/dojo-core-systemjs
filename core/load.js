(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './Promise'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('./Promise');
    const load = (function () {
        if (typeof module === 'object' && typeof module.exports === 'object') {
            return function (contextualRequire, ...moduleIds) {
                if (typeof contextualRequire === 'string') {
                    moduleIds.unshift(contextualRequire);
                    contextualRequire = require;
                }
                return new Promise_1.default(function (resolve, reject) {
                    try {
                        resolve(moduleIds.map(function (moduleId) {
                            return contextualRequire(moduleId);
                        }));
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            };
        }
        else if (typeof define === 'function' && define.amd) {
            return function (contextualRequire, ...moduleIds) {
                if (typeof contextualRequire === 'string') {
                    moduleIds.unshift(contextualRequire);
                    contextualRequire = require;
                }
                return new Promise_1.default(function (resolve) {
                    // TODO: Error path once https://github.com/dojo/loader/issues/14 is figured out
                    contextualRequire(moduleIds, function (...modules) {
                        resolve(modules);
                    });
                });
            };
        }
        else {
            return function () {
                return Promise_1.default.reject(new Error('Unknown loader'));
            };
        }
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = load;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLDBCQUFvQixXQUFXLENBQUMsQ0FBQTtJQWlCaEMsTUFBTSxJQUFJLEdBQVMsQ0FBQztRQUNuQixFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxNQUFNLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLFVBQVUsaUJBQXNCLEVBQUUsR0FBRyxTQUFtQjtnQkFDOUQsRUFBRSxDQUFDLENBQUMsT0FBTyxpQkFBaUIsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxTQUFTLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQ3JDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztnQkFDN0IsQ0FBQztnQkFDRCxNQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07b0JBQzNDLElBQUksQ0FBQzt3QkFDSixPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLFFBQVE7NEJBQ3ZDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUNBO29CQUFBLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ2QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNmLENBQUM7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsVUFBVSxpQkFBc0IsRUFBRSxHQUFHLFNBQW1CO2dCQUM5RCxFQUFFLENBQUMsQ0FBQyxPQUFPLGlCQUFpQixLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDckMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDO2dCQUM3QixDQUFDO2dCQUNELE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsVUFBVSxPQUFPO29CQUNuQyxnRkFBZ0Y7b0JBQ2hGLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxVQUFVLEdBQUcsT0FBYzt3QkFDdkQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNsQixDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQztRQUNILENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNMLE1BQU0sQ0FBQztnQkFDTixNQUFNLENBQUMsaUJBQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQztRQUNILENBQUM7SUFDRixDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ0w7c0JBQWUsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAnLi9Qcm9taXNlJztcblxuZGVjbGFyZSB2YXIgZGVmaW5lOiB7XG5cdCguLi5hcmdzOiBhbnlbXSk6IGFueTtcblx0YW1kOiBhbnk7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGVSZXF1aXJlIHtcblx0KG1vZHVsZUlkOiBzdHJpbmcpOiBhbnk7XG59XG5leHBvcnQgdHlwZSBSZXF1aXJlID0gRG9qb0xvYWRlci5SZXF1aXJlIHwgTm9kZVJlcXVpcmU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZCB7XG5cdChyZXF1aXJlOiBSZXF1aXJlLCAuLi5tb2R1bGVJZHM6IHN0cmluZ1tdKTogUHJvbWlzZTxhbnlbXT47XG5cdCguLi5tb2R1bGVJZHM6IHN0cmluZ1tdKTogUHJvbWlzZTxhbnlbXT47XG59XG5cbmNvbnN0IGxvYWQ6IExvYWQgPSAoZnVuY3Rpb24gKCk6IExvYWQge1xuXHRpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoY29udGV4dHVhbFJlcXVpcmU6IGFueSwgLi4ubW9kdWxlSWRzOiBzdHJpbmdbXSk6IFByb21pc2U8YW55W10+IHtcblx0XHRcdGlmICh0eXBlb2YgY29udGV4dHVhbFJlcXVpcmUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdG1vZHVsZUlkcy51bnNoaWZ0KGNvbnRleHR1YWxSZXF1aXJlKTtcblx0XHRcdFx0Y29udGV4dHVhbFJlcXVpcmUgPSByZXF1aXJlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXNvbHZlKG1vZHVsZUlkcy5tYXAoZnVuY3Rpb24gKG1vZHVsZUlkKTogYW55IHtcblx0XHRcdFx0XHRcdHJldHVybiBjb250ZXh0dWFsUmVxdWlyZShtb2R1bGVJZCk7XG5cdFx0XHRcdFx0fSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChjb250ZXh0dWFsUmVxdWlyZTogYW55LCAuLi5tb2R1bGVJZHM6IHN0cmluZ1tdKTogUHJvbWlzZTxhbnlbXT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBjb250ZXh0dWFsUmVxdWlyZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0bW9kdWxlSWRzLnVuc2hpZnQoY29udGV4dHVhbFJlcXVpcmUpO1xuXHRcdFx0XHRjb250ZXh0dWFsUmVxdWlyZSA9IHJlcXVpcmU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRcdFx0Ly8gVE9ETzogRXJyb3IgcGF0aCBvbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9kb2pvL2xvYWRlci9pc3N1ZXMvMTQgaXMgZmlndXJlZCBvdXRcblx0XHRcdFx0Y29udGV4dHVhbFJlcXVpcmUobW9kdWxlSWRzLCBmdW5jdGlvbiAoLi4ubW9kdWxlczogYW55W10pIHtcblx0XHRcdFx0XHRyZXNvbHZlKG1vZHVsZXMpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdH1cblx0ZWxzZSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1Vua25vd24gbG9hZGVyJykpO1xuXHRcdH07XG5cdH1cbn0pKCk7XG5leHBvcnQgZGVmYXVsdCBsb2FkO1xuIl19