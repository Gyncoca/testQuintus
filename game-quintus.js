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


Q.Sprite.extend('End', {
    init: function(p) {
        this._super(p, { sheet: 'end' });
    }
});

Q.Sprite.extend('BadGhost', {
    init: function(p) {
        this._super(p, {
            sheet: 'badGhost',
            sprite: 'badGhost',
            vx: -100, // On part vers la gauche par défaut
            collisionMask: Q.SPRITE_DEFAULT
        });

        this.add('2d, animation, aiBounce'); // On ajoute un peu d'intelligence artificielle et d'animations (aiBounce sert à gérer les collisions avec les murs, pour faire demi-tour automatiquement)
		this.on('bump.left, bump.right, bump.bottom', function(collision) {
		if(collision.obj.isA('Player')) { // S'il rentre dans un joueur, la partie est finie
			Q.stageScene('endGame', 1, { label: 'Perdu !' }); // Tiens, un paramètre est passé à notre scène, ça vous rappelle quelque chose ?
			collision.obj.destroy(); // On détruit le joueur, le jeu n'étant pas en pause, pour éviter de lancer plusieurs fois l'écran de fin
		}
	});

	this.on('bump.top', this, 'die'); // Si le joueur lui tombe dessus, on lance la méthode `die`
	},
	step: function (dt) {
		if (this.p.x <= 0 || this.p.x >= Q.width) {
			this.p.vx = -this.p.vx; // S'il va au bord, on inverse sa vitesse pour qu'il fasse demi-tour
		}

		if (this.p.vx > 0) {
			this.p.direction = 'right';
		}
		else if (this.p.vx < 0) {
			this.p.direction = 'left';
		}
		else {
			this.p.direction = null;
		}

		if (this.p.direction) {
			this.play('walk_' + this.p.direction);
		}

	},
	die: function (collision) {
		this.p.vx = this.p.vy = 0; // Pas bouger !
		this.play('dying'); // Fais le mort

		(function (bghost) {
			setTimeout(function() {
				bghost.destroy(); // On attend un peu puis on le détruit (il ne gênera pas les autres loups ou le joueur, comme ça)
			}, 300);
		})(this);

		collision.obj.p.vy = -300; // On fait rebondir le joueur
	}
});

Q.Sprite.extend('Player',{
    init: function(p) {
        this._super(p, {
            sheet: 'my_player',
            sprite: 'my_player', // On indique le sprite
            collisionMask: Q.SPRITE_DEFAULT, // On verra ça au moment de la gestion des collisions
            speed: 300,
            jumpSpeed: -500, // Pour sauter plus haut, on diminue la valeur
            direction: null // Par défaut il n'y a pas de direction, notre joueur est statique
        });

        this.add('2d, platformerControls,animation');
		
		this.on('hit.sprite',function(collision) { // Quand le joueur entre en collision avec un autre Sprite
			if(collision.obj.isA('End')) { // S'il s'agit d'une bergerie
				console.log('Bienvenue à la fin du niveau !');
				Q.stageScene('endGame', 1, { label: 'Gagné !' }); // On lance l'écran de fin avec un message personnalisé
				this.destroy(); // On détruit notre joueur, vu que la partie est terminée
			}
		});
		
		this.play('stand');

    },
	step: function(dt) {
		// On va déjà éviter que notre joueur ne sorte de la grille…
		if (this.p.x <= 0) {
			this.p.x = 0;
		}
		else if (this.p.x >= Q.width) {
			this.p.x = Q.width;
		}

		// Si on a appuyé sur le bouton pour sauter, on joue l'animation de saut (et on sort de la méthode pour gagner du temps)
		if (Q.inputs['up']) {
			this.play('jump');
			return;
		}

		// On calcule la variation horizontale pour savoir dans quel sens on bouge
		if (this.p.vx > 0) {
			this.p.direction = 'right';
		}
		else if (this.p.vx < 0) {
			this.p.direction = 'left';
		}
		else {
			this.p.direction = null; // Si aucune variation, pas de direction : joueur immobile
		}

		if (this.p.direction) {
			this.play('walk_' + this.p.direction); // On joue l'animation qui correspond à notre direction le cas échéant
		}
		else {
			this.play('stand'); // Sinon on affiche un joueur immobile
		}
	}
});

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
	
	var img_bg = new Q.Sprite({ x: Q.width/2, y: 70+Q.height/2, w: Q.width, h: Q.height, tileW: Q.width, tileH: Q.width, asset: 'ghost.png'}); // On ajoute notre image en spécifiant l'asset à utiliser, les dimensions à lui donner et la partie de l'image à utiliser (ici 600x800, soit la taille du canvas)
		
	stage.insert(img_bg); // Ne pas oublier d'insérer l'image (à noter que vous pouvez tout faire en une seule ligne, comme déjà vu plus tôt)
	img_bg.add('tween');
	moveSheep.apply(img_bg);
	
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


