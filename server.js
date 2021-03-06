var restify = require('restify');
var builder = require('botbuilder');
var restify = require('restify');
var builder = require('botbuilder');
var Face = require('oxford-face-api');
//var face = new Face("");
var request = require("superagent");
var httprequest = require('request').defaults({ encoding: null });
const needle = require("needle"),
      url = require('url');

var fs = require('fs')
  , gm = require('gm');  

var azure = require('azure-storage'); 
var blobSvc = azure.createBlobService('13threaltimeinsight','fKxio8XGO776YjVV84gDgbYmVQiOdtGtiS9m/8AGoL1xPGK3Yyqso+lgz8wKCyG0vzZVi+UQvyn9L+e+K1CC/w==');
var person_index=-1;
var personid;
var person_confidence=1;
var young_person_index;
var max_age=999;
var man_count=0;
var woman_count=0;
var max_smile_value=0;
var smile_person_index=-1;
var filename,smile_filename,dir_filename,smdir_filename;
var FACEKEY = "8f7a031e5133417aa8b1f1ab525efec1";
var CROP = true;
var KC_ID="7c1e96f9-c73c-4eea-951b-61aab07c1b16";
var JERRY_ID="16ef3542-84b4-448e-9250-9f57773f183b";
var FinalName=""; 
var urlencode = require('urlencode');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
 
 
    appId: process.env.MICROSOFT_APP_ID ,//|| "39e398aa-5e7a-43c7-9079-fcb4f07a6dbc",
    appPassword: process.env.MICROSOFT_APP_PASSWORD //|| "tZtei6Px5cY90yxTkP9HdQ6"
 
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

// Create LUIS recognizer 
var model = process.env.LUIS_MODEL_URL || "https://api.projectoxford.ai/luis/v1/application?id=ceb627e1-2d52-4626-9bbd-543a25983862&subscription-key=35820529a1be4e389462b5b4fd14ef90";
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);



//開場LUIS
dialog.matches('你好', [
  function (session, args, next) {
    var reply_str = '請上傳一張照片讓我看看在場的俊男美女';
      session.send(reply_str);   

       var Eng="\"postUnit\"";
       var Unit="\""+urlencode("衛生局")+"\"";
       var url="http://data.tycg.gov.tw/api/v1/rest/datastore/73644460-c76f-4afa-aa30-064bfef291d8?"+"filters={"+Eng+":"+Unit+"}";
       console.log(url);
            httprequest(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  var info = JSON.parse(body)
                  console.log(info.result.records[0].postUnit);
                }else{
                   console.log(response.statusCode);
                }
            })
  },
   function (session, results) {
    
   }
]);
 
dialog.matches('開心', [
  function (session, args, next) {
     // builder.Prompts.attachment(session, '請上傳一張照片讓我看看誰最開心');
      var msg = new builder.Message(session);
      msg.attachments([{
          contentType: "image/jpeg",
          contentUrl: "https://13threaltimeinsight.blob.core.windows.net/imagescontainer/" + smile_filename,
      }]);
      session.endDialog(msg);
 
 
      var reply_str = '他看起來笑得最燦爛，笑顏值有' + max_smile_value + '分這麼高呢!';
 
 
      session.send(reply_str);  //Send Photo CT建議放大開心那個人的臉部比較有效果
      max_smile_value = 0;
  },
  function (session, results) {
     
      
  }
]);
dialog.matches('認識', [

    function (session, args, next) {
       // builder.Prompts.attachment(session, '請上傳一張照片讓我看看今天午餐誰來請客');
       var msg = new builder.Message(session);
        msg.attachments([{
            contentType: "image/jpeg",
            contentUrl: "https://13threaltimeinsight.blob.core.windows.net/imagescontainer/" + filename,
        }]);
        session.endDialog(msg);
        var reply_str = "";
        if (person_index == -1) {
            if (max_age > 1) {
                max_age = parseInt(max_age);
            }
            reply_str = '當然是看起來最年輕的要請客囉~~就是你啦不要躲，看起來你只有' + max_age + '歲呢!!';
        } else {
            var title_str;
            if(FinalName=="微軟總經理Jerry"){
              title_str="總經理";
            }else if(FinalName=="微軟副總經理KC"){
               title_str="副總經理";
            }
            reply_str = '嗨'+FinalName+'，好久不見啦~~';
            person_index = -1;
        }
        session.send(reply_str);
        
    },

    function (session, results) {
      
    }

]);
dialog.matches('請客', [

    function (session, args, next) {
       // builder.Prompts.attachment(session, '請上傳一張照片讓我看看今天午餐誰來請客');
       var msg = new builder.Message(session);
        msg.attachments([{
            contentType: "image/jpeg",
            contentUrl: "https://13threaltimeinsight.blob.core.windows.net/imagescontainer/" + filename,
        }]);
        session.endDialog(msg);
        var reply_str = "";
        if (person_index == -1) {
            if (max_age > 1) {
                max_age = parseInt(max_age);
            }
            reply_str = '當然是看起來最年輕的要請客囉~~就是你啦不要躲，看起來你只有' + max_age + '歲呢!!';
        } else {
            var title_str;
            if(FinalName=="微軟總經理Jerry"){
              title_str="總經理";
            }else if(FinalName=="微軟副總經理KC"){
               title_str="副總經理";
            }
            reply_str = '當然是'+FinalName+'要請客拉!!，謝謝'+title_str+' づ(ˊ● ω ●ˋ)づ Let' + '\'s GO~';
            person_index = -1;
        }
        session.send(reply_str);
        
    },

    function (session, results) {
      
    }

]);

