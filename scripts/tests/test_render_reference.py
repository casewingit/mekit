import importlib.util
import json
from pathlib import Path
import struct
import unittest
import numpy as np

spec = importlib.util.spec_from_file_location('render_reference', Path(__file__).parents[1] / 'render_reference.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)

class PhotoRendererTests(unittest.TestCase):
    def test_background_and_transparent_dark_pixels_are_not_product(self):
        rgba = np.array([[[245, 242, 233, 255], [178, 112, 45, 255], [30, 31, 27, 255], [0, 0, 0, 0]]], dtype=np.uint8)
        self.assertEqual(renderer.extract_mask(rgba).tolist(), [[False, True, True, False]])

    def test_small_highlight_hole_is_filled_but_wrist_opening_remains(self):
        mask = np.ones((16, 16), dtype=bool)
        mask[0, :] = mask[-1, :] = False
        mask[:, 0] = mask[:, -1] = False
        mask[6:10, 6:10] = False
        mask[3, 3] = False
        filled = renderer.fill_small_holes(mask, max_area=4)
        self.assertTrue(filled[3, 3])
        self.assertFalse(filled[7, 7])
        self.assertFalse(filled[0, 0])

    def test_disconnected_background_specks_are_removed_without_losing_beads(self):
        mask = np.zeros((20, 20), dtype=bool)
        mask[4:8, 4:8] = True
        mask[10:14, 10:14] = True
        mask[0, 0] = True
        clean = renderer.remove_small_components(mask, min_area=8)
        self.assertFalse(clean[0, 0])
        self.assertTrue(clean[5, 5])
        self.assertTrue(clean[12, 12])

    def test_thin_attached_cloth_fringe_is_removed(self):
        mask = np.zeros((30, 30), dtype=bool)
        mask[8:22, 8:22] = True
        mask[14:16, 1:8] = True
        clean = renderer.clean_thin_fringe(mask, radius=2)
        self.assertFalse(clean[14, 2])
        self.assertTrue(clean[15, 15])

    def test_mesh_does_not_bridge_the_wrist_opening(self):
        mask = np.ones((24, 24), dtype=bool)
        mask[8:16, 8:16] = False
        positions, uvs, indices = renderer.build_mesh(mask, grid=24, relief=0.06)
        self.assertGreater(len(indices), 0)
        self.assertTrue(np.isfinite(positions).all())
        self.assertGreater(positions[:, 2].max(), 0)
        centers = uvs[indices].mean(axis=1)
        in_hole = (centers[:, 0] > 8/23) & (centers[:, 0] < 15/23) & (centers[:, 1] > 8/23) & (centers[:, 1] < 15/23)
        self.assertFalse(in_hole.any())

    def test_glb_contains_original_texture_and_unverified_reference_provenance(self):
        mask = np.ones((8, 8), dtype=bool)
        positions, uvs, indices = renderer.build_mesh(mask, grid=8, relief=0.04)
        from PIL import Image
        import io
        texture = io.BytesIO()
        Image.new('RGBA', (8, 8), (178, 112, 45, 255)).save(texture, format='PNG')
        data = renderer.make_glb(positions, uvs, indices, texture.getvalue(), {'sourcePage': 'https://example.com/product'})
        magic, version, length = struct.unpack_from('<4sII', data)
        self.assertEqual((magic, version, length), (b'glTF', 2, len(data)))
        json_size, kind = struct.unpack_from('<I4s', data, 12)
        self.assertEqual(kind, b'JSON')
        document = json.loads(data[20:20+json_size])
        self.assertFalse(document['asset']['extras']['verifiedEarthProduct'])
        self.assertEqual(document['asset']['extras']['geometryKind'], 'photo-relief-2.5d')
        self.assertIn(texture.getvalue(), data)
        count = document['accessors'][document['meshes'][0]['primitives'][0]['indices']]['count']
        self.assertEqual(count, indices.size)

if __name__ == '__main__':
    unittest.main()
