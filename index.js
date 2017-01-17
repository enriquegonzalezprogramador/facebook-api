//AP ID: 1613280442311228

//AP SECRET: ef18b0e62bd346a2aa12d235fe42b9fd


//Configurar nuestro servidor para usar las dependencias

var express =  require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var cookieSession = require('cookie-session');
var facebookStrategy = require('passport-facebook').Strategy;
var graph = require('fbgraph');
var User = require('./models/user');

var app = express();

/*Aqui importaremos body-parser para leer
datos de la peticion*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

/*Aqui importaremos cookie-session para porder
Guardar Cookies*/

app.use(cookieSession({keys:['abc','123']}));

/*Aqui le decimos a express que utilice passport
para la autenticacion*/

app.use(passport.initialize());
app.use(passport.session());

/*Aqui utilizaremos PUG para las
vistas */

app.set('view engine','pug');



//Configurar la  autentificacion

/* 1-Primero hay que definir la estrategia
a utilizar en este caso FACEBOOK */

passport.use(new facebookStrategy({
	clientID:'1613280442311228',
	clientSecret:'ef18b0e62bd346a2aa12d235fe42b9fd',
	callbackURL:'http://localhost:8000/auth/facebook/callback',

},function(accessToken,refreshToken,profile,cb){

	//1-Primero se guarda al usuario en la Base de datos

	User.findOrCreate({uid: profile.id},{

		name: profile.displayName,
		provider: 'facebook',
		accessToken: accessToken

		},function(err,user){
			//se guarda al usuario en la sesion
			//mandar a llamar cb, completa la autenticacion

			cb(null,user);

		});

	//se guarda al usuario en la sesion (usuario falso)

	/*var user = {

		accesToken: accesToken,
		profile: profile
	}*/


}
));

/* 2-Definir como vamos a guardar el
usuario de la sesion*/

passport.serializeUser(function(user,done){

	done(null,user);
});

/* 3-Definir como vamos a retomar el
usuario de la sesion*/

passport.deserializeUser(function(user,done){

	done(null,user);
});

//Definir el fluj de autenticacion :

/* 1-Esto inicia el flujo de autenticacion
y redirije a facebook*/

app.get('/auth/facebook',passport.authenticate('facebook',{scope:['publish_actions','user_friends']}));

// 2-Aqui recibimos la respuesta de  facebook 

app.get('/auth/facebook/callback',passport.authenticate('facebook',{failureRedirect: '/'}),function(req,res){

console.log(req.session);
res.redirect('/');

});

 //Cierre de sesion con facebook

 app.get('/auth/close',function(req,res){

 	req.logout();
 	res.redirect('/');

 });

//Vistas para cuando el usuario ya inicio sesion

//Mostrar la vista de inicio

app.get('/',function(req,res){

	/*vista cuando el usurio ya inicio sesion,esto
se valida cuando este dato existe -> req.session.passport.user*/

	if( typeof  req.session.passport == 'undefined' || !req.session.passport.user ){

		res.render('index');

	}else{

		res.render('home');
	}
	
});



//publicar en el muro

app.post('/move',function(req,res){

	var pronostico =req.body.pronostico;
	graph.setAccessToken(req.session.passport.user.accessToken);

	graph.post('/feed',{message: pronostico},function(err,graphResponse){

		console.log(graphResponse);
		res.redirect('/');

	});

});


//buscar amigos

app.get('/friends',function(req,res){

	graph.setAccessToken(req.session.passport.user.accessToken);

	graph.get('/me/friends',function(err,graphResponse){

		//res.json(graphResponse); Esto mostraba si traia los datos de los amigos

		//Primero hay que extraer los ids del arreglo data de graphResponse

		var ids = graphResponse.data.map(function(el){

			return el.id;


		});

		//Segundo hay que buscar en la coleccion de usuarios, los que tengan
		//un uid  = a los id que obtuvimos

		User.find({
			'uid': {
				$in: ids
			}
		},function(err,users){

				//Mostrar los usuarios que encontramos
				res.render('friends',{users: users});
			}


		);


		



	});

});


//Poner a escuchar el servidor

app.listen(8000,function(){
	console.log('Ready...');
});