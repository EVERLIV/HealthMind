-- Insert common biomarkers
INSERT INTO biomarkers (name, description, normal_range, category, importance, recommendations) VALUES
-- Blood Chemistry
('Glucose', 'Blood sugar level', '{"min": 70, "max": 100, "unit": "mg/dL"}', 'blood', 'high', '["Maintain balanced diet", "Regular exercise", "Monitor regularly if diabetic"]'),
('Hemoglobin A1c', 'Average blood sugar over 2-3 months', '{"min": 4.0, "max": 5.6, "unit": "%"}', 'blood', 'high', '["Control blood sugar", "Regular monitoring", "Lifestyle modifications"]'),
('Total Cholesterol', 'Total cholesterol in blood', '{"min": 0, "max": 200, "unit": "mg/dL"}', 'cardiovascular', 'high', '["Heart-healthy diet", "Regular exercise", "Limit saturated fats"]'),
('HDL Cholesterol', 'Good cholesterol', '{"min": 40, "max": 100, "unit": "mg/dL"}', 'cardiovascular', 'high', '["Regular exercise", "Healthy fats", "Moderate alcohol consumption"]'),
('LDL Cholesterol', 'Bad cholesterol', '{"min": 0, "max": 100, "unit": "mg/dL"}', 'cardiovascular', 'high', '["Low-fat diet", "Statins if needed", "Regular monitoring"]'),
('Triglycerides', 'Fat in blood', '{"min": 0, "max": 150, "unit": "mg/dL"}', 'cardiovascular', 'high', '["Limit sugar and carbs", "Regular exercise", "Weight management"]'),

-- Complete Blood Count
('White Blood Cell Count', 'Immune system cells', '{"min": 4500, "max": 11000, "unit": "cells/μL"}', 'blood', 'medium', '["Good hygiene", "Adequate sleep", "Stress management"]'),
('Red Blood Cell Count', 'Oxygen-carrying cells', '{"min": 4.5, "max": 5.9, "unit": "million cells/μL"}', 'blood', 'high', '["Iron-rich foods", "Vitamin B12", "Folate supplementation if needed"]'),
('Hemoglobin', 'Oxygen-carrying protein', '{"min": 12.0, "max": 15.5, "unit": "g/dL"}', 'blood', 'high', '["Iron supplementation", "Vitamin C for absorption", "Regular monitoring"]'),
('Hematocrit', 'Percentage of blood that is red blood cells', '{"min": 36, "max": 46, "unit": "%"}', 'blood', 'medium', '["Stay hydrated", "Iron-rich diet", "Monitor for anemia"]'),
('Platelet Count', 'Blood clotting cells', '{"min": 150000, "max": 450000, "unit": "platelets/μL"}', 'blood', 'medium', '["Avoid aspirin if low", "Monitor bleeding", "Regular checkups"]'),

-- Kidney Function
('Creatinine', 'Kidney function marker', '{"min": 0.6, "max": 1.2, "unit": "mg/dL"}', 'kidney', 'high', '["Stay hydrated", "Limit protein if high", "Regular monitoring"]'),
('BUN (Blood Urea Nitrogen)', 'Kidney function marker', '{"min": 7, "max": 20, "unit": "mg/dL"}', 'kidney', 'medium', '["Adequate hydration", "Balanced protein intake", "Monitor kidney function"]'),
('eGFR', 'Estimated kidney function', '{"min": 90, "max": 120, "unit": "mL/min/1.73m²"}', 'kidney', 'high', '["Control blood pressure", "Manage diabetes", "Avoid nephrotoxic drugs"]'),

-- Liver Function
('ALT (Alanine Aminotransferase)', 'Liver enzyme', '{"min": 7, "max": 56, "unit": "U/L"}', 'liver', 'high', '["Limit alcohol", "Healthy diet", "Regular exercise"]'),
('AST (Aspartate Aminotransferase)', 'Liver enzyme', '{"min": 10, "max": 40, "unit": "U/L"}', 'liver', 'high', '["Avoid alcohol", "Medication review", "Liver-friendly diet"]'),
('Bilirubin Total', 'Liver function marker', '{"min": 0.3, "max": 1.2, "unit": "mg/dL"}', 'liver', 'medium', '["Stay hydrated", "Avoid alcohol", "Monitor liver function"]'),
('Alkaline Phosphatase', 'Liver and bone enzyme', '{"min": 44, "max": 147, "unit": "U/L"}', 'liver', 'medium', '["Calcium and vitamin D", "Regular exercise", "Monitor bone health"]'),

