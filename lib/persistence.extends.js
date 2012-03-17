//
// our custom extensions to the persistence library.
//

function isNotCallback(obj) {
  return !(obj && obj.apply);
}

function isObject(obj) {
  return obj;
}

function isArray(obj) {
  return Array.isArray(obj);
}

function extendEntity(EntityClass) {
  //
  // findByID()
  // an alias for load()
  //
  EntityClass.findByID = function(session, tx, id, callback) {
    EntityClass.load(session, tx, id, callback);
  };

  //
  // findOne()
  //
  EntityClass.findOne = function(session, tx, options, callback) {
    EntityClass.collection(session, options).one(tx, callback);
  };

  //
  // findAll()
  //
  EntityClass.findAll = function(session, tx, options, callback) {
    var args = persistence.argspec.getArgs(arguments, [
      { name: 'session', optional: true, check: persistence.isSession, defaultValue: persistence},
      { name: 'tx', optional: true, check: persistence.isTransaction, defaultValue: null},
      { name: 'options', optional: true, check: isNotCallback, defaultValue: null},
      { name: 'callback', optional: true, check: persistence.argspec.isCallback(), defaultValue: function(){} }
    ]);
    EntityClass.collection(args.session, args.options).list(args.tx, args.callback);
  };


  //
  // findBySQL(sql, callback)
  //
  // arguments:
  //   sql -- sql statement, with ? where values should go.
  //   values -- an array of values to replace in the sql
  //
  EntityClass.findBySql = function(session, tx, sql, values, callback) {
    var args = persistence.argspec.getArgs(arguments, [
      { name: 'session', optional: true, check: persistence.isSession, defaultValue: persistence },
      { name: 'tx', optional: true, check: persistence.isTransaction, defaultValue: null },
      { name: 'sql', optional: false },
      { name: 'values', optional: true, check: isArray, defaultValue: [] },
      { name: 'callback', optional: true, check: persistence.argspec.isCallback(), defaultValue: function(){} }
    ]);
    var session = args.session;
    var tx = args.tx;
    var sql = args.sql;
    var values = args.values;
    var callback = args.callback;
    //var entityName = ?????;
    //var mainPrefix = ?????;

    if(!tx) {
      session.transaction(function(tx) {
        EntityClass.findBySql(session, tx, sql, values, callback);
      });
    } else {
      tx.executeSql(sql, values, callback);
      //tx.executeSql(sql,values, function(rows) {
      //  var results = [];
      //  for (var i=0; i<rows.length; i++) {
      //    var r = rows[i];
      //    var e = rowToEntity(session, entityName, r, mainPrefix);
      //    results.push(e);
      //    session.add(e);
      //  }
      //  callback(results);
      //});
    }
  }

  //
  // nicer syntax for building query collections
  //
  EntityClass.collection = function(session, options) {
    var args = persistence.argspec.getArgs(arguments, [
      { name: 'session', optional: true, check: persistence.isSession, defaultValue: persistence },
      { name: 'options', optional: true, check: isObject, defaultValue: {} }
    ]);
    var session = args.session;
    var options = args.options;
    var collection = EntityClass.all(session);

    if (options.where) {
      var property = options.where[0];
      var operator = options.where[1];
      var value = options.where[2];
      collection = collection.filter(property, operator, value)
    }

    if (options.order) {
      var property = options.order.split(" ")[0];
      var ascending = !/DESC/.exec(options.order);
      collection = collection.order(property, ascending);
    }

    if (options.limit) {
      collection = collection.limit(options.limit);
    }
    return collection;
  }
}
persistence.entityDecoratorHooks.push(extendEntity);

