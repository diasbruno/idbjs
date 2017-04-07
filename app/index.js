import _ from 'lodash';
import Task from 'data.task';

import * as idb from '../src/idb';

const configDB = {
  name: "test",
  version: 1
};

const nonunique = { options: { unique: false } };

idb.createSchema(configDB, {
  "users": {
    "options": { keyPath: 'name', autoincrement: true },
    "schema": [
      { name: 'name', key: 'name', options: { unique: true } }
    ]
  },
  "todos": {
    "options": { keyPath: 'userid', autoincrement: true },
    "schema": [
      { "name": 'title', "key": "title", ...nonunique },
      { "name": 'from', "key": "from", ...nonunique },
      { "name": 'userid', "key": "userid", "options": { unique: true } }
    ]
  }
}).fork(
  err => {
    console.log("error", err);
  },
  succ => {
    console.log("success", succ.results);
  }
);

//migration('users', 'id', { 'name': { unique: false } })
idb.withDB(
  configDB,
  idb.storeRW('users'),
  //idb.selectWhere('name', 'sbh')
  //idb.selectAll()
  // env => Task.of(env).chain(
  //   idb.selectWhere('name', 'bh')
  // ).chain(
  //   idb.insert({ id: 3, name: 'test' })
  // )
  idb.insert({ id: 6, name: 'sbh' })
  //idb.remove(5)
).fork(
  err => {
    console.log("error", err);
  },
  succ => {
    console.log("success", succ.results);
  }
);
