
var iAlbum = angular.module('iAlbum', []);

iAlbum.controller('iAlbumController', function($scope, $http){


$scope.log={name:"",pass:""};

$scope.uploadme=null;

$scope.cl =function(){
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
}
$scope.load = function(files)
{
     if (files[0] ) {
    $scope.uploadme=files[0];

}

};
$scope.idSelected = null;


$scope.upload = function()
{   if($scope.uploadme!=null)
    {
    
     oData = new FormData();
    try{
   
    
     $http.post("/uploadphoto", $scope.uploadme, {
        withCredentials: true,
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
    }).then(function(response){
        if(response.data._id!==''){
        $scope.get_al(0);
                }
        else{
         alert(response.data.msg);
        }
    }, function(response){
        alert("Error upload");
    });

    }catch(e){console.log(e);}
}
    else
    alert("empty file");
};




$scope.init=function()
{
	$http.get("/init").then(function(response)
    {
        if(response.data==='')
        {
            
        }
        else
        {
            $scope.friendlist=response.data;
        }
        },function(response){
		alert("Error getting contacts.");
	});
};







$scope.get_al=function(uid)
{
	
    if(uid===0)
    {
        $http.get("/getalbum/0").then(function(response){
            if(response.data.msg==='')
            {
                alert(msg);
            }
            else
            {
                $scope.idSelected=1;
                $scope.photos=response.data;
            }
        });
    }
    else
    {
        $http.get("/getalbum/"+uid).then(function(response){
            if(response.data.msg==='')
            {
                alert(msg);
            }
            else
            {
                $scope.idSelected=uid;
                $scope.photos=response.data;
            }
        });

    }
};




$scope.login = function(log)
{
    $http.post("/login",log).then(function(response){
        if(response.data==='Login failed')
        {// on fail login alert is prompted
            alert(response.data);
        }
        else
        {//on success location gets reloaded and init is called again retriveing the data required
            location.reload();
            
        }
    }, function(response){
        alert("Error login");
    });
};



$scope.logout = function()
{         
    $http.get("/logout").then(function(response){
        if(response.data==='')
        {
 
            location.reload();
 
        }
        else
        {
            alert("Error Logout");    
        }
    }, function(response){
        alert("Error Logout");
    });
};


/*

POP UP MODEL BOX FOR IMAGE LOGIC

*/

$scope.delta={x:"x",photo:"",friendlist:""};// OBJECT CONTAINING PHOTO DATA AND PHOTO OWNER INFO


$scope.pop=function(o,photo,friendlist){
    //alert(photo._id);
   try{
    var modal = document.getElementById('myModal');
    var img = document.getElementById(o);
    var modalImg = document.getElementById("img01");
    var captionText = document.getElementById("caption");
    
    modal.style.display = "block";
    modalImg.src = photo.url;
    $scope.delta["x"]="y";
    $scope.delta["photo"]=photo;
    $scope.delta["friendlist"]=friendlist;
   }catch(e){}
     
}


/*

DELETION FUNCTION

*/
$scope.delete= function(id){
    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this photo?');


    if (confirmation === true) {
   
      var url = "/deletephoto/" + id;
      $http.delete(url).then(function(response){
        if(response.data.msg===''){
          $scope.get_al(0);
          	
		}
		else{
			alert("Error deleting contacts.");
		}
	        	   
                  }, function(response){
        		alert("Error deleting contacts.");
      	});
   }
   else {
                  // If they said no to the confirm, do nothing
        	return false;
  }
};


/*

LIKE FUNCTION

*/

$scope.like= function(id,uid){
   
      var url = "/updatelike/" + id;
      $http.put(url).then(function(response){
        if(response.data.msg===''){
          $scope.get_al(uid);
          if($scope.delta.photo.likedby)
            $scope.delta.photo.likedby.push($scope.friendlist[0].username);
            }
		else{
			alert("Error Liking");
		}
	        	   
                  }, function(response){
        		alert("Error like");
      	});
   
};

})
