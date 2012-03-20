
//
// PRIVATE
//

function open_db(name) {
    return openDatabase(name, '1.0', 'localstorage', 1 * 1024 * 1024);
}

function if_database_empty(name, callback) {
    open_db(name).transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS initialized (id unique)');
        tx.executeSql('SELECT * FROM initialized', [], function(tx, results) {
            if (results.rows.length == 0) {
                callback();
            }
        });
    });
}

function mark_as_initialized(name) {
    open_db(name).transaction(function(tx) {
        tx.executeSql('INSERT INTO initialized (id) VALUES (1)');
    });
}

//
// PUBLIC
//

var appName = null;

function initializeApp(options) {
    appName = options.name;
    if (options.mode == "development") {
        resetDB(); // for development mode, this is much easier. 
    }
    document.title = appName;
    $(document).ready(function(){
        $('.app_title').html(appName);    
    });
}

function defineDatabase(options, callback) {
    persistence.store.websql.config(persistence, options.name, 'local storage', 1 * 1024 * 1024);
    callback();
    persistence.schemaSync(function() {
        if_database_empty(options.name, function() {
            console.log("seeding database");
            // disabling ajax call for now, so we don't need to require webserver.
            //$.ajax({
            //    url: options.seed,
            //    cache: false,
            //    success: function(json) {
                    persistence.load(options.seed, function() {
                        console.log("done");
                        mark_as_initialized(options.name);
                    });
             //   }
            //});
        });
    });
}

//
//  will trigger a re-seeding of the database
//
function resetDB() {
    open_db(appName).transaction(function(tx) {
        tx.executeSql('DROP TABLE initialized');
    });
}

//
// defineModel() -- define a database model.
//
// for example:
//
//   Fruit = defineModel({
//     table: 'fruits',
//     fields: {
//       name: "TEXT",
//       color: "TEXT"
//     }
//   });
//
function defineModel(options) {
    return persistence.define(options.table, options.fields);
}

//
// PROTOTYPE EXTENSIONS
//

//
// "The {speed} {color} fox jumps over the lazy {animal}.".interpolate({speed:'quick',color:'brown',animal:'dog'})
//
String.prototype.interpolate = function(valueMap){
  return this.replace(/\{([^}]+)\}/g, function(dummy, v){
    return valueMap[v];
  });
};


//
// UI HELPERS
//


//
// build a li. values supported are id, label, count.
//
function buildListItem(values) {
    if (values.count) {
      return "<li class='ui-li ui-li-static ui-body-c'><a data-id='{id}'>{label}<span class='ui-li-count ui-btn-up-c ui-btn-corner-all'>{count}</span></a></li>".interpolate(values);
    } else {
      return "<li class='ui-li ui-li-static ui-body-c'><a data-id='{id}'>{label}</a></li>".interpolate(values);
    }
}
