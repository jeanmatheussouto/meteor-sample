var Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
	Template.body.helpers({
    tasks: function () {
      console.log('Body.tasks helper is running');
      if (Session.get("hideCompleted")) {
        return Tasks.find({checked: {$ne: true}, owner: Meteor.userId()}, {sort: {createdAt: -1}});
      } else {
        return Tasks.find({owner: Meteor.userId()}, {sort: {createdAt: -1}});
      }
    },
    
    hideCompleted: function () {
      return Session.set("hideCompleted");
    },

    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}, owner: Meteor.userId()}).count();
    }
  });

  Template.body.events({
    "submit .new-task": function(event) {
      var task = event.target.task;
      Meteor.call('addTask', task.value);

      task.value = '';
      
      // Prevent default form submit
      event.preventDefault();
    },

    "change .hide-completed input": function (event){
      Session.set('hideCompleted', event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-checked": function() {
      Meteor.call('setChecked', this._id, !this.checked);
    },

    "click .delete": function(){
      Meteor.call('deleteTask', this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function(text){
    if(!Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      owner: Meteor.userId(),
      username: Meteor.user().username || Meteor.user().profile.name,
      createdAt: new Date()
    });
  },

  deleteTask: function(taskId){
    Tasks.remove(taskId);
  },

  setChecked: function(taskId, setChecked){
    Tasks.update(taskId, {$set: {checked: setChecked}});
  }
});