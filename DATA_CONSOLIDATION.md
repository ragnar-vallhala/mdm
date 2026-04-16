# Data Availability and Consolidation Report

This document outlines the real-world health datasets integrated into the VITAL_OS Health Dashboard and the methodology used for consolidation.

## 1. Available Data Sources

Data was sourced from four different group folders, each provided in a different format:

| Group   | Source File(s)                   | Metrics Extracted   | Format                |
| ------- | -------------------------------- | ------------------- | --------------------- |
| **GP2** | `gp2/male_step_data.txt`         | Steps               | [INFO] Logs           |
| **GP3** | `gp3/sitting.txt`                | Breathing, SPO2     | IMU/PPG Sensor Fusion |
| **GP4** | `gp4/Male.csv`, `gp4/Female.csv` | Heart Rate, Posture | CSV                   |
| **GP6** | `gp6/*.csv`                      | Body Temperature    | Time-series CSV       |

## 2. Consolidation Process

The datasets were merged using the `scripts/consolidate_data.py` script. The process followed these steps:

### Parsing & Normalization

- **GP2**: Extracted step counts.
- **GP3**: Mapped fused sensor values to human-readable health ranges for breathing and oxygen saturation.
- **GP4**: Used for Heart Rate and Posture data. **Initial readings are ignored (sensor settling mode)**; only the final stable measurements (last 10 rows) are utilized for interpolation.
- **GP6**: Combined multiple temperature CSVs and normalized Fahrenheit readings to Celsius.

### temporal Alignment (Interpolation)

Since each group recorded data at different sampling rates and durations, all datasets were interpolated to a **common timeline of 500 data points**.

- **Numeric Data**: Linear interpolation was used for heart rate, SPO2, breathing rate, and temperature.
- **Categorical Data**: Nearest-neighbor sampling was used for `posture` to maintain valid labels.
- **Step Counts**: Interpolated steps were rounded to the nearest integer to ensure realistic data representation.

### Gap Filling & transparency

For metrics not provided by any group (e.g., GSR, Dehydration Index), the system generates realistic mock values. To maintain transparency:

- Every field in the consolidated CSV has a corresponding `_gen` boolean flag (e.g., `heart_rate_gen`).
- If `True`, the value for that specific timestamp is interpolated or generated.
- Physical data from the groups maps to `False`.

## 3. Output

The final result is stored in:
`public/data/consolidated_real.csv`

This file is the primary data source for the "Real Consolidated" mode in the Health Dashboard.
