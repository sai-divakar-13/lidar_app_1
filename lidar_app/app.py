"""
LiDAR Forest Analytics Dashboard — Flask Backend
File: app.py
Run: python app.py
"""

import os, io, base64, json, uuid, math, struct
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Optional: laspy
try:
    import laspy
    LASPY_OK = True
except ImportError:
    LASPY_OK = False

# Optional: scipy / skimage for ITD
try:
    from scipy.ndimage import distance_transform_edt
    from scipy.ndimage import binary_fill_holes, binary_erosion, binary_dilation, label as ndimage_label
    from scipy import ndimage
    from scipy.interpolate import griddata, NearestNDInterpolator
    from scipy.stats import binned_statistic_2d
    from skimage.feature import peak_local_max
    from skimage.segmentation import watershed
    SCIPY_OK = True
except ImportError:
    SCIPY_OK = False

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

UPLOAD_FOLDER = os.path.join('static', 'uploads')
OUTPUT_FOLDER = os.path.join('static', 'outputs')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

SUPPORTED_EXTS = ['.las', '.laz', '.e57', '.ply', '.pcd']

# ─────────────────────────────────────────────────────────────
# CLASS METADATA
# ─────────────────────────────────────────────────────────────
CLASS_META = {
    0:  {'name': 'Never Classified', 'color': '#94a3b8', 'desc': 'Raw unprocessed points'},
    1:  {'name': 'Unclassified',     'color': '#64748b', 'desc': 'Points not yet classified'},
    2:  {'name': 'Ground',           'color': '#92400e', 'desc': 'Bare earth returns for DTM generation'},
    3:  {'name': 'Low Vegetation',   'color': '#16a34a', 'desc': 'Grass, shrubs up to ~1 m'},
    4:  {'name': 'Medium Vegetation','color': '#f97316', 'desc': 'Mid-storey shrubs, ~1–2.5 m'},
    5:  {'name': 'High Vegetation',  'color': '#22c55e', 'desc': 'Tree canopy returns, >2.5 m'},
    6:  {'name': 'Building',         'color': '#6366f1', 'desc': 'Roof and wall returns'},
    7:  {'name': 'Low Point (Noise)','color': '#a855f7', 'desc': 'Low confidence / outlier returns'},
    8:  {'name': 'Reserved',         'color': '#475569', 'desc': 'Reserved class'},
    9:  {'name': 'Water',            'color': '#0ea5e9', 'desc': 'Lake, river, pond surfaces'},
    10: {'name': 'Rail',             'color': '#78716c', 'desc': 'Railway / tramway'},
    11: {'name': 'Road Surface',     'color': '#94a3b8', 'desc': 'Paved road surface'},
    12: {'name': 'Overlap',          'color': '#f43f5e', 'desc': 'Overlapping flight lines'},
    13: {'name': 'Wire Guard',       'color': '#fbbf24', 'desc': 'Utility wire / guard'},
    14: {'name': 'Wire Conductor',   'color': '#fbbf24', 'desc': 'Power line conductor'},
    15: {'name': 'Transmission Tower','color':'#f59e0b', 'desc': 'Transmission tower structure'},
    16: {'name': 'Wire Connector',   'color': '#fbbf24', 'desc': 'Wire insulator / connector'},
    17: {'name': 'Bridge Deck',      'color': '#7c3aed', 'desc': 'Bridge surface returns'},
    18: {'name': 'High Noise',       'color': '#ef4444', 'desc': 'Noise above canopy'},
}

def get_class_info(cls_id):
    if cls_id in CLASS_META:
        return CLASS_META[cls_id]
    return {'name': f'Class {cls_id}', 'color': '#64748b', 'desc': f'User-defined class {cls_id}'}

def fig_to_b64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=110, bbox_inches='tight',
                facecolor='#0a0f1a', edgecolor='none')
    plt.close(fig)
    buf.seek(0)
    return 'data:image/png;base64,' + base64.b64encode(buf.read()).decode()

def styled_fig(nrows=1, ncols=1, figsize=(10, 6)):
    fig, ax = plt.subplots(nrows, ncols, figsize=figsize)
    fig.patch.set_facecolor('#0a0f1a')
    def style_ax(a):
        a.set_facecolor('#111827')
        a.tick_params(colors='#64748b')
        a.xaxis.label.set_color('#64748b')
        a.yaxis.label.set_color('#64748b')
        a.title.set_color('#e2e8f0')
        for sp in a.spines.values():
            sp.set_edgecolor('#1e2d45')
    if nrows == 1 and ncols == 1:
        style_ax(ax)
    else:
        for a in (ax.flat if hasattr(ax, 'flat') else ax):
            style_ax(a)
    return fig, ax

