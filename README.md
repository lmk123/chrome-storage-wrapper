**This project is DEPRECATED, please use [chrome-call](https://github.com/lmk123/chrome-call) instead.**

# chrome-storage.js

[![dependencies Status](https://img.shields.io/david/lmk123/chrome-storage-wrapper.svg?style=flat-square)](https://david-dm.org/lmk123/chrome-storage-wrapper)
[![devDependencies Status](https://img.shields.io/david/dev/lmk123/chrome-storage-wrapper.svg?style=flat-square)](https://david-dm.org/lmk123/chrome-storage-wrapper#info=devDependencies)
[![Bower Version](https://img.shields.io/bower/v/chrome-storage-wrapper.svg?style=flat-square)](https://github.com/lmk123/chrome-storage-wrapper/releases)
[![NPM Version](https://img.shields.io/npm/v/chrome-storage-wrapper.svg?style=flat-square)](https://www.npmjs.com/package/chrome-storage-wrapper)

A tiny wrapper for [chrome.storage](https://developer.chrome.com/extensions/storage) that using [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

## Example

```js
chromeStorage.addChangeListener( (changes, area) => {
    expect(changes.key).toBe('value in chrome.storage.local');
    expect(changes.otherKey).toBeUndefined();
    expect(area).toBe('local');
}, {
    keys:['key'], // limit change event in these keys
    areas:'local' // limit change event in chrome.storage.local storage area
} );

chromeStorage.defaultArea = 'sync';

// This will not fire the change listener because of the change occur in chrome.storage.sync
chromeStorage.set( 'key', 'value in chrome.storage.sync' )
    .then( () => chromeStorage.get('key') )
    .then( items => items.key === 'value in chrome.storage.sync' );

// This will fire the change listener by specified the storage area in chrome.storage.local
chromeStorage.set({
    key:'value in chrome.storage.local',
    otherKey:'other value in chrome.storage.local'
}, 'local')
    .then( () => chromeStorage.remove(['key','otherKey'],'local') );
```

## Installation

Install with [Bower](http://bower.io/):

```
bower install chrome-storage-wrapper
```

Or install with [npm](https://www.npmjs.com/):

```
npm install chrome-storage-wrapper
```

Or get `chrome-storage.js` on [release](https://github.com/lmk123/chrome-storage-wapper/releases), then you can:

 + Work with [RequireJS](http://requirejs.org/):`require(['path/to/chrome-storage.js'], chromeStorage => { ... })`
 + Work with [Browserify](http://browserify.org/):`const chromeStorage = require('path/to/chrome-storage.js')`
 + Traditional load by `<script>`:`<script src="path/to/chrome-storage.js"></script><script>console.dir(chromeStorage)</script>`

## API

### Storage Area

Each getter/setter function work on `chrome.storage.local` by default. You can specified a different area by use `chromeStorage.defaultArea`:

```js
chromeStorage.defaultArea = 'sync'; // use chrome.storage.sync
chromeStorage.defaultArea = 'managed'; // use chrome.storage.managed
```

Or you can specified the area at the last params of each getter/setter function. For example:

```js
chromeStorage.get('key','managed').then(() => { ... });
chromeStorage.set('key','value','sync').then(() => { ... })
chromeStorage.remove('key','local').then(() => { ... })
```

### Keys format

The getter/setter function whose are need a `keys` param support these format:

 + String. Like `'key'`
 + Array of String. Like `['key1','key2']`

### All functions

#### chromeStorage.get(keys[, area])

Gets one or more items.

```js
chromeStorage.get(['key1','key2'])
    .then(items => {
        console.log(items.key1);
        console.log(items.key2);
    });
```

#### chromeStorage.getAll([area])

Get all items.

```js
chromeStorage.getAll()
    .then(items => {
        console.log(items.key1);
        console.log(items.key2);
    });
```

#### chromeStorage.set(keyValuePairs[, area]) , chromeStorage.set(key, value[, area])

Sets one or multiple items.

```js
chromeStorage.set({ key1:'value1', key2:'value2' })
    .then(() => {
        // ...
    });
```

#### chromeStorage.remove(keys[, area])

Removes one or more items.

```js
chromeStorage.remove([ 'key1', 'key2' ])
    .then(() => {
        // ...
    });
```

#### chromeStorage.clear([area])

Removes all items.

#### chromeStorage.sync([ area-from, area-to])

Sync the data from `area-from` to `area-to`.

#### chromeStorage.addChangeListener(callback[, options])

Fired when one or more items change. This function return a function, it's used by `chromeStorage.removeChangeListener`. **Note**: The changes only has the new value. See below:

```js
chromeStorage.addChangeListener((changes, area) => {
    changes.key2 === 'value2 - changed';
    area === 'local';
}, {
    keys:['key2'], // optional, String or Array of String. Which keys you want listen.
    areas:['local'] // optional, String or Array of String. Which storage areas you want listen.
} ); // Only listen the change from 'key2' and chrome.storage.local

chromeStorage.set('key2','value2 - changed','local');
```

#### chromeStorage.removeChangeListener(callback)

Removes a callback function that returns by `chromeStorage.addChangeListener`.

```js
const cb = chromeStorage.addChangeListener((changes, area) => {
    // ...
});

chromeStorage.removeChangeListener(cb);
```

## Run test

Clone this project, then install dependencies:

```
npm install
bower install
```

Compile *.es6 files: `gulp compile-es6`

Now load `src` folder which under the project in Chrome by click the `Load unpacked extension...` button at `chrome://extensions`. Then it will auto open a page to run test.

## License
MIT
