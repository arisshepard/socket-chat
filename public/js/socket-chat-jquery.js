var params = new URLSearchParams(window.location.search);

// referencias Jquery
var divUsuarios = $('#divUsuarios');
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');
var h3TituloChat = $('#h3TituloChat');
var txtBusqueda = $('#txtBusqueda');

var nombre = params.get('nombre');
var sala = params.get('sala');

// Funciones para renderizar usuarios
function renderizarUsuarios(personas) {
	// console.log('Personas: ', personas);

	var html = '';
	html += '<li>';
	html +=
		'	<a href="javascript:void(0)" class="active"> Chat de <span> ' +
		params.get('sala') +
		'</span></a>';
	html += '</li>';

	// console.log(personas);

	for (var i = 0; i < personas.length; i++) {
		html += '<li>';
		html +=
			'    <a data-id="' +
			personas[i].id +
			'" href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>' +
			personas[i].nombre +
			' <small class="text-success">online</small></span></a>';
		html += '</li>';
	}

	divUsuarios.html(html);

	h3TituloChat.text(sala);
}

function renderizarMensajes(mensaje, yo) {
	var html = '';

	var fecha = new Date(mensaje.fecha);
	var hora = fecha.getHours() + ':' + fecha.getMinutes();

	var adminClass = 'info';

	if (mensaje.nombre === 'Administrador') {
		adminClass = 'danger';
	}

	if (!yo) {
		html += '<li class="animated fadeIn">';
		if (mensaje.nombre != 'Administrador') {
			html += '	<div class="chat-img">';
			html += '		<img src="assets/images/users/1.jpg" alt="user" />';
			html += '	</div>';
		}
		html += '	<div class="chat-content">';
		html += '		<h5>' + mensaje.nombre + '</h5>';
		html +=
			'		<div class="box bg-light-' +
			adminClass +
			'">' +
			mensaje.mensaje +
			'</div>';
		html += '	</div>';
		html += '	<div class="chat-time">' + hora + '</div>';
		html += '</li>';
	} else {
		html += '<li class="reverse">';
		html += '		<div class="chat-content">';
		html += '			<h5>' + mensaje.nombre + '</h5>';
		html += '			<div class="box bg-light-inverse">' + mensaje.mensaje + '</div>';
		html += '		</div>';
		html += '		<div class="chat-img">';
		html += '			<img src="assets/images/users/5.jpg" alt="user" />';
		html += '		</div>';
		html += '		<div class="chat-time">' + hora + '</div>';
		html += '</li>';
	}

	divChatbox.append(html);
}

function scrollBottom() {
	// selectors
	var newMessage = divChatbox.children('li:last-child');

	// heights
	var clientHeight = divChatbox.prop('clientHeight');
	var scrollTop = divChatbox.prop('scrollTop');
	var scrollHeight = divChatbox.prop('scrollHeight');
	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight() || 0;

	if (
		clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
		scrollHeight
	) {
		divChatbox.scrollTop(scrollHeight);
	}
}

// Listeners
divUsuarios.on('click', 'a', function () {
	var id = $(this).data('id');

	if (id !== undefined) {
		socket.emit('abrirPrivado', { id, nombre }, function (respuesta) {
			console.log(respuesta);
			// TODO: falta parte del front-end
		});
	}
});

formEnviar.on('submit', function (e) {
	// Evitar que se recargue la información
	e.preventDefault();
	if (txtMensaje.val().trim() === 0) return;

	socket.emit(
		'crearMensaje',
		{
			nombre: nombre,
			mensaje: txtMensaje.val(),
		},
		function (mensaje) {
			// console.log('respuesta server: ', mensaje);
			renderizarMensajes(mensaje, true);
			txtMensaje.val('').focus();
			scrollBottom();
		}
	);
});

txtBusqueda.on('keyup', function () {
	if (txtBusqueda.val().trim() === 0) {
		return;
	}

	socket.emit(
		'buscarPersonas',
		{ persona: txtBusqueda.val().trim(), sala: sala },
		function (personas) {
			// console.log('Estas son las personas: ', personas);

			renderizarUsuarios(personas);
		}
	);
});
