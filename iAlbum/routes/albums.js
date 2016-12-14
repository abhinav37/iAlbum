var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var fs= require('fs');
var path = require('path');


module.exports = router;
// START FROM HERE



router.get('/init', function(req, res) {

    var db = req.db;
    var collection = db.get('userList');
    
    if (req.cookies.userID) 
    {
        var user =req.cookies.userID;
        collection.find({_id:ObjectId(user)},{username:1,userID:1},function(e,docs){
             console.log(docs[0].username);
             collection.find({username:{$in:docs[0].friends}},{username:1,userID:1},function(e,ds){
            var ar=[];
            ar.push({_id:docs[0]._id , username:docs[0].username});
            ds.forEach(function(element) {ar.push({_id:element._id , username:element.username});});
            
            res.json(ar);    
         });
            
        });  
    }
    else
    {
                    res.send('');
    }
});

router.post('/login',function(req, res) {
    var db = req.db;
    var collection = db.get('userList');
  
  try{
  
        collection.findOne({"username":req.body.name,"password":req.body.pass},{},function(e,docs){
                
                if(typeof docs!== 'undefined')
                {
                    console.log("login true");
                    var cookie = req.cookies.userID;
                    if (cookie === undefined)
                    {
                        res.cookie('userID',docs._id, { maxAge: 3600000, httpOnly: true });
               
                    } 
                    res.send("Login successfully");
                }
                else
              {
                    res.send("Login failed");
              }
        });
            
        
    }catch(e){console.log(e);res.send("Login failed");}
});




router.get('/logout', function(req, res) {
    try{
    res.clearCookie("userID");
    res.send("");}catch(e){console.log(e);}
});


router.get('/getalbum/:userid', function(req, res) {
    var db = req.db;
    var collection = db.get('photoList');
  try{  
      if(req.params.userid==0)
    {
        var user=req.cookies.userID;
        collection.find({"userid":ObjectId(user)},{},function(e,docs){
        
            if(typeof docs!== 'undefined')
            {
                var ar=[];
                docs.forEach(function(element) {ar.push({_id:element._id , url:element.url, likedby:element.likedby , userid :element.userid});});
                /* 
                
                added userid as i required it for some conditions

                */
        
                if(ar[0]==null)
                    res.send("user");
                else
                    res.json(  (e === null) ?ar:{ msg: e });
            }
            else
            {res.send(e);}

    });
    }
    else
    {
       collection.find({"userid":ObjectId(req.params.userid)},{"userid":false},function(e,docs){
            
            
            if(typeof docs!== 'undefined')
                {
            var ar=[];
            
            docs.forEach(function(element) {ar.push({_id:element._id , url:element.url, likedby:element.likedby , userid :element.userid});});
            /* 
            
            added userid as i required it for some conditions

            */}
            
                    res.json(  (e === null) ?ar:{ msg: e })

        
    }); 
    }


  }catch(e){console.log(e);}
});


router.post('/uploadphoto', function(req, res) {
    try{
    var db = req.db;
    var collection = db.get('photoList');
    
    
    
    var name=1000000000000000000*Math.random();
    var pth=path.join(__dirname, '/../public/uploads/')+name+".jpg";
    
    
    req.body["image"]=req.pipe(fs.createWriteStream(pth)); 
    
    collection.insert({"url":'uploads/'+name+".jpg","userid":ObjectId(req.cookies.userID),"likedby":[]}, function(err, result){
    
    
    res.send(
            (err === null) ? { _id: result._id, url : result.url } : { msg: err }
        );
    });
}catch(e){console.log(e);res.send("");}
    
});



router.delete('/deletephoto/:photoid', function(req, res) {
    var db=req.db;
    var collection=db.get('photoList');
    
    collection.findOne({"_id":ObjectId(req.params.photoid)},function(err, docs){

        fs.unlink(path.join(__dirname, '/../public/')+docs.url, (err) => {
        if (err) throw err;
    });
    });
    
    collection.remove({"_id":ObjectId(req.params.photoid)},function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
            
    });

});

router.put('/updatelike/:photoid', function(req, res) {
    var db=req.db;
    var collection=db.get('userList');
    var collection2=db.get('photoList');
    try{
    collection.find({"_id":ObjectId(req.cookies.userID)},function(e,docs){
    collection2.update({"_id":ObjectId(req.params.photoid)},{ $push:{"likedby":docs[0].username}},function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});}catch(e){console.log(e);res.send("error")}
});

