export class NavigationButton {

    constructor(scene, x, y, text, callback, style = {}) {
        this.button = scene.add.text(x, y, text, {
            fontSize: '32px',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: {x : 20, y : 10},
            ...style,
        }).setOrigin(0.5).setInteractive();

        this.button.on('pointerdown', () => {
            callback();
        })


    }

}