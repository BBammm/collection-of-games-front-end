/*
1. setRenderer();
*/
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Input, AfterViewInit, OnChanges, SimpleChange } from '@angular/core';
import * as THREE from 'three';
import * as OBJLoader from 'three-obj-loader';
OBJLoader(THREE);
import * as MTLLoader from 'three-mtl-loader';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-dicegameplayer',
  template: `
  <div #rendererContainer></div>
  `,
  styleUrls: []
})
export class DiceGamePlayerObjectComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges  {
    @ViewChild('rendererContainer') private rendererContainer: ElementRef;
    private ngUnsubscribe = new Subject();

    private THREE = null;
    private renderer = null; // = new THREE.WebGLRenderer({ alpha: true }); // background alpha
    private scene = null;
    private camera = null;
    // private materials = null;

    private scale: [number, number] ; // 주사위 스케일
    private scaleMinLimit: number; // 주사위 스케일 최소
    private scaleMaxLimit: [number, number]; // 주사위 스케일 최대
    private diceDirection = ['up', 'up']; // 주사위 방향

    private speed: number; // 0.01
    private finalSpeed: number; // 주사위 결과에서의 속도
    private scaleStep: number; // 0.02
    // private boundTime: [number, number]; // 주사위 바운드 숫자 : 2번 바운드 후 바닥에 않을 때 실제 좌표입력

    private resultDice: [number, number];
    // private randomStartAngle = [0, 1, 2, 3];

    private resultDiceDegree = [
            [0, 0],
            [Math.PI * 90 / 180, 0], // 1
            [0, Math.PI * 90 / 180], // 2     1.57
            [0, 0], // 3
            [Math.PI, 0], // 4
            [0, Math.PI * 270 / 180], // 5     0 : 0, 90: 1.57, 180: 3. 14, 270: 4.71, 360: 6.28
            [Math.PI * 270 / 180, 0], // 6     4.71
        ];
    private mod = (Math.PI * 2); // 6.283185307179586

    private diceStartanimation = [null, null];
    private diceEndanimation = [null, null];
    private diceObject = {0: null, 1: null};

    private rendererSize = {width: 400, height: 220};

    // private diceGame = { objUrl: '../../../../../assets/games/dice/obj/' };
    private diceGame = { objUrl: './assets/games/dice/obj/' };
    // private diceGame = { objUrl: './dice/obj/' };
    // randomStartAngle = [0, Math.PI * 90, Math.PI * 180, Math.PI * 270];
    constructor(protected eventSvc: EventService) {
        this.THREE = THREE;
        this.eventSvc.getDiceGameResult()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((message) => {
            this.diceAnim(message.dice1, message.dice2);
        });
    }

    @Input() private width: number;
    @Input() private height: number;

    public ngOnInit(): void {
        this.setRenderer();
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
        for (const propName in changes) {
            if (changes.hasOwnProperty(propName)) {
                switch (propName) {
                    case 'width':
                        this.rendererSize.width = changes[propName].currentValue;
                        break;
                    case 'height':
                        this.rendererSize.height = changes[propName].currentValue;
                        break;
                }
            }
          }
     }

    protected setRenderer(): void {
        this.renderer = new THREE.WebGLRenderer({ alpha: true }); // background alpha
        this.scene = new this.THREE.Scene();

        // 위치
        // this.positon = new THREE.Vector3( 0, 1, 0 );
        // PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
        // https://www.jonathan-petitcolas.com/2013/04/02/create-rotating-cube-in-webgl-with-threejs.html
        // this.camera = new THREE.PerspectiveCamera(75, 450 / 220, 1, 10000);
        this.camera = new this.THREE.PerspectiveCamera(25, this.rendererSize.width / this.rendererSize.height, 1, 10000);

        // this.camera = new THREE.PerspectiveCamera(75, 600 / 400, 1, 10000);
        this.camera.position.z = 1000; // 1000
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        // this.camera.position.set(600, 600, 1000);
        const light = new this.THREE.DirectionalLight( 0xffffff ); // ( 0xffffff );
        // const light = new THREE.DirectionalLight( 0xffff00 );
        light.position.set( 0, 1, 1 ).normalize();
        this.scene.add(light);
        this.createDiceObject(0, () => {
            this.diceObject[0].position.set(-150, 50, 0);
        });
        this.createDiceObject(1, () => {
            this.diceObject[1].position.set(150, -50, 0);
         });
     }

    protected createDiceObject(num: number, callback: () => void): void {

        const mtlLoader = new MTLLoader();
        mtlLoader.setPath(this.diceGame.objUrl);
        mtlLoader.load('dice.mtl', (materials) => {
            materials.preload();
            const objLoader = new this.THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath(this.diceGame.objUrl);

            objLoader.load('dice.obj', (object) => {
                this.diceObject[num] = this.unitize(object, 100);
                this.scene.add(this.diceObject[num]);
                callback();
            }, this.onProgress, this.onError);

        }, this.onProgress, this.onError);
    }

    public ngAfterViewInit(): void {
        // this.renderer.setSize(450, 220); // 450, 220 600, 400
        this.renderer.setSize(this.rendererSize.width, this.rendererSize.height); // 450, 220 600, 400
        this.renderer.domElement.style.display = 'block';
        this.renderer.domElement.style.margin = 'auto';
        this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    }

