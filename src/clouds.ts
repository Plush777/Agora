import * as THREE from "three";
import { CloudUserData, CloudPosition } from "./types";

// 둥근 구름 생성 함수
export function createCloud(cloudIndex: number = 0): THREE.Group {
  const cloud = new THREE.Group();

  // 구름의 기본 색상 (밝은 하얀색 계열)
  const cloudColors: number[] = [
    0xffffff, // 순백
    0xfffffe, // 거의 순백
    0xfffffd, // 매우 밝은 하얀색
    0xfffffc, // 밝은 하얀색
    0xfffffb, // 밝은 하얀색
  ];

  // 구름 크기와 구체 개수 고정 설정
  const cloudSize = 0.8 + (cloudIndex % 6) * 0.2; // 0.8 ~ 2.0 사이 고정값
  const sphereCount = 5 + (cloudIndex % 3); // 5-7개 구체 고정

  // 중심 구체 (가장 큰 구체)
  const centerRadius = cloudSize * 0.5;
  const centerColor = cloudColors[cloudIndex % cloudColors.length];

  const centerSphere = new THREE.Mesh(
    new THREE.SphereGeometry(centerRadius, 12, 12),
    new THREE.MeshLambertMaterial({
      color: centerColor,
      transparent: true,
      opacity: 0.95,
    })
  );
  centerSphere.castShadow = true;
  centerSphere.receiveShadow = true;
  cloud.add(centerSphere);

  // 주변 구체들 추가 (이미지처럼 자연스럽게 배치)
  const positions: Array<{ x: number; y: number; z: number }> = [
    // 하단 좌우
    { x: -centerRadius * 0.8, y: -centerRadius * 0.2, z: 0 },
    { x: centerRadius * 0.8, y: -centerRadius * 0.2, z: 0 },
    // 상단 중앙
    { x: 0, y: centerRadius * 0.6, z: 0 },
    // 우측 확장
    { x: centerRadius * 1.2, y: centerRadius * 0.3, z: centerRadius * 0.3 },
    { x: centerRadius * 1.4, y: centerRadius * 0.1, z: centerRadius * 0.1 },
  ];

  for (let i = 0; i < sphereCount; i++) {
    const radius = centerRadius * (0.7 + (i % 4) * 0.075); // 중심의 70-100% 크기 고정
    const color = cloudColors[i % cloudColors.length]; // 고정된 색상 순서

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 12, 12),
      new THREE.MeshLambertMaterial({
        color: color,
        transparent: true,
        opacity: 0.85 + (i % 3) * 0.03, // 고정된 투명도
      })
    );

    // 이미지와 비슷한 배치 패턴 사용 - 고정된 위치
    let pos: { x: number; y: number; z: number };
    if (i < positions.length) {
      pos = positions[i];
      // 고정된 오프셋 추가
      pos.x += ((i % 3) - 1) * centerRadius * 0.1;
      pos.y += ((i % 2) - 0.5) * centerRadius * 0.1;
      pos.z += ((i % 4) - 1.5) * centerRadius * 0.1;
    } else {
      // 추가 구체들은 고정된 위치
      const angle = (i * 0.5) % (Math.PI * 2);
      const distance = centerRadius * (0.8 + (i % 3) * 0.1);
      pos = {
        x: Math.cos(angle) * distance,
        y: ((i % 3) - 1) * centerRadius * 0.2,
        z: Math.sin(angle) * distance,
      };
    }

    sphere.position.set(pos.x, pos.y, pos.z);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    cloud.add(sphere);
  }

  // 구름의 애니메이션 속성 설정 - 고정된 값
  cloud.userData = {
    originalY: 0,
    floatSpeed: 0.0008 + (Math.floor(Math.random() * 10) % 5) * 0.0002,
    floatAmount: 0.2 + (Math.floor(Math.random() * 10) % 4) * 0.075,
    rotationSpeed: 0.0003 + (Math.floor(Math.random() * 10) % 3) * 0.0001,
    time: (Math.floor(Math.random() * 10) % 10) * 0.2,
  } as CloudUserData;

  return cloud;
}

