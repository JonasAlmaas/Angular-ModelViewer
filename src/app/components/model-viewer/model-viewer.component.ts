import { Component, ElementRef, OnInit, AfterViewInit, Input, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'


@Component({
  selector: 'app-model-viewer',
  templateUrl: './model-viewer.component.html',
  styleUrls: ['./model-viewer.component.scss']
})
export class ModelViewerComponent implements OnInit, AfterViewInit {

  @Input() model: string = 'assets/models/hero_statue.stl';
  @Input() hdri: string = 'assets/hdri/cyclorama_hard_light_2k.hdr';

  public fov: number = 45;
  public renderScale: number = 0.75;

  // Environment settings
  public bgBlurriness: number = 1.0;
  public bgIntensity: number = 0.5;
  public toneMappingExposure: number = 1.0;

  // Material settings
  public color: string = '#f5f6f6';     // Aluminium
  public metalness: number = 1.0;
  public roughness: number = 0.4;
  public wireframe: boolean = false;

  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  private rgbeLoader: RGBELoader = new RGBELoader();
  private stlLoader: STLLoader = new STLLoader();

  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;

  private material = new THREE.MeshStandardMaterial({
    color: this.color,
    metalness: this.metalness,
    roughness: this.roughness,
    wireframe: this.wireframe,
  });

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private get aspectRatio(): number {
    return this.canvas.width / this.canvas.height;
  }

  constructor() { }

  public ngOnInit() {}

  public ngAfterViewInit() {
    this.setup_scene();

    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.toneMappingExposure;

    this.onResize();

    let instance = this;
    (function render() {
      requestAnimationFrame(render);
      instance.render_loop();
    }());
  }

  private setup_scene() {
    this.scene = new THREE.Scene();

    this.stlLoader.load(this.model, (geometry) => {
      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.rotation.x = -(Math.PI / 2);
      this.scene.add(mesh);

      const boundingBox = new THREE.Box3();
      boundingBox.setFromObject(mesh);

      const size = boundingBox.getSize(new THREE.Vector3());
      const center = boundingBox.getCenter(new THREE.Vector3());

      this.camera.position.copy(center);
      this.camera.position.x = size.x * 0.66;
      this.camera.position.y = size.y;
      this.camera.position.z = size.z * 3;

      this.controls.target.copy(center);
    });

    this.rgbeLoader.load(this.hdri, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = texture;
      this.scene.backgroundBlurriness = this.bgBlurriness;
      this.scene.backgroundIntensity = this.bgIntensity;
      this.scene.environment = texture;
    });
  }

  private render_loop() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Canvas resize event
  public onResize() {
    this.canvas.width = this.canvas.clientWidth * this.renderScale;
    this.canvas.height = this.canvas.clientHeight * this.renderScale;

    this.renderer.setSize(this.canvas.width, this.canvas.height);

    this.camera.aspect = this.aspectRatio;
    this.camera.updateProjectionMatrix();
  }

  // Settings change events

  public OnChangeRenderScale(event: any) { this.renderScale = event.target.value; this.onResize(); }
  public OnChangeFov(event: any) { this.fov = event.target.value; this.camera.fov = event.target.value; this.camera.updateProjectionMatrix(); }
  public onChangeWireframe(event: any) { this.material.wireframe = event.target.checked; }

  public onChangeColor(event: any) { this.color = event.target.value; this.material.color.set(event.target.value); }
  public onChangeMetalness(event: any) { this.metalness = event.target.value; this.material.metalness = event.target.value; }
  public OnChangeRoughness(event: any) { this.roughness = event.target.value; this.material.roughness = event.target.value; }

  public onBgBlurrinessChange(event: any) { this.bgBlurriness = event.target.value; this.scene.backgroundBlurriness = event.target.value; }
  public onBgIntensityChange(event: any) { this.bgIntensity = event.target.value; this.scene.backgroundIntensity = event.target.value; }
  public onToneMappingExposureChange(event: any) { this.toneMappingExposure = event.target.value; this.renderer.toneMappingExposure = event.target.value; }

}