function upLoadImage(att_url,session) {
   
    httprequest.get(att_url, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            var attachment_img = new Buffer(body, 'binary');
            var request_body = attachment_img;
         
            request
                   .post("https://api.projectoxford.ai/face/v1.0" + "/detect?")
                   .query({ returnFaceId: true })
                   .query({ returnFaceLandmarks: true })
                   .query({ returnFaceAttributes: "age,gender,smile" })
                   .set('Content-Type', 'application/octet-stream')
                   .set('Ocp-Apim-Subscription-Key', FACEKEY)
                   .send(request_body)
                   .end(function (error, response) {
                       if (!error && response.statusCode == 200) {
                          
                           var myJson = JSON.parse(JSON.stringify(response.body));

                           for (i = 0; i < myJson.length; i++) {
                               if (myJson[i].faceAttributes.age < max_age) {
                                   young_person_index = i;
                                   max_age = myJson[i].faceAttributes.age;
                               }
                               if (myJson[i].faceAttributes.gender == 'male') {
                                   man_count = man_count + 1;
                               } else if (myJson[i].faceAttributes.gender == 'female') {
                                   woman_count = woman_count + 1;
                               }
                               if (myJson[i].faceAttributes.smile > max_smile_value) {
                                   max_smile_value = myJson[i].faceAttributes.smile;
                                   smile_person_index = i;
                               }
                           }

                           var faceid = "";
 
 
                           for (j = 0; j < myJson.length; j++) {
                               faceid = faceid + myJson[j].faceId;
                               if (j != myJson.length - 1) {
 
                                   faceid = faceid + ",";
                               }
                           }
                           var array = faceid.split(',');
 
                           var identify_reqbody = {
                               "personGroupId": "mtcbotdemo",
                               "faceIds": array,
                               "maxNumOfCandidatesReturned": 1,
 
 
                               "confidenceThreshold": 0.623
 
                           };

                           request
                                 .post("https://api.projectoxford.ai/face/v1.0" + "/identify")
                                 .set('Content-Type', 'application/json')
                                 .set('Ocp-Apim-Subscription-Key', FACEKEY)
                                 .send(identify_reqbody)
                                 .end(function (error, response) {
                                     if (!error && response.statusCode == 200) {
                                        
                                         var identify_Json = JSON.parse(JSON.stringify(response.body));
                                         var i_index;
                                         for (i_index = 0; i_index < identify_Json.length; i_index++) {
                                             if (identify_Json[i_index].candidates.length != 0) {
                                                 person_index = i_index;
                                                 personid = identify_Json[i_index].candidates[0].personId;
                                                 person_confidence = identify_Json[i_index].candidates[0].confidence;
 
                                                 if(personid==JERRY_ID){
                                                  FinalName="微軟總經理Jerry";
                                                  break;
                                                 }else if(personid==KC_ID){
                                                  FinalName="微軟副總經理KC";
                                                 }

                                             }

                                         }
                                         var pic = gm(httprequest(att_url));
                                         var smile_pic = gm(httprequest(att_url));
                                         pic.stroke('#FFBB00')
                                            .strokeWidth(8);
                                         smile_pic.stroke('#FFFF00')
                                                  .strokeWidth(7);
                                         var x, smile_x;
                                         var y, smile_y;
                                         var width, smile_width;
                                         var height, smile_height;
                                        
                                         if (person_index == -1) {
                                             x = myJson[young_person_index].faceRectangle.left;
                                             y = myJson[young_person_index].faceRectangle.top;
                                             width = myJson[young_person_index].faceRectangle.width;
                                             height = myJson[young_person_index].faceRectangle.height;
                                         } else {
                                             x = myJson[person_index].faceRectangle.left;
                                             y = myJson[person_index].faceRectangle.top;
                                             width = myJson[person_index].faceRectangle.width;
                                             height = myJson[person_index].faceRectangle.height;
                                         }
                                         
                                         smile_x = myJson[smile_person_index].faceRectangle.left;
                                         smile_y = myJson[smile_person_index].faceRectangle.top;
                                         smile_width = myJson[smile_person_index].faceRectangle.width;
                                         smile_height = myJson[smile_person_index].faceRectangle.height;
                                          
                                         pic.drawLine(x, y, x + width, y)
                                            .drawLine(x, y, x, y + height)
                                            .drawLine(x, y + height, x + width, y + height)
                                            .drawLine(x + width, y, x + width, y + height);
                                         if (CROP) {
                                             smile_pic.crop(smile_width, smile_height, smile_x, smile_y);
                                         } else {
                                             smile_pic.drawLine(smile_x, smile_y, smile_x + smile_width, smile_y)
                                                .drawLine(smile_x, smile_y, smile_x, smile_y + smile_height)
                                                .drawLine(smile_x, smile_y + smile_height, smile_x + smile_width, smile_y + smile_height)
                                                .drawLine(smile_x + smile_width, smile_y, smile_x + smile_width, smile_y + smile_height);
                                         }
                                         filename = (Math.random() + 1).toString(24).substring(4) + '.jpg';

                                         smile_filename = 'sm_' + filename;
                                         dir_filename = './' + filename;
                                         smdir_filename = './' + smile_filename;
                                         
                                         pic.write(filename, function (err) {
                                             if (!err) {
                                                 blobSvc.createBlockBlobFromLocalFile('imagescontainer', filename, dir_filename, function (error, result, response) {
                                                     if (error) {
                                                         console.log("Couldn't upload stream");
                                                         console.error(error);
                                                     }
                                                     else {
                                                         console.log('Stream uploaded successfully');
                                                         var reply_str = '我看到了有';
                                                         if (man_count != 0) {
                                                             reply_str = reply_str + man_count + '位男嘉賓';
                                                         }
                                                         if (woman_count != 0) {
                                                             if (man_count != 0) {
                                                                 reply_str = reply_str + '和' + woman_count + '位女嘉賓';
                                                             } else {
                                                                 reply_str = reply_str + woman_count + '位女嘉賓';
                                                             }
                                                         }
                                                         reply_str = reply_str + '，歡迎參觀微軟 :-)';
                                                         session.send(reply_str);
                                                         man_count = 0;
                                                         woman_count = 0;

                                                     }
                                                 });

                                             } else {
                                                 console.log(err);
                                             }
                                         });
                                         smile_pic.write(smile_filename, function (err) {
                                             if (!err) {
                                                 blobSvc.createBlockBlobFromLocalFile('imagescontainer', smile_filename, smdir_filename, function (error, result, response) {
                                                     if (error) {
                                                         console.log("Couldn't upload stream");
                                                         console.error(error);
                                                     }
                                                     else {
                                                         console.log('smile Stream uploaded successfully');
                                                         
                                                     }
                                                    // session.endDialog(msg);
                                                 });
                                             } else {
                                                 console.log(err);
                                             }
                                         });
                                     }
                                     else {
                                         console.log(response.statusCode);
                                         console.log(error);
                                     }
                                 });

                          // return callback(null, response.body);

                       }
                       else {
                           console.log(response.body);
                           return callback(error);
                       }
                   });

        } else {
            console.log(response.statusCode);
            console.log(error);
            console.log(body);
        }
    });
}


 