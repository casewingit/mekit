"""Photo pixels -> estimated relief mesh, GLB and deterministic CPU renders.
No AI generation, hidden back surface, physical scale claim, or EARTH approval.
"""
import argparse
import base64
from collections import deque
import hashlib
import io
import json
from pathlib import Path
import struct
import sys
import urllib.request
from urllib.parse import urlparse

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]


def extract_mask(rgba, min_saturation=0.16, max_dark=0.42):
    rgb = rgba[..., :3].astype(np.float32) / 255
    high, low = rgb.max(axis=2), rgb.min(axis=2)
    saturation = (high - low) / np.maximum(high, 0.001)
    return ((saturation >= min_saturation) | (high <= max_dark)) & (rgba[..., 3] > 0)


def fill_small_holes(mask, max_area=64):
    result = mask.copy()
    visited = mask.copy()
    height, width = mask.shape
    for y, x in zip(*np.where(~mask)):
        if visited[y, x]:
            continue
        queue = deque([(y, x)])
        visited[y, x] = True
        component, border = [], False
        while queue:
            cy, cx = queue.popleft()
            component.append((cy, cx))
            border |= cy in (0, height - 1) or cx in (0, width - 1)
            for ny, nx in ((cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)):
                if 0 <= ny < height and 0 <= nx < width and not visited[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))
        if not border and len(component) <= max_area:
            yy, xx = zip(*component)
            result[yy, xx] = True
    return result


def remove_small_components(mask, min_area=256):
    result = np.zeros_like(mask)
    visited = ~mask.copy()
    height, width = mask.shape
    for y, x in zip(*np.where(mask)):
        if visited[y, x]:
            continue
        queue, component = deque([(y, x)]), []
        visited[y, x] = True
        while queue:
            cy, cx = queue.popleft()
            component.append((cy, cx))
            for ny, nx in ((cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)):
                if 0 <= ny < height and 0 <= nx < width and not visited[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))
        if len(component) >= min_area:
            yy, xx = zip(*component)
            result[yy, xx] = True
    return result


def clean_thin_fringe(mask, radius=8):
    if radius == 0:
        return mask.copy()
    height, width = mask.shape
    offsets = [(dy, dx) for dy in range(-radius, radius+1) for dx in range(-radius, radius+1) if dx*dx+dy*dy <= radius*radius]
    padded = np.pad(mask, radius, constant_values=False)
    eroded = mask.copy()
    for dy, dx in offsets:
        eroded &= padded[radius+dy:radius+dy+height, radius+dx:radius+dx+width]
    padded = np.pad(eroded, radius, constant_values=False)
    opened = np.zeros_like(mask)
    for dy, dx in offsets:
        opened |= padded[radius+dy:radius+dy+height, radius+dx:radius+dx+width]
    return opened & mask


def build_mesh(mask, grid=160, relief=0.06):
    height, width = mask.shape
    rows = max(3, round(grid * height / width))
    ys = np.linspace(0, height-1, rows).round().astype(int)
    xs = np.linspace(0, width-1, grid).round().astype(int)
    sampled = mask[np.ix_(ys, xs)]
    # Approximate front relief from silhouette distance, not recovered product depth.
    distance = sampled.astype(np.float32) * 1000
    distance = np.pad(distance, 1, constant_values=0)
    for y in range(1, rows+1):
        for x in range(1, grid+1):
            distance[y, x] = min(distance[y, x], distance[y-1, x]+1, distance[y, x-1]+1)
    for y in range(rows, 0, -1):
        for x in range(grid, 0, -1):
            distance[y, x] = min(distance[y, x], distance[y+1, x]+1, distance[y, x+1]+1)
    z = relief * np.sqrt(np.clip(distance[1:-1, 1:-1] / max(2, grid*0.06), 0, 1))
    u, v = np.meshgrid(np.linspace(0, 1, grid), np.linspace(0, 1, rows))
    # Nominal width 80mm is a display choice. Manifest explicitly marks it unverified.
    positions = np.stack(((u-.5)*.08, (.5-v)*.08*height/width, z*.08), axis=2)
    uvs = np.stack((u, v), axis=2)
    triangles = []
    for y in range(rows-1):
        for x in range(grid-1):
            if sampled[y:y+2, x:x+2].all():
                a = y*grid+x
                triangles.extend(((a, a+grid, a+1), (a+1, a+grid, a+grid+1)))
    if not triangles:
        raise ValueError('윤곽에서 메시를 만들지 못했습니다. 색 기준 또는 입력 사진을 확인하세요.')
    indices = np.asarray(triangles, dtype=np.uint32)
    used, compact = np.unique(indices, return_inverse=True)
    return positions.reshape(-1, 3)[used].astype(np.float32), uvs.reshape(-1, 2)[used].astype(np.float32), compact.reshape(-1, 3).astype(np.uint32)


