# LiDAR Forest Analytics Dashboard

Dynamic web dashboard — upload any .las/.laz/.e57/.ply/.pcd file, get full analysis.

## Folder Structure
```
lidar_app/
├── app.py                  ← Flask backend (Python)
├── requirements.txt        ← Python dependencies
├── templates/
│   ├── index.html          ← Main dashboard (served by Flask)
│   └── methodology.html    ← Standalone methodology page (opens in new tab)
└── static/
    ├── css/
    │   └── styles.css      ← All styles
    └── js/
        └── app.js          ← Frontend JavaScript
```

## Setup & Run

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. (Optional) For .e57 support
```bash
pip install pye57
```

### 3. Start the server
```bash
python app.py
```

### 4. Open browser
```
http://localhost:5000
```

## Changes in This Version

### Format Support
- **All five formats now work:** `.las`, `.laz`, `.e57`, `.ply`, `.pcd`
- PLY and PCD: binary and ASCII both supported
- E57: requires optional `pye57` library
- Classification derived from Z-percentiles if the file has no class field

### Correct Backend Computation (from screenshots)
- Resolution set to **1.0 m** (matching the notebook)
- Ground mask = **Class 2** only; vegetation = **Classes 3, 4, 5**
- `peak_local_max(CHM, min_distance=3, threshold_abs=2)` — exact parameters
- Watershed mask = `CHM > 2` (not 1)
- DBH: `1.3 + 0.6·H + 0.3·CrownØ`
- AGB: `0.0673 × (ρ·DBH²·H)^0.976`  with ρ = 0.6
- Carbon = AGB × 0.47,  CO₂ = Carbon × 3.67

### UI Changes
- **Methodology & Insights** removed from sidebar → top button that **opens a new page**
- Tree Inventory: **CSV download** + new **PDF download** (print-formatted report)
- All format badges shown as active in upload zone

## How It Works

1. **Upload** — Drop any supported file → backend reads it, counts point classes.
2. **Point Cloud Classes** — Scatter plots per class.
3. **Terrain Models** — Ground → DTM, vegetation → DSM, CHM = DSM − DTM.
4. **ITD** — `peak_local_max` finds tree tops; watershed delineates crowns.
5. **Analytics** — Height histogram, AGB bar, scatter, carbon/CO₂, DBH vs AGB.
6. **Spatial Map** — Canvas-rendered interactive crown map with hover tooltips.
7. **Tree Inventory** — Sortable table. CSV + PDF export.
8. **Methodology** — Opens in new page at `/methodology`.

## Supported Formats
| Format | Library     | Classification         |
|--------|-------------|------------------------|
| .las   | laspy       | From file              |
| .laz   | laspy       | From file              |
| .ply   | built-in    | From field or Z-derived|
| .pcd   | built-in    | From field or Z-derived|
| .e57   | pye57       | Z-derived              |

## Key Python Libraries
| Library       | Purpose                          |
|---------------|----------------------------------|
| laspy         | Read LAS/LAZ files               |
| numpy         | Array operations                 |
| scipy         | Interpolation, watershed ITD     |
| scikit-image  | peak_local_max tree detection    |
| matplotlib    | Server-side chart rendering      |
| pandas        | Tree metrics DataFrame           |
| flask         | REST API + HTML serving          |
| flask-cors    | Cross-origin headers             |
