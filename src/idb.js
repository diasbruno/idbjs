/**
 * @module
 * @desc Interaface for IndexedDB.
 */
import _ from 'lodash';
import Task from 'data.task';

export const Connect = window.indexedDB;
export const Transaction = window.IDBTransaction;
export const KeyRange = window.IDBKeyRange;
export { default as Task } from 'data.task';

/**
 * Alias to create a new task.
 * @param {Function} fn A callback.
 * @return {Task}
 */
const T = fn => new Task(fn);

/**
 * Create an index in a store.
 * @param {object} store The store.
 * @return ()
 */
export function createIndex(store) {
  return (opts, key) => store.createIndex(key, key, opts);
}

/**
 * Initialize the indexedDB.
 * @param {string} name Collection name.
 * @param {number} version The latest collection version.
 * @return {Task}
 */
export function openDB(name, version) {
  return T((rejecting, resolve) => {
    const conn = Connect.open(name, version || 1);

    // default error handler, just forward.
    conn.onerror = function(event) {
      rejecting({ error: event });
    };

    // this is triggered when everything is done
    // and the migration doesn't contain errors.
    conn.onsuccess = function(event) {
      resolve({ db: event.target.result });
    };
  });
}

/**
 * Close the database.
 * @param {object} env The current env.
 * @param {object}
 */
export function closeDB(env) {
  env.db.close();
  delete env.db;
  return env;
}

/**
 * Get and instance of the indexedDB and perform query.
 * @param {string} name Name of the instance.
 * @return {Task}
 */
export function withDB(config, store, query) {
  return openDB(
    config.name, config.version
  ).chain(store).chain(query).bimap(closeDB, closeDB);
}

/**
 * Creates a new schema.
 * @param {string} name Store name.
 * @param {object} keyOptions Store configuration.
 * @param {array} indexes List of indexes.
 * @return {Function}
 */
export function createSchema(config, schemas) {
    return T((reject, resolve) => {
      const conn = Connect.open(config.name, config.version || 1);

      // default error handler, just forward.
      conn.onerror = function(event) {
	reject({ error: event });
      };

      conn.onupgradeneeded = event => {
	const db = event.target.result;
	_.map(schemas, (v, k) => {
	  var store = db.createObjectStore(k, v.options);

	  v.schema.map(index => {
	    store.createIndex(index.name, index.key, index.options);
	  });
	});
      };

      conn.onsuccess = function(event) {
	resolve({ db: event.target.result });
      };
    });
}

/**
 * Check if table exists.
 * @param {string} tablename The table name.
 * @return {Bool}
 */
export function hasTable(name) {
    return db => new Task((rejected, resolve) => {
      const has = db.objectStoreNames.contains(name);
      return Task[has ? 'of' : 'rejected']({ db, has });
    });
}

/**
 * Open a store with a given mode.
 * @param {string} name Store name.
 * @param {string} mode "readonly" or "readwrite".
 * @return {Function}
 */
function openStore(name, mode) {
    return env => {
      try {
	const tx = env.db.transaction(name, mode);
	return Task.of({ ...env, store: tx.objectStore(name) });
      } catch (error) {
	return Task.rejected({ ...env, error });
      }
    };
}

/**
 * Open a store for read and write.
 * @param {string} name Name of the instance.
 * @return {object}
 */
export const storeRW = name => openStore(name, 'readwrite');

/**
 * Open a store for read only.
 * @param {string} name Name of the instance.
 * @return {object}
 */
export const storeRO = name => openStore(name, 'readonly');

/**
 * Join the error event to the state.
 * @param {Function} reject The promise reject.
 * @param {object}   env    The current state.
 */
function tagErrorEvent(reject, env) {
    return event => reject({ ...env, error: event });
}

/**
 * Join the success event results to the state.
 * @param {Function} reject The promise reject.
 * @param {object}   env    The current state.
 */
function tagSuccessEvent(resolve, env, item) {
    return event => resolve({ ...env, results: event.target.result || item });
}

/**
 * Query all results from a table.
 * @param {string} tablename The table name.
 * @param {IDBDatabase} db The db instance.
 * @return {Task}
 */
export function selectAll(from) {
    return env => T((reject, resolve) => {
      const { store } = env;
      const st = store.getAll();
      st.onerror = tagErrorEvent(reject, env);
      st.onsuccess = tagSuccessEvent(resolve, env);
    });
}

/**
 * Query an item from a table where...
 * @param {string} store The store name.
 * @param {string} from The keypath name.
 * @param {object} value The db instance.
 * @return {Function}
 */
export function selectWhere(from, value) {
  return env => T((reject, resolve) => {
    const { store } = env;
    const index = store.index(from);
    let req = index.get(value);
    req.onerror = tagErrorEvent(reject, env);
    req.onsuccess = function(event) {
      if (!event.target.result) {
	reject({ ...env, error: value });
	return;
      }
      resolve({ ...env, results: event.target.result });
    };
  });
}

/**
 * Insert an item into the store.
 * @param {string} into The keypath name.
 * @param {object} item Object.
 * @return {Task}
 */
export function insert(item) {
  return env => T((reject, resolve) => {
    const { store } = env;
    var st = store.add(item);
    st.onerror = tagErrorEvent(reject, env);
    st.onsuccess = tagSuccessEvent(resolve, env);
  });
}

/**
 * Update an item.
 * @param {object} item Item to update.
 * @return {Function}
 */
export function update(item) {
    return env => T((rejected, resolve) => {
      const { store } = env;
      var st = store.put(item);
      st.onerror = tagErrorEvent(rejected, env);
      st.onsuccess = tagSuccessEvent(resolve, env, item);
    });
}

/**
 * Remove and item from a collection.
 * @param {string} tablename The table name.
 * @param {object} db The item.
 * @return {Task}
 */
export function remove(item) {
  return env => T((reject, resolve) => {
    const { store } = env;
    var st = store.delete(item);
    st.onerror = tagErrorEvent(reject, env);
    st.onsuccess = tagSuccessEvent(resolve, env, item);
  });
}
