//
// our custom extensions to the persistence library.
//

function extendEntity(EntityClass) {
  //
  // find()
  // an alias for load()
  //
  EntityClass.findByID = function(session, tx, id, callback) {
    EntityClass.load(session, tx, id, callback);
  };

  //
  // findOne()
  //
  EntityClass.findOne = function(session, tx, options, callback) {
    EntityClass.collection(session, tx, options).one(tx, callback);
  };

  //
  // findAll()
  //
  EntityClass.findAll = function(session, tx, options, callback) {
    EntityClass.collection(session, tx, options).list(tx, callback);
  };

  //
  // nicer syntax for building query collections
  //
  EntityClass.collection = function(session, tx, options, callback) {
    var args = persistence.argspec.getArgs(arguments, [
      { name: 'session', optional: true, check: persistence.isSession, defaultValue: persistence },
      { name: 'tx', optional: true, check: persistence.isTransaction, defaultValue: null },
      { name: 'options', optional: false }
//        { name: 'callback', optional: true, check: persistence.argspec.isCallback(), defaultValue: function(){} }
    ]);
    session = args.session;
    tx = args.tx;
    callback = args.callback;
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










