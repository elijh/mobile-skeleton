//
// SETUP and CONFIGURATION
//

function setup() {
    initializeApp("Skeleton App");

    // 
    // setup database
    //

    defineDatabase({seed:'data.json'}, function() {
        Fruit = defineModel({
            table: 'fruits',
            fields: {
                name: "TEXT",
                color: "TEXT",
                id: "INT"
            }
        });     
    });
}

//
// EVENTS
//

$('#home').live('pageinit', function() {
    // resetDB();
});

$('#listing').live('pagebeforeshow', function() {

    // populate fruit list
    ul = $(".fruit_list");
    ul.empty(); // clear list
    Fruit.findAll({}, function(rows) {
    rows.forEach(function(record) {
        var li = "<li><a data-id='{id}'>{name}</a></li>".interpolate(record);
        ul.append(li);
    });
    ul.listview('refresh');
  });
});

$('.fruit_list a').live('click', function() {
    var fruit_id = $(this).attr('data-id');
    Fruit.findByID(fruit_id, function(record) {
        showFruit(record);
    });
});

//
// VIEWS
//

function showFruit(fruit) {
    $('.fruit_title').html(fruit.name);
    $('.fruit_name').html(fruit.name);
    $('.fruit_color').html(fruit.color);
    $.mobile.changePage('#show_fruit');
}