    protected dice_init(): void {
        // this.height = [0, 0];
        // this.max_height = 250;
        this.scaleMinLimit = 1; // 주사위 스케일 최소
        this.scaleMaxLimit = [2, 2]; // 주사위 스케일 최대
        this.scale = [this.scaleMinLimit, this.scaleMinLimit];
        this.diceDirection = ['up', 'up']; // 주사위 방향
        this.speed = 0.07; // 0.01
        this.finalSpeed = 0.05;
        this.scaleStep = 0.005; // 0.02
    //    this.boundTime = [0, 0]; // 주사위 바운드 숫자 : 2번 바운드 후 바닥에 않을 때 실제 좌표입력
        if (this.diceStartanimation[0]) { cancelAnimationFrame(this.diceStartanimation[0]); }
        if (this.diceStartanimation[1]) { cancelAnimationFrame(this.diceStartanimation[1]); }
        if (this.diceEndanimation[0]) { cancelAnimationFrame(this.diceEndanimation[0]); }
        if (this.diceEndanimation[1]) { cancelAnimationFrame(this.diceEndanimation[1]); }
    } // dice_init() {

    protected onProgress(e: any): void {
        // console.log(e);
    }

    protected onError(e: any): void {
        console.error(e);
    }

    protected unitize(object: any, targetSize: number): any  {
        // find bounding box of 'object'
        const box3 = new THREE.Box3();
        box3.setFromObject(object);
        const size = new THREE.Vector3();
        size.subVectors (box3.max, box3.min);
        const center = new THREE.Vector3();
        center.addVectors(box3.max, box3.min).multiplyScalar (1);

        // uniform scaling according to objSize
        const objSize = Math.max (size.x, size.y, size.z);
        const scaleSet = targetSize / objSize;

        const theObject =  new THREE.Object3D();
        theObject.add (object);
        object.scale.set (scaleSet, scaleSet, scaleSet);
        object.position.set (0, 0, 0);
        return theObject;
    }

    protected animate(mesh: any, num: number): void {
        this.diceStartanimation[num] = requestAnimationFrame(() => this.animate(mesh, num));
        mesh.rotation.x += this.speed * 3;
        mesh.rotation.y += this.speed * 2;
        // mesh.position.setY(height); // 높이 값을 변경한다.
        if (this.diceDirection[num] === 'up') {
            this.scale[num]  += this.scaleStep;
            // this.height[num] += this.height_step;

            if (this.scale[num] >= this.scaleMaxLimit[num] ) {
                this.diceDirection[num] = 'down';
            }
        } else {
            this.scale[num]  -= this.scaleStep;
            // this.height[num] -= this.height_step;
            if (this.scale[num] <= this.scaleMinLimit ) {
                // if (this.boundTime[num] === 2) {
                    cancelAnimationFrame(this.diceStartanimation[num]);
                    this.animate_result(mesh, num);
                    if (num === 1) { this.eventSvc.setDiceGameStatus('end'); } // 사운드의 효과적 사용을 위해 이곳에서 처리
                // }
                // this.scaleMaxLimit[num] =  this.scaleMaxLimit[num] / 1.4;
                // this.diceDirection[num] = 'up';
                // this.boundTime[num] ++;
            }
        }

        mesh.scale.set(this.scale[num], this.scale[num], this.scale[num]);
        this.renderer.render(this.scene, this.camera);
    }

    protected animate_result(mesh: any, num: number): void {
        let stopX = false;
        let stopY = false;

        // this.diceEndanimation[num] = window.requestAnimationFrame(() => this.animate_result(mesh, num));
        this.diceEndanimation[num] = requestAnimationFrame(() => this.animate_result(mesh, num));
        // Pi는 3.14이므로
        if (!this.resultDice) {
            return;
        }
        const resultDice = this.resultDice[num];

        if (stopX === false) {
            if ( Math.abs( this.resultDiceDegree[resultDice][0] - mesh.rotation.x % this.mod ) > 0.1 ) {
                mesh.rotation.x += this.finalSpeed; // 돌아가는 속도를 줄인다.
            } else {
                mesh.rotation.x = this.resultDiceDegree[resultDice][0];
                stopX = true;
            }
        }
        if (stopY === false) {
            if ( Math.abs(this.resultDiceDegree[resultDice][1] - mesh.rotation.y % this.mod) > 0.1) {
                mesh.rotation.y += this.finalSpeed; // 돌아가는 속도를 줄인다.
            } else {
                mesh.rotation.y = this.resultDiceDegree[resultDice][1];
                stopY = true;
            }
        }

        if (stopX && stopY) {
            cancelAnimationFrame(this.diceEndanimation[num]);
            // 종료
        }
        mesh.scale.set(this.scale[num], this.scale[num], this.scale[num]);
        this.renderer.render(this.scene, this.camera);
    }

    private diceAnim(dice1: number, dice2: number): void {
        this.dice_init();
        this.animate(this.diceObject[0], 0);
        setTimeout(() => {
           this.animate(this.diceObject[1], 1);
       }, 200);

        this.resultDice = [dice1, dice2];
    }

}