# ─────────────────────────────────────────────────────────────
# FORMAT READERS
# ─────────────────────────────────────────────────────────────

def read_ply(path):
    """Read binary/ASCII PLY, return (x,y,z,classification) arrays."""
    with open(path, 'rb') as f:
        header = []
        while True:
            line = f.readline().decode('ascii', errors='replace').strip()
            header.append(line)
            if line == 'end_header':
                break

        n_vertices = 0
        is_binary_little = False
        properties = []
        for line in header:
            if line.startswith('element vertex'):
                n_vertices = int(line.split()[-1])
            elif 'binary_little_endian' in line:
                is_binary_little = True
            elif line.startswith('property'):
                parts = line.split()
                properties.append((parts[1], parts[2]))

        dtype_map = {'float': 'f4','float32':'f4','float64':'f8','double':'f8',
                     'int':'i4','int32':'i4','uint8':'u1','uchar':'u1',
                     'int16':'i2','uint16':'u2','short':'i2','ushort':'u2',
                     'int64':'i8','uint64':'u8'}
        dt_list = []
        for ptype, pname in properties:
            dt_list.append((pname, dtype_map.get(ptype, 'f4')))

        if is_binary_little:
            data = np.frombuffer(f.read(), dtype=np.dtype(dt_list))
        else:
            rows = []
            for _ in range(n_vertices):
                row = list(map(float, f.readline().split()))
                rows.append(row)
            data = np.array(rows, dtype=np.float32)
            names = [p[1] for p in properties]
            data = {names[i]: data[:, i] for i in range(len(names))}

    names_lower = [p[1].lower() for p in properties]
    x = data['x'] if 'x' in data.dtype.names else np.zeros(n_vertices)
    y = data['y'] if 'y' in data.dtype.names else np.zeros(n_vertices)
    z = data['z'] if 'z' in data.dtype.names else np.zeros(n_vertices)
    # classification: try scalar_Classification, Classification, label, class, intensity
    cls = None
    for name in ['scalar_classification','classification','label','class','scalar_label']:
        if name in data.dtype.names:
            cls = data[name].astype(np.uint8)
            break
    if cls is None:
        # Derive from z percentiles as proxy
        z_vals = z.astype(float)
        cls = np.zeros(len(z_vals), dtype=np.uint8)
        p10 = np.percentile(z_vals, 10)
        p50 = np.percentile(z_vals, 50)
        p80 = np.percentile(z_vals, 80)
        cls[z_vals <= p10] = 2
        cls[(z_vals > p10) & (z_vals <= p50)] = 3
        cls[(z_vals > p50) & (z_vals <= p80)] = 4
        cls[z_vals > p80] = 5
    return x.astype(float), y.astype(float), z.astype(float), cls

def read_pcd(path):
    """Read PCD (binary/ASCII), return (x,y,z,classification) arrays."""
    with open(path, 'rb') as f:
        header = {}
        fields = []
        sizes = []
        types = []
        counts = []
        n_points = 0
        data_type = 'ascii'
        while True:
            line = f.readline().decode('ascii', errors='replace').strip()
            if line.startswith('FIELDS'):
                fields = line.split()[1:]
            elif line.startswith('SIZE'):
                sizes = list(map(int, line.split()[1:]))
            elif line.startswith('TYPE'):
                types = line.split()[1:]
            elif line.startswith('COUNT'):
                counts = list(map(int, line.split()[1:]))
            elif line.startswith('POINTS'):
                n_points = int(line.split()[1])
            elif line.startswith('DATA'):
                data_type = line.split()[1]
                break

        type_map = {'F': 'f', 'I': 'i', 'U': 'u'}
        if data_type == 'binary':
            dt_list = []
            for i, fn in enumerate(fields):
                t = type_map.get(types[i], 'f')
                dt_list.append((fn, f'{t}{sizes[i]}'))
            dt = np.dtype(dt_list)
            raw = f.read(dt.itemsize * n_points)
            data = np.frombuffer(raw, dtype=dt)
        else:
            rows = []
            for _ in range(n_points):
                row = list(map(float, f.readline().split()))
                rows.append(row)
            data_arr = np.array(rows, dtype=np.float32)
            data = {fields[i]: data_arr[:, i] for i in range(len(fields))}
            class FakeStruct:
                def __init__(self, d): self._d = d
                @property
                def dtype(self):
                    class N:
                        def __init__(self, names): self.names = names
                    return N(list(d.keys()))
                def __getitem__(self, k): return self._d[k]
            data = FakeStruct(data)

    get = lambda k: data[k] if k in data.dtype.names else None
    x = get('x') or np.zeros(n_points)
    y = get('y') or np.zeros(n_points)
    z = get('z') or np.zeros(n_points)
    cls = None
    for name in ['classification','label','class','intensity']:
        v = get(name)
        if v is not None:
            cls = v.astype(np.uint8)
            break
    if cls is None:
        z_vals = np.array(z, dtype=float)
        cls = np.zeros(len(z_vals), dtype=np.uint8)
        p10 = np.percentile(z_vals, 10)
        p50 = np.percentile(z_vals, 50)
        p80 = np.percentile(z_vals, 80)
        cls[z_vals <= p10] = 2
        cls[(z_vals > p10) & (z_vals <= p50)] = 3
        cls[(z_vals > p50) & (z_vals <= p80)] = 4
        cls[z_vals > p80] = 5
    return np.array(x, float), np.array(y, float), np.array(z, float), cls

