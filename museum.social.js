/**
 * Tarihi eser collection'u
 * Başlık,
 * İçerik
 * Fotoğraflar -> Bir tarihi eserin birden fazla fotoğrafı olabilir.
 * Beaconlar -> Bir tarihi eserin etrafında birden fazla beacon olabilir.
 * @type {Mongo.Collection}
 */
TarihiEser = new Mongo.Collection('TarihiEser');
Fotograflar = new Mongo.Collection('Fotograflar');
Beaconlar = new Mongo.Collection('Beaconlar');


TarihiEser.helpers({

  fotograflar: function () {
    return Fotograflar.find({eserId:this._id});
  },
  beaconlar: function () {
    return Beaconlar.find({eserId:this._id});
  }

});

Beaconlar.helpers({

  eser: function () {
    return TarihiEser.findOne({_id:eserId});
  }

});

Fotograflar.helpers({

  eser: function () {
    return TarihiEser.findOne({_id:eserId});
  }

});



if (Meteor.isClient) {

  // Set default page id is one!
  Session.set('pageId',1);
  Session.set('eserId',0);


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

  Template.main.helpers({
    'eserler': function () {
      return TarihiEser.find();
    }
  });

  Template.info.helpers({
    'eser': function () {
      // Eser ıd değerini sessiondan alalım
      var eserId = Session.get('eserId');
      //console.log(eserId);
      return TarihiEser.findOne(eserId);
    }
  });


  // Tab links
  $(document).on('click','.tab-link', function () {

    var link = $(this);

    eserId = link.attr('data-id');


    if ( eserId == null)
    {
      //console.log("eser id boş");
      Session.set('eserId',0);
    }
    else
    {
      //console.log(eserId);
      Session.set('eserId',eserId);
    }


    var links =  $('.tab-link');

    links.removeClass('active');
    //link.addClass('active');

    $('.'+link.attr('id')).addClass('active');


    Session.set('pageId',link.attr('id'));
  });


  console.log("Merhaba client!");
}

if (Meteor.isServer) {
  console.log("Merhaba server!");
}
