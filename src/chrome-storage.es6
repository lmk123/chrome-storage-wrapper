/*!
 * chrome-storage.js
 * https://github.com/lmk123/chrome-storage-wrapper
 *
 * Version: 0.1.0
 * Author: Milk Lee <me@limingkai.cn>
 * Release under MIT license.
 */
(function ( factory ) {
  if ( 'function' === typeof define && define.amd ) {
    define( [] , factory );
  } else if ( 'undefined' !== typeof module && module.exports ) {
    module.exports = factory();
  } else {
    window.chromeStorage = factory();
  }
}( function () {
  const { storage , runtime } = chrome ,
    changeCallbacks = [];

  let context = 'local' ,
    defaultStorage = storage[ context ];

  const module = {

    /**
     * 封装一层获取方法
     * @param {Object|String[]|String} keys - 可以是一个对象：{ key1:'null', key2:''}；也可以是一个数组：['key1','key2']；也可以是一个字符串：'key'
     * @param {String} [area]
     * @returns {Promise}
     */
    get ( keys , area ) {
      return new Promise( ( resolve , reject ) => {
        getCurrentStorage( area ).get( keys , items => {
          const err = runtime.lastError;
          if ( err ) {
            reject( err );
          } else {
            resolve( items );
          }
        } );
      } );
    } ,

    /**
     * 获取存储区域的所有数据
     * @param {String} [area]
     */
    getAll ( area ) {
      return module.get( null , area );
    } ,

    /**
     * 封装一层设置方法
     * @param {Object|String} key - 如果传了 value 参数，那么它只能是字符串
     * @param {*} [value] - 当以  .set('key', value) 的形式调用时，key 只能是一个字符串
     * @param {String} [area]
     * @returns {Promise}
     */
    set ( key , value , area ) {
      let obj;
      if ( 'object' === typeof key ) {
        obj = key;
        area = value;
      } else {
        obj = {};
        obj[ key ] = value;
      }
      return new Promise( ( resolve , reject ) => {
        getCurrentStorage( area ).set( obj , function () {
          var err = runtime.lastError;
          if ( err ) {
            reject( err );
          } else {
            resolve();
          }
        } );
      } );
    } ,

    /**
     * 封装一层删除方法
     * @param {Object|String[]|String} keys - 可以是一个对象：{ key1:'null', key2:''}；也可以是一个数组：['key1','key2']；也可以是一个字符串：'key'
     * @param {String} [area]
     * @returns {Promise}
     */
    remove ( keys , area ) {
      return new Promise( ( resolve , reject ) => {
        getCurrentStorage( area ).remove( keys , function ( items ) {
          const err = runtime.lastError;
          if ( err ) {
            reject( err );
          } else {
            resolve( items );
          }
        } );
      } );
    } ,

    /**
     * 封装一层 clear 方法
     * @param {String} [area]
     * @returns Promise
     */
    clear ( area ) {
      return new Promise( ( resolve , reject ) => {
        getCurrentStorage( area ).clear( () => {
          const err = runtime.lastError;
          if ( err ) {
            reject( err );
          } else {
            resolve();
          }
        } );
      } );
    } ,

    /**
     * 获取当前的默认存储区域
     * @returns {String}
     */
    get defaultArea() {
      return context;
    } ,

    /**
     * 设置当前的默认存储区域
     * @param {String} area
     */
    set defaultArea( area ) {
      noAreaError( area );
      context = area;
      defaultStorage = storage[ context ];
    } ,

    /**
     * 注册 change 事件。
     * 注意，回调里面的第一个参数仅包含最新值，
     * 而不是一个有newValue和oldValue的对象。
     * 见下面的事件监听函数。
     * @param {Function} listener
     * @param [options]
     * @param {String[]} [options.keys] - 关心哪些键的变化
     * @param {String[]} [options.areas] - 关心哪些存储区域的变化
     * @returns {Function} 最后实际生成的监听函数
     */
    addChangeListener ( listener , options ) {

      if ( !options ) { options = {}; }

      let { keys , areas } = options , newListener;

      if ( 'string' === typeof keys ) {
        keys = [ keys ];
      }

      if ( 'string' === typeof areas ) {
        areas = [ areas ];
      }

      newListener = ( changes , area ) => {
        if ( Array.isArray( areas ) ) {
          if ( areas.indexOf( area ) < 0 ) {
            return;
          }
        }

        const keysIsArray = Array.isArray( keys ) ,
          myChanges = {};

        for ( let key in changes ) {
          if ( !keysIsArray || keys.indexOf( key ) >= 0 ) {
            myChanges[ key ] = changes[ key ];
          }
        }

        for ( let hasMyChange in myChanges ) {
          listener( myChanges , area );
          break;
        }
      };
      changeCallbacks.push( newListener );
      return newListener;
    } ,

    /**
     * 删除一个监听函数
     * @param {Function} newListener
     */
    removeChangeListener ( newListener ) {
      const index = changeCallbacks.indexOf( newListener );
      if ( index >= 0 ) {
        changeCallbacks.splice( index , 1 );
      }
    } ,

    /**
     * 在存储区域间同步数据
     * @param {String} [from]
     * @param {String} [to]
     * @returns {Promise}
     */
    sync( from = 'local' , to = 'sync' ){
      return Promise
        .all( [
          module.getAll( from ) ,
          module.clear( to )
        ] )
        .then( ( [data] )=> module.set( data , to ) );
    }
  };

  storage.onChanged.addListener( ( changes , area )=> {
    const customChanges = {};

    for ( let key in changes ) {
      customChanges[ key ] = changes[ key ].newValue;
    }

    changeCallbacks.forEach( ( newListener ) => {
      newListener( customChanges , area );
    } );
  } );

  return module;

  /**
   * 获取默认的存储空间
   * @param {String} [area]
   * @returns {chrome.storage.StorageArea}
   */
  function getCurrentStorage( area ) {
    let currentStorage;
    if ( undefined === area ) {
      currentStorage = defaultStorage;
    } else {
      noAreaError( area );
      currentStorage = storage[ area ];
    }
    return currentStorage;
  }

  /**
   * 如果没有指定的存储区域则报错
   * @param {String} area
   */
  function noAreaError( area ) {
    if ( !storage[ area ] ) {
      throw new Error( 'chrome.storage 不支持 ' + area + ' 存储区域。' );
    }
  }
} ));
