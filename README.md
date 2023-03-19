# Angular parte III

En esta oportunidad vamos a trabajar en conjunto con una Api, si asi lo desean pueden empezar un nuevo trabajo y correr con otra api o usar la siguiente api https://young-sands-07814.herokuapp.com/api/products.

Primero nos dirigiremos a nuestro archivo **ts** de componente app para  hacegurarnos que tenemos el modulo HttpClientModule, si es que por casulidad clonaste el repositorio entonces tendras que intalar de nuevo todas las dependencia con la siguiente linea de comando.

    npm i

Si miras detenidamente la nueva api, veras que hay algunos combios. bueno vamos a reflejar esos cambios en nuestros compoenentesempezando con el model.

    export interface Product {
      id: string,
      title: string,
      price: number,
      description: string,
      images: string[],
      category: Category
    }
    export interface Category {
      id: string,
      name: string;
    }

Luego en nuestro services de products enviaremos nuestra nueva direccion de la API.

    getAllProduct() {
        return this.http.get<Product[]>('https://young-sands-07814.herokuapp.com/api/products')
      }

Y por ultimo en nuestro compoenente de product inicializaremos el nuevo estado

    @Input() product: Product = {
      id: '',
      title: '',
      price: 0,
      images: [],
      description: '',
      category: {
        id: '',
        name: ''
      }
    }

Con estos cambios deberia de andar nuestra pagina. Ahora supongamos que queremos hacer una solisitud a un producto en particular, bueno para ello vamos a hacer un nuevo metodo que involucre los id en nuestro services.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';

  @Injectable({
    providedIn: 'root'
  })
  export class ProductsService {

    urlApi = 'https://young-sands-07814.herokuapp.com/api/products'
    constructor(private http: HttpClient) {

    }

    getAllProduct() {
      return this.http.get<Product[]>(this.urlApi)
    }

    getAllProductById(id: string) {
      return this.http.get<Product>(`${this.urlApi}/${id}`)
    }
  }

Luego en nuestra lista de producto cambiemos el diseño del html

    <button (click)="toggleProduct()">click</button>
    <div class="products--grid">
      <app-product [product]="product" *ngFor="let product of products" (addedProduct)="onAddToShoppingCart($event)"
        (ShowProduct)="OnShowDetail($event)"></app-product>
    </div>
    <div class="product-detail" [class.active]="showProduct">
      <div>
        <button>close</button>
      </div>
    </div>

en el mismo componente agregurmos la hoja el estilo de nuestro nuevo componente.

    .product-detail {
      position: fixed;
      top: 0;
      left: 50%;
      bottom: 0;
      right: 0;
      background-color: whitesmoke;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      transition: all ease-out .5s;
      transform: translateX(100%);

      &.active {
        transform: translateX(0);
      }
    }

y creemos la logica para enviar el archivo desde el padre al hijo.


    import { Component, ElementRef, ViewChild } from '@angular/core';
    import { register } from 'swiper/element/bundle';
    import { Swiper } from 'swiper/types';

    export class ProductsComponent {

      myShoppingCart: Product[] = []
      products: Product[] = [];
      total = 0
      showProduct = false;

     ...
      toggleProduct() {
        this.showProduct = !this.showProduct
      }

      OnShowDetail(id: string) {
        this.producServices.getAllProductById(id).subscribe(
          ...
        )
      }
    }

Con eso el elemento pader le estara enviado (por ahora nada) los datos que necesitaremos mostrar. Para que el hijo lo reciba sera necesario agregaremos.


  export class ProductComponent {

    @Output() ShowProduct = new EventEmitter<string>()

    OnShowDetail() {
      this.ShowProduct.emit(this.product.id)
    }
  }

## Implementacion de componentes de terceros

Vamos a aprobechar esta oportunidad para implementar un compoenente de un tercero para el siguiente ejercicio. En este caso particular vamos a hacer uso de las herramienta que nos proporciona SwiperJS para hacer un silder o un carrucer con las imagenes que obtenermos de nuestra Api. Para ello escribimos el comando:

    npm i swiper