def read_e57(path):
    """Basic E57 reader: extract xyz and derive classification from Z."""
    try:
        import pye57
        e57 = pye57.E57(path)
        data = e57.read_scan(0, colors=False, ignore_missing_fields=True)
        x = np.array(data['cartesianX'], dtype=float)
        y = np.array(data['cartesianY'], dtype=float)
        z = np.array(data['cartesianZ'], dtype=float)
    except Exception:
        # fallback: try to parse as raw binary (may fail gracefully)
        raise ValueError("E57 reading requires the pye57 library. Install: pip install pye57")

    z_vals = z.astype(float)
    cls = np.zeros(len(z_vals), dtype=np.uint8)
    p10 = np.percentile(z_vals, 10)
    p50 = np.percentile(z_vals, 50)
    p80 = np.percentile(z_vals, 80)
    cls[z_vals <= p10] = 2
    cls[(z_vals > p10) & (z_vals <= p50)] = 3
    cls[(z_vals > p50) & (z_vals <= p80)] = 4
    cls[z_vals > p80] = 5
    return x, y, z, cls

def load_point_cloud(path):
    """
    Returns a dict with x, y, z, classification numpy arrays.
    Handles .las, .laz, .ply, .pcd, .e57
    """
    ext = os.path.splitext(path)[1].lower()
    if ext in ['.las', '.laz']:
        if not LASPY_OK:
            raise RuntimeError('laspy not installed')
        las = laspy.read(path)
        return {
            'x': np.array(las.x, dtype=float),
            'y': np.array(las.y, dtype=float),
            'z': np.array(las.z, dtype=float),
            'classification': np.array(las.classification, dtype=np.uint8),
            'dims': list(las.point_format.dimension_names),
        }
    elif ext == '.ply':
        x, y, z, cls = read_ply(path)
        return {'x': x, 'y': y, 'z': z, 'classification': cls, 'dims': ['X','Y','Z','classification']}
    elif ext == '.pcd':
        x, y, z, cls = read_pcd(path)
        return {'x': x, 'y': y, 'z': z, 'classification': cls, 'dims': ['X','Y','Z','classification']}
    elif ext == '.e57':
        x, y, z, cls = read_e57(path)
        return {'x': x, 'y': y, 'z': z, 'classification': cls, 'dims': ['X','Y','Z','classification']}
    else:
        raise ValueError(f'Unsupported format: {ext}')

