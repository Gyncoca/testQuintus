var Q = new Quintus({
    development: true // On lance le mode développement, pour forcer le refresh des assets (images, fichiers JSON…). Attention à bien désactiver cela une fois en production !
})

Q.include([ // On indique quels composants inclure de base
    Quintus.Sprites, // Pour gérer les sprites (les calques en gros)
    Quintus.Scenes, // Pour gérer les scenes (les différentes pages, pour faire simple)
    Quintus.Anim, // Pour gérer les animations (sur des sprites, par exemple)
    Quintus['2D'], // Pour gérer la 2D : permet d'avoir des ennemis qui se déplacent et de détecter les collisions automatiquement
    Quintus.Input, // Pour gérer les contrôles (certains contrôles sont inclus de base, c'est assez pratique)
    Quintus.Touch, // Pour gérer les contrôles via une surcouche tactile (avec un joypad si nécessaire — c'est paramétrable)
    Quintus.UI // Pour afficher des boutons, du texte, etc.
])

Q.setup('game', {
    maximize: false, // Inutile de modifier la taille du canvas (`true` permet d'étendre à toute la surface disponible)
    width: 600, // Largeur de base
    height: 800 // Hauteur de base
});
Q.controls();
Q.touch();


Q.scene('startGame', function(stage) { // On crée une nouvelle scène que l'on nomme. Une fois affichée la fonction sera appelée, avec en paramètre notre objet scène (dont on récupèrera quelques infos et auquel on balancera quelques objets)
    console.log('Écran de lancement affiché');
	
	var sprite_bg = new Q.Sprite({ x: 0, y: 0, w: Q.width, h: Q.height, type: Q.SPRITE_UI });

	sprite_bg.draw = function(ctx) { // Au moment de dessiner le sprite, on récupère le contexte 2D du canvas pour dessiner librement
		ctx.fillStyle = '#e0b232'; // On veut du jaune
		ctx.fillRect(this.p.x, this.p.y, this.p.w, this.p.h); // On dessine un rectangle de la taille du sprite
		var degrade = ctx.createRadialGradient(Q.width/2, Q.height/2, 0, Q.width/2, Q.height/2, Q.width/2); // On crée un dégradé radial qui commence du centre du sprite et qui s'étend sur la moitié de la taille de ce même sprite
		degrade.addColorStop(0, '#ffffff'); // Le centre sera blanc
		degrade.addColorStop(1, 'rgba(255, 255, 255, 0)'); // La fin sera transparente
		ctx.fillStyle = degrade; // On veut dessiner notre dégradé
		ctx.fillRect(0, 0, Q.width, Q.height); // On dessine le dégradé par-dessus le fond jaune
	};

	stage.insert(sprite_bg);
	
	var title = stage.insert(new Q.UI.Text({
		x: Q.width/2,
		y: 50,
		label: 'Mon super jeu',
		align: 'center',
		family: 'Comic Sans MS, Comis Sans, cursive', // Oui, du Comic Sans ! Pourquoi pas ?
		size: 48, // C'est un titre, donc c'est gros
		color: '#aa4242' // Un rouge foncé, comme un bon verre de rouge… (hips !)
	})); // On insère un titre sous forme de texte en haut, centré
	
	
	var container = stage.insert(new Q.UI.Container({ // On crée un conteneur
		x: Q.width/2, // On le centre en largeur
		y: Q.height/2, // On le centre en hauter
		fill: 'rgba(0, 0, 0, 0.5)', // On applique un fond noir semi-transparent
		radius: 5 // Des bordures arrondies de 5 pixels pour faire joli
	}));
	var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: '#f7f7f7', label: 'Jouer', highlight: '#ffffff', radius: 2 })); // On insère un bouton dans notre conteneur, avec un fond blanc cassé, qui devient blanc au clic, en haut du conteneur
	
	button.on('click', function() { // On place un écouteur sur le bouton pour gérer le clic
		Q.clearStages(); // On vide les scènes affichées, pour repartir sur un canvas vierge
		console.log('Bouton cliqué, lancement du jeu…'); // Regardez votre console ;)
		Q.stageScene('game', 0); // On affiche une autre scène (qui sera crée dans la partie 3) au rang 0, soit tout en bas dans la pile des calques
	});
	container.fit(10); // On adapte la taille du conteneur à son contenu (le bouton), avec un padding (marge interne) de 10 pixels
	
	
});

Q.stageScene('startGame', 0); // On affiche notre scène au rang 0, soit tout en bas de la pile (pensez à des calques, comme sous votre logiciel de dessin préféré ou à un z-index en CSS)

