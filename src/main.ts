import * as THREE from "three";

// 씬, 카메라, 렌더러 관련 import
import {
  createScene,
  createCamera,
  createRenderer,
  setupLighting,
  createGround,
  setupResizeHandler,
  loadTreeModel,
  updateCameraFromGLB,
  adjustCameraPosition,
} from "./scene";

// 구름 관련 import
import { createClouds } from "./clouds";

// 애니메이션 관련 import
import { createAnimationLoop } from "./animation";

// 메인 애플리케이션 초기화
async function init(): Promise<void> {
  // 씬 생성
  const scene = createScene();

  // 카메라 생성
  const camera = createCamera();

  // 렌더러 생성
  const renderer = createRenderer();

  // 조명 설정
  setupLighting(scene);

  // 지면 생성
  createGround(scene);

  // 나무 모델 로드 (우측 아래에 배치)
  await loadTreeModel(scene);

  // 구름들 생성 및 배치
  const clouds = createClouds(scene);

  // 리사이즈 핸들러 설정
  setupResizeHandler(camera, renderer);

  // 애니메이션 루프 생성 및 시작
  const animate = createAnimationLoop(scene, camera, renderer, clouds);
  animate();
}

// 애플리케이션 시작
init();