# ─────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/methodology')
def methodology():
    return send_from_directory('templates', 'methodology.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Step 1: Upload file, return class summary."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    f = request.files['file']
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in SUPPORTED_EXTS:
        return jsonify({'error': f'Unsupported format: {ext}. Supported: {", ".join(SUPPORTED_EXTS)}'}), 400

    if ext in ['.las', '.laz'] and not LASPY_OK:
        return jsonify({'error': 'laspy not installed on server'}), 500

    session_id = str(uuid.uuid4())[:8]
    save_path = os.path.join(UPLOAD_FOLDER, f'{session_id}{ext}')
    f.save(save_path)

    try:
        pc = load_point_cloud(save_path)
    except Exception as e:
        return jsonify({'error': f'Cannot read file: {str(e)}'}), 400

    x, y, z = pc['x'], pc['y'], pc['z']
    classification = pc['classification']
    dims = pc.get('dims', [])

    # Class counts — exactly as shown in screenshot
    unique, counts = np.unique(classification, return_counts=True)
    classes = []
    total_pts = int(counts.sum())
    for cls_id, cnt in zip(unique.tolist(), counts.tolist()):
        info = get_class_info(cls_id)
        classes.append({
            'id': int(cls_id),
            'name': info['name'],
            'color': info['color'],
            'desc': info['desc'],
            'count': cnt,
            'pct': round(cnt / total_pts * 100, 2)
        })

    x_range = [float(x.min()), float(x.max())]
    y_range = [float(y.min()), float(y.max())]
    z_range = [float(z.min()), float(z.max())]
    area_m2 = (x_range[1]-x_range[0]) * (y_range[1]-y_range[0])

    # Downsampled preview points for 3D viewer (max 25k points)
    n = len(x)
    max_preview = 25000
    if n > max_preview:
        idx = np.random.choice(n, max_preview, replace=False)
    else:
        idx = np.arange(n)

    px = x[idx]; py = y[idx]; pz = z[idx]; pc_cls = classification[idx]
    # Center coordinates around origin for viewer
    cx, cy, cz = float(x.mean()), float(y.mean()), float(z.mean())
    preview = []
    for i in range(len(idx)):
        info = get_class_info(int(pc_cls[i]))
        preview.append([
            round(float(px[i] - cx), 3),
            round(float(py[i] - cy), 3),
            round(float(pz[i] - cz), 3),
            info['color']
        ])

    return jsonify({
        'session_id': session_id,
        'filename': f.filename,
        'total_points': total_pts,
        'dimensions': dims,
        'classes': classes,
        'x_range': x_range,
        'y_range': y_range,
        'z_range': z_range,
        'area_m2': round(area_m2, 2),
        'file_format': ext,
        'preview_points': preview,
    })


@app.route('/api/class_image/<session_id>/<int:cls_id>', methods=['GET'])
def class_image(session_id, cls_id):
    """Generate scatter plot for a single class."""
    path = _find_file(session_id)
    if not path:
        return jsonify({'error': 'Session not found'}), 404

    try:
        pc = load_point_cloud(path)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    mask = pc['classification'] == cls_id
    pts = np.vstack((pc['x'][mask], pc['y'][mask])).T

    info = get_class_info(cls_id)

    fig, ax = styled_fig(figsize=(7, 5))
    if len(pts) > 100_000:
        idx = np.random.choice(len(pts), 100_000, replace=False)
        pts = pts[idx]
    ax.scatter(pts[:, 0], pts[:, 1], s=0.3, c=info['color'], alpha=0.6, linewidths=0)
    ax.set_title(f"{info['name']} (Class {cls_id})", color='#e2e8f0', fontsize=13)
    ax.set_xlabel('X Coordinate (m)', color='#64748b')
    ax.set_ylabel('Y Coordinate (m)', color='#64748b')
    img = fig_to_b64(fig)
    return jsonify({'image': img, 'class_id': cls_id})


@app.route('/api/terrain/<session_id>', methods=['GET'])
def terrain(session_id):
    """Generate DTM and CHM using the correct method from screenshots."""
    path = _find_file(session_id)
    if not path:
        return jsonify({'error': 'Session not found'}), 404

    try:
        pc = load_point_cloud(path)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    las_x = pc['x']
    las_y = pc['y']
    las_z = pc['z']
    classification = pc['classification']

    resolution = 1.0  # Use 1.0m as in screenshots

    x_min = float(las_x.min())
    y_min = float(las_y.min())

    # Ground mask — Class 2 (Ground) as in screenshots
    ground_mask = (classification == 2)
    print(f"Ground points: {ground_mask.sum()}")

    # Vegetation mask — Classes 3, 4, 5 as in screenshots
    veg_mask = (
        (classification == 3) |
        (classification == 4) |
        (classification == 5)
    )
    print(f"Vegetation points: {veg_mask.sum()}")

    # Fallbacks if no ground or veg points
    if ground_mask.sum() < 10:
        thresh = np.percentile(las_z, 10)
        ground_mask = las_z <= thresh
    if veg_mask.sum() < 10:
        veg_mask = las_z > np.percentile(las_z, 50)

    x_bins = np.arange(las_x.min(), las_x.max() + resolution, resolution)
    y_bins = np.arange(las_y.min(), las_y.max() + resolution, resolution)

    def make_grid(mask, stat='min'):
        pts_x = las_x[mask]
        pts_y = las_y[mask]
        pts_z = las_z[mask]
        if len(pts_x) == 0:
            return np.zeros((len(y_bins), len(x_bins)))
        xi = np.digitize(pts_x, x_bins) - 1
        yi = np.digitize(pts_y, y_bins) - 1
        grid = np.full((len(y_bins), len(x_bins)), np.nan)
        for i in range(len(pts_z)):
            r, c = yi[i], xi[i]
            if 0 <= r < grid.shape[0] and 0 <= c < grid.shape[1]:
                if np.isnan(grid[r, c]):
                    grid[r, c] = pts_z[i]
                else:
                    grid[r, c] = min(grid[r, c], pts_z[i]) if stat == 'min' else max(grid[r, c], pts_z[i])
        # Fill NaN with nearest neighbour
        if np.isnan(grid).any():
            mask2 = ~np.isnan(grid)
            if mask2.sum() > 0:
                coords = np.array(np.where(mask2)).T
                vals = grid[mask2]
                all_coords = np.array(np.where(np.ones_like(grid, dtype=bool))).T
                interp = NearestNDInterpolator(coords, vals)
                grid = interp(all_coords).reshape(grid.shape)
        return grid

    dtm = make_grid(ground_mask, 'min')
    dsm = make_grid(veg_mask, 'max')

    # CHM = DSM - DTM, exactly as in screenshots
    chm = dsm - dtm
    chm = np.clip(chm, 0, None)
    print(f"Tree Height (CHM): {chm.sum()}")

    fig, axes = styled_fig(1, 2, figsize=(14, 6))
    im0 = axes[0].imshow(dtm, cmap='terrain', origin='lower',
                          extent=[x_bins[0], x_bins[-1], y_bins[0], y_bins[-1]])
    axes[0].set_title('Digital Terrain Model (DTM)', color='#e2e8f0')
    axes[0].set_xlabel('X Coordinate (m)'); axes[0].set_ylabel('Y Coordinate (m)')
    fig.colorbar(im0, ax=axes[0], label='Elevation (m)').ax.yaxis.set_tick_params(color='#64748b')

    im1 = axes[1].imshow(chm, cmap='viridis', origin='lower',
                          extent=[x_bins[0], x_bins[-1], y_bins[0], y_bins[-1]])
    axes[1].set_title('Canopy Height Model (CHM)', color='#e2e8f0')
    axes[1].set_xlabel('X Coordinate (m)'); axes[1].set_ylabel('Y Coordinate (m)')
    fig.colorbar(im1, ax=axes[1], label='Height (m)').ax.yaxis.set_tick_params(color='#64748b')

    plt.tight_layout()
    img = fig_to_b64(fig)

    return jsonify({
        'image': img,
        'dtm_range': [float(np.nanmin(dtm)), float(np.nanmax(dtm))],
        'chm_max': float(np.nanmax(chm)),
        'chm_mean': float(np.nanmean(chm[chm > 0])) if (chm > 0).sum() > 0 else 0,
        'chm_data': chm.tolist(),
        'x_min': float(x_min),
        'y_min': float(y_min),
        'resolution': resolution,
    })


@app.route('/api/itd/<session_id>', methods=['POST'])
def individual_tree_detection(session_id):
    """Run ITD exactly as in screenshots: peak_local_max then watershed."""
    body = request.get_json()
    chm_list = body.get('chm_data')
    x_min = body.get('x_min', 0)
    y_min = body.get('y_min', 0)
    resolution = body.get('resolution', 1.0)

    chm = np.array(chm_list, dtype=float)

    # Tree top detection — exactly as screenshot
    # peak_local_max with min_distance=3, threshold_abs=2
    tree_tops = peak_local_max(
        chm,
        min_distance=3,
        threshold_abs=2
    )
    print(f"Trees detected: {len(tree_tops)}")

    # Watershed segmentation — exactly as screenshot
    markers = np.zeros(chm.shape, dtype=int)
    for i, p in enumerate(tree_tops):
        markers[p[0], p[1]] = i + 1

    labels = watershed(-chm, markers, mask=chm > 2)
    print(f"Crowns: {labels.max()}")

    # Build results DataFrame — exactly as screenshot
    results = []
    for tree_id in range(1, labels.max() + 1):
        crown = labels == tree_id
        if crown.sum() < 5:
            continue

        crown_area = crown.sum() * (resolution ** 2)
        crown_diameter = 2 * np.sqrt(crown_area / np.pi)
        tree_height = float(chm[crown].max())

        r, c = np.where(crown)
        tree_x = float(x_min + c.mean() * resolution)
        tree_y = float(y_min + r.mean() * resolution)

        results.append([
            tree_id,
            tree_x,
            tree_y,
            tree_height,
            crown_area,
            crown_diameter
        ])

    if not results:
        return jsonify({'error': 'No trees detected. Try adjusting parameters.'}), 400

    df = pd.DataFrame(
        results,
        columns=['Tree_ID', 'X', 'Y', 'Height_m', 'Crown_Area_m2', 'Crown_Diameter_m']
    )

    # Renumber Tree_ID sequentially (1..N) so there are no gaps from
    # crowns dropped by the area < 5 filter above
    df['Tree_ID'] = range(1, len(df) + 1)

    # ── Allometric pipeline — exactly as screenshots ──
    rho = 0.6

    # DBH estimation
    df['DBH_cm'] = (
        1.3 +
        0.6 * df['Height_m'] +
        0.3 * df['Crown_Diameter_m']
    )

    # AGB — Chave et al. pantropical equation
    df['AGB_kg'] = (
        0.0673 *
        ((rho * (df['DBH_cm'] ** 2) * df['Height_m']) ** 0.976)
    )

    # Carbon and CO2 — IPCC factors
    df['Carbon_kg'] = df['AGB_kg'] * 0.47
    df['CO2_kg'] = df['Carbon_kg'] * 3.67

    # Round to 4 decimal places
    for col in ['X', 'Y', 'Height_m', 'Crown_Area_m2', 'Crown_Diameter_m', 'DBH_cm', 'AGB_kg', 'Carbon_kg', 'CO2_kg']:
        df[col] = df[col].round(4)

    total_carbon = df['Carbon_kg'].sum()
    total_co2 = df['CO2_kg'].sum()
    print(f"Total Carbon (kg): {total_carbon}")
    print(f"Total CO2 (kg): {total_co2}")

    trees = df.to_dict(orient='records')

    summary = {
        'tree_count': len(df),
        'total_agb_kg': round(float(df['AGB_kg'].sum()), 2),
        'total_carbon_kg': round(float(df['Carbon_kg'].sum()), 2),
        'total_co2_kg': round(float(df['CO2_kg'].sum()), 2),
        'avg_height_m': round(float(df['Height_m'].mean()), 2),
        'max_height_m': round(float(df['Height_m'].max()), 2),
        'avg_crown_area_m2': round(float(df['Crown_Area_m2'].mean()), 2),
    }

    return jsonify({'trees': trees, 'summary': summary})


@app.route('/api/charts/<session_id>', methods=['POST'])
def generate_charts(session_id):
    """Generate analytics charts from tree data."""
    body = request.get_json()
    trees = body.get('trees', [])
    df = pd.DataFrame(trees)

    charts = {}

    # 1. Height histogram
    fig, ax = styled_fig(figsize=(7, 4))
    bins = np.arange(0, df['Height_m'].max() + 2, 2)
    ax.hist(df['Height_m'], bins=bins, color='#10b981', alpha=0.85, edgecolor='#064e3b')
    ax.set_xlabel('Height (m)'); ax.set_ylabel('Tree Count')
    ax.set_title('Tree Height Distribution', color='#e2e8f0')
    ax.grid(axis='y', color='#1e2d45', linewidth=0.5)
    charts['height_hist'] = fig_to_b64(fig)

    # 2. AGB ranked bar
    df_s = df.sort_values('AGB_kg', ascending=False).reset_index(drop=True)
    fig, ax = styled_fig(figsize=(10, 4))
    n = len(df_s)
    bar_colors = [mcolors.hsv_to_rgb(((120 - i/n*90)/360, 0.7, 0.65)) for i in range(n)]
    ax.bar(range(n), df_s['AGB_kg'], color=bar_colors, width=0.8)
    ax.set_xticks(range(n))
    ax.set_xticklabels([f"T{int(r['Tree_ID'])}" for _, r in df_s.iterrows()],
                       rotation=90, fontsize=7, color='#64748b')
    ax.set_ylabel('AGB (kg)'); ax.set_title('AGB Distribution (by tree)', color='#e2e8f0')
    ax.grid(axis='y', color='#1e2d45', linewidth=0.5)
    charts['agb_bar'] = fig_to_b64(fig)

    # 3. Height vs Crown Area scatter
    fig, ax = styled_fig(figsize=(7, 4))
    sc = ax.scatter(df['Height_m'], df['Crown_Area_m2'],
                    c=df['AGB_kg'], cmap='plasma', s=60, alpha=0.85, edgecolors='none')
    fig.colorbar(sc, ax=ax, label='AGB (kg)').ax.yaxis.set_tick_params(color='#64748b')
    ax.set_xlabel('Height (m)'); ax.set_ylabel('Crown Area (m²)')
    ax.set_title('Height vs Crown Area', color='#e2e8f0')
    ax.grid(color='#1e2d45', linewidth=0.5)
    charts['scatter'] = fig_to_b64(fig)

    # 4. Carbon & CO2 top 20
    top = df.sort_values('Carbon_kg', ascending=False).head(20)
    fig, ax = styled_fig(figsize=(10, 4))
    x = np.arange(len(top))
    ax.bar(x - 0.2, top['Carbon_kg'], 0.38, label='Carbon (kg)', color='#10b981aa')
    ax.bar(x + 0.2, top['CO2_kg'],    0.38, label='CO₂ (kg)',    color='#f59e0baa')
    ax.set_xticks(x)
    ax.set_xticklabels([f"T{int(r['Tree_ID'])}" for _, r in top.iterrows()],
                       rotation=45, fontsize=8, color='#64748b')
    ax.legend(facecolor='#111827', labelcolor='#94a3b8', edgecolor='#1e2d45')
    ax.set_title('Carbon & CO₂ — Top 20 Trees', color='#e2e8f0')
    ax.grid(axis='y', color='#1e2d45', linewidth=0.5)
    charts['carbon'] = fig_to_b64(fig)

    # 5. DBH vs AGB
    fig, ax = styled_fig(figsize=(7, 4))
    ax.scatter(df['DBH_cm'], df['AGB_kg'], c='#8b5cf6', s=55, alpha=0.8, edgecolors='none')
    ax.set_xlabel('DBH (cm)'); ax.set_ylabel('AGB (kg)')
    ax.set_title('DBH vs AGB', color='#e2e8f0')
    ax.grid(color='#1e2d45', linewidth=0.5)
    charts['dbh'] = fig_to_b64(fig)

    return jsonify({'charts': charts})


# ─────────────────────────────────────────────────────────────
# TREE CARBON — FRONT SIDE vs OUTSIDE OF BUILDING
# ─────────────────────────────────────────────────────────────
@app.route('/api/building_carbon/<session_id>', methods=['GET'])
def building_carbon(session_id):
    """
    Compares tree carbon stock in two zones relative to the building
    footprint (Class 6, if present):
      - FRONT zone:   a buffer strip in front of the building facade
      - OUTSIDE zone: everything else (the rest of the surveyed area)

    If no building points exist, returns has_building=False and the
    frontend simply shows tree-only results (no building comparison).
    """
    path = _find_file(session_id)
    if not path:
        return jsonify({'error': 'Session not found'}), 404
    try:
        pc = load_point_cloud(path)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    x_arr = pc['x']; y_arr = pc['y']; z_arr = pc['z']
    cls   = pc['classification']

    building_mask = cls == 6
    has_building = bool(building_mask.sum() >= 50)

    result = {'has_building': has_building}

    if not has_building:
        # No building in this dataset — nothing further to compute here.
        # The Analytics/Spatial/Inventory panels already show full tree
        # carbon results; this endpoint just confirms there's no building.
        return jsonify(result)

    bx = x_arr[building_mask]; by = y_arr[building_mask]; bz = z_arr[building_mask]
    ground_pts = z_arr[cls == 2]
    Z_GROUND = float(np.median(ground_pts)) if len(ground_pts) > 10 else float(bz.min())

    heights_ag = bz - Z_GROUND
    heights_valid = heights_ag[heights_ag > 0.3]
    max_height = float(heights_valid.max()) if len(heights_valid) else 0.0

    # Building footprint via 1m grid (height > 2m counted as built mass)
    resolution = 1.0
    x_bins = np.arange(bx.min(), bx.max() + resolution, resolution)
    y_bins = np.arange(by.min(), by.max() + resolution, resolution)
    xi_all = np.digitize(bx, x_bins) - 1
    yi_all = np.digitize(by, y_bins) - 1
    valid_all = (xi_all >= 0) & (xi_all < len(x_bins)) & (yi_all >= 0) & (yi_all < len(y_bins))
    bhm = np.zeros((len(y_bins), len(x_bins)))
    flat_idx = (yi_all * len(x_bins) + xi_all)[valid_all]
    np.maximum.at(bhm.ravel(), flat_idx, (bz - Z_GROUND)[valid_all])
    building_area   = float(np.sum(bhm > 2) * resolution ** 2)
    building_volume = float(np.sum(bhm[bhm > 2]) * resolution ** 2)
    building_carbon_vol_kg = round(building_volume * 300, 2)  # 300 kgCO2e/m3 concrete

    bbox = {
        'x_min': round(float(bx.min()), 2), 'x_max': round(float(bx.max()), 2),
        'y_min': round(float(by.min()), 2), 'y_max': round(float(by.max()), 2),
    }

    # ── Determine "front" side: the building edge facing the larger
    #    open area of the survey (simple heuristic — compare point
    #    density of vegetation on each of the 4 sides of the bbox) ──
    veg_mask = (cls == 3) | (cls == 4) | (cls == 5)
    vx, vy = x_arr[veg_mask], y_arr[veg_mask]

    FRONT_BUFFER = 15.0  # metres — depth of the "front zone" strip
    sides = {
        'south': vy < bbox['y_min'],
        'north': vy > bbox['y_max'],
        'west':  vx < bbox['x_min'],
        'east':  vx > bbox['x_max'],
    }
    # Pick the side with the most vegetation points within FRONT_BUFFER as "front"
    best_side, best_count = 'south', -1
    for side, mask in sides.items():
        if side == 'south':
            band = mask & (vy > bbox['y_min'] - FRONT_BUFFER)
        elif side == 'north':
            band = mask & (vy < bbox['y_max'] + FRONT_BUFFER)
        elif side == 'west':
            band = mask & (vx > bbox['x_min'] - FRONT_BUFFER)
        else:
            band = mask & (vx < bbox['x_max'] + FRONT_BUFFER)
        cnt = int(band.sum())
        if cnt > best_count:
            best_count = cnt
            best_side = side

    if best_side == 'south':
        front_zone_mask = (vy < bbox['y_min']) & (vy > bbox['y_min'] - FRONT_BUFFER)
    elif best_side == 'north':
        front_zone_mask = (vy > bbox['y_max']) & (vy < bbox['y_max'] + FRONT_BUFFER)
    elif best_side == 'west':
        front_zone_mask = (vx < bbox['x_min']) & (vx > bbox['x_min'] - FRONT_BUFFER)
    else:
        front_zone_mask = (vx > bbox['x_max']) & (vx < bbox['x_max'] + FRONT_BUFFER)

    # ── Plan image: building footprint + front zone strip + outside zone ──
    fig_plan, ax_plan = styled_fig(figsize=(8, 8))
    ax_plan.scatter(bx[::20], by[::20], c='#6366f1', s=1.2, alpha=0.5, label='Building')
    ax_plan.scatter(vx[~front_zone_mask][::20], vy[~front_zone_mask][::20],
                     c='#22c55e', s=1.0, alpha=0.35, label='Vegetation — Outside Zone')
    ax_plan.scatter(vx[front_zone_mask][::5], vy[front_zone_mask][::5],
                     c='#fbbf24', s=1.4, alpha=0.7, label='Vegetation — Front Zone')
    rect = plt.Rectangle((bbox['x_min'], bbox['y_min']),
                          bbox['x_max']-bbox['x_min'], bbox['y_max']-bbox['y_min'],
                          fc='none', ec='#6366f1', lw=2)
    ax_plan.add_patch(rect)
    ax_plan.set_title(f'Building Footprint & Tree Carbon Zones — Front: {best_side.title()} side',
                       color='#e2e8f0')
    ax_plan.set_xlabel('X (m)'); ax_plan.set_ylabel('Y (m)')
    ax_plan.legend(loc='upper right', fontsize=8, facecolor='#111827', labelcolor='#94a3b8', edgecolor='#1e2d45')
    plan_img = fig_to_b64(fig_plan)

    result.update({
        'z_ground': round(Z_GROUND, 3),
        'max_height_m': round(max_height, 2),
        'building_area_m2': round(building_area, 1),
        'building_volume_m3': round(building_volume, 1),
        'building_carbon_vol_kg': building_carbon_vol_kg,
        'bbox': bbox,
        'front_side': best_side,
        'front_buffer_m': FRONT_BUFFER,
        'plan_image': plan_img,
        # Boolean test the frontend can apply to each detected TREE (X,Y)
        # to classify it as front-zone vs outside-zone. Trees themselves
        # are computed in /api/itd — this endpoint only returns the
        # building geometry + zone test parameters, the actual carbon
        # split per zone is done client-side against the existing tree
        # list so totals always match the Analytics tab exactly.
        'zone_test': {
            'side': best_side,
            'buffer_m': FRONT_BUFFER,
            'x_min': bbox['x_min'], 'x_max': bbox['x_max'],
            'y_min': bbox['y_min'], 'y_max': bbox['y_max'],
        }
    })
    return jsonify(result)


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────
def _find_file(session_id):
    for ext in SUPPORTED_EXTS:
        p = os.path.join(UPLOAD_FOLDER, f'{session_id}{ext}')
        if os.path.exists(p):
            return p
    return None


if __name__ == '__main__':
    print("🌲 LiDAR Dashboard backend starting on http://localhost:5000")
    app.run(debug=True, port=5000)
