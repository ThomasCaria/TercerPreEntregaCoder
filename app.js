let catalogoCompleto;
let favoritos = JSON.parse(localStorage.getItem('PeliculasFavoritas')) || [];
let carrito = JSON.parse(localStorage.getItem('PeliculasEnCarrito')) || [];
let usuarioActual;



//Variables para acceder al DOM

const body = document.querySelector("body");
const bodyTitle = document.querySelector("#bodyTitle");
let catalogo = document.getElementById("todasCards");
let ftitulo = document.querySelector("#favTitulo");
let favoritas = document.querySelector("#favoritasCards");

const searchBar = document.querySelector("#search"); //Barra de busqueda
searchBar.addEventListener("input", (e) => {
    if (e.target.value != "") {
        filtrarBusqueda(e.target.value);
        cambiarBodyTitle("Resultados de la búsqueda:")
    } else {
        mostrarPeliculas()
        cambiarBodyTitle("Nuestro catálogo")
    }
})

const botonCarrito = document.querySelector("#botonCarrito"); // Botón para abrir el carrito
botonCarrito.addEventListener("click", () => {
    carrito.length != 0 && abrirCarrito();
})



// Se crea la clase Usuario

class usuario {
    constructor(nombre, email) {
        this.nombre = nombre;
        this.email = email;
    }
}

//Funciones

function validarUsuario(nombre) {
    let saludo = document.querySelector("#userName");
    saludo.innerHTML = "";
    let frase = document.createElement("h2");
    frase.innerHTML = `Bienvenid@, <span>${nombre}</span>`;
    saludo.appendChild(frase);
}

function ingresarUsuario() {
    let nombre;
    let email;
    let pantallaIngreso = document.querySelector("#bienvenida");
    pantallaIngreso.style.display = "block";
    body.style.overflow = "hidden";

    let campoNombre = document.querySelector("#nombreUsuario");
    campoNombre.addEventListener("input", (e) => {
        nombre = e.target.value;
    });

    let campoEmail = document.querySelector("#emailUsuario");
    campoEmail.addEventListener("input", (e) => {
        email = e.target.value;
    });

    let ingreso = document.querySelector("#ingresoUsuario");
    ingreso.addEventListener("submit", (e) => {
        e.preventDefault();
        campoNombre.value = "";
        campoEmail.value = "";
        usuarioActual = new usuario(nombre, email);
        usuarioActual.nombre != undefined ? nombre : usuarioActual.nombre = "anónimo";
        usuarioActual.email != undefined ? email : usuarioActual.email = "E-mail no validado"

        cerrarModal(pantallaIngreso);

        validarUsuario(usuarioActual.nombre);
    })
}

function cambiarBodyTitle(texto) {
    bodyTitle.innerHTML = texto
}

function setButton(inBtn, addedClass, newId, container, action, reference) {
    let btn = document.createElement("button");
    btn.classList.add(addedClass);
    btn.id = newId;
    btn.innerHTML += inBtn;
    container.appendChild(btn);
    btn.addEventListener("click", () => {
        btn = "";
        action(reference);
    })
}

function cerrarModal(param) {
    param.style.display = "none";
    body.style.overflow = "auto";
}

