if( typeof _ === "undefined" ) window._ = {

	body : $( "body" ),
	html : $( "html" ),
	document : $( document ),
	window : $( window ),
	viewport : { x : 0 , y : 0 }

};

String.prototype.json = function(){

    try{

        return $.parseJSON( this );

    }
    catch( e ){

        return false;

    }

};

/*Nem saját szimplán szeretem használni.*/

String.prototype.post = function( Data , l ){

    /*

        Usage : 		Posts an Async query with the parameters object S, and fetches the file output as response

        "index.php".post({ foo : "bar" }).done( function( r ){ alert( r );

         } );

    */

    var url = this;

    try{

        if(  typeof Data === "object" && typeof Data.do !== "undefined" ){

            var host = url;

            var concatChar = host.indexOf( "?" ) > -1 ? "&" : "?";

            var request = Data.do;

            url =  host + concatChar + request ;

        }

    } catch( exception ){ exception; }

    var postData = $.ajax({

      type : "POST",
      url  : url,
      data : Data

    });

    // Live declaration kills development messages of async queries

    if( typeof _.live === "undefined" ) _.live = false;
    if( typeof l === "undefined" ) l = true;

    if( !_.live && l ){

        console.groupCollapsed( "-> Sent POST data to %c" + url , "color:#82b;" );
        console.log( "\r\n Data sent: " , Data );
        console.groupEnd();

    }

    ( function( t ){

        postData.done( function( response ){

            if( !_.live && l ){

              console.groupCollapsed( "%c" + t + "%c's <- Raw response" , "color:#82b;" , "color:#000;" );
              console.log( response );
              console.groupEnd();

              }

          try{

              if( !_.live && l ){

              console.groupCollapsed( "%c" + t + "%c's <- Compiled response" , "color:#82b;" , "color:#000;" ); 
              console.log( response.json() );
              console.groupEnd();

              }

          } catch( exception ){ exception; }

        } );

    })( url );

    return postData;

};


/* Feltölti az adatbázisba a user adatait */
var uploadToDataBase = function( data ){

    /*localHost-ról vagy Serverről kell futtatni*/

    var dataToBackend = [];
    
    /*itt lehet szabályozni, hágy embert viszek fel. Ha éles API-ról kapnék több személyt természetesen más lenne a megoldás, de a feladatot így tudtam  legjobb tudásom szerint megoldani. */

    for( var  i = 0; i < 10; i++ ){

        dataToBackend.push( data.slice() );

    }
    
    for( var i = 0; i < dataToBackend.length; i++ ){
     
        ( function( i ){ 
            
            setTimeout( function(){

                "handler.php".post({
            
                    do : "Insert/users",
                    data : dataToBackend[ i ]
            
                }, false ).done( function( response ){
            
                    response = response.json();

                    var backEndResponseElements = $( ".insert-users .backend-response" );

                    console.log( response );

                    backEndResponseElements.find( ".success" ).toggleClass( "hidden" , !response );
                    backEndResponseElements.find( ".error" ).toggleClass( "hidden" , response );
            
                    return response;
            
                } );
    
            } , i * 10 );
    
        })( i );
    
    }


};

getUsers = function(){

    "handler.php".post({

        do : "Get/users"

    }).done( function( response ){

        response = response.json();

        $( ".get-users .backend-response .error" ).toggleClass( "hidden" , !!response );

        drawUsers( response );
        
        return !!response;

    } )

}

drawUsers = function( users ){
    
    var usersContainer = $( ".get-users .users" );
    
    usersContainer.find( ".user" ).remove();
    
    if( users.length === 0 ){
        
        return false;
        
    }

    var userPrototype = $( ".user.prototype" );

    for( var i = 0; i < users.length; i++ ){

        var currentUser = users[ i ];

        var userPrototypeClone = userPrototype.clone().toggleClass( "prototype" , false );

        userPrototypeClone.find( ".avatar img" ).attr( "src" , currentUser.picture );

        userPrototypeClone.find( ".name" ).html( currentUser.name );
        userPrototypeClone.find( ".age" ).html( currentUser.age );
        userPrototypeClone.find( ".gender" ).html( currentUser.gender );
        userPrototypeClone.find( ".email" ).html( currentUser.email );
        
        userPrototypeClone.find( ".city" ).html( currentUser.city );
        userPrototypeClone.find( ".country" ).html( currentUser.country );

        usersContainer.append( userPrototypeClone );

    }

}

_.document.on( "ready" , function(){})

.on( "click" , ".insert-users .button.api-call" , function(){

    $.ajax({

        url: 'https://randomuser.me/api/',
        dataType: 'json'

    }).done( function( response ){

        response = response[ "results" ];

        var requiredUserData = [];

        /*Arra külön védelmet nem állítottam fel, hogy mi van ha hiányos az adat.
        Naivan arra spekulálok, hogy az API jól müködik. Természetesen ha kell 
        nagyon szívesen vizsgálom, hogy minden a helyén van e, de gondoltam nem bonyolítom.*/

        for( var i = 0 ; i < response.length; i++ ){

            var currentResponse = response[ i ];

            var usefullData = {

                name : currentResponse.name.first + " " + currentResponse.name.last,
                gender : currentResponse.gender,
                age : currentResponse.dob.age,
                email : currentResponse.email,
                city : currentResponse.location.city,
                country : currentResponse.location.country,
                salt : currentResponse.login.salt,
                password : currentResponse.login.sha256,
                picture : currentResponse.picture.large

            }

            requiredUserData.push( usefullData );

        }

        uploadToDataBase( requiredUserData );
        
    });



} ).on( "click" , ".get-users .button.api-call" , function(){

    getUsers();

} )
