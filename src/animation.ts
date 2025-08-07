import * as THREE from "three";
import { CloudUserData } from "./types";

// 구름 애니메이션
export function animateClouds(
  clouds: THREE.Group[],
  elapsedTime: number
): void {
  clouds.forEach((cloud) => {
    const userData = cloud.userData as CloudUserData;
    const time = userData.time + elapsedTime;

    // 부드러운 상하 움직임
    cloud.position.y =
      userData.originalY +
      Math.sin(time * userData.floatSpeed) * userData.floatAmount;

    // 천천히 회전
    cloud.rotation.y += userData.rotationSpeed;

    // 구름이 천천히 이동하는 효과 (바람에 의한 이동)
    cloud.position.x += Math.sin(time * 0.0003) * 0.008;
    cloud.position.z += Math.cos(time * 0.0002) * 0.006;

    // 화면 경계 체크 및 재배치
    if (Math.abs(cloud.position.x) > 200 || Math.abs(cloud.position.z) > 200) {
      cloud.position.x = (Math.random() - 0.5) * 400;
      cloud.position.z = (Math.random() - 0.5) * 400;
      userData.originalY = 12 + Math.random() * 18;
    }

    // 구름 내부 구체들도 약간씩 다르게 움직이게
    cloud.children.forEach((sphere, index) => {
      const sphereTime = time * (0.8 + index * 0.1);
      sphere.rotation.x = Math.sin(sphereTime * 0.3) * 0.03;
      sphere.rotation.z = Math.cos(sphereTime * 0.2) * 0.03;

      // 구체들이 약간씩 다른 속도로 움직이게 (매우 미세하게)
      sphere.position.y += Math.sin(sphereTime * 0.4) * 0.001;
    });
  });
}

// 메인 애니메이션 루프
export function createAnimationLoop(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  clouds: THREE.Group[]
): () => void {
  return function animate(): void {
    requestAnimationFrame(animate);

    const elapsedTime = Date.now() * 0.001; // 시간 흐름

    // 구름 애니메이션
    animateClouds(clouds, elapsedTime);

    renderer.render(scene, camera);
  };
}
