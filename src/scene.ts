import * as THREE from "three";
import {
  loadGLBModel,
  loadMultipleGLBModels,
  GLBCameraInfo,
  SceneInfo,
  calculateSceneInfo,
  calculateOptimalCameraPosition,
} from "./utils/glbLoader";

// 씬 생성 및 설정
export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  // 하늘색 배경 설정
  scene.background = new THREE.Color(0x87ceeb);
  return scene;
}

// 카메라 생성 및 설정 (고정 위치)
export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    80, // FOV를 약간 줄여서 더 넓은 시야 확보
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  // 고정 카메라 위치 설정 (나무가 잘리지 않도록 조정)
  camera.position.set(0, 13, 25);
  camera.lookAt(0, 0, 0);

  // 카메라를 고정으로 설정 (업데이트 방지)
  camera.matrixAutoUpdate = false;
  camera.matrixWorldAutoUpdate = false;

  console.log("Fixed camera created:", camera);
  return camera;
}

// 카메라 정보를 콘솔에 출력하는 디버깅 함수
export function logCameraInfo(
  camera: THREE.PerspectiveCamera,
  label: string = "Camera"
): void {
  console.log(`=== ${label} Info ===`);
  console.log(`Position:`, camera.position);
  console.log(`Rotation:`, camera.rotation);
  console.log(`FOV:`, camera.fov);
  console.log(`Aspect:`, camera.aspect);
  console.log(`Near:`, camera.near);
  console.log(`Far:`, camera.far);
  console.log(`Matrix:`, camera.matrix);
  console.log(`Projection Matrix:`, camera.projectionMatrix);
  console.log(`==================`);
}

// 카메라 위치를 미세 조정하는 함수
export function adjustCameraPosition(
  camera: THREE.PerspectiveCamera,
  offsetX: number = 0,
  offsetY: number = 0,
  offsetZ: number = 0
): void {
  camera.position.x += offsetX;
  camera.position.y += offsetY;
  camera.position.z += offsetZ;

  // 카메라가 씬 중심을 바라보도록 설정
  camera.lookAt(0, 0, 0);

  // 매트릭스 업데이트
  camera.updateMatrixWorld();

  console.log("Camera position adjusted:", camera.position);
}

// GLB 파일의 카메라 정보를 기반으로 카메라를 업데이트하는 함수
export function updateCameraFromGLB(
  camera: THREE.PerspectiveCamera,
  cameraInfo: GLBCameraInfo,
  sceneInfo?: SceneInfo
): void {
  console.log("Updating camera with GLB info:", cameraInfo);

  // 업데이트 전 카메라 정보 출력
  logCameraInfo(camera, "Before Update");

  // GLB에서 추출한 카메라 정보가 있으면 적용
  if (cameraInfo.fov !== undefined) {
    camera.fov = cameraInfo.fov;
  }

  if (cameraInfo.near !== undefined) {
    camera.near = cameraInfo.near;
  }

  if (cameraInfo.far !== undefined) {
    camera.far = cameraInfo.far;
  }

  if (cameraInfo.aspect !== undefined) {
    camera.aspect = cameraInfo.aspect;
  }

  // GLB에서 추출한 카메라 위치가 있으면 적용
  if (cameraInfo.position) {
    camera.position.copy(cameraInfo.position);
    console.log("Applied GLB camera position:", camera.position);
  } else if (sceneInfo) {
    // GLB에 카메라 정보가 없으면 씬 정보를 기반으로 최적 위치 계산
    const optimalPosition = calculateOptimalCameraPosition(
      sceneInfo,
      camera.fov,
      camera.aspect
    );
    camera.position.copy(optimalPosition);
    console.log("Applied calculated camera position:", camera.position);
  }
  // GLB에 카메라 정보가 없고 씬 정보도 없으면 createCamera에서 설정한 기본값 유지

  // GLB에서 추출한 카메라 회전이 있으면 적용
  if (cameraInfo.rotation) {
    camera.rotation.copy(cameraInfo.rotation);
  } else {
    // 기본적으로 씬 중심을 바라보도록 설정
    camera.lookAt(0, 0, 0);
  }

  // 카메라 매트릭스 업데이트 (한 번만)
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  // 카메라를 고정으로 설정
  camera.matrixAutoUpdate = false;
  camera.matrixWorldAutoUpdate = false;

  // 업데이트 후 카메라 정보 출력
  logCameraInfo(camera, "After Update");
}

// 렌더러 생성 및 설정
export function createRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("scene") as HTMLCanvasElement,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

// 조명 설정
export function setupLighting(scene: THREE.Scene): void {
  // 환경광 (더 밝게)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // 방향성 조명 (더 밝게)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(5, 10, 2);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = 100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  scene.add(directionalLight);

  // 추가 보조 조명 (나무를 더 밝게 비추기 위해)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-5, 8, -5);
  scene.add(fillLight);
}

// 나무 모델 로드 함수 (우측 아래에 배치)
export async function loadTreeModel(scene: THREE.Scene): Promise<void> {
  try {
    const { model } = await loadGLBModel("./models/Tree.glb", {
      scale: new THREE.Vector3(10, 10, 10), // 스케일을 6배로 증가
      position: new THREE.Vector3(22.5, 0, 12), // 우측 하단으로 이동
      enableShadows: true,
      castShadow: true,
      receiveShadow: true,
    });

    // 나무의 바운딩 박스 계산 및 출력
    const boundingBox = new THREE.Box3().setFromObject(model);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());

    console.log("Tree model loaded and positioned at right bottom");
    console.log("Tree position:", model.position);
    console.log("Tree scale:", model.scale);
    console.log("Tree bounding box size:", size);
    console.log("Tree bounding box center:", center);

    // 나무가 지면 위에 올바르게 배치되도록 조정 (높이 잘림 방지)
    if (size.y > 0) {
      model.position.y = 11; // 지면에 바로 배치
    }

    // 나무 재질을 더 밝게 조정하고 그림자 설정
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 그림자 설정 강화
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat.color) {
                // 색상을 더 밝게 조정
                mat.color.multiplyScalar(1.3);
              }
              mat.needsUpdate = true;
            });
          } else {
            if (child.material.color) {
              // 색상을 더 밝게 조정
              child.material.color.multiplyScalar(1.3);
            }
            child.material.needsUpdate = true;
          }
        }
      }
    });

    scene.add(model);
  } catch (error) {
    console.error("Failed to load tree model:", error);
  }
}

// 지면 생성
export function createGround(scene: THREE.Scene): void {
  // 기본 지면
  const groundGeometry = new THREE.PlaneGeometry(400, 400);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x9acd32 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 중앙 광장을 위한 별도 지면 (원형, 더 밝은 색상)
  const plazaGeometry = new THREE.CircleGeometry(16, 32);
  const plazaMaterial = new THREE.MeshLambertMaterial({ color: 0xb8e6b8 });
  const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 6; // 약간 위에 배치하여 z-fighting 방지
  plaza.receiveShadow = true;
  scene.add(plaza);
}

// 리사이즈 이벤트 핸들러 (카메라는 고정이므로 aspect만 업데이트)
export function setupResizeHandler(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): void {
  window.addEventListener("resize", () => {
    // 카메라 aspect만 업데이트 (위치는 고정)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