Luego podemos importar estas implementeciones desde nuestro app module

    import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

    @NgModule({
      declarations: [
        ...
      ],
      imports: [
        ...
      ],
      providers: [],
      bootstrap: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

Despues de esto podemos ir a nuesrto componente products y recibir estas importaciones.

    export class ProductsComponent {

      ...
        @ViewChild('swiper')
          swiperRef: ElementRef | undefined;
          swiper?: Swiper;

          ngAfterViewInit(): void {
            register();
            this.swiper = this.swiperRef?.nativeElement.swiper;
          }
    }

Luego envolveremos las imagenes que resivimos de nuestra api en los silder de acuerdo a la [docuemntacion](https://swiperjs.com/element).

    <div class="product-detail" [class.active]="showProduct">
      <div>
        <button (click)="toggleProduct()">close</button>

        <h1>{{ producChosen.title }}</h1>

        <swiper-container #swiper initial-slide="0" pagination="true" slides-per-view="1">
          <swiper-slide *ngFor="let img of producChosen.images">
            <img [src]="img" width="100%" alt="{{ producChosen.title }}" />
          </swiper-slide>
        </swiper-container>

        <p>{{ producChosen.description }}</p>
      </div>
    </div>

## Solicitudes POST

El segundo verbo http que veremos ahora es el verbo post. Este nos permite agregar nuevos elementos a nuestra Api. Ahora si ponemos a pensar un momento, sabemos que nuesrto objeto produtc tiene un objeto category como un atribulo. por lo que podria darnos problemas.

Una solucion no muy practica y costosa seria crear una nueva interface que tenga los elementos que necesitamos enviar y ignore los otros atributos como el id.

En este momento es cuando la herencia hace brilla con fuerza.

    export interface CreateProducto extends Omit<Product, 'id' | 'category'> {
      idCategory: string;
    }
  
En este ejemplo, gracias a TS creanmos una nueva interface que hereda del objeto producto, pero que ignora los atributos id y category.

Ahora podemos ir a nuestro service que se encarga de la conexion a la Api y crear el nuevo metodo que insertara nuestros producto a la Api.

    export class ProductsService {
      ...
      create(data: CreateProduct) {
        return this.http.post<Product>(this.urlApi, data)
      }
    }

Ahora de manera manual inyectaremos un nuevo objeto createProduct para verificar que nuestr metodo esta funcionando.

    createProduct(): void {
      const body: CreateProduct = {
        title: 'El producto!',
        description: 'El producto mas chingon',
        images: ['https://example.com/image'],
        price: 100,
        categoryId: 4
      };
      this.producServices.create(body)
        .subscribe(data => {
          //console.log(data)
          this.products.push(data);
        });
    }

>Nota: no intenten crear producto con una categoryId mayor a 4, por cuestiones de la misma Api les devolvera un error.

    <button (click)="createProduct()">create</button>

Ahora con este botton podremos insertar el elemento ya creado con anticipacion 

## PUT vs. PATCH, ¿cuál es la diferencia?

Técnicamente, los endpoints PUT deberían recibir todos los datos del registro a actualizar. Por ejemplo, el título, la descripción, el precio, la categoría, etc. En cambio, PATCH debería solo recibir un campo individual a actualizar como solo el título, o solo la categoría.

De todos modos, también puedes utilizar endpoints del tipo PUT que reciban un solo dato a actualizar. Ten en cuenta que PUT es mucho más utilizado que PATCH, pero si quieres refinar y ser estricto con tu backend y seguir a raja tabla las buenas prácticas, PATCH es ideal para este tipo de actualizaciones de tus datos.

Comencemos por crear el modelo que nos permitira hacer la peticion.

    export interface UpdateProduct extends Partial<CreateProduct> { }

Como puedes notar, aqui heredamos una del objetro CreateProduct que a su vez hereda de Product. Esto es asi, porque este es el modelo mas conveniente para pasaje de informacion de acuerdo a nuestra logica. Ahora si vemos bien, vemos un atribulo **Partial** este atributo nos va a permitir que los atributos del objeto permitan null.

Paso seguido creemos la funcion de actualizar.

    update(id: string, data: UpdateProduct) {
      return this.http.put<Product>(`${this.urlApi}/${id}`, data)
    }


Luego nos vamos a Ts de products y creamos la logica con la cual actualizar.

    UpdateProduct(): void {

    const changes: UpdateProduct = {
      title: 'el señor titulo'
    }
    const id = this.producChosen.id
    this.producServices.update(id, changes).subscribe(
      data => {
        console.log(data)
      })
  }

y por ultimo en el html agregaremos el boton de actualizar, que segun nuestra logica tomara el id del elemento que nos muestra el detalle.

## Delete

ESte metodo se podria considerar el segundo mas facil, despues del get para desarrollar.

    Delete(id: string) {
      return this.http.delete<boolean>(`${this.urlApi}/${id}`)
    }

Como vemos en esta Api, estamos retornando un boleano que nos confirmara si dicho producto fue eliminado o no.

    DeleteProduct(): void {
      const id = this.producChosen.id
      this.producServices.Delete(id)
        .subscribe(p => {
          const index = this.products.findIndex(item => item.id === this.producChosen.id)
          this.products.splice(index, 1)
          this.showProduct = false;
        })
    }

**html**

    <button (click)="DeleteProduct()">Eliminar</button>

## Paginacion.

Los endpoints del tipo Get suelen recibir informacion por parametros de URL.
- https://example.com/api/productos?offset=0&limit=10

Angular posee un método sencillo para construir varias URL con parámetros para realizar consultas en API.

    getProductsByPages(offset: number, limit: number) {
      return this.http.get<Product[]>(this.urlApi, { params: { offset, limit } });
    }

Con esto Nosotros limitariamos al cantidad de informacion que obtendriamos de la pagina. por ejemplo si offset sea igual a 0 y limit a 10, traeria los primeros 10 elementos del la Api,
Creamos dos variables para darle valores iniciales segun nuestras necesidades y lueho enviamos esa variables a nuestra funcion getProductsByPages() que recibira y traera la informacion de acuerdo a los parametros que establecimos.

    loadMore() {
      this.producServices.getProductsByPages(this.offset, this.limit)
        .subscribe(res => {
          this.products = this.products.concat(res);
          console.log(this.products)
          this.offset += 10;
        });
     }

Ahora para seguir la logica, es necesario llamarla en nuestra funcion ngOnInit y para evitar el conflicto borramos o comentamos la funcion original.

      ngOnInit(): void {
        this.producServices.getProductsByPages(this.offset, this.limit)
          .subscribe(res => {
            this.products = res;
          });
      }

Pero nosotro queremos que esta cargue a travez de un boton. Eso es simple. ya que solo tenemos que crear un boton que llame a nuestra funcion loadMore().

    <button (click)="loadMore()">Ver mas</button>

## Observables vs. Promesas

JavaScript posee dos maneras de manejar la asincronicidad, a través de: Observables y Promesas, que comparten el mismo objetivo, pero con características y comportamientos diferentes.

Gran parte del ecosistema Angular está basado en observables y la librería RxJS es tu mejor aliado a la hora de manipularlos. El patrón de diseño “observador” centraliza la tarea de informar un cambio de estado de un determinado dato o la finalización de un proceso, notificando a múltiples interesados cuando esto sucede sin necesidad de que tengan que consultar cambios activamente.

### Características de los Observables en Javascript:
- Emiten múltiples datos
- Permiten escuchar cualquier tipo de proceso, (peticiones a una API, lectura de archivos, etc.)
- Notifican a múltiples interesados
- Pueden cancelarse
- Manipulan otros datos (transformar, filtrar, etc.) con RxJS.
- Son propensos al callback hell

Las promesas son un método algo más sencillo y directo para manipular procesos asincrónicos en Javascript. Además, estos objetos tienen dos posibles estados:
- Resuelto
- Rechazado


### Características de las Promesas:
- Ofrecen mayor simplicidad
- Emiten un único valor
- Evitan el callback hell
- No se puede cancelar
- Proveen una robusta API nativa de Javascript disponible desde ES 2017
- Constituyen librerías populares como AXIOS o Fetch

Veamos un pequeño ejemplo.

    import { retry } from 'rxjs/operators';

    urlApi2 = 'https://young-sands-07814.herokuapp1.com/api/products'
    @Injectable({
      providedIn: 'root'
    })
    export class ApiService {

      constructor(
        private http: HttpClient,
      ) { }

       getProductsByPages(offset: number, limit: number) {
        return this.http.get<Product[]>(this.urlApi2, { params: { offset, limit } }).pipe(
          retry(2));
      }


    }

El método .pipe() de los observables permite manipular datos y con la función retry() de RxJS le indicas la cantidad de reintentos que buscas para que la petición lo haga en caso de fallar. En este ejemplo intencionalmente cambiamos la url a una que no existe y si entramos a las opciones de desarrollador, network o red veremos que se repitio la peticion 2 veces.


## El problema de CORS

Cross Origin Resource Sharing (CORS) o en español, Intercambio de Recursos de Origen Cruzado, es un mecanismo de seguridad para la solicitud e intercambio de recursos entre aplicaciones con dominios diferentes. En pocas palabras, si las solicitudes HTTP se realizan desde un dominio diferente al dominio del backend, estas serán rechazadas.

Si eres desarrollador o desarrolladora front-end, tendrás problemas de CORS a lo largo de tu carrera y en múltiples oportunidades. Pero no te preocupes, es completamente normal y vamos a ver de qué se trata para evitar dolores de cabeza.

Si CORS no está habilitado en el backend que estés consultando, las peticiones se bloquearán y verán un error en la consola de desarrollo del navegador.

Dependerá del equipo back end o de ti si también estás desarrollándolo, de habilitar el dominio del front-end desde el cual se ejecutarán las peticiones.

Para habilitar en angular primero en la carpeta raiz de nuestro proyecto vamos a crear un nuevo archivo json llamado **proxy.config.json** y dentro vamos a llenar colocar:

    {
      "/api/*": {
        "target": "https://young-sands-07814.herokuapp.com",
        "secure": true,
        "logLevel": "debug",
        "changeOrigin": true
      }
    }

De esta manera el proxi se va a encargar de todo lo que venga con /api/... de rellenar el target. Entonces tenemos que cambiar la configuracion de nuestra url de nuestro servicio.

    export class ProductsService {

      urlApi = '/api/products'
      ...

    }
y por ultimo para correr la aplicacion vamos a ir a nuestro **package.son** y agregaremos un nuevo scripts para correr el programa.

    "scripts": {
        "ng": "ng",
        "start": "ng serve",
        "start:proxy": "ng serve --proxy-config ./proxy.config.json",
        "build": "ng build",
        "watch": "ng build --watch --configuration development",
        "test": "ng test"
      },

Ahora, como sabes la etapa de desarrollo y la etapa de produccion son dos cosas distintas. este truco solo nos permitira seguir trabajando en la etapa de produccion, pero en la de desarrollo habra un problema con la url.

En versiones anterirores de Angular venian con un directorio llamado environments, pero si tienes angular 15 o superior vas a tener que crearlo dentro de la carpeta src.

detro vamos a crear dos archivos llamado environment.ts y environment.prod.ts. Por si nombre ya habras adivinado que uno se se usa en produccion y otro para desarrollo.

    // environments.ts
    export const environment = {
      production: false
    };

    // environments.prod.ts
    export const environment = {
      production: true
    };

Ahora que tenemos esto es pdemos agregar nuestro dominio dentro de estos archivos. como en produccion hicimos uso del proxi para poder aceder y evirtar el error tener las peticiones bloqueadas podemos dejarla vacio.

    export const environment = {
      production: false,
      API_URL: '',
    };

Pero el problema estaria en procuccion, por lo que tendremos que agregar la url para no encontrar problemas en el futuro.

    export const environment = {
      production: true,
      API_URL: 'https://young-sands-07814.herokuapp.com',
    };

Pero ¿como leemos el recurso de este ambiente? Para ello vamos a nuestro servicios e importamos el recurso.

    import { environment } from './../../environments/environments';

    export class ProductsService {

      urlApi = `${environment.API_URL}/api/products`
    }

## Manejo de errores

Como todos sabemos las peticiones HTTP que tu aplicación realiza pueden fallar por una u otra razón. Recuerda que una aplicación profesional tiene que contemplar estos escenarios y estar preparada para cuando esto suceda.

Para ello tenemos el Angular nos da ciertas herramientas que nos podremos usar para capturar los errorres.

    import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
    import { catchError, retry } from 'rxjs/operators';
    import { throwError } from 'rxjs';

    getAllProductById(id: string) {
      return this.http.get<Product>(`${this.urlApi}/${id}`).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === HttpStatusCode.Conflict) {
            return throwError(()=> new Error('Algo esta fallando en el server'));
          }
          if (error.status === HttpStatusCode.NotFound) {
            return throwError(() => new Error('El producto no existe'));
          }
          if (error.status === HttpStatusCode.Unauthorized) {
            return throwError(() => new Error('No estas permitido'));
          }
          return throwError(() => new Error('Ups algo salio mal'));
        })
      )
    }

