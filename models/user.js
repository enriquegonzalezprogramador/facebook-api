
//Primero importamos las dependencias

var mongoose = require ('mongoose');
var findOrCreate = require ('mongoose-findorcreate');
var Schema = mongoose.Schema;

//Segundo nos conectamos a mongoDB y a la Base de Datos

mongoose.connect('mongodb://localhost/bd_playbetcris');

//Tercero definimos el Schema

var userSchema = new Schema ({

	name: String,
	provider: String,
	uid: String,
	accessToken: String
});

//Cuarto usar el plugin findorcreate de mongodb

userSchema.plugin(findOrCreate);

//Quinto creamos el modelo


var User = mongoose.model('User',userSchema);


//Exportamos el modelo


module.exports = User;

