
var mongo = require( 'mongodb' ).MongoClient,
    client = require( 'socket.io' ).listen( 8080 ).sockets;

function setStatus( msg ){
  var clear = false;
  if( msg === 'Message set'){
    clear = true;
  }
  return {"status": msg, "clear": clear };
}

mongo.connect('mongodb://127.0.0.1/chat', function ( err, db ) {
  if( err ) throw err;
  client.on( 'connection', function ( socket ) {

       var messageCollection =   db.collection( 'messages' );


       function sendStatus( s ) {
         socket.emit( 'status', s );
       }

      messageCollection.find().limit( 10 ).sort({_id:1}).toArray( function ( err, res){
        if( err ) throw err;
        socket.emit('output',{messages: res });
      });
      socket.on( 'input', function ( data ) {

        var whitespacePattern = /^\s*$/;
        console.log( data );
        if( whitespacePattern.test( data.name ) || whitespacePattern.test( data.message ) ){
          sendStatus( {"message":'Name and Message are required'});
        } else {
            messageCollection.insert( data , function () {
              client.emit('output', {messages: [data]});
              console.log( 'inserted' );
              sendStatus( {"message": 'Message sent', "clear": true}  );
          });
        }
      });
  });
});