def make_glb(positions, uvs, indices, texture_png, provenance):
    # glTF 2.0 / four-byte aligned GLB. Texture is embedded, unlit and double-sided.
    binary = bytearray()
    views = []
    def add(payload, target=None):
        binary.extend(b'\0' * (-len(binary) % 4))
        entry = {'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(payload)}
        if target is not None:
            entry['target'] = target
        views.append(entry)
        binary.extend(payload)
        return len(views)-1
    pos_view = add(positions.astype('<f4').tobytes(), 34962)
    uv_view = add(uvs.astype('<f4').tobytes(), 34962)
    index_view = add(indices.astype('<u4').tobytes(), 34963)
    image_view = add(texture_png)
    extras = dict(provenance, verifiedEarthProduct=False, physicalScaleVerified=False, geometryKind='photo-relief-2.5d', nominalRenderWidthMeters=0.08)
    document = {
        'asset': {'version': '2.0', 'generator': 'MEKIT photo reference renderer', 'extras': extras},
        'extensionsUsed': ['KHR_materials_unlit'],
        'extensionsRequired': ['KHR_materials_unlit'],
        'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0}],
        'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'TEXCOORD_0': 1}, 'indices': 2, 'material': 0}]}],
        'accessors': [
            {'bufferView': pos_view, 'componentType': 5126, 'count': len(positions), 'type': 'VEC3', 'min': positions.min(axis=0).tolist(), 'max': positions.max(axis=0).tolist()},
            {'bufferView': uv_view, 'componentType': 5126, 'count': len(uvs), 'type': 'VEC2'},
            {'bufferView': index_view, 'componentType': 5125, 'count': indices.size, 'type': 'SCALAR'},
        ],
        'materials': [{'doubleSided': True, 'alphaMode': 'MASK', 'alphaCutoff': .5,
                       'extensions': {'KHR_materials_unlit': {}},
                       'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0, 'roughnessFactor': 1}}],
        'textures': [{'sampler': 0, 'source': 0}],
        'samplers': [{'magFilter': 9729, 'minFilter': 9729, 'wrapS': 33071, 'wrapT': 33071}],
        'images': [{'bufferView': image_view, 'mimeType': 'image/png'}],
        'bufferViews': views, 'buffers': [{'byteLength': len(binary)}],
    }
    header = json.dumps(document, separators=(',', ':'), ensure_ascii=False).encode()
    header += b' ' * (-len(header) % 4)
    binary.extend(b'\0' * (-len(binary) % 4))
    size = 12 + 8 + len(header) + 8 + len(binary)
    return struct.pack('<4sII', b'glTF', 2, size) + struct.pack('<I4s', len(header), b'JSON') + header + struct.pack('<I4s', len(binary), b'BIN\0') + binary


def render(positions, uvs, indices, texture, yaw=0, pitch=0, size=900):
    y, x = np.radians([yaw, pitch])
    ry = np.array([[np.cos(y), 0, np.sin(y)], [0, 1, 0], [-np.sin(y), 0, np.cos(y)]])
    rx = np.array([[1, 0, 0], [0, np.cos(x), -np.sin(x)], [0, np.sin(x), np.cos(x)]])
    points = positions @ (rx @ ry).T
    # Orthographic texture projection; source lighting is preserved, not re-created.
    projected = np.column_stack((size*.5 + points[:, 0]/.08*size*.80, size*.5 - points[:, 1]/.08*size*.80))
    pixels = np.full((size, size, 4), 255, dtype=np.uint8)
    pixels[..., :3] = [244, 241, 232]
    depth = np.full((size, size), -np.inf)
    th, tw = texture.shape[:2]
    for tri in indices:
        p = projected[tri]
        left, top = np.maximum(np.floor(p.min(axis=0)).astype(int), 0)
        right, bottom = np.minimum(np.ceil(p.max(axis=0)).astype(int), size-1)
        if left > right or top > bottom:
            continue
        xx, yy = np.meshgrid(np.arange(left, right+1)+.5, np.arange(top, bottom+1)+.5)
        a, b, c = p
        denominator = (b[1]-c[1])*(a[0]-c[0]) + (c[0]-b[0])*(a[1]-c[1])
        if abs(denominator) < 1e-8:
            continue
        wa = ((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/denominator
        wb = ((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/denominator
        wc = 1-wa-wb
        z = wa*points[tri[0], 2] + wb*points[tri[1], 2] + wc*points[tri[2], 2]
        region = depth[top:bottom+1, left:right+1]
        inside = (wa >= -1e-6) & (wb >= -1e-6) & (wc >= -1e-6) & (z > region)
        uv = wa[..., None]*uvs[tri[0]] + wb[..., None]*uvs[tri[1]] + wc[..., None]*uvs[tri[2]]
        tx = np.clip(np.rint(uv[..., 0]*(tw-1)).astype(int), 0, tw-1)
        ty = np.clip(np.rint(uv[..., 1]*(th-1)).astype(int), 0, th-1)
        color = texture[ty, tx]
        inside &= color[..., 3] > 127
        pixels[top:bottom+1, left:right+1][inside] = color[inside]
        region[inside] = z[inside]
    return Image.fromarray(pixels)


def main():
    parser = argparse.ArgumentParser(description='외부 제품 사진으로 2.5D 참고 렌더를 생성합니다. 실제 EARTH 복원이 아닙니다.')
    parser.add_argument('--profile', type=Path, default=ROOT/'assets/render-references/sitti-olive-lava.json')
    parser.add_argument('--input', type=Path)
    parser.add_argument('--source-page', help='다른 입력 사진을 사용할 때의 출처 URL 또는 로컬 출처 설명')
    parser.add_argument('--out', type=Path, default=ROOT/'output/reference-render/sitti-olive-lava')
    parser.add_argument('--grid', type=int, default=256)
    parser.add_argument('--min-saturation', type=float, default=.16)
    parser.add_argument('--max-dark', type=float, default=.42)
    parser.add_argument('--min-component-area', type=int, default=512)
    parser.add_argument('--max-hole-area', type=int, default=1600)
    parser.add_argument('--clean-radius', type=int, default=8)
    parser.add_argument('--relief', type=float, default=.06, help='추정 깊이 비율. 실측값 아님')
    args = parser.parse_args()
    if not 16 <= args.grid <= 512 or not 0 <= args.relief <= .15:
        parser.error('grid는 16~512, relief는 0~0.15 범위여야 합니다.')
    if not 0 <= args.min_saturation <= 1 or not 0 <= args.max_dark <= 1 or args.min_component_area < 1 or args.max_hole_area < 0:
        parser.error('색 기준은 0~1, min-component-area는 양수, max-hole-area는 0 이상이어야 합니다.')
    if not 0 <= args.clean_radius <= 32:
        parser.error('clean-radius는 0~32 범위여야 합니다.')
    profile = json.loads(args.profile.read_text())
    source = args.input or ROOT/profile['image']
    if args.input and not args.source_page:
        parser.error('다른 입력은 --source-page로 출처를 지정해야 합니다.')
    if not source.is_file() and not args.input:
        url = profile['sourceImage']
        if urlparse(url).scheme != 'https':
            parser.error('원본 다운로드 URL은 HTTPS여야 합니다.')
        request = urllib.request.Request(url, headers={'User-Agent': 'MEKIT-ReferenceRenderer/0.1'})
        with urllib.request.urlopen(request, timeout=30) as response:
            data = response.read(8 * 1024 * 1024 + 1)
        if len(data) > 8 * 1024 * 1024 or hashlib.sha256(data).hexdigest() != profile['sha256']:
            parser.error('다운로드한 원본의 크기 또는 해시가 프로필과 맞지 않습니다.')
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_bytes(data)
    if not source.is_file():
        parser.error(f'입력 사진이 없습니다: {source}. 원본 URL은 프로필의 sourceImage를 참고하세요.')
    source_bytes = source.read_bytes()
    source_hash = hashlib.sha256(source_bytes).hexdigest()
    if not args.input and source_hash != profile['sha256']:
        parser.error('고정 참고 사진의 해시가 바뀌었습니다. 출처와 프로필을 확인하세요.')
    provenance = {k: profile[k] for k in ['label', 'sourcePage', 'sourceImage']}
    if args.input:
        provenance = {'label': source.name, 'sourcePage': args.source_page, 'sourceImage': str(source.resolve())}
    source_image = Image.open(io.BytesIO(source_bytes))
    source_mime = Image.MIME.get(source_image.format, 'application/octet-stream')
    rgba = np.array(ImageOps.exif_transpose(source_image).convert('RGBA'))
    mask = remove_small_components(extract_mask(rgba, args.min_saturation, args.max_dark), args.min_component_area)
    mask = fill_small_holes(mask, max_area=args.max_hole_area)
    mask = clean_thin_fringe(mask, radius=args.clean_radius)
    ys, xs = np.where(mask)
    if len(xs) < 100:
        parser.error('제품 윤곽이 너무 작습니다. 다른 사진 또는 색 기준을 사용하세요.')
    # Crop once with padding. RGB stays exactly the source; only alpha changes.
    bbox = (max(0, xs.min()-12), max(0, ys.min()-12), min(rgba.shape[1], xs.max()+13), min(rgba.shape[0], ys.max()+13))
    left, top, right, bottom = bbox
    rgba[..., 3] = np.where(mask, rgba[..., 3], 0)
    texture = rgba[top:bottom, left:right].copy()
    cropped_mask = mask[top:bottom, left:right]
    positions, uvs, indices = build_mesh(cropped_mask, grid=args.grid, relief=args.relief)
    texture_file = io.BytesIO()
    Image.fromarray(texture).save(texture_file, format='PNG')
    provenance.update(inputSHA256=source_hash, verifiedEarthProduct=False, physicalScaleVerified=False,
                      geometryKind='photo-relief-2.5d', depthIsEstimated=True, backSurfaceRecovered=False,
                      nominalRenderWidthMeters=.08, reliefRatio=args.relief, grid=args.grid,
                      minSaturation=args.min_saturation, maxDark=args.max_dark,
                      minComponentArea=args.min_component_area, maxHoleArea=args.max_hole_area, cleanRadius=args.clean_radius,
                      crop=[int(v) for v in bbox], vertices=len(positions), triangles=len(indices))
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out/'texture.png').write_bytes(texture_file.getvalue())
    (args.out/'reference.glb').write_bytes(make_glb(positions, uvs, indices, texture_file.getvalue(), provenance))
    render(positions, uvs, indices, texture).save(args.out/'front.png')
    render(positions, uvs, indices, texture, yaw=28, pitch=20).save(args.out/'angled.png')
    (args.out/'manifest.json').write_text(json.dumps(provenance, indent=2, ensure_ascii=False)+'\n')
    template = (ROOT/'scripts/reference-review.html').read_text()
    payload = {'positions': positions.tolist(), 'uvs': uvs.tolist(), 'indices': indices.ravel().tolist(),
               'texture': 'data:image/png;base64,'+base64.b64encode(texture_file.getvalue()).decode(),
               'front': 'data:image/png;base64,'+base64.b64encode((args.out/'front.png').read_bytes()).decode(),
               'angled': 'data:image/png;base64,'+base64.b64encode((args.out/'angled.png').read_bytes()).decode(),
               'source': 'data:'+source_mime+';base64,'+base64.b64encode(source_bytes).decode(), 'provenance': provenance}
    safe_payload = json.dumps(payload, separators=(',', ':'), ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    (args.out/'review.html').write_text(template.replace('__PAYLOAD__', safe_payload))
    print(f'완료: {args.out.resolve()}\n정점 {len(positions):,} / 삼각형 {len(indices):,}\n외부 제품 참고 · 2.5D 추정 깊이 · EARTH 제품 자산 아님')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError) as error:
        print(f'렌더링 실패: {error}', file=sys.stderr)
        sys.exit(1)
