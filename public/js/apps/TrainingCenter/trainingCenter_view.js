define([
    "app",
    "apps/Class/class_app",
    "tpl!apps/TrainingCenter/templates/training_layout.tpl",
    "tpl!apps/TrainingCenter/templates/class_thumb_view.tpl",
    "tpl!apps/TrainingCenter/templates/class_list_view.tpl"
  ],
  function(VirtualDojo, ClassApp, traininglayoutTpl, classThumbViewTpl, classListViewTpl) {
    VirtualDojo.module("TrainingApp.View", function(View, VirtualDojo, Backbone, Marionette, $, _){
      
    // TrainingCenter Layout View 

      View.TrainingLayout = Marionette.LayoutView.extend({
        template: traininglayoutTpl,
        regions: {
          kendoRegion: "#kendo-region",
          qigongRegion: "#qigong-region"
        },
        initialize: function() {
        }
      });
      
      // ClassThumb Itemview
      View.ClassThumb = Marionette.ItemView.extend({

        // className: "class-thumb card",
        template: classThumbViewTpl,

        serializeData: function() {
          var model = this.model;
          var title = model.get("title");
          var description = model.get("description");
          var classImage = model.get("classImage");
          var classVideo = model.get("classVideo");

          return {
            title: title,
            description: description,
            classImage: classImage,
            classVideo: classVideo
          };
        },

        initialize: function() {
          // permission access control 
          if (this.model.get("disciplineId") === 1 ) {
            if (this.model.get("classNum") > UTConfig.currentKendoClass) {
              this.$el.addClass("class-thumb card disabled");
            } else {
              this.$el.addClass("class-thumb card");
            }
          } else {
            if (this.model.get("classNum") > UTConfig.currentQigongClass) {
              this.$el.addClass("class-thumb card disabled")
            } else {
              this.$el.addClass("class-thumb card");
            }
          }
          
          _.bindAll(this, "onCardClick");

          var that = this;
          this.$el.on("click", this.onCardClick);

          // video thumbnail
          var classVideo = this.model.get("classVideo");
          if (classVideo) {
            this.$el.on("mouseenter", function() {
              var $video = that.$(".thumbnail-video");
              var vid = $video.get()[0];
              that.$(".img-container").addClass("thumbnail-hidden");
              vid.currentTime = 0;
              vid.play();
            });

            this.$el.on("mouseleave", function() {
              var $video = that.$(".thumbnail-video");
              var vid = $video.get()[0];
              that.$(".img-container").removeClass("thumbnail-hidden");
              vid.pause();
            });
          }
        },
        
        onCardClick: function(event) {
          event.preventDefault();
           var disciplineId = this.model.get("discipline_id"); 
           var classNum = this.model.get("classNum");
            
            // access control 
            if (disciplineId === 1 ) {
              if (classNum > UTConfig.currentKendoClass) {
                console.log("kendo access denied!!")
                return;
              } 
            } else {
              if (classNum > UTConfig.currentQigongClass) {
                console.log("qigong access denied!!")
                return;
              } 
            } 

            VirtualDojo.trigger("show:class", {
              "disciplineId": disciplineId,
              "classNum": classNum
            });
        },
      });

      // ClassList composite view
      View.ClassList = Marionette.CompositeView.extend({
        template: classListViewTpl,
        childView: View.ClassThumb,
        childViewContainer: ".training-container",
        initialize: function() {
        },
        serializeData: function() {
          return {
            title: this.model.get("title"),
            description: this.model.get("description")
          } 
        }
      });
    });
    return VirtualDojo.TrainingApp.View;
  }
);



