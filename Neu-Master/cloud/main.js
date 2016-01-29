require('cloud/app.js');

Parse.Cloud.afterSave("Post", function(request) {
	Parse.Cloud.useMasterKey();
    
    var Config = Parse.Object.extend('Config');
    var configQuery = new Parse.Query(Config);

    configQuery.equalTo("type","color")
    configQuery.find({
        success: function(results){
            var colorObjId = results[0].id;
            
            configQuery.get(colorObjId,{
                success: function(colorObj){
                    var scheme = colorObj.get("data").colorSet
                    if(scheme < 5){
                        colorObj.set("data", {"colorSet":scheme + 1});
                        colorObj.save();
                    }
                    else {
                        colorObj.set("data", {"colorSet":1});
                        colorObj.save();
                    }
                },
                error: function(error){
                    console.error(error);
                }
            })
        },
        error: function(error){
            console.error(error);
        }
    });
});

Parse.Cloud.define("getConfig", function(request, response) {
    var config_name = request.params.config_name;

    var Config = Parse.Object.extend('Config');
    var configQuery = new Parse.Query(Config);

    configQuery.equalTo("type",config_name)
    configQuery.find({
        success: function(results){
            response.success(results[0].get("data").colorSet);
        },
        error: function(error){
            console.error(error);
            response.error(error);
        }
    });
});