// 구름들 생성 및 배치 - 고정된 위치
export function placeCloudsInSky(): CloudPosition[] {
  const positions: CloudPosition[] = [];

  // 하늘에 고정된 구름 위치들
  const cloudPositions: CloudPosition[] = [
    // 첫 번째 층 (낮은 구름들)
    { x: -25, y: 15, z: -20, scale: 0.7 },
    { x: 20, y: 18, z: -15, scale: 0.8 },
    { x: -15, y: 16, z: 25, scale: 0.6 },
    { x: 30, y: 17, z: 20, scale: 0.9 },
    { x: -35, y: 14, z: 10, scale: 0.5 },
    { x: 25, y: 19, z: -30, scale: 0.8 },

    // 두 번째 층 (중간 구름들)
    { x: -10, y: 22, z: -25, scale: 0.7 },
    { x: 15, y: 24, z: 15, scale: 0.8 },
    { x: -20, y: 21, z: -10, scale: 0.6 },
    { x: 35, y: 23, z: -5, scale: 0.9 },
    { x: -30, y: 25, z: 30, scale: 0.7 },
    { x: 10, y: 20, z: 35, scale: 0.6 },

    // 세 번째 층 (높은 구름들)
    { x: -5, y: 28, z: -35, scale: 0.8 },
    { x: 40, y: 26, z: 10, scale: 0.7 },
    { x: -25, y: 29, z: -5, scale: 0.6 },
    { x: 20, y: 27, z: 40, scale: 0.9 },
    { x: -40, y: 30, z: 20, scale: 0.7 },
    { x: 5, y: 25, z: -40, scale: 0.6 },

    // 추가 구름들
    { x: -45, y: 18, z: -15, scale: 0.5 },
    { x: 45, y: 22, z: 25, scale: 0.8 },
    { x: -15, y: 31, z: 45, scale: 0.7 },
    { x: 30, y: 19, z: -45, scale: 0.6 },
    { x: -50, y: 24, z: 5, scale: 0.8 },
    { x: 50, y: 21, z: -20, scale: 0.7 },
    { x: -10, y: 32, z: -50, scale: 0.6 },
    { x: 15, y: 28, z: 50, scale: 0.9 },
    { x: -55, y: 26, z: 35, scale: 0.7 },
    { x: 55, y: 23, z: 15, scale: 0.6 },
    { x: -20, y: 33, z: -55, scale: 0.8 },
    { x: 25, y: 29, z: 55, scale: 0.7 },
    { x: -60, y: 20, z: -10, scale: 0.5 },
    { x: 60, y: 25, z: 30, scale: 0.8 },
    { x: -5, y: 34, z: -60, scale: 0.6 },
    { x: 35, y: 30, z: 60, scale: 0.9 },
    { x: -65, y: 27, z: 25, scale: 0.7 },
    { x: 65, y: 22, z: -25, scale: 0.6 },
    { x: -30, y: 35, z: -65, scale: 0.8 },
    { x: 40, y: 31, z: 65, scale: 0.7 },
    { x: -70, y: 24, z: 5, scale: 0.5 },
    { x: 70, y: 26, z: 35, scale: 0.8 },
    { x: -15, y: 36, z: -70, scale: 0.6 },
    { x: 45, y: 32, z: 70, scale: 0.9 },
    { x: -75, y: 28, z: 40, scale: 0.7 },
    { x: 75, y: 23, z: -30, scale: 0.6 },
  ];

  return cloudPositions;
}

// 구름들을 씬에 배치하는 함수
export function createClouds(scene: THREE.Scene): THREE.Group[] {
  const cloudPositions = placeCloudsInSky();
  const clouds: THREE.Group[] = [];

  cloudPositions.forEach((pos, index) => {
    const cloud = createCloud(index);
    cloud.position.set(pos.x, pos.y, pos.z);
    cloud.scale.setScalar(pos.scale);
    (cloud.userData as CloudUserData).originalY = pos.y;

    // 고정된 애니메이션 시작 시간
    (cloud.userData as CloudUserData).time = index * 0.1;
    (cloud.userData as CloudUserData).windTime = index * 0.15;

    clouds.push(cloud);
    scene.add(cloud);
  });

  return clouds;
}