Despues de configurar vamos a nuestro componente para capturar estos errores.

    OnShowDetail(id: string) {
        this.producServices.getAllProductById(id).subscribe(
          data => {
            this.toggleProduct();
            this.producChosen = data
          }, error => {
            console.log(error);
          })
      }

>Nota: esto debe estar en todas las funciones que tengan una peticion a la api o db.

Luego creamos un boton para probar si captura el error correctamente.

    <button (click)="OnShowDetail('6545641')">prueba de error</button>

## Login y manejo de Auth

Cuando nos conectamos nosotros tenemos 2 instacias, la aplicacion y nuestra Api. Cuando nos logueamos lo hacemos por medio de un login para enviar el usuario y el pasword. si ambos son correcto el backend nos devolvera un token (JWT). una vez obtenido el token lo almacenaremos en algun lugar para usarlo en alguna aplicacion protegida.

Comencemos creando un nuevo servicios llamado auth, otro para el token y otro para los usuarios.

    ng g s services/auth
    ng g s services/user
    ng g s services/token

comencemos configurando user.service para obtener y crear usuarios. Como ya sabemos necesitamos importar httpcliente

    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { User, CreateUser } from '../models/user.models';

    import { environment } from './../../environments/environments';

    @Injectable({
      providedIn: 'root'
    })
    export class UserService {

      urlApi = `${environment.API_URL}/api/users`

      constructor(private http: HttpClient) { }

      create(user : CreateUser) { 
        return this.http.post<User>(this.urlApi, user)
      }

      getAll(){
        return this.http.get<User[]>(this.urlApi)
      }
    }

