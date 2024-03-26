'use strict';

// Objeto vue
const app = Vue.createApp({

    data(){
        return {
            datos: null,
            campus: null,
            carreras: null,
            personales: {
                nombre: null,
                apaterno: null,
                email: null,
                celular: null
            },
            calculados: {
                urlreferrer: null,
                dispositivo: null
            },
            constantes: {
                verify_token: 'UVM.G0-24',
                CID: '2016705784.1697574806',
                marcable: 1
            },
            oferta: {
                campusLargo: "",
                carrera: "",
                carreraInteres: null,
                subNivelInteres: 12,
                nivelInteres: null,
                ciclo: null
            }
        }
    },
    methods: {
        ObtenerDispositivo(navegador, os){ // Metodo para validar el tipo de dispositivo a traves del sistema operativo
            
            if (os === 'Windows' || os === 'OS X' || os === 'Linux') {

                this.calculados.dispositivo = `computadora-${navegador}`;
            } else if (os === 'iOS' || os === 'Android') {
                
                this.calculados.dispositivo = `dispositivo-movil-${navegador}`;
            }  else {

                this.calculados.dispositivo = `desconocido-${navegador}`;        
            }

            console.log(this.dispositivo);
        },
        ObtenerDatosOferta (){ // Metodo para obtener la información de la oferta educativa

            fetch('https://uvm.mx/suitev3/get_ofertando_vigente').then(response => {

                return response.json();
            }).then(data => {

                this.datos = data.message;

                const campus = [];

                data.message.forEach(objeto => {
                    
                    if (!campus.includes(objeto.nombrelargo_campus)) {
                        
                        campus.push(objeto.nombrelargo_campus);
                    }
                });

                this.campus = campus;
            });
        },
        obtenerCarrera(campus){ // Metodo para obtener las carreras que tiene cada campus

            this.carreras = null;

            const carreras = [];

            this.datos.forEach(objeto => {
                
                // Validamos que los campus sean iguales
                if (objeto.nombrelargo_campus == campus) {
                 
                    if (!carreras.includes(objeto.ofertando_crmit_name)) {
                    
                        carreras.push(objeto.ofertando_crmit_name);
                    }
                }
            });

            this.carreras = carreras;
        },
        seleccionCarrera(carrera){ // Metodo para 

            this.datos.some(objeto => {
                
                // Validamos que los campus sean iguales y las carreras
                if (objeto.nombrelargo_campus == this.oferta.campusLargo && objeto.ofertando_crmit_name == carrera) {
                 
                    this.oferta.carreraInteres = objeto.carrerainteres;
                    this.oferta.nivelInteres = objeto.crmit_nivelcrm;
                    this.oferta.ciclo = objeto.crmit_cicloreinscripciones;

                    return true;
                }
            });
        },
        envioOferta () { // Metodo para enviar la información del pre-registro

            console.log('se envio success');

            // URL a la que enviar la solicitud POST
            const url = 'https://webhooksqa.uvm.mx/proc-leads/lead/medios.php';

            // convertir a minisculas y sin espacios el nombre
            const banner = this.personales.nombre.toLowerCase().replace(/\s+/g, '');

            // // Datos a enviar en la solicitud POST
            // const requestData = {
            //     nombre: this.personales.nombre,
            //     apaterno: this.personales.apaterno,
            //     email: this.personales.email,
            //     celular: this.personales.celular,
            //     urlreferrer: this.calculados.urlreferrer,
            //     dispositivo: this.calculados.dispositivo,
            //     banner: banner, 
            //     CID: this.constantes.CID,
            //     verify_token: this.constantes.verify_token,
            //     marcable: this.constantes.marcable,
            //     campusLargo: this.oferta.campusLargo,
            //     carrera: this.oferta.carrera,
            //     carreraInteres: this.oferta.carreraInteres,
            //     subNivelInteres: this.oferta.subNivelInteres,
            //     nivelInteres: this.oferta.nivelInteres,
            //     ciclo: this.oferta.ciclo,
            //     gclid: null,
            //     utm_campaign: null
            // };

            // Datos a enviar en la solicitud POST
            const formData = new FormData();

            formData.append('nombre', this.personales.nombre);
            formData.append('apaterno', this.personales.apaterno);
            formData.append('email', this.personales.email);
            formData.append('celular', this.personales.celular);
            formData.append('urlreferrer', this.calculados.urlreferrer);
            formData.append('dispositivo', this.calculados.dispositivo);
            formData.append('banner', banner);
            formData.append('CID', this.constantes.CID);
            formData.append('verify_token', this.constantes.verify_token);
            formData.append('marcable', this.constantes.marcable);
            formData.append('campusLargo', this.oferta.campusLargo);
            formData.append('carrera', this.oferta.carrera);
            formData.append('carreraInteres', this.oferta.carreraInteres);
            formData.append('subNivelInteres', this.oferta.subNivelInteres);
            formData.append('nivelInteres', this.oferta.nivelInteres);
            formData.append('ciclo', this.oferta.ciclo);
            formData.append('gclid', '');
            formData.append('utm_campaign', '');

            console.log(formData);

            // Configuración de la solicitud
            const options = {
                method: 'POST',
                body: formData
            };

            // Envío de la solicitud
            fetch(url, options).then(response => {
                
                return response.json();
            }).then(data => {
                
                if (data.procesado == 0) {
                
                    Swal.fire('¡Éxito!', 'La operación se realizó correctamente.', 'success');

                    this.carreras = null;
                    this.personales.nombre = null;
                    this.personales.apaterno = null;
                    this.personales.email = null;
                    this.personales.celular = null;

                    this.oferta.campusLargo = "";
                    this.oferta.carrera = "";
                    this.oferta.carreraInteres = null;
                    this.oferta.nivelInteres = null;
                    this.oferta.ciclo = null;

                } else {
                    
                    Swal.fire('¡Error!', 'Hubo un problema al realizar la operación.', 'error');
                }

                // console.log('Respuesta:', data);
            }).catch(error => {

                Swal.fire('¡Error!', 'Hubo un problema al realizar la operación.', 'error');
                // console.error('Error:', error);
            });
        }
    },
    mounted() {
        
        this.calculados.urlreferrer = window.location.href; // obtenemos la url de donde se manda la petición 
         
        const navegador = platform.name; // obtenemos el navegador
        const os = platform.os.family; // obtenemos el sistema operativo

        this.ObtenerDispositivo(navegador, os);
        this.ObtenerDatosOferta();
    }
});