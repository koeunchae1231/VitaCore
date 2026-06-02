export const VITAL_CHART_WINDOW = 100;

function seedSeries(count, createPoint) {
  return Array.from({ length: count }, (_, index) => createPoint(index));
}

function waveJitter(seed, scale = 1) {
  return Math.sin(seed * 0.73) * scale + Math.sin(seed * 0.17) * scale * 0.45;
}

export function generateHeartRatePoint(hr, tick) {
  const safeHr = Number(hr) || 75;
  const beatSpacing = Math.max(7, Math.round(36 - safeHr / 5));
  const phase = tick % beatSpacing;
  const baseline = safeHr + waveJitter(tick, 1.1);
  const ecg =
    phase === 0
      ? 44
      : phase === 1
        ? -22
        : phase === 2
          ? 11
          : phase === beatSpacing - 2
            ? 5
            : 0;

  return { t: tick, value: baseline + ecg };
}

export function generateSpo2Point(spo2, tick) {
  const safeSpo2 = Number(spo2) || 98;
  const instability = safeSpo2 < 90 ? 2.45 : safeSpo2 < 95 ? 1.5 : 0.75;
  const pulse = Math.pow(Math.max(0, Math.sin(tick * 0.22)), 1.8) * instability;
  return {
    t: tick,
    value: safeSpo2 + pulse - instability * 0.35 + waveJitter(tick, instability * 0.18),
  };
}

export function generateRespirationPoint(rr, tick) {
  const safeRr = Number(rr) || 16;
  const speed = Math.max(0.18, safeRr / 42);
  return {
    t: tick,
    value: safeRr + Math.sin(tick * speed) * 6.8,
  };
}

export function generateBloodPressurePoint(sbp, dbp, tick) {
  const safeSbp = Number(sbp) || 118;
  const safeDbp = Number(dbp) || 76;
  const pressurePulse = Math.pow(Math.max(0, Math.sin(tick * 0.26)), 2.5);

  return {
    t: tick,
    sbp: safeSbp + pressurePulse * 12 + waveJitter(tick, 1.8),
    dbp: safeDbp + pressurePulse * 6 + waveJitter(tick + 9, 1.1),
  };
}

export function generateVitalChartPoint(vitals, tick) {
  return {
    hr: generateHeartRatePoint(vitals.HR, tick),
    spo2: generateSpo2Point(vitals.SPO2, tick),
    rr: generateRespirationPoint(vitals.RR, tick),
    bp: generateBloodPressurePoint(vitals.SBP, vitals.DBP, tick),
  };
}

export function generateInitialVitalSeries(vitals, count = VITAL_CHART_WINDOW) {
  return {
    hr: seedSeries(count, (index) => generateHeartRatePoint(vitals.HR, index)),
    spo2: seedSeries(count, (index) => generateSpo2Point(vitals.SPO2, index)),
    rr: seedSeries(count, (index) => generateRespirationPoint(vitals.RR, index)),
    bp: seedSeries(count, (index) =>
      generateBloodPressurePoint(vitals.SBP, vitals.DBP, index)
    ),
  };
}

export function appendVitalSeriesPoint(series, vitals, tick) {
  const point = generateVitalChartPoint(vitals, tick);
  return {
    hr: [...series.hr, point.hr].slice(-VITAL_CHART_WINDOW),
    spo2: [...series.spo2, point.spo2].slice(-VITAL_CHART_WINDOW),
    rr: [...series.rr, point.rr].slice(-VITAL_CHART_WINDOW),
    bp: [...series.bp, point.bp].slice(-VITAL_CHART_WINDOW),
  };
}
