var instagram = (function() {
  return {
    initialize: function(tag) {
      var self = this;
      this.clientId = 'CLIENTID';
      this.accessToken = 'TOKEN';
      this.tag = tag;
      this.photoData = [];
      return this;
    },
    /*
      https://api.instagram.com/oauth/authorize/?client_id=db14318e793346bfbe64869bbba54718&redirect_uri=http://melissagotconned.com&response_type=token
    */
    authorize: function() {
      return this;
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
      this.addHandlers();
      return this;
    },
    addHandlers: function() {
      return this;
    },
    fetch: function() {
      var self = this;
      this.instagram.requestPhotos()
          .done(function() {
            self.setPhotos(instagram.photoData)
                .render();
          });
      return this;
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
      this.renderPhoto(this.photos[this.counter]);
      this.renderTag();
      this.start();
      return this;
    },
    renderPhoto: function(photo) {
      var $photo = $('.photo');
      $photo.css('background-image', 'url(' + photo.url + ')');
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
  app.fetch();
});
