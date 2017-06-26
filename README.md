# promise-object-filler

Fill properties of an object with the result of a promise.

It is a common pattern, specially in orchestration components, to
populate a JS object with the result of multiple async calls. E.g.
calling multiple services and combining the results.

With callbacks, it was complicated, with promises it is nicer, but
still tedious (and error-prone) work to write the same pattern:
Promise.all(request), unpack result and assign to properties.

This filler object makes it straigh forward: declare property and
promise that produces its value and .then will have it populated.

# API

 * `constructor(obj: Object?)`: If no params, it will populate a new object,
   otherwise it will add the properties to the parameter
   
 * `setResilient(boolean)`: the filler makes a Promise.all of all
   properties, so by default, one failing will cancel all operations.
   Setting resilient to true, will .catch all the promises, ignoring
   the error or setting a default value, depending on how the property
   was configured (see below)
   
 * `add(path: string, promise: Promise, defaultValue: Any?)`: It will
   store in objects 'path' the result of 'promise' when it resolves.
   By default, if any of the promises fails the whole filling is
   cancelled. Setting resilient to true, the filler catches the
   exceptions and replaces the error with defaultValue if present.
   If there is no defaultValue, the property is not set at all.
   
 * `promise()`: Return the global promise that will resolve in a filled
   object.


# Example

```javascript

const FillBuilder = require('promise-object-filler');

/**
 * Function that returns a promise
 */
function getValue(param) {
    return Promise.resolve('value ' + param);
}

/**
 * This function will resolve in an object:
 * { members: 'value members',
 *   stuff: 'value stuff' }
 */
function populateObject() {
    let builder = new FillBuilder();
    return builder
        .add("members", getValue('members'))
        .add("stuff", getValue('stuff'))
        .promise();
}

populateObject()
    .then(o => console.log(o))
    .catch(e => console.error(e));
```
