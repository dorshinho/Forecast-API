;
(function(exports) {


    Backbone.GeoModel = Backbone.Model.extend({
        geo: function() {
            var x = $.Deferred(),
                self = this;
            navigator.geolocation.getCurrentPosition(function(position) {
                self.set('position', position, {
                    silent: true
                })
                x.resolve(position);
            }, function(e) {
                x.fail(e)
            }, {
                timeout: 12000, //12s
                maximumAge: 10 * 60 * 1000 //600s, or 10m
            })
            return x;
        },
        geofetch: function() {
            var self = this;
            return this.geo().then(function(position) {
                return self.fetch().then(function() {
                    console.log(self)
                })
            })
        }
    })

    var GeoWeatherModel = Backbone.GeoModel.extend({
        url: function() {
            return [
                "https://api.forecast.io/forecast/",
                this.get('access_token'),
                "/",
                this.get("position").coords.latitude + ',' + this.get("position").coords.longitude,
                "?callback=?"
            ].join('')
        }
    })

    Backbone.TemplateView = Backbone.View.extend({
        cache: {},
        stream: function(url) {
            var x = $.Deferred();
            if (this.cache[url]) {
                x.resolve(cache[url]);
            } else {
                $.get(url).then((function(d) {
                    this.cache[url] = _.template(d);
                    x.resolve(_.template(d));
                }).bind(this));
            }
            return x;
        },
        loadTemplate: function(name) {
            return this.stream('./templates/' + name + '.html');
        },
        initialize: function(options) {
            this.options = options;
            this.model && this.model.on("change", this.render.bind(this));
        },
        render: function() {
            var self = this;
            this.loadTemplate(this.options.view).then(function(fn) {
                self.model && (self.el.innerHTML = fn(self.model.toJSON()));
            })
        }
    })

    var m = new GeoWeatherModel({
        access_token: "98ac5c9976432c87264125f629576420"
    });
    var v = new Backbone.TemplateView({
        el: ".main",
        model: m,
        view: "search"
    })

    m.geofetch().then(function(data) {
        data; // { ... } --> data from network request
    })

    exports.m = m;

})(typeof module === "object" ? module.exports : window);
