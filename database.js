//
// define the database for this app
//

var Fruit = null;

defineDatabase({seed: 'data.json'}, function() {

  Fruit = persistence.define('fruits', {
    name: "TEXT",
    color: "TEXT"
  });

});

