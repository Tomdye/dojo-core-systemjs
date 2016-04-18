(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    const escapeRegExpPattern = /[[\]{}()|\/\\^$.*+?]/g;
    const escapeXmlPattern = /[&<]/g;
    const escapeXmlForPattern = /[&<>'"]/g;
    const escapeXmlMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
    };
    exports.HIGH_SURROGATE_MIN = 0xD800;
    exports.HIGH_SURROGATE_MAX = 0xDBFF;
    exports.LOW_SURROGATE_MIN = 0xDC00;
    exports.LOW_SURROGATE_MAX = 0xDFFF;
    /**
     * Performs validation and padding operations used by padStart and padEnd.
     */
    function getPadding(name, text, length, character = '0') {
        if (text == null) {
            throw new TypeError('string.' + name + ' requires a valid string.');
        }
        if (character.length !== 1) {
            throw new TypeError('string.' + name + ' requires a valid padding character.');
        }
        if (length < 0 || length === Infinity) {
            throw new RangeError('string.' + name + ' requires a valid length.');
        }
        length -= text.length;
        return length < 1 ? '' : repeat(character, length);
    }
    /**
     * Validates that text is defined, and normalizes position (based on the given default if the input is NaN).
     * Used by startsWith, includes, and endsWith.
     * @return Normalized position.
     */
    function normalizeSubstringArgs(name, text, search, position, isEnd = false) {
        if (text == null) {
            throw new TypeError('string.' + name + ' requires a valid string to search against.');
        }
        const length = text.length;
        position = position !== position ? (isEnd ? length : 0) : position;
        return [text, String(search), Math.min(Math.max(position, 0), length)];
    }
    /**
     * Returns the UTF-16 encoded code point value of a given position in a string.
     * @param text The string containing the element whose code point is to be determined
     * @param position Position of an element within the string to retrieve the code point value from
     * @return A non-negative integer representing the UTF-16 encoded code point value
     */
    function codePointAt(text, position = 0) {
        // Adapted from https://github.com/mathiasbynens/String.prototype.codePointAt
        if (text == null) {
            throw new TypeError('string.codePointAt requries a valid string.');
        }
        const length = text.length;
        if (position !== position) {
            position = 0;
        }
        if (position < 0 || position >= length) {
            return undefined;
        }
        // Get the first code unit
        const first = text.charCodeAt(position);
        if (first >= exports.HIGH_SURROGATE_MIN && first <= exports.HIGH_SURROGATE_MAX && length > position + 1) {
            // Start of a surrogate pair (high surrogate and there is a next code unit); check for low surrogate
            // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            const second = text.charCodeAt(position + 1);
            if (second >= exports.LOW_SURROGATE_MIN && second <= exports.LOW_SURROGATE_MAX) {
                return (first - exports.HIGH_SURROGATE_MIN) * 0x400 + second - exports.LOW_SURROGATE_MIN + 0x10000;
            }
        }
        return first;
    }
    exports.codePointAt = codePointAt;
    /**
     * Determines whether a string ends with the given substring.
     * @param text The string to look for the search string within
     * @param search The string to search for
     * @param endPosition The index searching should stop before (defaults to text.length)
     * @return Boolean indicating if the search string was found at the end of the given string
     */
    function endsWith(text, search, endPosition) {
        if (endPosition == null && text != null) {
            endPosition = text.length;
        }
        // V8 Bug: https://bugs.chromium.org/p/v8/issues/detail?id=4636
        // StackOverlow: http://stackoverflow.com/questions/36076782/array-destructuring-assignment-not-working-in-v8-with-harmony-option-in-node-js
        // Node v.5 does not fully implement assignment_destructuring, only with var / let / const
        // Fixed in V8, can be put back to [text,search,endPosition] when Node v.6 released.
        const [nText, nSearch, nEndPosition] = normalizeSubstringArgs('endsWith', text, search, endPosition, true);
        const start = nEndPosition - nSearch.length;
        if (start < 0) {
            return false;
        }
        return nText.slice(start, nEndPosition) === nSearch;
    }
    exports.endsWith = endsWith;
    /**
     * Escapes a string so that it can safely be passed to the RegExp constructor.
     * @param text The string to be escaped
     * @return The escaped string
     */
    function escapeRegExp(text) {
        return !text ? text : text.replace(escapeRegExpPattern, '\\$&');
    }
    exports.escapeRegExp = escapeRegExp;
    /**
     * Sanitizes a string to protect against tag injection.
     * @param xml The string to be escaped
     * @param forAttribute Whether to also escape ', ", and > in addition to < and &
     * @return The escaped string
     */
    function escapeXml(xml, forAttribute = true) {
        if (!xml) {
            return xml;
        }
        const pattern = forAttribute ? escapeXmlForPattern : escapeXmlPattern;
        return xml.replace(pattern, function (character) {
            return escapeXmlMap[character];
        });
    }
    exports.escapeXml = escapeXml;
    /**
     * Returns a string created by using the specified sequence of code points.
     * @param codePoints One or more code points
     * @return A string containing the given code points
     */
    function fromCodePoint(...codePoints) {
        // Adapted from https://github.com/mathiasbynens/String.fromCodePoint
        const length = arguments.length;
        if (!length) {
            return '';
        }
        const fromCharCode = String.fromCharCode;
        const MAX_SIZE = 0x4000;
        let codeUnits = [];
        let index = -1;
        let result = '';
        while (++index < length) {
            let codePoint = Number(arguments[index]);
            // Code points must be finite integers within the valid range
            let isValid = isFinite(codePoint) && Math.floor(codePoint) === codePoint &&
                codePoint >= 0 && codePoint <= 0x10FFFF;
            if (!isValid) {
                throw RangeError('string.fromCodePoint: Invalid code point ' + codePoint);
            }
            if (codePoint <= 0xFFFF) {
                // BMP code point
                codeUnits.push(codePoint);
            }
            else {
                // Astral code point; split in surrogate halves
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                codePoint -= 0x10000;
                let highSurrogate = (codePoint >> 10) + exports.HIGH_SURROGATE_MIN;
                let lowSurrogate = (codePoint % 0x400) + exports.LOW_SURROGATE_MIN;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += fromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
            }
        }
        return result;
    }
    exports.fromCodePoint = fromCodePoint;
    /**
     * Determines whether a string includes the given substring (optionally starting from a given index).
     * @param text The string to look for the search string within
     * @param search The string to search for
     * @param position The index to begin searching at
     * @return Boolean indicating if the search string was found within the given string
     */
    function includes(text, search, position = 0) {
        // V8 Bug: https://bugs.chromium.org/p/v8/issues/detail?id=4636
        const [nText, nSearch, nPosition] = normalizeSubstringArgs('includes', text, search, position);
        return nText.indexOf(nSearch, nPosition) !== -1;
    }
    exports.includes = includes;
    /**
     * Adds padding to the end of a string to ensure it is a certain length.
     * @param text The string to pad
     * @param length The target minimum length of the string
     * @param character The character to pad onto the end of the string
     * @return The string, padded to the given length if necessary
     */
    function padEnd(text, length, character = '0') {
        return text + getPadding('padEnd', text, length, character);
    }
    exports.padEnd = padEnd;
    /**
     * Adds padding to the beginning of a string to ensure it is a certain length.
     * @param text The string to pad
     * @param length The target minimum length of the string
     * @param character The character to pad onto the beginning of the string
     * @return The string, padded to the given length if necessary
     */
    function padStart(text, length, character = '0') {
        return getPadding('padStart', text, length, character) + text;
    }
    exports.padStart = padStart;
    /**
     * A tag function for template strings to get the template string's raw string form.
     * @param callSite Call site object (or a template string in TypeScript, which will transpile to one)
     * @param substitutions Values to substitute within the template string (TypeScript will generate these automatically)
     * @return String containing the raw template string with variables substituted
     *
     * @example
     * // Within TypeScript; logs 'The answer is:\\n42'
     * let answer = 42;
     * console.log(string.raw`The answer is:\n${answer}`);
     *
     * @example
     * // The same example as above, but directly specifying a JavaScript object and substitution
     * console.log(string.raw({ raw: [ 'The answer is:\\n', '' ] }, 42));
     */
    function raw(callSite, ...substitutions) {
        let rawStrings = callSite.raw;
        let result = '';
        let numSubstitutions = substitutions.length;
        if (callSite == null || callSite.raw == null) {
            throw new TypeError('string.raw requires a valid callSite object with a raw value');
        }
        for (let i = 0, length = rawStrings.length; i < length; i++) {
            result += rawStrings[i] + (i < numSubstitutions && i < length - 1 ? substitutions[i] : '');
        }
        return result;
    }
    exports.raw = raw;
    /**
     * Returns a string containing the given string repeated the specified number of times.
     * @param text The string to repeat
     * @param count The number of times to repeat the string
     * @return A string containing the input string repeated count times
     */
    function repeat(text, count = 0) {
        // Adapted from https://github.com/mathiasbynens/String.prototype.repeat
        if (text == null) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (count !== count) {
            count = 0;
        }
        if (count < 0 || count === Infinity) {
            throw new RangeError('string.repeat requires a non-negative finite count.');
        }
        let result = '';
        while (count) {
            if (count % 2) {
                result += text;
            }
            if (count > 1) {
                text += text;
            }
            count >>= 1;
        }
        return result;
    }
    exports.repeat = repeat;
    /**
     * Determines whether a string begins with the given substring (optionally starting from a given index).
     * @param text The string to look for the search string within
     * @param search The string to search for
     * @param position The index to begin searching at
     * @return Boolean indicating if the search string was found at the beginning of the given string
     */
    function startsWith(text, search, position = 0) {
        search = String(search);
        // V8 Bug: https://bugs.chromium.org/p/v8/issues/detail?id=4636
        const [nText, nSearch, nPosition] = normalizeSubstringArgs('startsWith', text, search, position);
        const end = nPosition + nSearch.length;
        if (end > nText.length) {
            return false;
        }
        return nText.slice(nPosition, end) === nSearch;
    }
    exports.startsWith = startsWith;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3N0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFFQSxNQUFNLG1CQUFtQixHQUFHLHVCQUF1QixDQUFDO0lBQ3BELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0lBQ2pDLE1BQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0lBQ3ZDLE1BQU0sWUFBWSxHQUFpQjtRQUNsQyxHQUFHLEVBQUUsT0FBTztRQUNaLEdBQUcsRUFBRSxNQUFNO1FBQ1gsR0FBRyxFQUFFLE1BQU07UUFDWCxHQUFHLEVBQUUsUUFBUTtRQUNiLElBQUksRUFBRSxPQUFPO0tBQ2IsQ0FBQztJQUNXLDBCQUFrQixHQUFHLE1BQU0sQ0FBQztJQUM1QiwwQkFBa0IsR0FBRyxNQUFNLENBQUM7SUFDNUIseUJBQWlCLEdBQUcsTUFBTSxDQUFDO0lBQzNCLHlCQUFpQixHQUFHLE1BQU0sQ0FBQztJQUV4Qzs7T0FFRztJQUNILG9CQUFvQixJQUFZLEVBQUUsSUFBWSxFQUFFLE1BQWMsRUFBRSxTQUFTLEdBQVcsR0FBRztRQUN0RixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLElBQUksU0FBUyxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsMkJBQTJCLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sSUFBSSxTQUFTLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRywy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QUNkLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEtBQUssT0FBTyxDQUFDO0lBQ2hELENBQUM7SUFYZSxrQkFBVSxhQVd6QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGFzaCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmNvbnN0IGVzY2FwZVJlZ0V4cFBhdHRlcm4gPSAvW1tcXF17fSgpfFxcL1xcXFxeJC4qKz9dL2c7XG5jb25zdCBlc2NhcGVYbWxQYXR0ZXJuID0gL1smPF0vZztcbmNvbnN0IGVzY2FwZVhtbEZvclBhdHRlcm4gPSAvWyY8PidcIl0vZztcbmNvbnN0IGVzY2FwZVhtbE1hcDogSGFzaDxzdHJpbmc+ID0ge1xuXHQnJic6ICcmYW1wOycsXG5cdCc8JzogJyZsdDsnLFxuXHQnPic6ICcmZ3Q7Jyxcblx0J1wiJzogJyZxdW90OycsXG5cdCdcXCcnOiAnJiMzOTsnXG59O1xuZXhwb3J0IGNvbnN0IEhJR0hfU1VSUk9HQVRFX01JTiA9IDB4RDgwMDtcbmV4cG9ydCBjb25zdCBISUdIX1NVUlJPR0FURV9NQVggPSAweERCRkY7XG5leHBvcnQgY29uc3QgTE9XX1NVUlJPR0FURV9NSU4gPSAweERDMDA7XG5leHBvcnQgY29uc3QgTE9XX1NVUlJPR0FURV9NQVggPSAweERGRkY7XG5cbi8qKlxuICogUGVyZm9ybXMgdmFsaWRhdGlvbiBhbmQgcGFkZGluZyBvcGVyYXRpb25zIHVzZWQgYnkgcGFkU3RhcnQgYW5kIHBhZEVuZC5cbiAqL1xuZnVuY3Rpb24gZ2V0UGFkZGluZyhuYW1lOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgbGVuZ3RoOiBudW1iZXIsIGNoYXJhY3Rlcjogc3RyaW5nID0gJzAnKTogc3RyaW5nIHtcblx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy4nICsgbmFtZSArICcgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcuJyk7XG5cdH1cblxuXHRpZiAoY2hhcmFjdGVyLmxlbmd0aCAhPT0gMSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy4nICsgbmFtZSArICcgcmVxdWlyZXMgYSB2YWxpZCBwYWRkaW5nIGNoYXJhY3Rlci4nKTtcblx0fVxuXG5cdGlmIChsZW5ndGggPCAwIHx8IGxlbmd0aCA9PT0gSW5maW5pdHkpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcignc3RyaW5nLicgKyBuYW1lICsgJyByZXF1aXJlcyBhIHZhbGlkIGxlbmd0aC4nKTtcblx0fVxuXG5cdGxlbmd0aCAtPSB0ZXh0Lmxlbmd0aDtcblx0cmV0dXJuIGxlbmd0aCA8IDEgPyAnJyA6IHJlcGVhdChjaGFyYWN0ZXIsIGxlbmd0aCk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoYXQgdGV4dCBpcyBkZWZpbmVkLCBhbmQgbm9ybWFsaXplcyBwb3NpdGlvbiAoYmFzZWQgb24gdGhlIGdpdmVuIGRlZmF1bHQgaWYgdGhlIGlucHV0IGlzIE5hTikuXG4gKiBVc2VkIGJ5IHN0YXJ0c1dpdGgsIGluY2x1ZGVzLCBhbmQgZW5kc1dpdGguXG4gKiBAcmV0dXJuIE5vcm1hbGl6ZWQgcG9zaXRpb24uXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVN1YnN0cmluZ0FyZ3MobmFtZTogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyLFxuXHRcdGlzRW5kOiBib29sZWFuID0gZmFsc2UpOiBbIHN0cmluZywgc3RyaW5nLCBudW1iZXIgXSB7XG5cdGlmICh0ZXh0ID09IG51bGwpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcuJyArIG5hbWUgKyAnIHJlcXVpcmVzIGEgdmFsaWQgc3RyaW5nIHRvIHNlYXJjaCBhZ2FpbnN0LicpO1xuXHR9XG5cblx0Y29uc3QgbGVuZ3RoID0gdGV4dC5sZW5ndGg7XG5cdHBvc2l0aW9uID0gcG9zaXRpb24gIT09IHBvc2l0aW9uID8gKGlzRW5kID8gbGVuZ3RoIDogMCkgOiBwb3NpdGlvbjtcblx0cmV0dXJuIFsgdGV4dCwgU3RyaW5nKHNlYXJjaCksIE1hdGgubWluKE1hdGgubWF4KHBvc2l0aW9uLCAwKSwgbGVuZ3RoKSBdO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIFVURi0xNiBlbmNvZGVkIGNvZGUgcG9pbnQgdmFsdWUgb2YgYSBnaXZlbiBwb3NpdGlvbiBpbiBhIHN0cmluZy5cbiAqIEBwYXJhbSB0ZXh0IFRoZSBzdHJpbmcgY29udGFpbmluZyB0aGUgZWxlbWVudCB3aG9zZSBjb2RlIHBvaW50IGlzIHRvIGJlIGRldGVybWluZWRcbiAqIEBwYXJhbSBwb3NpdGlvbiBQb3NpdGlvbiBvZiBhbiBlbGVtZW50IHdpdGhpbiB0aGUgc3RyaW5nIHRvIHJldHJpZXZlIHRoZSBjb2RlIHBvaW50IHZhbHVlIGZyb21cbiAqIEByZXR1cm4gQSBub24tbmVnYXRpdmUgaW50ZWdlciByZXByZXNlbnRpbmcgdGhlIFVURi0xNiBlbmNvZGVkIGNvZGUgcG9pbnQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvZGVQb2ludEF0KHRleHQ6IHN0cmluZywgcG9zaXRpb246IG51bWJlciA9IDApIHtcblx0Ly8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXRcblx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5jb2RlUG9pbnRBdCByZXF1cmllcyBhIHZhbGlkIHN0cmluZy4nKTtcblx0fVxuXHRjb25zdCBsZW5ndGggPSB0ZXh0Lmxlbmd0aDtcblxuXHRpZiAocG9zaXRpb24gIT09IHBvc2l0aW9uKSB7XG5cdFx0cG9zaXRpb24gPSAwO1xuXHR9XG5cdGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gbGVuZ3RoKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8vIEdldCB0aGUgZmlyc3QgY29kZSB1bml0XG5cdGNvbnN0IGZpcnN0ID0gdGV4dC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcblx0aWYgKGZpcnN0ID49IEhJR0hfU1VSUk9HQVRFX01JTiAmJiBmaXJzdCA8PSBISUdIX1NVUlJPR0FURV9NQVggJiYgbGVuZ3RoID4gcG9zaXRpb24gKyAxKSB7XG5cdFx0Ly8gU3RhcnQgb2YgYSBzdXJyb2dhdGUgcGFpciAoaGlnaCBzdXJyb2dhdGUgYW5kIHRoZXJlIGlzIGEgbmV4dCBjb2RlIHVuaXQpOyBjaGVjayBmb3IgbG93IHN1cnJvZ2F0ZVxuXHRcdC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuXHRcdGNvbnN0IHNlY29uZCA9IHRleHQuY2hhckNvZGVBdChwb3NpdGlvbiArIDEpO1xuXHRcdGlmIChzZWNvbmQgPj0gTE9XX1NVUlJPR0FURV9NSU4gJiYgc2Vjb25kIDw9IExPV19TVVJST0dBVEVfTUFYKSB7XG5cdFx0XHRyZXR1cm4gKGZpcnN0IC0gSElHSF9TVVJST0dBVEVfTUlOKSAqIDB4NDAwICsgc2Vjb25kIC0gTE9XX1NVUlJPR0FURV9NSU4gKyAweDEwMDAwO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmlyc3Q7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgc3RyaW5nIGVuZHMgd2l0aCB0aGUgZ2l2ZW4gc3Vic3RyaW5nLlxuICogQHBhcmFtIHRleHQgVGhlIHN0cmluZyB0byBsb29rIGZvciB0aGUgc2VhcmNoIHN0cmluZyB3aXRoaW5cbiAqIEBwYXJhbSBzZWFyY2ggVGhlIHN0cmluZyB0byBzZWFyY2ggZm9yXG4gKiBAcGFyYW0gZW5kUG9zaXRpb24gVGhlIGluZGV4IHNlYXJjaGluZyBzaG91bGQgc3RvcCBiZWZvcmUgKGRlZmF1bHRzIHRvIHRleHQubGVuZ3RoKVxuICogQHJldHVybiBCb29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHNlYXJjaCBzdHJpbmcgd2FzIGZvdW5kIGF0IHRoZSBlbmQgb2YgdGhlIGdpdmVuIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZW5kc1dpdGgodGV4dDogc3RyaW5nLCBzZWFyY2g6IHN0cmluZywgZW5kUG9zaXRpb24/OiBudW1iZXIpOiBib29sZWFuIHtcblx0aWYgKGVuZFBvc2l0aW9uID09IG51bGwgJiYgdGV4dCAhPSBudWxsKSB7XG5cdFx0ZW5kUG9zaXRpb24gPSB0ZXh0Lmxlbmd0aDtcblx0fVxuXG5cdC8vIFY4IEJ1ZzogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDYzNlxuXHQvLyBTdGFja092ZXJsb3c6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzYwNzY3ODIvYXJyYXktZGVzdHJ1Y3R1cmluZy1hc3NpZ25tZW50LW5vdC13b3JraW5nLWluLXY4LXdpdGgtaGFybW9ueS1vcHRpb24taW4tbm9kZS1qc1xuXHQvLyBOb2RlIHYuNSBkb2VzIG5vdCBmdWxseSBpbXBsZW1lbnQgYXNzaWdubWVudF9kZXN0cnVjdHVyaW5nLCBvbmx5IHdpdGggdmFyIC8gbGV0IC8gY29uc3Rcblx0Ly8gRml4ZWQgaW4gVjgsIGNhbiBiZSBwdXQgYmFjayB0byBbdGV4dCxzZWFyY2gsZW5kUG9zaXRpb25dIHdoZW4gTm9kZSB2LjYgcmVsZWFzZWQuXG5cdGNvbnN0IFsgblRleHQsIG5TZWFyY2gsIG5FbmRQb3NpdGlvbiBdID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnZW5kc1dpdGgnLCB0ZXh0LCBzZWFyY2gsIGVuZFBvc2l0aW9uLCB0cnVlKTtcblxuXHRjb25zdCBzdGFydCA9IG5FbmRQb3NpdGlvbiAtIG5TZWFyY2gubGVuZ3RoO1xuXHRpZiAoc3RhcnQgPCAwKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIG5UZXh0LnNsaWNlKHN0YXJ0LCBuRW5kUG9zaXRpb24pID09PSBuU2VhcmNoO1xufVxuXG4vKipcbiAqIEVzY2FwZXMgYSBzdHJpbmcgc28gdGhhdCBpdCBjYW4gc2FmZWx5IGJlIHBhc3NlZCB0byB0aGUgUmVnRXhwIGNvbnN0cnVjdG9yLlxuICogQHBhcmFtIHRleHQgVGhlIHN0cmluZyB0byBiZSBlc2NhcGVkXG4gKiBAcmV0dXJuIFRoZSBlc2NhcGVkIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdHJldHVybiAhdGV4dCA/IHRleHQgOiB0ZXh0LnJlcGxhY2UoZXNjYXBlUmVnRXhwUGF0dGVybiwgJ1xcXFwkJicpO1xufVxuXG4vKipcbiAqIFNhbml0aXplcyBhIHN0cmluZyB0byBwcm90ZWN0IGFnYWluc3QgdGFnIGluamVjdGlvbi5cbiAqIEBwYXJhbSB4bWwgVGhlIHN0cmluZyB0byBiZSBlc2NhcGVkXG4gKiBAcGFyYW0gZm9yQXR0cmlidXRlIFdoZXRoZXIgdG8gYWxzbyBlc2NhcGUgJywgXCIsIGFuZCA+IGluIGFkZGl0aW9uIHRvIDwgYW5kICZcbiAqIEByZXR1cm4gVGhlIGVzY2FwZWQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVYbWwoeG1sOiBzdHJpbmcsIGZvckF0dHJpYnV0ZTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xuXHRpZiAoIXhtbCkge1xuXHRcdHJldHVybiB4bWw7XG5cdH1cblxuXHRjb25zdCBwYXR0ZXJuID0gZm9yQXR0cmlidXRlID8gZXNjYXBlWG1sRm9yUGF0dGVybiA6IGVzY2FwZVhtbFBhdHRlcm47XG5cblx0cmV0dXJuIHhtbC5yZXBsYWNlKHBhdHRlcm4sIGZ1bmN0aW9uIChjaGFyYWN0ZXI6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGVzY2FwZVhtbE1hcFtjaGFyYWN0ZXJdO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIGNyZWF0ZWQgYnkgdXNpbmcgdGhlIHNwZWNpZmllZCBzZXF1ZW5jZSBvZiBjb2RlIHBvaW50cy5cbiAqIEBwYXJhbSBjb2RlUG9pbnRzIE9uZSBvciBtb3JlIGNvZGUgcG9pbnRzXG4gKiBAcmV0dXJuIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGdpdmVuIGNvZGUgcG9pbnRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHM6IG51bWJlcltdKTogc3RyaW5nIHtcblx0Ly8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5mcm9tQ29kZVBvaW50XG5cdGNvbnN0IGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cdGlmICghbGVuZ3RoKSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0Y29uc3QgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblx0Y29uc3QgTUFYX1NJWkUgPSAweDQwMDA7XG5cdGxldCBjb2RlVW5pdHM6IG51bWJlcltdID0gW107XG5cdGxldCBpbmRleCA9IC0xO1xuXHRsZXQgcmVzdWx0ID0gJyc7XG5cblx0d2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0XHRsZXQgY29kZVBvaW50ID0gTnVtYmVyKGFyZ3VtZW50c1tpbmRleF0pO1xuXG5cdFx0Ly8gQ29kZSBwb2ludHMgbXVzdCBiZSBmaW5pdGUgaW50ZWdlcnMgd2l0aGluIHRoZSB2YWxpZCByYW5nZVxuXHRcdGxldCBpc1ZhbGlkID0gaXNGaW5pdGUoY29kZVBvaW50KSAmJiBNYXRoLmZsb29yKGNvZGVQb2ludCkgPT09IGNvZGVQb2ludCAmJlxuXHRcdFx0Y29kZVBvaW50ID49IDAgJiYgY29kZVBvaW50IDw9IDB4MTBGRkZGO1xuXHRcdGlmICghaXNWYWxpZCkge1xuXHRcdFx0dGhyb3cgUmFuZ2VFcnJvcignc3RyaW5nLmZyb21Db2RlUG9pbnQ6IEludmFsaWQgY29kZSBwb2ludCAnICsgY29kZVBvaW50KTtcblx0XHR9XG5cblx0XHRpZiAoY29kZVBvaW50IDw9IDB4RkZGRikge1xuXHRcdFx0Ly8gQk1QIGNvZGUgcG9pbnRcblx0XHRcdGNvZGVVbml0cy5wdXNoKGNvZGVQb2ludCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gQXN0cmFsIGNvZGUgcG9pbnQ7IHNwbGl0IGluIHN1cnJvZ2F0ZSBoYWx2ZXNcblx0XHRcdC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuXHRcdFx0Y29kZVBvaW50IC09IDB4MTAwMDA7XG5cdFx0XHRsZXQgaGlnaFN1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgPj4gMTApICsgSElHSF9TVVJST0dBVEVfTUlOO1xuXHRcdFx0bGV0IGxvd1N1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgJSAweDQwMCkgKyBMT1dfU1VSUk9HQVRFX01JTjtcblx0XHRcdGNvZGVVbml0cy5wdXNoKGhpZ2hTdXJyb2dhdGUsIGxvd1N1cnJvZ2F0ZSk7XG5cdFx0fVxuXG5cdFx0aWYgKGluZGV4ICsgMSA9PT0gbGVuZ3RoIHx8IGNvZGVVbml0cy5sZW5ndGggPiBNQVhfU0laRSkge1xuXHRcdFx0cmVzdWx0ICs9IGZyb21DaGFyQ29kZS5hcHBseShudWxsLCBjb2RlVW5pdHMpO1xuXHRcdFx0Y29kZVVuaXRzLmxlbmd0aCA9IDA7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgc3RyaW5nIGluY2x1ZGVzIHRoZSBnaXZlbiBzdWJzdHJpbmcgKG9wdGlvbmFsbHkgc3RhcnRpbmcgZnJvbSBhIGdpdmVuIGluZGV4KS5cbiAqIEBwYXJhbSB0ZXh0IFRoZSBzdHJpbmcgdG8gbG9vayBmb3IgdGhlIHNlYXJjaCBzdHJpbmcgd2l0aGluXG4gKiBAcGFyYW0gc2VhcmNoIFRoZSBzdHJpbmcgdG8gc2VhcmNoIGZvclxuICogQHBhcmFtIHBvc2l0aW9uIFRoZSBpbmRleCB0byBiZWdpbiBzZWFyY2hpbmcgYXRcbiAqIEByZXR1cm4gQm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSBzZWFyY2ggc3RyaW5nIHdhcyBmb3VuZCB3aXRoaW4gdGhlIGdpdmVuIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5jbHVkZXModGV4dDogc3RyaW5nLCBzZWFyY2g6IHN0cmluZywgcG9zaXRpb246IG51bWJlciA9IDApOiBib29sZWFuIHtcblx0Ly8gVjggQnVnOiBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00NjM2XG5cdGNvbnN0IFsgblRleHQsIG5TZWFyY2gsIG5Qb3NpdGlvbiBdID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnaW5jbHVkZXMnLCB0ZXh0LCBzZWFyY2gsIHBvc2l0aW9uKTtcblx0cmV0dXJuIG5UZXh0LmluZGV4T2YoblNlYXJjaCwgblBvc2l0aW9uKSAhPT0gLTE7XG59XG5cbi8qKlxuICogQWRkcyBwYWRkaW5nIHRvIHRoZSBlbmQgb2YgYSBzdHJpbmcgdG8gZW5zdXJlIGl0IGlzIGEgY2VydGFpbiBsZW5ndGguXG4gKiBAcGFyYW0gdGV4dCBUaGUgc3RyaW5nIHRvIHBhZFxuICogQHBhcmFtIGxlbmd0aCBUaGUgdGFyZ2V0IG1pbmltdW0gbGVuZ3RoIG9mIHRoZSBzdHJpbmdcbiAqIEBwYXJhbSBjaGFyYWN0ZXIgVGhlIGNoYXJhY3RlciB0byBwYWQgb250byB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcbiAqIEByZXR1cm4gVGhlIHN0cmluZywgcGFkZGVkIHRvIHRoZSBnaXZlbiBsZW5ndGggaWYgbmVjZXNzYXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWRFbmQodGV4dDogc3RyaW5nLCBsZW5ndGg6IG51bWJlciwgY2hhcmFjdGVyOiBzdHJpbmcgPSAnMCcpOiBzdHJpbmcge1xuXHRyZXR1cm4gdGV4dCArIGdldFBhZGRpbmcoJ3BhZEVuZCcsIHRleHQsIGxlbmd0aCwgY2hhcmFjdGVyKTtcbn1cblxuLyoqXG4gKiBBZGRzIHBhZGRpbmcgdG8gdGhlIGJlZ2lubmluZyBvZiBhIHN0cmluZyB0byBlbnN1cmUgaXQgaXMgYSBjZXJ0YWluIGxlbmd0aC5cbiAqIEBwYXJhbSB0ZXh0IFRoZSBzdHJpbmcgdG8gcGFkXG4gKiBAcGFyYW0gbGVuZ3RoIFRoZSB0YXJnZXQgbWluaW11bSBsZW5ndGggb2YgdGhlIHN0cmluZ1xuICogQHBhcmFtIGNoYXJhY3RlciBUaGUgY2hhcmFjdGVyIHRvIHBhZCBvbnRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICogQHJldHVybiBUaGUgc3RyaW5nLCBwYWRkZWQgdG8gdGhlIGdpdmVuIGxlbmd0aCBpZiBuZWNlc3NhcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhZFN0YXJ0KHRleHQ6IHN0cmluZywgbGVuZ3RoOiBudW1iZXIsIGNoYXJhY3Rlcjogc3RyaW5nID0gJzAnKTogc3RyaW5nIHtcblx0cmV0dXJuIGdldFBhZGRpbmcoJ3BhZFN0YXJ0JywgdGV4dCwgbGVuZ3RoLCBjaGFyYWN0ZXIpICsgdGV4dDtcbn1cblxuLyoqXG4gKiBBIHRhZyBmdW5jdGlvbiBmb3IgdGVtcGxhdGUgc3RyaW5ncyB0byBnZXQgdGhlIHRlbXBsYXRlIHN0cmluZydzIHJhdyBzdHJpbmcgZm9ybS5cbiAqIEBwYXJhbSBjYWxsU2l0ZSBDYWxsIHNpdGUgb2JqZWN0IChvciBhIHRlbXBsYXRlIHN0cmluZyBpbiBUeXBlU2NyaXB0LCB3aGljaCB3aWxsIHRyYW5zcGlsZSB0byBvbmUpXG4gKiBAcGFyYW0gc3Vic3RpdHV0aW9ucyBWYWx1ZXMgdG8gc3Vic3RpdHV0ZSB3aXRoaW4gdGhlIHRlbXBsYXRlIHN0cmluZyAoVHlwZVNjcmlwdCB3aWxsIGdlbmVyYXRlIHRoZXNlIGF1dG9tYXRpY2FsbHkpXG4gKiBAcmV0dXJuIFN0cmluZyBjb250YWluaW5nIHRoZSByYXcgdGVtcGxhdGUgc3RyaW5nIHdpdGggdmFyaWFibGVzIHN1YnN0aXR1dGVkXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFdpdGhpbiBUeXBlU2NyaXB0OyBsb2dzICdUaGUgYW5zd2VyIGlzOlxcXFxuNDInXG4gKiBsZXQgYW5zd2VyID0gNDI7XG4gKiBjb25zb2xlLmxvZyhzdHJpbmcucmF3YFRoZSBhbnN3ZXIgaXM6XFxuJHthbnN3ZXJ9YCk7XG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFRoZSBzYW1lIGV4YW1wbGUgYXMgYWJvdmUsIGJ1dCBkaXJlY3RseSBzcGVjaWZ5aW5nIGEgSmF2YVNjcmlwdCBvYmplY3QgYW5kIHN1YnN0aXR1dGlvblxuICogY29uc29sZS5sb2coc3RyaW5nLnJhdyh7IHJhdzogWyAnVGhlIGFuc3dlciBpczpcXFxcbicsICcnIF0gfSwgNDIpKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhdyhjYWxsU2l0ZTogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnN1YnN0aXR1dGlvbnM6IGFueVtdKTogc3RyaW5nIHtcblx0bGV0IHJhd1N0cmluZ3MgPSBjYWxsU2l0ZS5yYXc7XG5cdGxldCByZXN1bHQgPSAnJztcblx0bGV0IG51bVN1YnN0aXR1dGlvbnMgPSBzdWJzdGl0dXRpb25zLmxlbmd0aDtcblxuXHRpZiAoY2FsbFNpdGUgPT0gbnVsbCB8fCBjYWxsU2l0ZS5yYXcgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yYXcgcmVxdWlyZXMgYSB2YWxpZCBjYWxsU2l0ZSBvYmplY3Qgd2l0aCBhIHJhdyB2YWx1ZScpO1xuXHR9XG5cblx0Zm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHJhd1N0cmluZ3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRyZXN1bHQgKz0gcmF3U3RyaW5nc1tpXSArIChpIDwgbnVtU3Vic3RpdHV0aW9ucyAmJiBpIDwgbGVuZ3RoIC0gMSA/IHN1YnN0aXR1dGlvbnNbaV0gOiAnJyk7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgZ2l2ZW4gc3RyaW5nIHJlcGVhdGVkIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIHRpbWVzLlxuICogQHBhcmFtIHRleHQgVGhlIHN0cmluZyB0byByZXBlYXRcbiAqIEBwYXJhbSBjb3VudCBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIHJlcGVhdCB0aGUgc3RyaW5nXG4gKiBAcmV0dXJuIEEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGlucHV0IHN0cmluZyByZXBlYXRlZCBjb3VudCB0aW1lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwZWF0KHRleHQ6IHN0cmluZywgY291bnQ6IG51bWJlciA9IDApOiBzdHJpbmcge1xuXHQvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5yZXBlYXRcblx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yZXBlYXQgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcuJyk7XG5cdH1cblx0aWYgKGNvdW50ICE9PSBjb3VudCkge1xuXHRcdGNvdW50ID0gMDtcblx0fVxuXHRpZiAoY291bnQgPCAwIHx8IGNvdW50ID09PSBJbmZpbml0eSkge1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKCdzdHJpbmcucmVwZWF0IHJlcXVpcmVzIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBjb3VudC4nKTtcblx0fVxuXG5cdGxldCByZXN1bHQgPSAnJztcblx0d2hpbGUgKGNvdW50KSB7XG5cdFx0aWYgKGNvdW50ICUgMikge1xuXHRcdFx0cmVzdWx0ICs9IHRleHQ7XG5cdFx0fVxuXHRcdGlmIChjb3VudCA+IDEpIHtcblx0XHRcdHRleHQgKz0gdGV4dDtcblx0XHR9XG5cdFx0Y291bnQgPj49IDE7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBzdHJpbmcgYmVnaW5zIHdpdGggdGhlIGdpdmVuIHN1YnN0cmluZyAob3B0aW9uYWxseSBzdGFydGluZyBmcm9tIGEgZ2l2ZW4gaW5kZXgpLlxuICogQHBhcmFtIHRleHQgVGhlIHN0cmluZyB0byBsb29rIGZvciB0aGUgc2VhcmNoIHN0cmluZyB3aXRoaW5cbiAqIEBwYXJhbSBzZWFyY2ggVGhlIHN0cmluZyB0byBzZWFyY2ggZm9yXG4gKiBAcGFyYW0gcG9zaXRpb24gVGhlIGluZGV4IHRvIGJlZ2luIHNlYXJjaGluZyBhdFxuICogQHJldHVybiBCb29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHNlYXJjaCBzdHJpbmcgd2FzIGZvdW5kIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGdpdmVuIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRzV2l0aCh0ZXh0OiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyID0gMCk6IGJvb2xlYW4ge1xuXHRzZWFyY2ggPSBTdHJpbmcoc2VhcmNoKTtcblx0Ly8gVjggQnVnOiBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00NjM2XG5cdGNvbnN0IFsgblRleHQsIG5TZWFyY2gsIG5Qb3NpdGlvbiBdID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnc3RhcnRzV2l0aCcsIHRleHQsIHNlYXJjaCwgcG9zaXRpb24pO1xuXG5cdGNvbnN0IGVuZCA9IG5Qb3NpdGlvbiArIG5TZWFyY2gubGVuZ3RoO1xuXHRpZiAoZW5kID4gblRleHQubGVuZ3RoKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIG5UZXh0LnNsaWNlKG5Qb3NpdGlvbiwgZW5kKSA9PT0gblNlYXJjaDtcbn1cbiJdfQ==