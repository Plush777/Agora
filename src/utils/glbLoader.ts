import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// GLB 모델 로드 옵션 인터페이스
export interface GLBLoadOptions {
  scale?: THREE.Vector3;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  enableShadows?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

// GLB 파일에서 추출된 카메라 정보 인터페이스
export interface GLBCameraInfo {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  fov?: number;
  near?: number;
  far?: number;
  aspect?: number;
}

// 씬 정보 인터페이스
export interface SceneInfo {
  boundingBox: THREE.Box3;
  center: THREE.Vector3;
  size: THREE.Vector3;
  radius: number;
}

// 기본 옵션
const defaultOptions: GLBLoadOptions = {
  scale: new THREE.Vector3(1, 1, 1),
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  enableShadows: true,
  castShadow: true,
  receiveShadow: true,
};

/**
 * GLB 파일에서 카메라 정보를 추출하는 함수
 * @param gltf - 로드된 GLTF 객체
 * @returns GLBCameraInfo - 추출된 카메라 정보
 */
export function extractCameraInfo(gltf: any): GLBCameraInfo {
  const cameraInfo: GLBCameraInfo = {};

  // GLTF에 카메라가 있는지 확인
  if (gltf.cameras && gltf.cameras.length > 0) {
    const camera = gltf.cameras[0];

    if (camera.perspective) {
      cameraInfo.fov = THREE.MathUtils.radToDeg(camera.perspective.yfov);
      cameraInfo.near = camera.perspective.znear;
      cameraInfo.far = camera.perspective.zfar;
      cameraInfo.aspect = camera.perspective.aspectRatio;
    }
  }

  // 씬에서 카메라 노드를 찾기
  if (gltf.scene) {
    gltf.scene.traverse((node: any) => {
      if (node.isCamera && !cameraInfo.position) {
        cameraInfo.position = node.position.clone();
        cameraInfo.rotation = node.rotation.clone();
      }
    });
  }

  return cameraInfo;
}

/**
 * 씬의 바운딩 박스와 관련 정보를 계산하는 함수
 * @param scene - Three.js 씬
 * @returns SceneInfo - 씬 정보
 */
export function calculateSceneInfo(scene: THREE.Scene): SceneInfo {
  const boundingBox = new THREE.Box3();

  // 씬의 모든 객체를 순회하며 바운딩 박스 계산
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.computeBoundingBox();
      if (object.geometry.boundingBox) {
        const box = object.geometry.boundingBox.clone();
        box.applyMatrix4(object.matrixWorld);
        boundingBox.union(box);
      }
    }
  });

  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());
  const radius = size.length() * 0.5;

  return {
    boundingBox,
    center,
    size,
    radius,
  };
}

/**
 * 씬 정보를 기반으로 적절한 카메라 위치를 계산하는 함수
 * @param sceneInfo - 씬 정보
 * @param fov - 카메라 FOV (도)
 * @param aspect - 카메라 aspect ratio
 * @returns THREE.Vector3 - 계산된 카메라 위치
 */
export function calculateOptimalCameraPosition(
  sceneInfo: SceneInfo,
  fov: number = 80,
  aspect: number = window.innerWidth / window.innerHeight
): THREE.Vector3 {
  const fovRadians = THREE.MathUtils.degToRad(fov);
  const distance = sceneInfo.radius / Math.sin(fovRadians * 0.5);

  // 카메라를 씬 중심에서 약간 뒤로 이동
  const cameraPosition = sceneInfo.center.clone();
  cameraPosition.z += distance * 1.2; // 20% 더 뒤로
  cameraPosition.y += distance * 0.3; // 약간 위로

  return cameraPosition;
}

/**
 * GLB 파일을 로드하는 유틸리티 함수
 * @param filePath - GLB 파일 경로
 * @param options - 로드 옵션
 * @returns Promise<{ model: THREE.Group; cameraInfo: GLBCameraInfo }> - 로드된 모델과 카메라 정보
 */
export async function loadGLBModel(
  filePath: string,
  options: GLBLoadOptions = {}
): Promise<{ model: THREE.Group; cameraInfo: GLBCameraInfo }> {
  const loader = new GLTFLoader();
  const finalOptions = { ...defaultOptions, ...options };

  try {
    const gltf = await loader.loadAsync(filePath);
    const model = gltf.scene;

    // 카메라 정보 추출
    const cameraInfo = extractCameraInfo(gltf);

    // 스케일 설정
    if (finalOptions.scale) {
      model.scale.copy(finalOptions.scale);
    }

    // 위치 설정
    if (finalOptions.position) {
      model.position.copy(finalOptions.position);
    }

    // 회전 설정
    if (finalOptions.rotation) {
      model.rotation.copy(finalOptions.rotation);
    }

    // 재질 및 그림자 설정
    if (finalOptions.enableShadows) {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 그림자 설정
          child.castShadow = finalOptions.castShadow!;
          child.receiveShadow = finalOptions.receiveShadow!;
          
          // 재질 설정 - Three.js 에디터와 동일하게
          if (child.material) {
            // 재질의 색상 공간 설정
            if (child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace;
            }
            
            // 재질의 투명도 설정
            if (child.material.transparent) {
              child.material.alphaTest = 0.5;
            }
            
            // 재질 업데이트
            child.material.needsUpdate = true;
          }
        }
      });
    }

    console.log(`GLB model loaded successfully: ${filePath}`);
    console.log("Extracted camera info:", cameraInfo);

    return { model, cameraInfo };
  } catch (error) {
    console.error(`Error loading GLB model from ${filePath}:`, error);
    throw error;
  }
}

/**
 * 여러 GLB 파일을 동시에 로드하는 유틸리티 함수
 * @param models - 로드할 모델들의 배열 (파일 경로와 옵션)
 * @returns Promise<{model: THREE.Group, cameraInfo: GLBCameraInfo}[]> - 로드된 모델들과 카메라 정보 배열
 */
export async function loadMultipleGLBModels(
  models: Array<{ filePath: string; options?: GLBLoadOptions }>
): Promise<{ model: THREE.Group; cameraInfo: GLBCameraInfo }[]> {
  const loadPromises = models.map(({ filePath, options }) =>
    loadGLBModel(filePath, options)
  );

  try {
    const loadedModels = await Promise.all(loadPromises);
    console.log(`Successfully loaded ${loadedModels.length} GLB models`);
    return loadedModels;
  } catch (error) {
    console.error("Error loading multiple GLB models:", error);
    throw error;
  }
}
