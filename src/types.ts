import * as THREE from "three";

export interface CloudUserData {
  originalY: number;
  floatSpeed: number;
  floatAmount: number;
  rotationSpeed: number;
  time: number;
}

export interface CloudPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export type CloudCreator = (cloudIndex?: number) => THREE.Group;