En auth vamos a guardar la logica para el login.

    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Auth } from './../models/auth.models';

    import { environment } from './../../environments/environments';

    @Injectable({
      providedIn: 'root'
    })
    export class AuthService {

      urlApi = `${environment.API_URL}/api/auth`

      constructor(private http: HttpClient) { }

      login(email: string, password: string) {
        return this.http.post<Auth>(`${this.urlApi}/login`, { email, password })
      }
      profile(token : string) {
        return this.http.get<User>(`${this.urlApi}/profile`,{
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
  }
    }

y por ultimo nuestro token, lo dejaremos como esta por ahora.


No tenemos que olvidarnos de crear nuestras interfaces para cada uno de nuestros servicios.

    // interfaces/user.interface.ts
    export interface Credentials {
      email: string;
      password: string;
    }
    export interface Login {
      access_token: string;
    }
    export interface User {
      id: string;
      email: string;
      password: string;
      name: string;
    }

Para no estar perdiendo el tiempo con un formulario y todo lo demas, vamos a hacer un ejemplo simple en app component.


    import { AuthService } from './services/auth.service';
    import { UserService } from './services/user.service';

    export class AppComponent {

      constructor(
        private authService: AuthService,
        private userService: UserService
      ) { }

      createUser() {
        this.userService.create({
          name: 'Sebas',
          email: 'sebas@mail.com',
          password: '1212'
        })
          .subscribe(rta => {
            console.log(rta);
          });
      }

       login() {
        this.authService.login('Castellano@mail.com',
          '1212')
          .subscribe(rta => {
            console.log(rta.access_token)
            this.token = rta.access_token;
          })
      }
    }

Con esto despues de aprentar un boton podriamos crear y loguear el usuario recien creado. Luego de que el usuario se halla registrado, puedes utilizar el token para realizar peticiones al backend que requieran de autenticación. Para esto, es necesario inyectar dicho token en las solicitudes HTTP.

Para esto, puedes obtener el token desde Local Storage (o si prefieres guardarlo en Cookies) e inyectarlo directamente en los Headers de la petición.

    <app-nav></app-nav>
    <button (click)="createUser()">Crear User</button>
    <button (click)="login()">Loguear</button>
    <button (click)="getProfile()">Get profile</button>

    <app-products></app-products>

**ts**

    getProfile() {
        this.authService.profile(this.token)
          .subscribe(
            profile => {
              console.log(profile)

            }
          );
      }

## Uso de interceptores

Un interceptor, como su nombre indica, interceptará las solicitudes HTTP antes de que se envíen al servidor, para agregar información a las request, manipular datos, entre otras utilidades.

Con el CLI de Angular, puedes crear un interceptor con el comando

    ng g interceptor <interceptro_name>. 

Creemos uno para evaluar el tiempo y vamos al archivo.

    ng g interceptor interceptors/time --flat

    ...
    import { tap } from 'rxjs/operators';

    export class TimeInterceptor implements HttpInterceptor {

      constructor() { }

      intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const start = performance.now()
        return next
          .handle(request)
          .pipe(tap(() => {
            const time = (performance.now() - start) + 'mas';
            console.log(request.url, time)
          }));
      }
    }

agregaremos el la nueva dependencia tap que nos permitira correr el proceso sin modicicar la respuesta. Luego hacemos la logica para medir el tiempo y manualmente llamamos a nuestro interceptor en app.module.ts

    import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
    import { TimeInterceptor } from './interceptors/time.interceptor';
    ...

    @NgModule({
      ...
       providers: [{
        provide : HTTP_INTERCEPTORS,
        useClass :TimeInterceptor,
        multi:true
      }],
    })

Ahora que estamos entendiendo como funciona, usemos los interceptores para enviar nuestros tokens. primero vamos a nuestro token.services y agregurmos los cambios.

    export class TokenService {

      constructor() { }

      saveToken(token: string) {
        localStorage.setItem('token', token);
      }

      getToken() {
        const token = localStorage.getItem('token')
        return token
      }
    }

Luego en nuestro Auth.service importaremos y agregaremos una pipe a nuestro login.

    import { Token } from '@angular/compiler';
    import { tap } from 'rxjs/operators';
    ...
    
    login(email: string, password: string) {
        return this.http.post<Auth>(`${this.urlApi}/login`, { email, password })
          .pipe( tap( response => this.TokenService.saveToken(response.access_token)))
      }

Ahora que vamos a usar token ya no nocesitaremos que la funcion profile reciba el toquen, despues de todo estaria guardada en el localStorage. simplemente derivaremos la tarea de enviar el token al interceptor.

Para ello comencemos creando uno nuevo.

    ng g interceptor interceptors/token --flat


    import { TokenService } from '../services/token.service';

    export class TokenInterceptor implements HttpInterceptor {

      constructor(
        private tokenService : TokenService
      ) {}

      intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        request = this.addToken(request)
        return next.handle(request);
      }

      private addToken(request : HttpRequest<unknown>){
        const token = this.tokenService.getToken()
        if (token) {
          const authReq = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${token}`)
        });
        return authReq;
        }
        return request;
      }
    }


Lo que hacemos es crear una nueva funcion que verifia si existe el token y si no devuelve el request tal y como estaba. Vamos a nuestro app.module para agregar este interceptor.

    providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: TimeInterceptor,
    multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }],

Con esto agregamos una capa mas de seguridad a nuestra aplicacion y vemos que el coportamiento sigue siendo el mismo.
