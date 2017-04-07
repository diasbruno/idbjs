# idbjs

A functional approach to work with IndexDB.

It uses heavily [data.task](https://github.com/origamitower/folktale) to provide a better promise composition.

# Api

## Configuration

```js
const configDB = {
  name: "test",
  version: 24
};
```

## withDB(config, storeT, queryT)

Perform a `query` using a `store` on the `config` database.

```js
idb.withDB(
  configDB,
  idb.storeRW('contacts'),
  idb.selectWhere('name', 'eman')
).fork(
  err => {
	console.log("error", err);
  },
  succ => {
	console.log("success", succ.results);
  }
);
```

## selectAll() -> Task

```js
idb.withDB(
  configDB,
  idb.storeRO('contacts'),
  idb.selectAll()
).fork(
  err => {
	console.log("error", err);
  },
  succ => {
	console.log("success", succ.results);
  }
);
```

## selectWhere(key, value) -> Task

```js
idb.withDB(
  configDB,
  idb.storeRO('contacts'),
  idb.selectWhere('name', 'eman')
).fork(
  err => {
	console.log("error", err);
  },
  succ => {
	console.log("success", succ.results);
  }
);
```

## insert(item) -> Task

```js
idb.withDB(
  configDB,
  idb.storeRW('contacts'),
  idb.insert({ name: 'eman' })
).fork(
  err => {
	console.log("error", err);
  },
  succ => {
	console.log("success", succ.results);
  }
);
```

## update(item) -> Task

```js
idb.withDB(
  configDB,
  idb.storeRW('contacts'),
  idb.update({ id: 3, name: 'eman' })
).fork(
  err => {
	console.log("error", err);
  },
  succ => {
	console.log("success", succ.results);
  }
);
```

## remove(item) -> Task

```js
idb.withDB(
  configDB,
  idb.storeRW('contacts'),
  idb.update({ id: 3, name: 'eman' })
).fork(
  err => {
	console.log("error", err);
  },
  succ => {
	console.log("success", succ.results);
  }
);
```

# License

See `license.md`.
