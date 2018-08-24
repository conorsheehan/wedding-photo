var instagram = (function() {
  return {
    initialize: function(tag) {
      var self = this;
      this.clientId = 'db14318e793346bfbe64869bbba54718';
      this.redirectURI = 'https://wedding-photo-82ecc.firebaseapp.com/';
      this.accessToken = undefined;
      this.tag = tag;
      this.photoData = [];
      this.isAuthorized = false;

      console.log('authorize', this.authorize());

      return this;
    },

    authorize: function() {
      var accessToken = this.getAccessTokenFromHash();
      if(accessToken) {
        this.accessToken = accessToken;
        this.isAuthorized = true;
      } else {
        this.accessToken = undefined;
        this.isAuthorized = false;
      }
      return this.isAuthorized;
    },

    getAccessTokenFromHash: function() {
      var label = "access_token=";
      var hash = window.location.hash;
      if(hash && hash.indexOf(label)) {
        return hash.substr(hash.indexOf(label) + label.length);
      } else {
        return false;
      }
    },

    getAuthURL: function() {
      return 'https://api.instagram.com/oauth/authorize/?client_id=' + this.clientId + '&redirect_uri=' + this.redirectURI + '&response_type=token';
    },

    /*
      https://api.instagram.com/v1/tags/TAG/media/recent?access_token=ACCESSTOKEN
    */
    requestPhotos: function() {
      var url = 'https://api.instagram.com/v1/tags/' + this.tag + '/media/recent?access_token=' + this.accessToken;

      return $.ajax({
        url: url,
        context: this
      }).done(function(response) {
        this.setPhotoData(response);
      });
    },

    setPhotoData: function(response) {
      this.photoData = this.parsePhotos(response);
      return this;
    },

    parsePhotos: function(response) {
      return _.map(response.data, function(photoData) {
        return photoData.images.standard_resolution;
      });
    }

  };
})();

var app = (function() {
  return {
    initialize: function(tag) {
      this.tag = tag;
      this.photos = [];
      this.instagram = instagram.initialize(tag);
      this.speed = 2000;
      this.interval = undefined;
      this.counter = 0;
      this.$photo = $('.photo');
      this.$auth = $('.auth');
      this.addHandlers()
          .render();
      return this;
    },

    addHandlers: function() {
      return this;
    },

    fetch: function() {
      var self = this;

      return this.instagram.requestPhotos()
        .done(function() {
          self.setPhotos(instagram.photoData)
              .renderPhotoStream();
        });
    },

    setPhotos: function(photoData) {
      this.photos = photoData;
      this.randomize();
      return this;
    },

    randomize: function() {
      this.photos = _.shuffle(this.photos);
      return this;
    },

    render: function() {
      var self = this;

      if(this.instagram.isAuthorized) {
        this.fetch().done(function() {
          self.renderPhotoStream();
        });
      } else {
        this.renderAuth();
      }
      return this;
    },

    renderAuth: function() {
      this.$photo.hide();
      this.$auth.show();
      this.$auth.find('.cta').attr('href', this.instagram.getAuthURL());
      return this;
    },

    renderPhotoStream: function() {
      this.$auth.hide();
      this.$photo.show();
      this.renderPhoto(this.photos[this.counter]);
      this.renderTag();
      this.start();
      return this;
    },

    renderPhoto: function(photo) {
      this.$photo.css('background-image', 'url(' + photo.url + ')');
      return this;
    },

    renderTag() {
      $('.hashtag').text('#' + this.tag);
      return this;
    },

    start: function() {
      var self = this;

      this.interval = window.setInterval(function() {
        self.next();
      }, this.speed);
    },

    next: function() {
      if(this.counter === this.photos.length - 1) {
        this.counter = 0;
      } else {
        this.counter += 1;
      }

      this.renderPhoto(this.photos[this.counter]);

      return this;
    },

    stop: function() {
      window.clearInterval(this.interval);
    }

  };
})();

$(function() {
  var tag = 'DoolsFallInLove';
  app.initialize(tag);
});