function renderCards(lista, container) {
    lista.forEach((pelicula, indice) => {
        let card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <div>
                <img src="./img/${pelicula.miniatura}.jpg" alt="catalogo de peliculas">
            </div>
            <div class="cardInfo">
                <div class="cardText">
                    <h4>${pelicula.nombre}</h4>
                    <p>Duración: ${pelicula.duracion} min</p>
                    <p>Género: ${pelicula.genero}</p>
                    <p>Precio: $${pelicula.precio}</p>   
                </div>
            </div>`
        container.appendChild(card)

        card.addEventListener("click", () => {
            mostrarInfo(lista, indice)
        })

    })
}

function limpiarCards(container) {
    while (container.hasChildNodes()) {
        container.removeChild(container.firstChild);
    }
}

const mostrarPeliculas = async() => {
    const response = await fetch('data.json')
    const todasPeliculas = await response.json()
    catalogoCompleto = todasPeliculas

    limpiarCards(catalogo)

    renderCards(catalogoCompleto, catalogo);

    if (favoritos.length > 0) {
        limpiarCards(favoritas)
        renderCards(favoritos, favoritas);
        ftitulo.style.display = "block";
    } else {
        ftitulo.style.display = "none";
        favoritas.hasChildNodes() && favoritas.removeChild(favoritas.firstChild);
    }
}

function filtrarBusqueda(value) {
    let peliculasFiltradas = []
    let valueUppercase = value.toUpperCase();
    for (const iterator of catalogoCompleto) {
        let iteratorNameUppercase = iterator.nombre.toUpperCase();
        if (iteratorNameUppercase.indexOf(valueUppercase) > -1) {
            peliculasFiltradas.push(iterator);
        }
        if (peliculasFiltradas.length > 0) {
            limpiarCards(catalogo);
            limpiarCards(favoritas);
            ftitulo.style.display = "none";
            renderCards(peliculasFiltradas, catalogo);
        }
    }
}

function mostrarInfo(array, indice) {
    const item = array[indice];
    let { nombre, resumen, director, duracion, genero, estreno, clasificacionEdad, calificacionIMDB, precio, poster } = item;

    let modalInfo = document.querySelector("#modalInfoPelicula");
    let itemInfo = document.createElement("div");
    itemInfo.classList.add("modalInfoContent");
    modalInfo.innerHTML = "";
    itemInfo.innerHTML = `<div class="divImagen">
    <img src="./imagenes/${poster}.jpg" alt="poster">
    </div>
    <div>
        <div>
            <h3>${nombre}</h3>
            <p>${resumen}</p>
            <p>Director: ${director}</p>
            <p>Duración: ${duracion} min.</p>
            <p>Género: ${genero}</p>
            <p>Año de estreno: ${estreno}</p>
            <p>Clasificación por edad: Para mayores de ${clasificacionEdad} años</p>
            <p>Calificación de IMDB: ${calificacionIMDB}</p>
            <p>Mirala por $ ${precio}</p>
        </div>
    </div>`
    modalInfo.appendChild(itemInfo);

    let peliculaEncontradaFavoritos = favoritos.findIndex((elemento) => {
        return elemento.nombre === item.nombre
    });

    let btnFavText;
    peliculaEncontradaFavoritos === -1 ? btnFavText = "Agregar a favoritos" : btnFavText = "Quitar de favoritos";

    let peliculaEncontradaCarrito = carrito.findIndex((elemento) => {
        return elemento.nombre === item.nombre
    });

    let btnCartText;
    peliculaEncontradaCarrito === -1 ? btnCartText = "Agregar al carrito" : btnCartText = "Quitar del carrito";

    let itemActions = document.createElement("div");
    itemActions.classList.add("modalInfoActions");


    setButton(btnFavText, "botonModal", "btnFav", itemActions, agregarFavoritos, item);
    setButton(btnCartText, "botonModal", "btnCart", itemActions, agregarCarrito, item);
    setButton("Volver", "botonModal", "btnVolver", itemActions, cerrarModal, modalInfo);
    itemInfo.appendChild(itemActions);

    modalInfo.style.display = "block";
    body.style.overflow = "hidden";
}

function agregarFavoritos(item) {
    let peliculaEncontrada = favoritos.findIndex((elemento) => {
        return elemento.nombre === item.nombre
    });
    peliculaEncontrada === -1 ? favoritos.push(item) : favoritos.splice(peliculaEncontrada, 1);

    const favoritosStr = JSON.stringify(favoritos);
    localStorage.setItem("PeliculasFavoritas", favoritosStr);

    let textoBoton = document.querySelector("#btnFav");
    textoBoton.innerHTML = "";
    let btnFavText;
    let textoNotificacion;
    if (favoritos.includes(item)) {
        btnFavText = "Quitar de favoritos"
        textoNotificacion = `${item.nombre} fue agregado a favoritos`
    } else {
        btnFavText = "Agregar a favoritos"
        textoNotificacion = `${item.nombre} fue quitado de favoritos`
    }

    textoBoton.innerHTML = btnFavText;

    mostrarPeliculas();

    mostrarNotificacion(textoNotificacion);
}

function agregarCarrito(item) {
    let peliculaEncontrada = carrito.findIndex((elemento) => {
        return elemento.nombre === item.nombre
    });
    peliculaEncontrada === -1 ? carrito.push(item) : carrito.splice(peliculaEncontrada, 1);

    const carritoStr = JSON.stringify(carrito);
    localStorage.setItem("PeliculasEnCarrito", carritoStr);

    modificarContadorCarrito();

    let textoBoton = document.querySelector("#btnCart");
    let btnCartText;
    let textoNotificacion;
    if (carrito.includes(item)) {
        btnCartText = "Quitar del carrito"
        textoNotificacion = `${item.nombre} fue agregado al carrito`
    } else {
        btnCartText = "Agregar al carrito"
        textoNotificacion = `${item.nombre} fue quitado del carrito`
    }

    textoBoton.innerHTML = btnCartText;

    mostrarNotificacion(textoNotificacion);
}


function modificarContadorCarrito() {
    let carritoContainer = document.querySelector("#carrito");
    let contadorCarrito = document.createElement("p");
    carritoContainer.innerHTML = ""
    if (carrito.length > 0) {
        contadorCarrito.innerHTML = `${carrito.length}`;
        carritoContainer.appendChild(contadorCarrito);
    }
}

function abrirCarrito() {
    let total = 0;
    let modalCart = document.querySelector("#modalCart")
    let modalCarrito = document.querySelector("#modalCarrito");
    modalCarrito.innerHTML = ""
    if (carrito.length > 0) {
        carrito.forEach((pelicula, indice) => {
            total = total + pelicula.precio;
            let modalContent = document.createElement("div");
            modalContent.classList.add("descripcionPelicula");
            modalContent.innerHTML = `<img src="./imagenes/${pelicula.miniatura}.jpg" alt="matrix">
            <p>${pelicula.nombre}</p>
            <p>$${pelicula.precio}</p>
            <button onClick="eliminarItem(${indice})">X Eliminar</button>`
            modalCarrito.appendChild(modalContent);
        })
        let montoTotal = document.createElement("div");
        montoTotal.classList.add("montoTotal");
        montoTotal.innerHTML = "";
        montoTotal.innerHTML = `<h4>Total de la compra: $${total}</h4>`
        modalCarrito.appendChild(montoTotal)

        let acciones = document.createElement("div");
        acciones.classList.add("accionesCarrito");
        acciones.innerHTML = "";
        acciones.innerHTML = `<button onClick="finalizarCompra()">Finalizar compra</button>
            <button onClick="vaciarCarrito()">Vaciar carrito</button>
            <button onClick="cerrarModal(modalCart)">Volver</button>`
        modalCarrito.appendChild(acciones)
    }
    modalCart.style.display = "block";
    body.style.overflow = "hidden";
}

function eliminarItem(indice) {
    let nombre = carrito[indice].nombre;
    carrito.splice(indice, 1);

    const carritoStr = JSON.stringify(carrito);
    localStorage.setItem("PeliculasEnCarrito", carritoStr);

    modificarContadorCarrito();

    cerrarModal(modalCart);

    mostrarNotificacion(`${nombre} fue quitado del carrito`)

    if (carrito.length != 0) {
        abrirCarrito()
    }
}

function vaciarCarrito() {
    carrito = [];

    const carritoStr = JSON.stringify(carrito);
    localStorage.setItem("PeliculasEnCarrito", carritoStr);

    modificarContadorCarrito();

    cerrarModal(modalCart);

    mostrarNotificacion("El carrito ha sido vaciado");
}

function mostrarNotificacion(notificacion) {
    Toastify({
        text: notificacion,
        duration: 2000,
        gravity: "bottom",
        className: "toastifyNotification",
        style: {
            background: "linear-gradient(to right, #4741A6, #9bbbfce5)",
        }
    }).showToast();
}

function finalizarCompra() {
    modalCarrito.innerHTML = "";
    cerrarModal(modalCart);


    Swal.fire({
        title: 'Estás a un paso de disfrutar del mejor cine',
        text: "¿Confirmar compra?",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Comprar',
        cancelButtonText: 'Volver',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Compra realizada',
                'Traé el pochoclo y disfrutá de la película. Su recibo fue enviado a ' + usuarioActual.email,
                'success'
            )
            carrito = [];

            modificarContadorCarrito();

            const carritoStr = JSON.stringify(carrito);
            localStorage.setItem("PeliculasEnCarrito", carritoStr);
        }
    })
}

// Fin de funciones

// Iniciar app

ingresarUsuario();

mostrarPeliculas();

modificarContadorCarrito();