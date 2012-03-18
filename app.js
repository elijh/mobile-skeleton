//
// SETUP and CONFIGURATION
//

function setup(options) {
    initializeApp(options);
    
    defineDatabase(options, function() {
        Fruit = defineModel({
            table: 'fruits',
            fields: {
                name: "TEXT",
                color: "TEXT"
            }
        });     
    });
}

//
// EVENTS
//

$('#home_page').live('pageinit', function() {
    // app initialization can go here.
});

//
// FRUIT LIST
//

$('.list_fruit_button').live('click', function() {
    Fruit.findAll({order:"name"}, function(rows) {
        showFruitList(rows);
    });
});

//
// FRUIT LIST CLICK
//

$('.fruit_list a').live('click', function() {
    // get the data-id of the link that was clicked
    var id = $(this).attr('data-id');

    // find the record and load its details page
    Fruit.findByID(id, function(record) {
        showFruit(record);
    });
});

//
// COLOR LIST
//

$('.list_colors_button').live('click', function() {
    var sql = 'SELECT *, count(*) as count FROM fruits GROUP BY color ORDER BY color';
    Fruit.findBySql(sql, function(rows) {
        showColorsList(rows);
    });
});

//
// COLOR LIST CLICK
//

$('.color_list a').live('click', function() {
    // get the data-id of the link that was clicked
    var color = $(this).attr('data-id');

    // find the record and load its details page
    Fruit.findAll({where:["color","=",color]}, function(rows) {
        showFruitList(rows, color + " Fruit");
    });
});

//
// VIEWS
//

//
// shows a list of fruit records.
//
// arguments:
//   records -- a list of fruit records (required).
//
function showFruitList(records, title) {
    // update the list with records
    var ul = $(".fruit_list");
    ul.empty(); // clear list
    records.forEach(function(record) {
        var li = buildListItem({id:record.id, label:record.name});
        ul.append(li);
    });

    if (title) {
        $('.fruit_list_title').html(title);
    } else {
        $('.fruit_list_title').html("Fruit");
    }

    // jump to the page
    $.mobile.changePage('#list_fruit_page');

    // refresh the list view
    ul.listview('refresh');
}

//
// shows the list of colors
//
function showColorsList(records) {
    var ul = $(".color_list");
    ul.empty(); // clear list
    records.forEach(function(record) {
        var li = buildListItem({id:record.color, label:record.color, count:record.count});
        ul.append(li);
    });
    $.mobile.changePage('#list_colors_page');
    ul.listview('refresh');
}


//
// shows details for a particular fruit.
//
// arguments:
//   fruit -- a single fruit record (required).
//
function showFruit(fruit) {
    // change the text on the show_fruit page
    $('.fruit_title').html("Fruit: " + fruit.name);
    $('.fruit_name').html(fruit.name);
    $('.fruit_color').html(fruit.color);

    // switch to the show_fruit page.
    $.mobile.changePage('#show_fruit_page');
}
