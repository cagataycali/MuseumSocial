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


  var myMessages = myApp.messages('.messages', {
    autoLayout: true
  });

// If we need to use custom DOM library, let's save it to $$ variable:
  var $$ = Dom7;


  Template.content.helpers({
    'state':function (i) {
      return Session.get('pageId') == i;
    },
    'message': function (i) {
      return Session.get('messageId') == i;
    }
  });


  $(document).on('click','.mesaj', function () {
    Session.set('messageId',2);
  });

  Template.main.helpers({
    'item':function (i) {
      return Session.get('itemId') == i;
    }
  });

  // Tab links
  $(document).on('click','.tab-link', function () {

    //Mesajlar sayfasına dönsün.
    Session.set('messageId',1);

    //İtem ıd set!
    Session.set('itemId',1);


    var link = $(this);

    var links =  $('.tab-link');

    links.removeClass('active');
    //link.addClass('active');

    $('.'+link.attr('id')).addClass('active');


    Session.set('pageId',link.attr('id'));
    //console.log(link.attr('id'));
  });

  $(document).on('deleted','.swipeout', function () {
    console.log("Swipeout deleted");
  });


  $(document).on('opened','.swipeout', function () {
    console.log("Swipeout opened");
  });

  $(document).on('click','.mark', function () {
    //İtem ıd set!
    Session.set('itemId',2);

  });

  $(document).on('click','.reply', function () {
    //İtem ıd set!
    Session.set('itemId',3);

  });


  console.log("Merhaba client!");
}

if (Meteor.isServer) {
  console.log("Merhaba server!");
}
