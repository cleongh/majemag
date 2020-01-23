# Majemag en Complutum

[Se puede probar el juego en un navegador](https://clnznr.github.io/majemag/)

## Objetivos

- Que se muevan un poco y salgan a la calle de vez en cuando
- Que se vea UCM
- Fomentar la "colaboración y el buen rollo"
    - Enlazarlo con los premios

## Narrativa

El juego tendrá narrativa de principio a fin. Todas las partidas estarán conceptualmente unidas en un solo avance por una mazmorra en el que habrá que derrotar al dragón *Majemag*. Majemag se ha hecho con el control de Complutum (como si fuera Eriador y Smaug) y tenemos que liberarlo.

Todo el juego se articula como una analogía a la Game Jam. Cuando vaya finalizando el tiempo de jam, se dispararán las probabilidades de que el motor genere la batalla contra Majemag.

Habrá 2 tipos de personaje: lucha, magia (analogía con programador y artista).


## Dinámica global

La idea del juego en la pantalla es que actúe como reconocimiento (no único) a los participantes que colaboren más con otros. Colaborar mejorará la experiencia de juego gracias al reconociento de los compañeros de *jam*. Así, se gamifica un poco el proceso y anima a todos a colaborar.

Así, se podrá reconocer, metiante tuits con el hashtag `#majemag`, la colaboración. Es estos tuits tendrá que aparecer Majemag derrotado idealmente, y aparecerá explícitamente el participante reconocido en el texto. Sólo un reconocimiento por tuit.

El participante podrá decidir cómo se le cita (idealmente con su nombre en Twitter), para mantener, si quiere, el anonimato.

Al final de la jam se hará un recuento *cualitativo* de los reconocimientos para dar un premio.

## Diseño del juego

### Interfaz

No hay cambio de menú o interfaces explícitas: siempre se está jugando en una habitación, con héroes de tipos concretos (cuando llega una nueva persona, se crea un tipo de héroe aleatorio)


### Layout aleatorio

Las habitaciones no tienen estado global, cada pantalla tiene su propio estado.

Las habitaciones nunca tienen salida hacia el lado del que se ha venido, ni hacia abajo. Así no podemos volver a una pantalla, con lo que no hace falta guardar un mapa (se avanza siempre hacia adelante). Esto coincide con la metáfora jam de "no deshacer lo hecho".


## Mecánicas

### Andar

Lo único que se puede hacer es andar por la plaza. Cuando las personas se muevan, el héroe se moverá a la vez, y disparará si hay enemigos.

### Puertas

Las puertas se activan con el tiempo. El tiempo debería ser suficiente como para que se pueda cambiar de opinión (individual o grupalmente).

# Concepto y arte

Habrá referencias a la UCM. En estandartes y otro arte diegético. Estamos en una especie de Eriador que es la UCM.

El fondo será oscuro (casi negro) para evitar emisiones muy exageradas.

La paleta es "aurora" de [Lospec](https://lospec.com/palette-list/aurora)

# TODO

- [x] Transiciones suaves entre pantallas
- [ ] Transiciones/animaciones de morir enemigo
- [ ] Transiciones/animaciones de atacar
- [ ] Textos
- [ ] Comprobar que los jugadores se pintan los últimos
- [x] Tamaño de puertas y muros correspondientes
- [ ] Animación dragón
- [ ] Animación mago
- [ ] Animación luchador
- [ ] Animación fantasma
- [ ] Probabilidades de generación de habitaciones
- [ ] Solucionar y depurar la identificación de blobs
- [x] Decidir y planear arte
- [x] Hacer que los magos disparen mejor (más frecuencia o como sea)
- [x] Motor de animaciones
