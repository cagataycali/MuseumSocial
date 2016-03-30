if (Meteor.isClient) {

  // Set default page id is one!
  Session.set('pageId',1);
  Session.set('itemId',1);
  Session.set('messageId',1);


// Initialize app
  var myApp = new Framework7({
    pushState: true
    // ... other parameters
  });


// If we need to use custom DOM library, let's save it to $$ variable:
  var $$ = Dom7;

  Template.content.helpers({
    'state':function (i) {
      return Session.get('pageId') == i;
    }
  });


  // Tab links
  $(document).on('click','.tab-link', function () {

    //İtem ıd set!
    Session.set('itemId',1);

    var link = $(this);

    var links =  $('.tab-link');

    links.removeClass('active');
    //link.addClass('active');

    $('.'+link.attr('id')).addClass('active');


    Session.set('pageId',link.attr('id'));
  });


  $(document).on('click','.mark', function () {
    //İtem ıd set!
    Session.set('pageId',2);

  });

  console.log("Merhaba client!");
}

if (Meteor.isServer) {
  console.log("Merhaba server!");
}
