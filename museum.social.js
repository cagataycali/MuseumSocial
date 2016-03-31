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

    processed_data = [];

    Deps.autorun(function (c) {
        console.log('run');
        var cursor = Beaconlar.find();
        if (!cursor.count()) return;

        cursor.forEach(function (row) {
            processed_data.push(
                {
                    id: row.eserId,
                    uuid: row.uuid,
                    major: 5,
                    minor: 1000
                }
            );

        });
        //console.log(processed_data);

        // Own data
        //processed_data.push(
        //    {
        //        id: 'cagatay',
        //        uuid: 'B0702880-A295-A8AB-F734-031A98A512DE',
        //        major: 5,
        //        minor: 1000
        //    }
        //);

        // Save beacons in session
        Session.set('beacons',processed_data);
        c.stop();
    });

    //console.log(Session.get('beacons'));



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
    },
    'beaconlar': function () {
        return Session.get('mNearestBeacon');
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
      //Session.set('eserId',0);
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

if (Meteor.isCordova) {
    var app = (function()
    {
        // Application object.
        var app = {};

        // History of enter/exit events.
        var mRegionEvents = [];

        // Nearest ranged beacon.
        var mNearestBeacon = null;

        // Timer that displays nearby beacons.
        var mNearestBeaconDisplayTimer = null;

        // Background flag.
        var mAppInBackground = true;

        // Background notification id counter.
        var mNotificationId = 0;


        // Mapping of region event state names.
        // These are used in the event display string.
        var mRegionStateNames =
        {
            'CLRegionStateInside': 'Enter',
            'CLRegionStateOutside': 'Exit'
        };

        // Here monitored regions are defined.
        // TODO: Update with uuid/major/minor for your beacons.
        // You can add as many beacons as you want to use.

        //var mRegions = Session.get('beacons');
        var mRegions =
            [
                {
                    id: 'cagatay',
                    uuid: 'B0702880-A295-A8AB-F734-031A98A512DE',
                    major: 5,
                    minor: 1000
                },
                {
                    id: 'kemal',
                    uuid: 'B0702880-A295-A8AB-F734-031A98A512DC',
                    major: 5,
                    minor: 1000
                }


            ];

        // Region data is defined here. Mapping used is from
        // region id to a string. You can adapt this to your
        // own needs, and add other data to be displayed.
        // TODO: Update with major/minor for your own beacons.
        var mRegionData =
        {
            'heykel': 'Düşünen adam'
        };

        app.initialize = function()
        {
            document.addEventListener('deviceready', onDeviceReady, true);
            document.addEventListener('pause', onAppToBackground, true);
            document.addEventListener('resume', onAppToForeground, true);
        };

        function onDeviceReady()
        {


            startMonitoringAndRanging();
            startNearestBeaconDisplayTimer();
            displayRegionEvents();
        }

        function onAppToBackground()
        {
            mAppInBackground = true;
            stopNearestBeaconDisplayTimer();
        }

        function onAppToForeground()
        {
            mAppInBackground = false;
            startNearestBeaconDisplayTimer();
            displayRegionEvents();
        }

        function startNearestBeaconDisplayTimer()
        {
            mNearestBeaconDisplayTimer = setInterval(displayNearestBeacon, 1000);
        }

        function stopNearestBeaconDisplayTimer()
        {
            clearInterval(mNearestBeaconDisplayTimer);
            mNearestBeaconDisplayTimer = null;
        }

        function startMonitoringAndRanging()
        {
            function onDidDetermineStateForRegion(result)
            {
                saveRegionEvent(result.state, result.region.identifier);
                displayRecentRegionEvent();
            }

            function onDidRangeBeaconsInRegion(result)
            {
                updateNearestBeacon(result.beacons);
            }

            function onError(errorMessage)
            {
                console.log('Monitoring beacons did fail: ' + errorMessage);
            }

            // Request permission from user to access location info.
            cordova.plugins.locationManager.requestAlwaysAuthorization();

            // Create delegate object that holds beacon callback functions.
            var delegate = new cordova.plugins.locationManager.Delegate();
            cordova.plugins.locationManager.setDelegate(delegate);

            // Set delegate functions.
            delegate.didDetermineStateForRegion = onDidDetermineStateForRegion;
            delegate.didRangeBeaconsInRegion = onDidRangeBeaconsInRegion;

            // Start monitoring and ranging beacons.
            startMonitoringAndRangingRegions(mRegions, onError);
        }

        function startMonitoringAndRangingRegions(regions, errorCallback)
        {
            // Start monitoring and ranging regions.
            for (var i in regions)
            {
                startMonitoringAndRangingRegion(regions[i], errorCallback);
            }
        }

        function startMonitoringAndRangingRegion(region, errorCallback)
        {
            // Create a region object.
            var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
                region.id,
                region.uuid,
                region.major,
                region.minor
            );

            // Start ranging.
            cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
                .fail(errorCallback)
                .done();

            // Start monitoring.
            cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
                .fail(errorCallback)
                .done();
        }

        function saveRegionEvent(eventType, regionId)
        {
            // Save event.
            mRegionEvents.push(
                {
                    type: eventType,
                    time: getTimeNow(),
                    regionId: regionId
                });

            // Truncate if more than ten entries.
            if (mRegionEvents.length > 10)
            {
                mRegionEvents.shift();
            }
        }

        function getBeaconId(beacon)
        {
            return beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
        }

        function isSameBeacon(beacon1, beacon2)
        {
            return getBeaconId(beacon1) == getBeaconId(beacon2);
        }

        function isNearerThan(beacon1, beacon2)
        {
            return beacon1.accuracy > 0
                && beacon2.accuracy > 0
                && beacon1.accuracy < beacon2.accuracy;
        }

        function updateNearestBeacon(beacons)
        {
            for (var i = 0; i < beacons.length; ++i)
            {
                var beacon = beacons[i];
                if (!mNearestBeacon)
                {
                    mNearestBeacon = beacon;
                }
                else
                {
                    if (isSameBeacon(beacon, mNearestBeacon) ||
                        isNearerThan(beacon, mNearestBeacon))
                    {
                        mNearestBeacon = beacon;
                    }
                }
            }
        }

        function displayNearestBeacon()
        {
            if (!mNearestBeacon) { return; }


            if (mNearestBeacon.accuracy <= 1)
            {
                //Alert
                cordova.plugins.notification.local.schedule({
                    id: 1,
                    title: 'Miss gibi tarih kokuyor!',
                    text: 'Yakınlarında bir tarihi eser yakaladım, sen farketmediysen hemen tıkla!',
                    sound: isAndroid ? 'file://sound.mp3' : 'file://beep.caf'
                });

                //navigator.vibrate(1000);
            }


            // Update element.
            //var element = $(
            //    '<li>'
            //    +	'<strong>Nearest Beacon</strong><br />'
            //    +	'UUID: ' + mNearestBeacon.uuid + '<br />'
            //    +	'Major: ' + mNearestBeacon.major + '<br />'
            //    +	'Minor: ' + mNearestBeacon.minor + '<br />'
            //    +	'Proximity: ' + mNearestBeacon.proximity + '<br />'
            //    +	'Distance: ' + mNearestBeacon.accuracy + '<br />'
            //    +	'RSSI: ' + mNearestBeacon.rssi + '<br />'
            //    + '</li>'
            //);

            var element = {
                uuid:mNearestBeacon.uuid,
                distance: mNearestBeacon.accuracy
            };

            Session.set('mNearestBeacon',element);
        }

        function displayRecentRegionEvent()
        {
            if (mAppInBackground)
            {
                // Set notification title.
                var event = mRegionEvents[mRegionEvents.length - 1];
                if (!event) { return; }
                var title = getEventDisplayString(event);
            }
            else
            {

                displayRegionEvents();
            }
        }

        function displayRegionEvents()
        {
            // Clear list.
            $('#events').empty();

            // Update list.
            for (var i = mRegionEvents.length - 1; i >= 0; --i)
            {
                var event = mRegionEvents[i];
                var title = getEventDisplayString(event);
                //var element = $(
                //    '<li>'
                //    + '<strong>' + title + '</strong>'
                //    + '</li>'
                //);
                var element = {
                    title:title
                };
            }

            //todo tüm beaconlar listelenirken

            // If the list is empty display a help text.
            if (mRegionEvents.length <= 0)
            {
                var element = $(
                    '<li>'
                    + '<strong>'
                    +	'Waiting for region events, please move into or out of a beacon region.'
                    + '</strong>'
                    + '</li>'
                );

               //todo : beacon bekleniyor yazısı eklenecek.
            }
        }

        function getEventDisplayString(event)
        {
            return event.time + ': '
                + mRegionStateNames[event.type] + ' '
                + mRegionData[event.regionId];
        }

        function getTimeNow()
        {
            function pad(n)
            {
                return (n < 10) ? '0' + n : n;
            }

            function format(h, m, s)
            {
                return pad(h) + ':' + pad(m)  + ':' + pad(s);
            }

            var d = new Date();
            return format(d.getHours(), d.getMinutes(), d.getSeconds());
        }

        return app;

    })();

    Meteor.startup(function () {

        app.initialize();

    });

}