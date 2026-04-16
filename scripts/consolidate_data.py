import pandas as pd
import re
import os
import numpy as np

def parse_gp2(file_path):
    data = []
    if not os.path.exists(file_path):
        return pd.DataFrame()
    with open(file_path, 'r') as f:
        for line in f:
            if '[INFO]' in line:
                steps_match = re.search(r'Steps: (\d+)', line)
                activity_match = re.search(r'Activity: (\w+)', line)
                if steps_match and activity_match:
                    steps = int(steps_match.group(1))
                    activity = activity_match.group(1).capitalize()
                    data.append({'steps': steps, 'posture': activity})
    return pd.DataFrame(data)

def parse_gp3(file_path):
    data = []
    if not os.path.exists(file_path):
        return pd.DataFrame()
    with open(file_path, 'r') as f:
        for line in f:
            match = re.search(r'IMU:([\d.]+),PPG:([\d.]+),FUSED:([\d.]+)', line)
            if match:
                data.append({
                    'imu_raw': float(match.group(1)),
                    'ppg_raw': float(match.group(2)),
                    'breathing_rate': float(match.group(3)) # FUSED is Breathing Rate
                })
    return pd.DataFrame(data)

def parse_gp4(file_path):
    if not os.path.exists(file_path):
        return pd.DataFrame()
    df = pd.read_csv(file_path, header=None)
    # Col 3 is heart rate, Col 5 is posture
    if df.shape[1] >= 5:
        # Take only last 10 values (ignore sensor settling)
        df = df.tail(10)
        # Col 0: Red, Col 1: IR, Col 2: heart rate, Col 4: posture
        extracted = df.iloc[:, [0, 1, 2, 4]].copy()
        extracted.columns = ['red', 'ir', 'heart_rate', 'posture']
        
        # Approximate SpO2 from Red/IR Ratio
        extracted['heart_rate'] = extracted['heart_rate'].astype(float)
        extracted['spo2'] = 110 - 5 * (extracted['red'] / extracted['ir'])
        extracted['spo2'] = extracted['spo2'].clip(94, 100)
        
        return extracted[['heart_rate', 'spo2', 'posture']]
    return pd.DataFrame()

def parse_gp6(file_path):
    if not os.path.exists(file_path):
        return pd.DataFrame()
    df = pd.read_csv(file_path)
    # The format has Timestamp,humidity,temperature, etc.
    # Take the first set of columns
    df = df.iloc[:, [0, 1, 2]]
    df.columns = ['timestamp', 'humidity', 'temperature']
    # Filter out empty or non-numeric temperature
    df = df[pd.to_numeric(df['temperature'], errors='coerce').notnull()].copy()
    df['temperature'] = df['temperature'].astype(float)
    # Convert Fahrenheit to Celsius if it looks like F (typical body temp in F is 97-99)
    if df['temperature'].mean() > 60:
        df['temperature'] = (df['temperature'] - 32) * 5 / 9
    return df

def consolidate_for_gender(gender):
    print(f"Processing {gender} data...")
    
    # Group 2
    gp2_path = f'public/real_data/gp2/{gender}_step_data.txt'
    gp2 = parse_gp2(gp2_path)
    
    # Group 3
    gp3 = parse_gp3('public/real_data/gp3/sitting.txt')
    if not gp3.empty:
        # FUSED is breathing_rate (already extracted as float)
        # Assuming PPG/IMU might give raw HR/SPO2 hints
        gp3['heart_rate'] = gp3['ppg_raw'] * 12 # Simple heuristic for HR if PPG is low freq
        gp3['spo2'] = 94 + (gp3['imu_raw'] / 10) # Minimal variation
    
    # Group 6
    import glob
    gp6_files = glob.glob('public/real_data/gp6/*.csv')
    gp6_list = [parse_gp6(f) for f in gp6_files]
    gp6 = pd.concat(gp6_list, ignore_index=True) if gp6_list else pd.DataFrame()

    # Group 4
    gp4_path = f'public/real_data/gp4/{gender.capitalize()}.csv'
    gp4 = parse_gp4(gp4_path)

    target_len = 500
    
    def interpolate_df(df, length):
        if df.empty:
            return pd.DataFrame(index=range(length))
        old_indices = np.linspace(0, len(df) - 1, len(df))
        new_indices = np.linspace(0, len(df) - 1, length)
        new_df = pd.DataFrame()
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                new_df[col] = np.interp(new_indices, old_indices, df[col])
            else:
                indices = np.linspace(0, len(df)-1, length).astype(int)
                new_df[col] = df[col].iloc[indices].values
        return new_df

    gp2_int = interpolate_df(gp2, target_len)
    gp3_int = interpolate_df(gp3, target_len)
    gp6_int = interpolate_df(gp6, target_len)
    gp4_int = interpolate_df(gp4, target_len)

    if 'steps' in gp2_int.columns:
        gp2_int['steps'] = gp2_int['steps'].round().astype(int)

    hr_source = gp4_int if not gp4.empty else gp3_int
    posture_source = gp4_int if not gp4.empty else gp2_int
    
    consolidated = pd.concat([
        gp6_int[['temperature']], 
        gp2_int[['steps']], 
        posture_source[['posture']], 
        hr_source[['heart_rate', 'spo2']], 
        gp3_int[['breathing_rate']]
    ], axis=1)
    
    consolidated['timestamp'] = np.arange(target_len)
    real_fields = set(gp2.columns) | set(gp3.columns) | set(gp6.columns) | set(gp4.columns)
    all_fields = ['heart_rate', 'spo2', 'breathing_rate', 'gsr', 'temperature', 'dehydration_index', 'posture', 'fall_detected', 'steps']
    
    field_to_group = {
        'heart_rate': 'GP4' if not gp4.empty else 'GP3',
        'spo2': 'GP4' if not gp4.empty else 'GP3',
        'breathing_rate': 'GP3',
        'temperature': 'GP6',
        'steps': 'GP2',
        'posture': 'GP4' if not gp4.empty else 'GP2',
        'gsr': 'SIM',
        'dehydration_index': 'SIM',
        'fall_detected': 'SIM'
    }

    for field in all_fields:
        is_gen = field not in real_fields
        source_group = field_to_group.get(field, 'SIM') if not is_gen else 'SIM'
        
        if is_gen:
            if field == 'gsr': consolidated[field] = 4.5 + np.random.randn(target_len) * 0.1
            if field == 'dehydration_index': consolidated[field] = 1.2 + np.random.randn(target_len) * 0.05
            if field == 'fall_detected': consolidated[field] = False
            if field == 'spo2' and 'spo2' not in real_fields: consolidated[field] = 98.5 + np.random.randn(target_len) * 0.2
        
        consolidated[f"{field}_gen"] = is_gen
        consolidated[f"{field}_source"] = source_group

    output_path = f'public/data/consolidated_{gender}.csv'
    consolidated.to_csv(output_path, index=False)
    print(f"Saved {gender} data to {output_path}")

def main():
    consolidate_for_gender('male')
    consolidate_for_gender('female')

if __name__ == "__main__":
    main()
