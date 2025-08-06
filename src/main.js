import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Scene, Camera, Renderer
const scene = new THREE.Scene();
// 하늘색 배경 설정
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 1, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("webgl"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
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

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x9acd32 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true; // 지면에 그림자 받기
scene.add(ground);

// 중앙 광장을 위한 별도 지면 (원형, 더 밝은 색상)
const plazaGeometry = new THREE.CircleGeometry(12, 32); // 반지름 12, 32개 세그먼트
const plazaMaterial = new THREE.MeshLambertMaterial({ color: 0xb8e6b8 }); // 더 밝은 녹색
const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
plaza.rotation.x = -Math.PI / 2;
plaza.position.y = 0.01; // 약간 위에 배치하여 z-fighting 방지
plaza.receiveShadow = true;
scene.add(plaza);

// Make a simple low-poly tree
function createTree() {
  const tree = new THREE.Group();

  // 더 각진 트렁크 (낮은 폴리곤 수)
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 4); // 4개 세그먼트로 더 각지게
  const trunkMat = new THREE.MeshLambertMaterial({
    color: 0x8b4513, // 더 진한 갈색
    flatShading: true, // 플랫 셰이딩으로 각진 느낌 강조
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // 각진 단계별 잎사귀 (더 low poly 느낌)
  const foliageLevels = 3;
  for (let i = 0; i < foliageLevels; i++) {
    const radius = 0.8 - i * 0.2;
    const height = 0.6;
    const yOffset = 1.2 + i * 0.5;

    const foliageGeo = new THREE.CylinderGeometry(radius, radius, height, 4); // 4개 세그먼트
    const foliageMat = new THREE.MeshLambertMaterial({
      color: 0x228b22 - i * 0x001100, // 단계별로 색상 변화
      flatShading: true,
    });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = yOffset;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    tree.add(foliage);
  }

  return tree;
}

// 삼각형 기반 low poly 나무
function createTriangleTree() {
  const tree = new THREE.Group();

  // 각진 트렁크
  const trunkGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
  const trunkMat = new THREE.MeshLambertMaterial({
    color: 0x654321,
    flatShading: true,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // 삼각형 잎사귀들
  const triangleCount = 4;
  for (let i = 0; i < triangleCount; i++) {
    const size = 1.0 - i * 0.2;
    const height = 0.8;
    const yOffset = 1.2 + i * 0.6;

    const foliageGeo = new THREE.ConeGeometry(size, height, 3); // 3개 세그먼트로 삼각형
    const foliageMat = new THREE.MeshLambertMaterial({
      color: 0x006400 - i * 0x001100,
      flatShading: true,
    });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = yOffset;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    tree.add(foliage);
  }

  return tree;
}

// 팔면체 기반 low poly 나무
function createOctahedronTree() {
  const tree = new THREE.Group();

  // 각진 트렁크
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 4);
  const trunkMat = new THREE.MeshLambertMaterial({
    color: 0x8b4513,
    flatShading: true,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // 팔면체 잎사귀
  const foliageGeo = new THREE.OctahedronGeometry(0.8);
  const foliageMat = new THREE.MeshLambertMaterial({
    color: 0x228b22,
    flatShading: true,
  });
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.y = 1.8;
  foliage.castShadow = true;
  foliage.receiveShadow = true;
  tree.add(foliage);

  return tree;
}

// Create bushes
function createBush() {
  const geo = new THREE.SphereGeometry(0.4, 4, 4); // 4x4 세그먼트로 더 각지게
  const mat = new THREE.MeshLambertMaterial({
    color: 0x006400, // 더 진한 녹색
    flatShading: true, // 플랫 셰이딩
  });
  const bush = new THREE.Mesh(geo, mat);
  bush.position.y = 0.4;
  bush.castShadow = true;
  bush.receiveShadow = true;
  return bush;
}

// Create flowers
function createFlower() {
  const flower = new THREE.Group();

  const petal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.2, 4), // 4개 세그먼트
    new THREE.MeshLambertMaterial({
      color: 0xffffff,
      flatShading: true,
    })
  );
  petal.rotation.x = Math.PI / 2;
  petal.castShadow = true;
  petal.receiveShadow = true;

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 4, 4), // 4x4 세그먼트
    new THREE.MeshLambertMaterial({
      color: 0xffd700,
      flatShading: true,
    })
  );
  center.position.y = 0.1;
  center.castShadow = true;
  center.receiveShadow = true;

  flower.add(petal);
  flower.add(center);
  flower.position.y = 0.1;

  return flower;
}

// 둥근 구름 생성 함수
function createCloud(cloudIndex = 0) {
  const cloud = new THREE.Group();

  // 구름의 기본 색상 (밝은 하얀색 계열)
  const cloudColors = [
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
  const positions = [
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
    let pos;
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
  };

  return cloud;
}

// 나무 배치 - 가장자리에만 배치하고 중앙은 비워두기
const trees = [];
const treeTypes = [createTree, createTriangleTree, createOctahedronTree];

// 가장자리 나무 배치 함수
function placeTreesOnEdges() {
  const edgeDistance = 25; // 중앙에서 가장자리까지의 거리 (가까이 배치)
  const centerClearance = 12; // 중앙에 비워둘 공간 (조금 줄임)

  // 사각형 가장자리에 나무 배치
  const positions = [];

  // 위쪽 가장자리
  for (let x = -edgeDistance; x <= edgeDistance; x += 3) {
    if (Math.abs(x) > centerClearance) {
      positions.push({ x, z: -edgeDistance });
    }
  }

  // 아래쪽 가장자리
  for (let x = -edgeDistance; x <= edgeDistance; x += 3) {
    if (Math.abs(x) > centerClearance) {
      positions.push({ x, z: edgeDistance });
    }
  }

  // 왼쪽 가장자리
  for (let z = -edgeDistance; z <= edgeDistance; z += 3) {
    if (Math.abs(z) > centerClearance) {
      positions.push({ x: -edgeDistance, z });
    }
  }

  // 오른쪽 가장자리
  for (let z = -edgeDistance; z <= edgeDistance; z += 3) {
    if (Math.abs(z) > centerClearance) {
      positions.push({ x: edgeDistance, z });
    }
  }

  // 모서리 부분에 추가 나무 배치
  const cornerPositions = [
    { x: -edgeDistance - 5, z: -edgeDistance - 5 },
    { x: edgeDistance + 5, z: -edgeDistance - 5 },
    { x: -edgeDistance - 5, z: edgeDistance + 5 },
    { x: edgeDistance + 5, z: edgeDistance + 5 },
  ];

  positions.push(...cornerPositions);

  return positions;
}

const treePositions = placeTreesOnEdges();

treePositions.forEach((pos, index) => {
  const treeType = treeTypes[index % treeTypes.length];
  const tree = treeType();
  tree.position.set(pos.x, 0, pos.z);
  tree.rotation.y = (index * 0.7) % (Math.PI * 2); // 고정된 회전값
  tree.scale.setScalar(0.8 + (index % 3) * 0.1); // 고정된 스케일

  // 자연스러운 애니메이션을 위한 속성 추가 - 고정된 값
  tree.userData = {
    originalScale: tree.scale.clone(),
    originalX: tree.position.x,
    originalZ: tree.position.z,
    originalRotationY: tree.rotation.y,

    // 바람 효과 - 고정된 값
    windSpeed: 0.02 + (index % 5) * 0.003, // 바람 속도
    windStrength: 0.3 + (index % 4) * 0.1, // 바람 강도
    windDirection: (index * 0.5) % (Math.PI * 2), // 바람 방향

    // 나무 고유 특성 - 고정된 값
    flexibility: 0.1 + (index % 3) * 0.05, // 나무의 유연성
    height: 1.2 + (index % 4) * 0.2, // 나무 높이에 따른 영향

    // 자연스러운 움직임 - 고정된 값
    swaySpeed: 0.015 + (index % 3) * 0.003, // 기본 흔들림 속도
    swayAmount: 0.15 + (index % 4) * 0.05, // 기본 흔들림 정도

    // 계절/시간 변화 - 고정된 값
    seasonalFactor: 0.8 + (index % 5) * 0.08, // 계절적 변화

    // 고정된 시작 시간
    time: index * 0.2,
    windTime: index * 0.3,
  };

  trees.push(tree);
  scene.add(tree);
});

// 수풀과 꽃도 가장자리에만 배치 - 고정된 위치
function placeBushesOnEdges() {
  const edgeDistance = 22;
  const centerClearance = 15;
  const positions = [];

  // 위쪽 가장자리
  for (let x = -edgeDistance; x <= edgeDistance; x += 4) {
    if (Math.abs(x) > centerClearance) {
      positions.push({ x, z: -edgeDistance });
    }
  }

  // 아래쪽 가장자리
  for (let x = -edgeDistance; x <= edgeDistance; x += 4) {
    if (Math.abs(x) > centerClearance) {
      positions.push({ x, z: edgeDistance });
    }
  }

  // 왼쪽 가장자리
  for (let z = -edgeDistance; z <= edgeDistance; z += 4) {
    if (Math.abs(z) > centerClearance) {
      positions.push({ x: -edgeDistance, z });
    }
  }

  // 오른쪽 가장자리
  for (let z = -edgeDistance; z <= edgeDistance; z += 4) {
    if (Math.abs(z) > centerClearance) {
      positions.push({ x: edgeDistance, z });
    }
  }

  return positions;
}

function placeFlowersOnEdges() {
  const edgeDistance = 20;
  const centerClearance = 14;
  const positions = [];

  // 위쪽 가장자리
  for (let x = -edgeDistance; x <= edgeDistance; x += 3) {
    if (Math.abs(x) > centerClearance) {
      positions.push({ x, z: -edgeDistance });
    }
  }

  // 아래쪽 가장자리
  for (let x = -edgeDistance; x <= edgeDistance; x += 3) {
    if (Math.abs(x) > centerClearance) {
      positions.push({ x, z: edgeDistance });
    }
  }

  // 왼쪽 가장자리
  for (let z = -edgeDistance; z <= edgeDistance; z += 3) {
    if (Math.abs(z) > centerClearance) {
      positions.push({ x: -edgeDistance, z });
    }
  }

  // 오른쪽 가장자리
  for (let z = -edgeDistance; z <= edgeDistance; z += 3) {
    if (Math.abs(z) > centerClearance) {
      positions.push({ x: edgeDistance, z });
    }
  }

  return positions;
}

const bushPositions = placeBushesOnEdges();
const flowerPositions = placeFlowersOnEdges();

// 수풀 배치
bushPositions.forEach((pos, index) => {
  const bush = createBush();
  bush.position.set(pos.x, 0, pos.z);
  bush.rotation.y = (index * 0.5) % (Math.PI * 2); // 고정된 회전값
  scene.add(bush);
});

// 꽃 배치
flowerPositions.forEach((pos, index) => {
  const flower = createFlower();
  flower.position.set(pos.x, 0, pos.z);
  flower.rotation.y = (index * 0.3) % (Math.PI * 2); // 고정된 회전값
  scene.add(flower);
});

// 구름들 생성 및 배치 - 고정된 위치
function placeCloudsInSky() {
  const positions = [];

  // 하늘에 고정된 구름 위치들
  const cloudPositions = [
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

const cloudPositions = placeCloudsInSky();
const clouds = [];

cloudPositions.forEach((pos, index) => {
  const cloud = createCloud(index);
  cloud.position.set(pos.x, pos.y, pos.z);
  cloud.scale.setScalar(pos.scale);
  cloud.userData.originalY = pos.y;

  // 고정된 애니메이션 시작 시간
  cloud.userData.time = index * 0.1;
  cloud.userData.windTime = index * 0.15;

  clouds.push(cloud);
  scene.add(cloud);
});

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 카메라 고정 설정 (OrbitControls 비활성화)
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.target.set(0, 0, 0);

// controls.maxPolarAngle = Math.PI / 2.2; // 대략 81도쯤
// controls.minPolarAngle = 0.3; // 너무 아래로도 못 보게 (optional)

// // 카메라 거리 제한 설정
// controls.minDistance = 2; // 최소 거리 (너무 가까이 가지 않도록)
// controls.maxDistance = 80; // 최대 거리 (너무 멀리 가지 않도록)

// controls.update();

// 카메라 위치 고정 (버블파이터 광장과 같은 시점)
camera.position.set(0, 8, 20);
camera.lookAt(0, 0, 0);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  // controls.update(); // 카메라 고정으로 인해 제거

  const elapsedTime = Date.now() * 0.001; // 시간 흐름

  // 나무 애니메이션 적용
  trees.forEach((tree) => {
    const userData = tree.userData;
    const time = userData.time + elapsedTime;
    const windTime = userData.windTime + elapsedTime;

    // 바람 효과 계산
    const windX =
      Math.sin(windTime * userData.windSpeed) * userData.windStrength;
    const windZ =
      Math.cos(windTime * userData.windSpeed * 0.7) *
      userData.windStrength *
      0.5;

    // 바람 방향에 따른 회전
    const windRotation =
      Math.sin(windTime * userData.windSpeed) * userData.flexibility * 0.3;

    // 기본 흔들림 + 바람 효과
    const swayX =
      Math.sin(time * userData.swaySpeed) * userData.swayAmount * 0.3;
    const swayZ =
      Math.cos(time * userData.swaySpeed * 0.8) * userData.swayAmount * 0.2;

    // 위치 업데이트 (바람 + 기본 흔들림)
    tree.position.x = userData.originalX + windX + swayX;
    tree.position.z = userData.originalZ + windZ + swayZ;

    // 회전 업데이트 (바람에 따른 자연스러운 회전)
    tree.rotation.y = userData.originalRotationY + windRotation;

    // 바람에 따른 스케일 변화 (나뭇잎이 바람에 날리는 효과)
    const windScale =
      1 +
      Math.sin(windTime * userData.windSpeed * 2) * 0.05 * userData.flexibility;
    const seasonalScale =
      1 + Math.sin(time * 0.001) * 0.02 * userData.seasonalFactor; // 매우 느린 계절 변화

    tree.scale.setScalar(userData.originalScale.x * windScale * seasonalScale);

    // 나뭇잎 부분들만 추가로 흔들리게 (더 유연한 부분)
    for (let i = 1; i < tree.children.length; i++) {
      const leafSway =
        Math.sin(windTime * userData.windSpeed * 1.5) *
        userData.flexibility *
        0.4;
      tree.children[i].rotation.z = leafSway;
      tree.children[i].rotation.x =
        Math.sin(windTime * userData.windSpeed * 0.8) *
        userData.flexibility *
        0.2;
    }
  });

  // 구름 애니메이션
  clouds.forEach((cloud) => {
    const userData = cloud.userData;
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
      cloud.userData.originalY = 12 + Math.random() * 18;
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

  renderer.render(scene, camera);
}
animate();
