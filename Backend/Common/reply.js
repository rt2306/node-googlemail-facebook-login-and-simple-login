export default {
    success: (message, data = null, extra = null) => {
        var result = {
            status_code: "1",
            status_text: "success",
            message: message,
        };

        if (data != null || data == []) {
            result['data'] = data;
        }

        if (extra != null) {
            Object.assign(result, extra);
        }

        return result;
    },

    failed: (message) => {
        return {
            status_code: "0",
            status_text: "failed",
            message: message,
        }
    },

    unauth: () => {
        return {
            status_code: "0",
            status_text: "failed",
            message: 'Unauthenticated',
        }
    },

    notfound: () => {
        return {
            status_code: "0",
            status_text: "failed",
            message: 'Not Found',
        }
    },

    groupBy: (key, array) => {
        var result = {};
        array.forEach(element => {
            if (result[element[key]] !== undefined) {
                result[element[key]].push(element);
            }
            else {
                result[element[key]] = [element];
            }
        });
        return result;
    },

    limitGroupBy: (key, array, limit) => {
        var result = {};
        array.every(element => {
            if (Object.keys(result).length == limit) {
                return false;
            }
            if (result[element[key]] !== undefined) {
                result[element[key]].push(element);
            }
            else {
                result[element[key]] = [element];
            }
            return true;
        });
        return result;
    }

};