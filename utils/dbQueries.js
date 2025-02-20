

var db = require('../app/config');
var Class = require('../app/models/classes.js');
var Discipline = require('../app/models/disciplines.js');
var Feedback = require('../app/models/feedbacks.js');
var Instructor = require('../app/models/instructor.js');
var Level = require('../app/models/levels.js');
var Progress = require('../app/models/progress.js');
var Rank = require('../app/models/ranks.js');
var Student = require('../app/models/student.js');

/**
 * An object holding our entire helper functions.
 * @type {Object}
 * @namespace
 */
var DBQuery = {
  
/**
 * Insert new Student to DB.
 * @memberof DBQuery
 * @param  {object}   user     Object information of new Student.
 * @param  {Function} callback A callback funciton.
 */
  newStudent: function (user, callback) {
    db.knex('students')
    .where('username', user.username)
    .select('*')
    .catch(function(err){
      console.log(err);
      if(callback){
        callback({
          result: false,
          message: 'Sorry, internal server error.'
        });
      }
    })
    .then(function(exist){
      if(!exist || exist.length===0){
        db.knex('instructors')
        .where('username', user.username)
        .select('*')
        .then(function(exist){
          if(!exist || exist.length===0){
            new Student(user)
            .save()
            .catch(function(err){
              console.log('Error in newStudent: ',err);
              if(callback){
                callback({
                  result: false,
                  message: 'Sorry, internal server error.'
                });
              }
            })
            .then(function(data){
              console.log('Saved new student user to DB.');
              if(callback){
                callback({
                  result: true,
                });
              }
            });
          }else{
            // console.log('Instructor already used that username.');
            if(callback){
                callback({
                  result: false,
                  message: 'Instructor already used that username.'
                });
            }
          }
        });
      }else{
        // console.log('Student already used that username.');
        if(callback){
          callback({
            result: false,
            message: 'Student already used that username.'
          });
        }
      }
    });
  },

  /**
   * Insert new Instructor to DB. Will check for any collisions and invoke callback with results.
   * @memberOf DBQuery
   * @param  {object}   user     Holds information on new Instructor.
   * @param  {string}   key      Unique key to register as an Instructor.
   * @param  {Function} callback Callback function.
   */
  newInstructor: function (user, key, callback){
    db.knex('instructors')
    .where('username', user.username)
    .select('*')
    .catch(function(err){
      console.log(err);
      if(callback){
        callback({
          result: false,
          message: 'Sorry, internal server error.'
        });
      }
    })
    .then(function(exist){
      if(!exist || exist.length===0){
        //Check if instructor uses that username
        db.knex('students')
        .where('username', user.username)
        .select('*')
        .then(function(exist){
          if(!exist || exist.length===0){
            // db.knex('keys')
            // .where('key', key)
            // .then(function(exist){
            //   if(!exits || exist.length===0){
            //     if(callback){
            //       callback({
            //         result: false,
            //         message: 'Key does not exist. Make sure Key is proper.'
            //       });
            //     }
            //   }else{
            //     if(exist.used){
            //       if(callback){
            //         callback({
            //           result: false,
            //           message: 'That key has been used.'
            //         });
            //       }
            //     }else{
                  new Instructor(user)
                  .save()
                  .catch(function(err){
                    console.log('Error in newInstructor: ',err);
                    if(callback){
                      callback({
                        result: false,
                        message: 'Sorry, internal server error.'
                      });
                    }
                  })
                  .then(function(data){
                    console.log('Saved new Instructor user to DB.');
                    // exist.save( { used: true }, {patch: true} );
                    if(callback){
                      callback({
                        result: true,
                      });
                    }
                  });
            //     }
            //   }
            // });
          }else{
            // console.log('Instructor already used that username.');
            if(callback){
                callback({
                  result: false,
                  message: 'Student already used that username.'
                });
            }
          }
        });
      }else{
        // console.log('Student already used that username.');
        if(callback){
          callback({
            result: false,
            message: 'Instructor already used that username.'
          });
        }
      }
    });
  },


  /**
   * Either saves or updates a rank of a user. 
   * @memberOf DBQuery
   * @param {object}   info         Object with info on rank.
   * @param {Boolean}  isInstructor Is this for Instructor or not?
   * @param {Function} callback     Callback function.
   */
  setRank: function(info, isInstructor, callback){
    if(!isInstructor){
      new Student({id: info.student_id})
      .fetch()
      .then(function(aStudent){
        if(aStudent){
          new Discipline({id: info.discipline_id})
          .fetch()
          .then(function(aDisc){
            if(aDisc){
              new Rank({
                student_id: aStudent.get('id'),
                discipline_id: aDisc.get('id'),
              }).fetch()
              .then(function(aRank){
                if(aRank){
                  aRank.save(info,
                    {patch: true})
                  .then(function(){
                    callback('Rank updated.');
                  })
                }else{
                  new Rank(info)
                  .save()
                  .then(function(){
                    callback('Created new rank.');
                  })
                }
              });
            }else{
              callback('Discipline does not exist.');
            }
          });
        }else{
          callback('Student does not exist.');
        }
      });
    }else{
      new Instructor({id: info.instructor_id})
      .fetch()
      .then(function(aInstructor){
        if(aInstructor){
          new Discipline({id: info.discipline_id})
          .fetch()
          .then(function(aDisc){
            if(aDisc){
              new Rank({
                instructor_id: aInstructor.get('id'),
                discipline_id: aDisc.get('id'),
              }).fetch()
              .then(function(aRank){
                if(aRank){
                  aRank.save(info,
                    {patch: true})
                  .then(function(){
                    callback('Rank updated.');
                  })
                }else{
                  new Rank(info)
                  .save()
                  .then(function(){
                    callback('Created new rank.');
                  })
                }
              });
            }else{
              callback('Discipline does not exist.');
            }
          });
        }else{
          callback('Instructor does not exist.');
        }
      });
    }
  },

  // /**
  //  * Create a new class. WIll check if class title already exists.
  //  * @classInfo  {[Object]} Object with new class info
  //  * @callback {[Function]}  Callback function
  //  */
  // newClass: function(classInfo, callback){

  //   new Discipline()
  //   .where({
  //     id: classInfo.discipline_id
  //   })
  //   .fetch()
  //   .then(function(discipline){
  //     if(discipline){
  //       new Instructor({
  //         id: classInfo.instructor_id
  //       })
  //       .fetch()
  //       .then(function(instructor){
  //         if(instructor){
  //           new Class({
  //             discipline_id: discipline.get('id'),
  //             classNum: classInfo.classNum
  //           }).fetch()
  //           .then(function(aClass){
  //             if(!aClass){
  //               discipline.save({
  //                   classCount: discipline.get('classCount')+1,
  //                 },{patch: true})
  //                 .then(function(){
  //                   console.log('Incremented discipline classCount.');

  //                   new Class(classInfo)
  //                   .save()
  //                   .then(function(){
  //                     callback('Class Saved.');
  //                   })
  //                 })
  //             }else{
  //               callback('Class of that number already exists in this discipline.');
  //             }
  //           });
  //         }else{
  //           callback('Instructor does not exist');
  //         }
  //       })
  //     }else{
  //       callback('Discipline does not exist');
  //     }
  //   });
  // },

  // /**
  //  * When student submits a video. Only one can exist at a time per student.
  //  * If student have submitted video to a class before, will overwrite that URL.
  //  * @vidInfo  {[Object]}
  //  * @callback {[Function]} 
  //  */
  // submitStudentFeedback: function(username, classNum, disciplineID, feedback, callback){
  //   var checkDiscipline = this.getDisciplineByID;
  //   this.getStudentUsing('username', username, function(student){
  //     if(!student){
  //       callback({
  //         result: false,
  //         message: 'Invalid student username',
  //       });
  //     }else{
  //       //Get Discipline with ID
  //       checkDiscipline(disciplineID, function(discipline){
  //         if(!discipline){
  //           callback(discipline);
  //         }else{
  //           //Get class with classNum and disciplineID
  //           new Class({
  //             discipline_id: disciplineID,
  //             classNum: classNum
  //           }).fetch()
  //           .then(function(theClass){
  //             if(!theClass){
  //               callback(theClass);
  //             }else{
  //               submitFeedback(student.id, theClass.get('id'), theClass.get('instructor_id'));
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
    
  //   var submitFeedback = function(studentID, classID, instructorID){
  //     var newFeedback = new Feedback({
  //       videoURL: feedback.videoURL,
  //       approved: feedback.approved,
  //       student_id: studentID,
  //       class_id: classID,
  //       instructor_id: instructorID,
  //     });

  //     new Feedback({
  //       student_id: studentID,
  //       class_id: classID,
  //       instructor_id: instructorID,
  //     }).fetch()
  //     .then(function(exist){
  //       if(!exist){
  //         newFeedback.save()
  //         .catch(function(err){
  //           console.log(err);
  //           callback({
  //             result: false,
  //             message: 'Internal Server Error.'
  //           });
  //         })
  //         .then(function(){
  //           console.log('Saved student feedback.');
  //           callback({
  //             result: true,
  //           });
  //         });
  //       }else{
  //         exist.save({
  //           videoURL: feedback.videoURL,
  //           comment: feedback.comment,
  //           student_id: studentID,
  //           class_id: classID,
  //           instructor_id: instructorID,
  //         }, {patch: true})
  //         .catch(function(err){
  //           console.log(err);
  //           callback({
  //             result: false,
  //             message: 'Internal Server Error.'
  //           });
  //         })
  //         .then(function(){
  //           console.log('Updated student feedback.');
  //           callback({
  //             result: true,
  //           });
  //         });
  //       }
  //     });
  //   };
  // },


  // replyToFeedback: function(feedbackID, update, callback){
  //   new Feedback({
  //     id: feedbackID
  //   }).fetch()
  //   .then(function(feedback){
  //     if(!feedback){
  //       callback({
  //         result: false,
  //         message: 'Feedback of that ID not found.'
  //       });
  //     }else{
  //       feedback.save({
  //         approved: update.approved,
  //         comment: update.comment,
  //       }, {patch: true})
  //       .then(function(feed){
  //         console.log('Feedback updated');

  //         if(update.approved){
  //           //Here we have to update student's progress and rank.
  //           new Progress()
  //           .where({
  //             student_id: feed.get('student_id')
  //           })
  //           .fetch()
  //           .then(function(progress){
  //             console.log('!!!!!!!!!!!!!!');
  //             if(progress){
  //               //Get the current classNum
  //               new Class()
  //               .where({
  //                 id: progress.get('class_id')
  //               })
  //               .fetch()
  //               .then(function(oldClass){
  //                 new Class()
  //                 .where({
  //                   discipline_id: oldClass.get('discipline_id'),
  //                   classNum: oldClass.get('classNum')+1
  //                 })
  //                 .fetch()
  //                 .then(function(nextClass){
  //                   if(nextClass){
  //                     progress.save({
  //                       class_id: nextClass.get('id')
  //                     }, {patch: true})
  //                     .then(function(data){
  //                       console.log('Update progress from '+oldClass.get('title')+' to '+nextClass.get('title'));

  //                       //Still need to do upgrade student's rank.

  //                       callback(feed);
  //                     });
  //                   }else{
  //                     console.log('Class of that number does not exist in this discipline.');
  //                     callback({
  //                       result: true,
  //                       message: 'You have reached the top class of this discipline.'
  //                     });
  //                   }
  //                 });
  //               });
  //             }
  //           });
  //         }else{
  //           console.log('Student did not pass.');
  //           callback(feed);
  //         }
  //       });
  //     } 
  //   });
  // },

  // /**
  //  * Submits instructor's video for a class. Will check and do nothing 
  //  * if same vid already exists in that class.
  //  * @vidInfo  {[Object]} Information on the new video.
  //  * @return {[Boolean]}  If successful
  //  */
  // newLevel: function (infoObject, callback){
  //   new Class({
  //     id: infoObject.class_id
  //   })
  //   .fetch()
  //   .then(function(aClass){
  //     if(aClass){
  //       new Level({
  //         class_id: aClass.get('id'),
  //         levelNum: infoObject.levelNum,
  //       }).fetch()
  //       .then(function(aLevel){
  //         if(!aLevel){
  //           aClass.save({
  //             levelCount: aClass.get('levelCount')+1,
  //           }, {patch: true})
  //           .then(function(){
  //             console.log('LevelCount ++');
  //             new Level(infoObject)
  //             .save()
  //             .then(function(){
  //               callback('Level saved.')
  //             })
  //           })
  //         }else{  
  //           aLevel.save(infoObject, {patch: true})
  //           .then(function(){
  //             console.log('Level Updated');
  //           });
  //         }
  //       });
  //     }else{
  //       callback('Class of that ID not found.')
  //     }
  //   })

  // },

  // newDiscipline: function(discipline, callback){
  //   new Discipline({
  //     title: discipline.title
  //   }).fetch()
  //   .then(function(exist){
  //     if(!exist){
  //       new Discipline(discipline)
  //       .save()
  //       .catch(function(err){
  //         console.log(err);
  //         if(callback){
  //           callback({
  //             result: false,
  //             message: 'Internal Server Error.'
  //           });
  //         }
  //       })
  //       .then(function(){
  //         if(callback){
  //           callback({
  //             result:true
  //           });
  //         }
  //       });
  //     }else{
  //       if(callback){
  //         callback({
  //           result: false,
  //           message: 'That discipline of that title already exists.'
  //         });
  //       }
  //     }
  //   });
  // },

  // setProgress: function(username, classTitle, levelNum, callback){
  //   var studentID; 
  //   var classID;

  //   new Student({
  //     username: username
  //   }).fetch()
  //   .then(function(exist){
  //     if(exist){
  //       studentID =  exist.get('id');
  //       checkClass();
  //     }else{
  //       callback({
  //         result: false,
  //         message: 'Could not find student of that username.'
  //       });
  //     }
  //   });
  //   var checkClass = function(){
  //     new Class({
  //       title: classTitle
  //     }).fetch()
  //     .then(function(exist){
  //       if(exist){
  //         classID = exist.get('id');
  //         saveProgress();
  //       }else{
  //         callback({
  //           result: false,
  //           message: 'Could not find class of that title.'
  //         });
  //         return;
  //       }
  //     });
  //   };

  //   var saveProgress = function(){
  //     var newProgress = new Progress({
  //       student_id: studentID,
  //       class_id: classID,
  //       levelNum: levelNum
  //     });

  //     newProgress.fetch()
  //     .then(function(data){
  //       if(data){
  //         //update progress
  //         data.save({levelNum: levelNum}, {patch: true})
  //         .catch(function(err){
  //           console.log(err);
  //           callback({
  //             result:false,
  //             message: 'Internal Server Error.'
  //           });
  //         })
  //         .then(function(){
  //           console.log('Progress updated.');
  //           callback({
  //             result: true
  //           });
  //         });
  //       }else{
  //         newProgress.save()
  //         .catch(function(err){
  //           console.log(err);
  //           callback({
  //             result:false,
  //             message: 'Internal Server Error.'
  //           });
  //         })
  //         .then(function(){
  //           console.log('Progress saved.');
  //           callback({
  //             result: true
  //           });
  //         });
  //       }
  //     });
  //   };
  // },


  // //============================================================================//
  //                                 //Get Queries//
  // //============================================================================//
  
  // getDisciplineByTitle: function(title, callback){
  //   new Discipline({
  //     title: title
  //   }).fetch()
  //   .then(function(exist){
  //     if(exist){
  //      callback(exist.attributes);
  //     }else{
  //       console.log('Discipline of that title does not exist.');
  //       callback({
  //         result: false,
  //         message: 'No discipline with that title.'
  //       });
  //     }
  //   });
  // },

  // getDisciplineByID: function(ID, callback){
  //   new Discipline({
  //     id: ID
  //   }).fetch({required: true})
  //   .catch(function(err){
  //     console.log(err);
  //     callback({
  //       result: false,
  //       message: 'Internal Server Error'
  //     });
  //   })
  //   .then(function(exist){
  //     if(exist){
  //      callback(exist.attributes);
  //     }else{
  //       console.log('Discipline of that ID does not exist.');
  //       callback({
  //         result: false,
  //         message: 'No discipline with that ID.'
  //       });
  //     }
  //   });
  // },

  // /**
  //  * Gets a single student's info from DB
  //  * @param  {[String]} using [Property to search]
  //  * @param  {[]} info [Student's info]
  //  * @param  {[String]} callback [callback function (optional)]
  //  * @return {[Object]}   [Student information, or false if not found]
  //  */
  // getStudentUsing: function(using, info, callback){
  //   db.knex('students')
  //   .where(using, info)
  //   .select('*')
  //   .catch(function(err){
  //     console.log('Error: ',err);
  //   })
  //   .then(function(data){
  //     if(!data || data.length===0){
  //       console.log('Student does not exist');
  //       if(callback){ callback(false); }
  //     }else if(data.length>1){
  //       console.log('Warning: More then one student found.');
  //       if(callback){ callback(data); }
  //     }else{
  //       if(callback){ callback(data[0]); }
  //     }
  //   });
  // },

  // getUserRankUsing: function(using, info, isInstructor, callback){
  //   if(!isInstructor){
  //     db.knex('disciplines')
  //     .join('disciplines_students', 'disciplines.id', '=', 'disciplines_students.discipline_id')
  //     .join('students', 'disciplines_students.student_id', '=', 'students.id')
  //     .where('students.'+using, info)
  //     .select('disciplines.*', 'students.username', 'students.firstName', 'students.lastName')
  //     .catch(function(err){
  //       console.log(err);
  //     })
  //     .then(function(data){
  //       if(callback){
  //         callback(data);
  //       }
  //     });
  //   }else{
  //     db.knex('disciplines')
  //     .join('disciplines_instructors', 'disciplines.id', '=', 'disciplines_instructors.discipline_id')
  //     .join('instructors', 'disciplines_instructors.instructor_id', '=', 'isntructors.id')
  //     .where('instructors.'+using, info)
  //     .select('disciplines.*', 'instructors.username', 'instructors.firstName', 'instructors.lastName')
  //     .catch(function(err){
  //       console.log(err);
  //     })
  //     .then(function(data){
  //       if(callback){
  //         callback(data);
  //       }
  //     });
  //   }
  // },

  // /**
  //  * Get's class info.
  //  * @param  {[String]} using [Property to search]
  //  * @param  {[]}   info  [Class info]
  //  * @param  {Function} callback [Callback function]
  //  * @return {[Object/Boolean]}  [Return false on failure, and data if any is found]
  //  */
  // getClassUsing: function(using, info, callback){
  //   var result;
  //   db.knex('classes')
  //   .where(using, info)
  //   .select('*')
  //   .then(function(data){
  //     if(!data || data.length===0){
  //       console.log('Class does not exist');
  //       if(callback){ callback(false); }
  //       return false;
  //     }else if(data.length>1){
  //       console.log('Warning: More then one class found.');
  //       if(callback){ callback(data); }
  //       return data[0];
  //     }else{
  //       if(callback){ callback(data[0]); }
  //       return data[0];
  //     }
  //   });
  // },

  // /**
  //  * Get's Instructor info.
  //  * @param  {[String]} using [Property to search]
  //  * @param  {[]}   info  [The unique instructor info]
  //  * @param  {Function} callback [Callback function]
  //  * @return {[Object/Boolean]}  [Return false on failure, and data if any is found]
  //  */
  // getInstructorUsing: function(using, info, callback){
  //   db.knex('instructors')
  //   .where(using, info)
  //   .select('*')
  //   .catch(function(err){
  //     console.log(err);
  //     if(callback){ callback(false); }
  //     return false;
  //   })
  //   .then(function(data){
  //     if(!data || data.length===0){
  //       console.log('Instructor does not exist');
  //       if(callback){ callback(false); }
  //       return false;
  //     }else if(data.length>1){
  //       console.log('Warning: More then one Instructor of this username is found.');
  //       if(callback){ callback(data); }
  //       return data[0];
  //     }else{
  //       if(callback){ callback(data[0]); }
  //       return data[0];
  //     }
  //   });
  // },

  // /**
  //  * Gets student video 
  //  * @param  {[String]} using [Property to search]
  //  * @param  {[]} info [unqiue info]
  //  * @param  {Function}  callback  [Callback function]
  //  * @return {[type]}  [Will return false on any failure, returns object if any data found]
  //  */
  // getStudentVidUsing: function(using, info, callback){
  //   db.knex('studentVideos')
  //   .where(using, info)
  //   .select('*')
  //   .catch(function(err){
  //     console.log(err);
  //     if(callback){ callback(false); }
  //     return false;
  //   })
  //   .then(function(data){
  //     if(!data || data.length===0){
  //       console.log('No videos found.');
  //       if(callback){ callback(false); }
  //       return false;
  //     }else{
  //       if(callback){ callback(data); }
  //       return data;
  //     }
  //   })
  //   .catch(function(err){
  //     console.log('Error in getStudentVidUsing: \n',err);
  //   });
  // },

  // /**
  //  * Gets the instruction videos using the instructors ID
  //  * @param  {[String]} using [Property to search]
  //  * @param  {[]} info [unqiue info]
  //  * @param  {Function} callback     [Callback function]
  //  * @return {[type]}  [Will return false on any failure, returns object if any data found]
  //  */
  // getInstVideoUsing: function(using, info, callback){
  //   db.knex('instrVideos')
  //   .where(using, info)
  //   .select('*')
  //   .catch(function(err){
  //     console.log(err);
  //     if(callback){ callback(false); }
  //     return false;
  //   })
  //   .then(function(data){
  //     if(!data || data.length===0){
  //       console.log('No videos found.');
  //       if(callback){ callback(false); }
  //       return false;
  //     }else{
  //       if(callback){ callback(data); }
  //       return data;
  //     }
  //   })
  //   .catch(function(err){
  //     console.log('Error in getInstVideoUsing: \n',err);
  //   });
  // },

  // /**
  //  * Gets all students under an instructor for all classes.
  //  * @param  {[String]} using [Property to search]
  //  * @param  {[]} info [unqiue info]
  //  * @param  {Function} callback     [Callback function]
  //  * @return {[Array]} An [] of {}, each {} being a student. Or false if invalid info or using.
  //  */
  // getStudentsUnderInstUsing: function(using, info, callback){
  //   db.knex('instructors')
  //   .select('*')
  //   .where(using, info)
  //   .catch(function(err){
  //     console.log(err);
  //     if(callback){ callback(false); }
  //     return false;
  //   })
  //   .then(function(exists){
  //     if(!exists || exists.length===0){
  //       return false;
  //     }else{
  //       db.knex('instructors')
  //       .join('classes', 'instructors.id', '=', 'classes.instructor_id')
  //       .join('classes_students', 'classes.id', '=', 'classes_students.class_id')
  //       .join('students', 'students.id', '=', 'classes_students.student_id')
  //       .select('students.*', 'classes.title')
  //       .where('instructors.'+using, info)
  //       .then(function(data){
  //         if(callback){ callback(data); }
  //         return data;
  //       });
  //     }
  //   });
  // },
  
  // /**
  //  * Gets all Instructors for a student across all classes.
  //  * @param  {[String]} using [Property to search]
  //  * @param  {[]} info [unqiue info]
  //  * @param  {Function} callback     [Callback function]
  //  * @return {[Array]} An [] of {}, each {} being a Instructor. Or false if invalid info or using.
  //  */
  // getInstOfStudentUsing: function(using, info, callback){
  //   db.knex('students')
  //   .select('*')
  //   .where(using, info)
  //   .catch(function(err){
  //     console.log(err);
  //     if(callback){ callback(false); }
  //     return false;
  //   })
  //   .then(function(exists){
  //     if(!exists || exists.length===0){
  //       return false;
  //     }else{
  //       db.knex('students')
  //       .join('classes_students', 'students.id', '=', 'classes_students.student_id')
  //       .join('classes', 'classes.id', '=', 'classes_students.class_id')
  //       .join('instructors', 'instructors.id', '=', 'classes.instructor_id')
  //       .select('instructors.*', 'classes.title')
  //       .where('students.'+using, info)
  //       .then(function(data){
  //         if(callback){ callback(data); }
  //         return data;
  //       });
  //     }
  //   });
  // },

  // /**
  //  * Get's info of all classes a student is in.
  //  * @param  {[String]}   using    [Unique info to search with.]
  //  * @param  {[String]}   info     [The actual info]
  //  * @param  {Function} callback [Callback function]
  //  * @return {[type]} [Will return [] of {}, or false on error.]
  //  */
  // getClassesOfStudent: function(using, info, callback){
  //   db.knex('classes')
  //   .join('classes_students', 'classes_students.class_id', '=', 'classes.id')
  //   .join('students', 'students.id', '=', 'classes_students.student_id')
  //   .select('classes.*')
  //   .where('students.'+using, info)
  //   .catch(function(err){
  //     console.log('Error in getClassesOfStudent: ', err);
  //     return false;
  //   })
  //   .then(function(data){

  //   });
  // },


  // getFeedbacksForUser: function(username, callback){
  //   new Student({
  //     username: username
  //   })
  //   .fetch({withrRelated: 'feedbacks'})
  //   .then(function(model){
  //     // callback(model.related('feedback').toJSON());
  //     callback(model.related('feedbacks'));
  //   });
  // },


  // getFeedbackUsing: function(using, info, callback){
  //   new Feedback()
  //   .where(using, info)
  //   .fetch()
  //   .then(function(model){
  //     callback(model);
  //   });
  // },





  // /////////////////////
  // //Special functions//
  // /////////////////////

  // /**
  //  * Establish a relation between student to class using their ID.
  //  * Will return false if student already has relation to that class.
  //  * @studentID  {[String]} Student ID
  //  * @classID  {[String]}   Class ID
  //  * @return {[Boolean]}    If successful
  //  */
  // studentToClass: function(studentUser, classTitle, callback){
    
  //   //check if studentID and classID are valid
  //   var student = new Student({username: studentUser});
  //   var classs = new Class({title: classTitle});

  //   student.fetch()
  //   .then(function(exists){
  //     if(!exists || exists.length===0){
  //       // console.log('studentToClass: Invalid studentUser');
  //       if(callback){
  //         callback({
  //           result: false,
  //           message: 'Invalid studentUser'
  //         });
  //       }
  //     }else{
  //       checkClass();
  //     }
  //   })
  //   .catch(function(err){
  //     console.log('Error in studentToClass: ', err);
  //     if(callback){
  //       callback({
  //         result: false,
  //         message: 'Internal Server Error'
  //       });
  //     }
  //   });

  //   var checkClass = function(){
  //     classs.fetch()
  //     .then(function(exists){
  //       if(!exists || exists.length===0){
  //         console.log('studentToClass: Invalid classTitle');
  //         if(callback){
  //           callback({
  //             result: false,
  //             message: 'Invalid classTitle'
  //           });
  //         }
  //       }else{
  //         asignStudent();
  //       }
  //     })
  //     .catch(function(err){
  //       console.log(err);
  //       if(callback){
  //         callback({
  //           result: false,
  //           message: 'Internal Server Error'
  //         });
  //       }
  //     });
  //   };

  //   var asignStudent = function(){
  //     //check if such a relation already exist
  //     db.knex('classes_students')
  //     .join('students', 'students.id', '=', 'classes_students.student_id')
  //     .join('classes', 'classes.id', '=', 'classes_students.class_id')
  //     .where({
  //       'students.username': studentUser,
  //       'classes.title': classTitle
  //     })
  //     .select('classes_students.id')
  //     .then(function(exist){
  //       if(!exist || exist.length===0){
  //         // console.log('Succesfully added student to class.');
  //         student.classes().attach(classs);
  //         if(callback){
  //           callback({
  //             result: true
  //           });
  //         }
  //       }else{
  //         // console.log('That student is already in that class.');
  //         if(callback){
  //           callback({
  //             result: false,
  //             message: 'That student is already in that class.'
  //           });
  //         }
  //       }
  //     })
  //     .catch(function(err){
  //       console.log('Error in studentToClass: '+err);
  //       if(callback){
  //         callback({
  //           result: false,
  //           message: 'Internal Server Error'
  //         });
  //       }
  //     });
  //   };
  // },


  // /////////////////////
  // //Deletion Queries //
  // //USE WITH CAUTION!//
  // /////////////////////
  
  // /**
  //  * Removes a student from the Students table
  //  * @param  {[String]}   username [Student's username.]
  //  * @param  {Function} callback [Optional callback]
  //  * @return {[Boolean]} [if no callback, will return true on successful del]
  //  */
  // delStudent: function(username, callback){
  //   db.knex('students')
  //   .where('username', username)
  //   .del()
  //   .catch(function(err){
  //     console.log('Error in delStudent: ',err);
  //     if(callback){
  //       callback(false);
  //     }
  //   })
  //   .then(function(data){
  //     if(data!==0){
  //       // console.log(data,' removed from Instructor table.');
  //       if(callback){
  //         callback(data);
  //       }
  //     }else{
  //       callback(false);
  //     }
  //   });
  // },

  // /**
  //  * [delInstructor description]
  //  * @param  {[String]}   username [Instructor username]
  //  * @param  {Function} callback [Callback]
  //  * @return {[Boolean]}  [If no callback, will return boolean based on success]
  //  */
  // delInstructor: function(username, callback){
  //   db.knex('instructors')
  //   .where('username', username)
  //   .del()
  //   .catch(function(err){
  //     console.log('Error in delInstructor: ',err);
  //     if(callback){
  //       callback(false);
  //     }
  //   })
  //   .then(function(data){
  //     if(data!==0){
  //       // console.log(data,' removed from Instructor table.');
  //       if(callback){
  //         callback(data);
  //       }
  //     }else{
  //       callback(false);
  //     }
  //   });
  // },
  
  // /**
  //  * Will delete all rows from a table is specified. 
  //  * Will clear ALL tables if tableName is not given.
  //  * @param  {[String]} tableName [Name of table to clear.]
  //  */
  // clearTable: function(tableName){
  //   if(tableName){
  //     db.knex(tableName)
  //     .select('*')
  //     .del()
  //     .then(function(){
  //       console.log('Cleared Table: ', tableName);
  //     });
  //   }else{
  //     db.knex.raw('DELETE FROM "students";');
  //     db.knex.raw('DELETE FROM "instructors";');
  //     db.knex.raw('DELETE FROM "classes";');
  //     db.knex.raw('DELETE FROM "studentVideos";');
  //     db.knex.raw('DELETE FROM "instrVideos";');
  //     db.knex.raw('DELETE FROM "classes_students";');
  //     console.log('Cleared All Tables!');
  //   }
  // },

};


module.exports = DBQuery;






