const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios');
const usuarios = new Usuarios();

const { crearMensaje } = require('../utils/utils');

io.on('connection', (client) => {
	client.on('entrarChat', (usuario, callback) => {
		if (!usuario.nombre || !usuario.sala) {
			return callback({
				error: true,
				mensaje: 'El nombre y la sala son necesarios',
			});
		}

		client.join(usuario.sala);

		let id = client.id;

		// let personas = usuarios.agregarPersona(id, usuario.nombre, usuario.sala);

		usuarios.agregarPersona(id, usuario.nombre, usuario.sala);

		// console.log('USUARIOS sala: ', usuarios.getPersonasPorSala(usuario.sala));

		client.broadcast
			.to(usuario.sala)
			.emit('listaPersonas', usuarios.getPersonasPorSala(usuario.sala));

		// callback(personas);

		client.broadcast
			.to(usuario.sala)
			.emit(
				'crearMensaje',
				crearMensaje('Administrador', `${usuario.nombre} se ha unido`)
			);

		callback(usuarios.getPersonasPorSala(usuario.sala));

		// console.log('USUARIO CONECTADO: ', usuario);
	});

	client.on('disconnect', () => {
		let personaBorrada = usuarios.borrarPersona(client.id);
		// console.log('PERSONA DESCONECTADA: ', personaBorrada);

		client.broadcast
			.to(personaBorrada.sala)
			.emit(
				'crearMensaje',
				crearMensaje('Administrador', `${personaBorrada.nombre} salió`)
			);

		client.broadcast
			.to(personaBorrada.sala)
			.emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));
	});

	client.on('crearMensaje', (data, callback) => {
		let persona = usuarios.getPersona(client.id);
		let mensaje = crearMensaje(persona.nombre, data.mensaje);

		client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

		callback(mensaje);
	});

	// Mensajes privados
	client.on('mensajePrivado', (data) => {
		let persona = usuarios.getPersona(client.id);

		client.broadcast
			.to(data.para)
			.emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
	});

	client.on('buscarPersonas', (persona, callback) => {
		// console.log('Persona recibida por el servidor: ', persona);

		let personas = usuarios.getPersonasPorSalaNombre(
			persona.sala,
			persona.persona
		);

		callback(personas);
	});

	client.on('abrirPrivado', (personas, callback) => {
		let personaDestino = usuarios.getPersona(personas.id).nombre;
		let personaOrigen = personas.nombre;

		let sala = 'privateRooom' + personaOrigen + 'And' + personaDestino;
		callback({ sala, personaDestino });
	});

	// console.log('Usuario conectado');
	// client.emit('enviarMensaje', {
	//     usuario: 'Administrador',
	//     mensaje: 'Bienvenido a esta aplicación'
	// });
	// client.on('disconnect', () => {
	//     console.log('Usuario desconectado');
	// });
	// // Escuchar el cliente
	// client.on('enviarMensaje', (data, callback) => {
	//     console.log(data);
	//     client.broadcast.emit('enviarMensaje', data);
	//     // if (mensaje.usuario) {
	//     //     callback({
	//     //         resp: 'TODO SALIO BIEN!'
	//     //     });
	//     // } else {
	//     //     callback({
	//     //         resp: 'TODO SALIO MAL!!!!!!!!'
	//     //     });
	//     // }
	// });
});