-- Thyroid Function
('TSH (Thyroid Stimulating Hormone)', 'Thyroid function', '{"min": 0.4, "max": 4.0, "unit": "mIU/L"}', 'thyroid', 'high', '["Regular monitoring", "Medication compliance", "Stress management"]'),
('Free T4', 'Active thyroid hormone', '{"min": 0.8, "max": 1.8, "unit": "ng/dL"}', 'thyroid', 'high', '["Medication compliance", "Regular monitoring", "Balanced diet"]'),
('Free T3', 'Active thyroid hormone', '{"min": 2.3, "max": 4.2, "unit": "pg/mL"}', 'thyroid', 'medium', '["Medication compliance", "Regular monitoring", "Stress management"]'),

-- Inflammatory Markers
('C-Reactive Protein (CRP)', 'Inflammation marker', '{"min": 0, "max": 3.0, "unit": "mg/L"}', 'inflammatory', 'high', '["Anti-inflammatory diet", "Regular exercise", "Stress management"]'),
('ESR (Erythrocyte Sedimentation Rate)', 'Inflammation marker', '{"min": 0, "max": 20, "unit": "mm/hr"}', 'inflammatory', 'medium', '["Anti-inflammatory diet", "Regular exercise", "Monitor for infections"]'),

-- Vitamins and Minerals
('Vitamin D (25-OH)', 'Vitamin D status', '{"min": 30, "max": 100, "unit": "ng/mL"}', 'vitamin', 'high', '["Sun exposure", "Vitamin D supplements", "Fatty fish consumption"]'),
('Vitamin B12', 'B12 vitamin level', '{"min": 200, "max": 900, "unit": "pg/mL"}', 'vitamin', 'high', '["Animal products", "B12 supplements", "Regular monitoring"]'),
('Folate', 'Folic acid level', '{"min": 3, "max": 20, "unit": "ng/mL"}', 'vitamin', 'medium', '["Leafy greens", "Folate supplements", "Balanced diet"]'),
('Iron', 'Iron level', '{"min": 60, "max": 170, "unit": "μg/dL"}', 'mineral', 'high', '["Iron-rich foods", "Vitamin C for absorption", "Avoid coffee with meals"]'),
('Ferritin', 'Iron storage', '{"min": 15, "max": 200, "unit": "ng/mL"}', 'mineral', 'high', '["Iron supplementation if low", "Regular monitoring", "Balanced diet"]'),

-- Electrolytes
('Sodium', 'Blood sodium level', '{"min": 136, "max": 145, "unit": "mEq/L"}', 'electrolyte', 'high', '["Adequate hydration", "Balanced diet", "Monitor fluid intake"]'),
('Potassium', 'Blood potassium level', '{"min": 3.5, "max": 5.0, "unit": "mEq/L"}', 'electrolyte', 'high', '["Bananas and oranges", "Balanced diet", "Monitor kidney function"]'),
('Chloride', 'Blood chloride level', '{"min": 98, "max": 107, "unit": "mEq/L"}', 'electrolyte', 'medium', '["Balanced diet", "Adequate hydration", "Monitor kidney function"]'),
('CO2 (Bicarbonate)', 'Blood bicarbonate level', '{"min": 22, "max": 28, "unit": "mEq/L"}', 'electrolyte', 'medium', '["Balanced diet", "Monitor kidney function", "Adequate hydration"]'),

-- Cardiac Markers
('Troponin I', 'Heart muscle damage marker', '{"min": 0, "max": 0.04, "unit": "ng/mL"}', 'cardiac', 'high', '["Immediate medical attention if elevated", "Regular cardiac monitoring", "Heart-healthy lifestyle"]'),
('BNP (Brain Natriuretic Peptide)', 'Heart failure marker', '{"min": 0, "max": 100, "unit": "pg/mL"}', 'cardiac', 'high', '["Heart failure management", "Regular monitoring", "Medication compliance"]'),

-- Metabolic Markers
('Insulin', 'Blood insulin level', '{"min": 2, "max": 25, "unit": "μU/mL"}', 'metabolic', 'high', '["Low-carb diet", "Regular exercise", "Weight management"]'),
('C-Peptide', 'Insulin production marker', '{"min": 0.8, "max": 3.1, "unit": "ng/mL"}', 'metabolic', 'medium', '["Monitor diabetes", "Regular exercise", "Balanced diet"]'),
('HbA1c', 'Average blood sugar over 2-3 months', '{"min": 4.0, "max": 5.6, "unit": "%"}', 'metabolic', 'high', '["Blood sugar control", "Regular monitoring", "Lifestyle modifications"]');
