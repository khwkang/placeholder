define([
    "app",
    "tpl!apps/Dashboard/Instructor/templates/instructor_dashboard.tpl",
    "tpl!apps/Dashboard/Instructor/templates/pending_feedback.tpl",
  ],
  function(VirtualDojo, instructorDashboardTpl, pendingFeedbackTpl) {
    VirtualDojo.module("DashApp.Instructor.View", function(View, VirtualDojo, Backbone, Marionette, $, _){
      

      View.PendingFeedback = Marionette.ItemView.extend({
        className: "user-feedback",
        template: pendingFeedbackTpl,

        events: {
          "click .user-feedback": "clickFeedback"
        },

        clickFeedback: function(e){
          e.preventDefault();
          var feedbackId = this.model.get("id");

          VirtualDojo.trigger("show:feed", {
            feedbackId: feedbackId
          })
        },

        initialize: function() {
        },
        serializeData: function() {
          var model = this.model;
          var instructorName = model.get("instrUsername");
          var classTitle = model.get("classTitle");
          var studentUsername = model.get("studentName");
          var approved = model.get("approved");

          return {
            classTitle: classTitle,
            instructorName: instructorName,
            studentUsername: studentUsername,
            approved: approved
          } 
        }
      });

      View.InstructorDashboard = Marionette.CompositeView.extend({
        template: instructorDashboardTpl,
        childView: View.PendingFeedback,
        childViewContainer: ".feedback-container",
      });
    });
    return VirtualDojo.DashApp.Instructor.View;
  }
);



