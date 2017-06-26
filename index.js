'use strict';

const assert = require('assert');

class FillBuilder {
    constructor(obj) {
        if (arguments.length > 0) {
            assert(typeof obj !== 'undefined',
                   'root object for the fill builder must be defined!');
        }

        this.options = {
            resilient: false
        };

        this.obj = obj || {};
        this.todo = [];
    }

    setResilient(b) {
        this.options.resilient = b;
    }

    __safeSet(path, value) {
        // TODO: handle complex and dynamic paths (property names)
        if (path.length === 0) {
            this.obj = Object.assign(this.obj, value);
        } else {
            this.obj[path] = value;
        }
    }

    __exec({ path, promise, failureResult }) {
        const operation = promise
              .then(r => this.__safeSet(path, r));

        if (this.options.resilient) {
            return operation.catch(() => {
                if (failureResult) {
                    this.__safeSet(path, failureResult);
                }
            });
        }

        return operation;
    }

    add(path, promise, failureResult) {
        assert(typeof path === 'string', 'property path must be an string');
        assert(promise !== undefined &&
               typeof promise.then === 'function', 'second param in add() doesn\'t look like a promise');

        this.todo.push({ path, promise, failureResult });
        return this;
    }

    promise() {
        return Promise.all(this.todo.map(op => this.__exec(op)))
            .then(() => this.obj);
    }
}

module.exports = FillBuilder;
