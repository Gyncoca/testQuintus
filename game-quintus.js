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
	};

	stage.insert(sprite_bg);
	
	
});

Q.stageScene('startGame', 0); // On affiche notre scène au rang 0, soit tout en bas de la pile (pensez à des calques, comme sous votre logiciel de dessin préféré ou à un z-index en CSS)