Q.scene('game', function(stage) {
    console.log('Niveau 1 !');
	stage.insert(new Q.Repeater({ asset: 'ciel.jpg', speedY: 0.5 })); // L'image ne se répète qu'à la verticale et avance moitié moins vite que le joueur
	  /* On pourra mettre la majorité du code du niveau ici */

	var tiles = new Q.TileLayer({
		dataAsset: 'game.json', // Nom du fichier tileset
		sheet: 'my_tiles', // Nom des tiles
		tileW: Q.sheets['my_tiles'].tileW, // Dimensions des tiles : on va les chercher directement depuis la feuille que l'on a crÃ©Ã©e au chargement
		tileH: Q.sheets['my_tiles'].tileH
	});
	
	stage.collisionLayer(tiles);
	
	stage.insert(new Q.End({ // Il faut positionner le centre du sprite, qui sera tout en haut à droite de la scène
		x: tiles.p.w - Q.sheets['end'].tileW/2, // Calé à droite
		y: Q.sheets['end'].tileW/2-20 // Calé en haut
	}));
	var player = new Q.Player(); // On crée notre joueur avec une vitesse de départ
	player.p.x = tiles.p.w / 2; // On place notre joueur horizontalement au centre…
	player.p.y = tiles.p.h - (player.p.cy + tiles.p.tileH); // â€¦ et verticalement en bas
	stage.insert(player);
	
	stage.insert(new Q.BadGhost({ x: tiles.p.w/2, y: tiles.p.h/2 })); // Au milieu de la carte
	stage.insert(new Q.BadGhost({ x: tiles.p.w/4, y: tiles.p.h - (player.p.cy + tiles.p.tileH) })); // En bas à gauche, pas loin du joueur (sinon ce serait trop simple)
	stage.insert(new Q.BadGhost({ x: tiles.p.w - Q.sheets['end'].tileW * 2, y: 0, vy: 100 })); // Celui-ci part de la bergerie, attention !
		
	
	
	stage.add('viewport').follow(player, { x: false, y :true }, { minX:0, maxX: tiles.p.w, maxY: tiles.p.h} );
	

});

Q.scene('endGame', function (stage) {
    var container = stage.insert(new Q.UI.Container({
        x: Q.width/2,
        y: Q.height/2,
        fill: 'rgba(0, 0, 0, 0.5)',
        radius: 5
    }));
	
	var button_y = 0;
	if (stage.options.label) {
		container.insert(new Q.UI.Text({
			x: 0,
			y: 0,
			color: '#ffffff',
			align: 'center',
			label: stage.options.label
		}));
		button_y += Math.ceil(container.children[container.children.length - 1].p.h) + 10;

	}

    var button = container.insert(new Q.UI.Button({ x: 0, y: button_y, fill: '#f7f7f7', label: 'Rejouer', highlight: '#ffffff', radius: 2 }));

    button.on('click', function() { // On place un écouteur sur le bouton, mais vous savez déjà faire normalement…
        Q.clearStages(); // On vide les scènes affichées, pour repartir sur un canvas vierge
        console.log('Bouton cliqué, redémarrage du jeu…');
        Q.stageScene('game', 0); // On relance le jeu
    });

    container.fit(10);
});

Q.load(['ghost.png','ciel.jpg','badGhost.png','blop.png','wall.png','littleGhost.png','game.json' /* vous pouvez aussi ajouter des assets ici, à la suite du tableau, pour en charger plusieurs */ ], function() {
    Q.sheet('my_tiles', 'wall.png', { tileW: 30, tileH: 30 }); // On crée des tiles de 30x30 à partir de l'image que l'on vient de charger et on enregistre le tout sou le nom *my_tiles*
	Q.sheet('my_player', 'littleGhost.png', { tileW: 25, tileH: 30 }); // On crée la feuille du joueur, qui permet de décomposer les états (pour l'animer par exemple)
	Q.sheet('badGhost', 'badGhost.png', { tileW: 25, tileH: 30 }); // N'oubliez pas de pré charger l'image qui correspond !
	Q.animations('my_player', {
		stand: { frames: [1], rate: 1/60, loop: true },
		walk_left: { frames: [0], rate: 1/60 },
		walk_right: { frames: [2], rate: 1/60 },
		jump: { frames: [3], rate: 1/60 },
	});
	Q.animations('badGhost', {
		stand: { frames: [0], rate: 1/60, flip: false, loop: true },
		walk_left: { frames: [1], rate: 1/60, flip: false, loop: true },
		walk_right: { frames: [2], rate: 1/60, flip: false }, // Eh oui, pour réduire le nombre d'images, il suffit de retourner celle que l'on souhaite !
		dying: { frames: [3], rate: 1/60, flip: false }, // Et ça fonctionne aussi pour une symétrie verticale !
	});
	Q.sheet('end', 'blop.png', { tileW: 50, tileH: 50 });
	
	Q.stageScene('startGame', 0);
	}, {
    progressCallback: function(loaded, total) {
        console.log('Chargement : ' + Math.floor(loaded/total*100) + '%'); // On affiche le pourcentage dans la console
    }
});





function moveSheep() {
    this.animate({ y: this.p.cy+20 }, 1.5, Q.Easing.Quadratic.InOut, {}).chain({ y: this.p.cy+140 }, 1.5, Q.Easing.Quadratic.InOut, { callback: moveSheep });
}


