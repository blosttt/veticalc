import React, { useState, useMemo, useEffect } from 'react';
import {
  Syringe, Dog, Cat, Bird, AlertTriangle, Pill, Moon, Sun,
  Droplets, History, ArrowLeftRight, Calculator, Trash2,
  Heart, Activity, Thermometer, Wind, CheckCircle, AlertCircle,
  Clock, Scale, FlaskConical, Info, BookOpen,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — SPECIES
═══════════════════════════════════════════════════════════════ */
const SPECIES = {
  canine: {
    name: 'Canino', Icon: Dog,
    constants: {
      fc: '60–140 bpm', fr: '10–30 rpm', temp: '37.5–39.2°C',
      pa: '110–160 mmHg', spo2: '>95%', glucemia: '4.0–6.0 mmol/L',
    },
    maintenanceRate: 2.5,
  },
  feline: {
    name: 'Felino', Icon: Cat,
    constants: {
      fc: '140–220 bpm', fr: '20–30 rpm', temp: '38.0–39.5°C',
      pa: '120–170 mmHg', spo2: '>95%', glucemia: '4.0–8.0 mmol/L',
    },
    maintenanceRate: 2,
  },
  exotic: {
    name: 'Exótico', Icon: Bird,
    constants: {
      fc: 'Variable', fr: 'Variable', temp: 'Variable',
      pa: 'Consultar', spo2: '>90%', glucemia: 'Variable',
    },
    maintenanceRate: 3,
  },
};

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — DRUG DATABASE
═══════════════════════════════════════════════════════════════ */
const DRUGS = {
  'AINEs / Analgésicos': [
    { name: 'Meloxicam',   doses: { canine: 0.2,  feline: 0.1,  exotic: 0.2  }, route: 'SC/VO',    concs: [1.5, 5],    note: 'AINE preferido en felinos. Dosis inicial SC, luego VO.' },
    { name: 'Carprofeno',  doses: { canine: 4.4,  feline: 4.0,  exotic: 2.0  }, route: 'VO/SC',    concs: [50],        note: 'No usar >5 días sin evaluación hepática.' },
    { name: 'Ketoprofeno', doses: { canine: 2.0,  feline: 2.0,  exotic: 2.0  }, route: 'IM/SC/VO', concs: [10],        note: 'Máx. 5 días. Riesgo GI en uso prolongado.' },
    { name: 'Tramadol',    doses: { canine: 3.0,  feline: 2.0,  exotic: 5.0  }, route: 'VO/SC',    concs: [50],        note: 'Opioide sintético. Vigilar sedación excesiva.' },
    { name: 'Metamizol',   doses: { canine: 25.0, feline: 15.0, exotic: 20.0 }, route: 'IV/IM/VO', concs: [500],       note: 'Administrar IV lento. Buena acción espasmolítica.' },
  ],
  'Antibióticos': [
    { name: 'Amoxicilina+Clav', doses: { canine: 12.5, feline: 12.5, exotic: 15.0 }, route: 'VO',    concs: [40, 125],  note: 'Amplio espectro. Administrar con alimento.' },
    { name: 'Enrofloxacino',    doses: { canine: 5.0,  feline: 5.0,  exotic: 10.0 }, route: 'VO/IM', concs: [25, 50],   note: 'Evitar en animales en crecimiento.' },
    { name: 'Cefalexina',       doses: { canine: 22.0, feline: 22.0, exotic: 20.0 }, route: 'VO',    concs: [250, 500], note: 'Cefalosporina 1ª gen. Buena tolerancia GI.' },
    { name: 'Metronidazol',     doses: { canine: 15.0, feline: 10.0, exotic: 20.0 }, route: 'VO/IV', concs: [5],        note: 'Anaerobios y protozoarios. Evitar uso prolongado (riesgo neurológico).' },
    { name: 'Doxiciclina',      doses: { canine: 5.0,  feline: 5.0,  exotic: 25.0 }, route: 'VO',    concs: [10, 20],   note: 'Administrar con agua abundante. Fotosensibilizante.' },
  ],
  'Anestesia / Sedación': [
    { name: 'Propofol',         doses: { canine: 6.0,   feline: 6.0,  exotic: 10.0 }, route: 'IV',    concs: [10],     note: 'Inducción lenta (2 mg/kg/30s). Tener ventilación lista.' },
    { name: 'Ketamina',         doses: { canine: 5.0,   feline: 5.0,  exotic: 20.0 }, route: 'IM/IV', concs: [50, 100], note: 'Siempre combinar con una benzodiacepina. No usar solo.' },
    { name: 'Dexmedetomidina',  doses: { canine: 0.005, feline: 0.04, exotic: 0.01 }, route: 'IM/IV', concs: [0.5],    note: 'α2-agonista potente. Revertir con atipamezol (5× la dosis en mg).' },
    { name: 'Midazolam',        doses: { canine: 0.2,   feline: 0.2,  exotic: 0.5  }, route: 'IV/IM', concs: [5],      note: 'Excelente premedicación. Revertible con flumazenil.' },
    { name: 'Xilacina',         doses: { canine: 1.0,   feline: 1.0,  exotic: 2.0  }, route: 'IM/IV', concs: [20, 100], note: 'α2-agonista. Monitorear bradicardia y bradipnea.' },
  ],
  'Corticoides': [
    { name: 'Dexametasona',      doses: { canine: 0.25, feline: 0.25, exotic: 0.5 }, route: 'IM/IV/VO', concs: [2, 4],    note: 'No usar sin diagnóstico definido. Potente inmunosupresor.' },
    { name: 'Prednisolona',      doses: { canine: 1.0,  feline: 1.0,  exotic: 2.0  }, route: 'VO',       concs: [5, 20],   note: 'Retirada gradual tras >7 días de uso.' },
    { name: 'Metilprednisolona', doses: { canine: 0.5,  feline: 0.5,  exotic: 1.0  }, route: 'IV/IM',    concs: [40, 125], note: 'Para shock o inflamación aguda severa.' },
  ],
  'Antiparasitarios': [
    { name: 'Ivermectina',  doses: { canine: 0.2,  feline: 0.2,  exotic: 0.2  }, route: 'SC/VO', concs: [1, 10],  note: '⚠️ Contraindicado en Collie, Shetland y razas con mutación MDR1/ABCB1.' },
    { name: 'Prazicuantel', doses: { canine: 5.0,  feline: 5.0,  exotic: 5.0  }, route: 'VO/SC', concs: [56.8],  note: 'Cestodicida eficaz. Dosis única generalmente suficiente.' },
    { name: 'Fenbendazol',  doses: { canine: 50.0, feline: 50.0, exotic: 50.0 }, route: 'VO',    concs: [100],   note: 'Antinematodo. Administrar 3–5 días consecutivos.' },
  ],
  'Cardiovascular': [
    { name: 'Furosemida', doses: { canine: 2.0, feline: 1.0,  exotic: 1.0  }, route: 'VO/IV/IM', concs: [10, 50], note: 'Diurético de asa. Monitorear electrolitos (K⁺).' },
    { name: 'Enalapril',  doses: { canine: 0.5, feline: 0.5,  exotic: null  }, route: 'VO',       concs: [2.5, 5], note: 'IECA. Útil en ICC y proteinuria crónica. No usar en exóticos.' },
    { name: 'Atenolol',   doses: { canine: 0.5, feline: 6.25, exotic: null  }, route: 'VO',       concs: [25, 50], note: 'β-bloqueante. Gatos: dosis fija 6.25 mg/animal (ver nota).' },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — FLUIDS
═══════════════════════════════════════════════════════════════ */
const FLUIDS = [
  { id: 'ringer',     name: 'Ringer Lactato',   na: 130, osmol: 273, desc: 'Isotónica balanceada. Primera elección general.' },
  { id: 'nacl',       name: 'NaCl 0.9%',         na: 154, osmol: 308, desc: 'Suero fisiológico. Para alcalosis hipoclorémica.' },
  { id: 'dex5',       name: 'Dextrosa 5%',        na: 0,   osmol: 252, desc: 'Para hipoglucemia o como vehículo de fármacos.' },
  { id: 'plasmalyte', name: 'Plasma-Lyte 148',    na: 140, osmol: 294, desc: 'Balanceada con pH fisiológico. Ideal en pacientes críticos.' },
];

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — CONVERSIONS
═══════════════════════════════════════════════════════════════ */
const CONV_SECTIONS = [
  {
    id: 'weight', label: 'Peso', Icon: Scale,
    items: [
      { label: 'kg → lb',  fn: v => (v * 2.2046).toFixed(3),  unit: 'lb' },
      { label: 'lb → kg',  fn: v => (v / 2.2046).toFixed(3),  unit: 'kg' },
      { label: 'kg → g',   fn: v => (v * 1000).toFixed(0),    unit: 'g'  },
      { label: 'g → kg',   fn: v => (v / 1000).toFixed(4),    unit: 'kg' },
    ],
  },
  {
    id: 'drug', label: 'Fármaco', Icon: Pill,
    items: [
      { label: 'mg → mcg', fn: v => (v * 1000).toFixed(0),   unit: 'mcg' },
      { label: 'mcg → mg', fn: v => (v / 1000).toFixed(4),   unit: 'mg'  },
      { label: 'mg → g',   fn: v => (v / 1000).toFixed(6),   unit: 'g'   },
      { label: 'g → mg',   fn: v => (v * 1000).toFixed(0),   unit: 'mg'  },
    ],
  },
  {
    id: 'volume', label: 'Volumen', Icon: Droplets,
    items: [
      { label: 'ml → L',           fn: v => (v / 1000).toFixed(4), unit: 'L'   },
      { label: 'L → ml',           fn: v => (v * 1000).toFixed(0), unit: 'ml'  },
      { label: 'ml → gtt (macro)', fn: v => (v * 20).toFixed(0),   unit: 'gtt' },
      { label: 'ml → gtt (micro)', fn: v => (v * 60).toFixed(0),   unit: 'gtt' },
    ],
  },
  {
    id: 'temp', label: 'Temperatura', Icon: Thermometer,
    items: [
      { label: '°C → °F', fn: v => ((v * 9 / 5) + 32).toFixed(1),     unit: '°F' },
      { label: '°F → °C', fn: v => ((v - 32) * 5 / 9).toFixed(1),     unit: '°C' },
      { label: '°C → K',  fn: v => (Number(v) + 273.15).toFixed(2),   unit: 'K'  },
    ],
  },
  {
    id: 'conc', label: 'Concentración', Icon: FlaskConical,
    items: [
      { label: 'mg/ml → %',  fn: v => (v / 10).toFixed(4),  unit: '%'     },
      { label: '% → mg/ml',  fn: v => (v * 10).toFixed(2),  unit: 'mg/ml' },
      { label: 'mg/ml → g/L',fn: v => (v * 1).toFixed(2),   unit: 'g/L'  },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPER — VOLUME STATUS
═══════════════════════════════════════════════════════════════ */
function getVolStatus(vol) {
  const v = parseFloat(vol);
  if (!v || v <= 0)
    return { pct: 0, barCls: 'bg-slate-200 dark:bg-slate-700', txtCls: 'text-slate-400', Icon: null,          label: '' };
  if (v <= 10)
    return { pct: (v / 30) * 100,  barCls: 'bg-emerald-500', txtCls: 'text-emerald-600 dark:text-emerald-400', Icon: CheckCircle,  label: 'Volumen seguro'         };
  if (v <= 20)
    return { pct: (v / 30) * 100,  barCls: 'bg-amber-400',   txtCls: 'text-amber-600 dark:text-amber-400',     Icon: AlertCircle,  label: 'Revisar indicaciones'   };
  if (v <= 30)
    return { pct: 90,               barCls: 'bg-orange-500',  txtCls: 'text-orange-600 dark:text-orange-400',   Icon: AlertTriangle, label: 'Volumen elevado'       };
  return   { pct: 100,              barCls: 'bg-red-500',     txtCls: 'text-red-600 dark:text-red-400',         Icon: AlertTriangle, label: 'Verificar urgente'     };
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT — CONVERSION TAB (own state)
═══════════════════════════════════════════════════════════════ */
function ConversionTab() {
  const [value, setValue] = useState('');
  const [section, setSection] = useState('weight');
  const current = CONV_SECTIONS.find(s => s.id === section);
  const num = parseFloat(value);
  const hasNum = value !== '' && !isNaN(num);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Selector */}
      <div className="glass-card p-5">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
          Tipo de Conversión
        </p>
        <nav className="space-y-1.5">
          {CONV_SECTIONS.map(s => {
            const Icon = s.Icon;
            return (
              <button key={s.id} onClick={() => { setSection(s.id); setValue(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  section === s.id
                    ? 'bg-uct-blue text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 glass-card p-6">
        {current && (
          <>
            <div className="flex items-center gap-2 mb-5">
              <current.Icon className="w-4 h-4 text-uct-blue dark:text-uct-yellow" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Conversión — {current.label}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Valor a convertir
              </label>
              <input
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Ingresa un número…"
                className="input-field text-2xl font-bold"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {current.items.map(item => (
                <div key={item.label}
                  className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">{item.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">
                      {hasNum ? item.fn(num) : '—'}
                    </span>
                    {item.unit && (
                      <span className="text-sm font-bold text-uct-blue dark:text-uct-yellow">{item.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {

  /* ── Theme ─────────────────────────────────────────── */
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('veticalc-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('veticalc-theme', dark ? 'dark' : 'light');
  }, [dark]);

  /* ── Navigation ────────────────────────────────────── */
  const [tab, setTab] = useState('calc');

  /* ── Calculator state ──────────────────────────────── */
  const [species,  setSpecies]  = useState('canine');
  const [weight,   setWeight]   = useState('');
  const [dose,     setDose]     = useState('');
  const [conc,     setConc]     = useState('');
  const [drugCat,  setDrugCat]  = useState('');
  const [selDrug,  setSelDrug]  = useState(null);
  const [history,  setHistory]  = useState([]);

  /* ── Fluid state ───────────────────────────────────── */
  const [fw,       setFw]       = useState('');
  const [fluidId,  setFluidId]  = useState('ringer');
  const [dehyd,    setDehyd]    = useState('5');
  const [dur,      setDur]      = useState('24');
  const [setType,  setSetType]  = useState('macro');

  /* ── Update dose when drug or species changes ──────── */
  useEffect(() => {
    if (!selDrug) return;
    const val = selDrug.doses[species];
    setDose(val != null ? String(val) : '');
  }, [species, selDrug]);

  /* ── Dose volume calculation ───────────────────────── */
  const volume = useMemo(() => {
    const w = parseFloat(weight);
    const d = parseFloat(dose);
    const c = parseFloat(conc);
    if (w > 0 && d > 0 && c > 0) return ((w * d) / c).toFixed(2);
    return '0.00';
  }, [weight, dose, conc]);

  const volStatus = useMemo(() => getVolStatus(volume), [volume]);

  /* ── Fluid calculation ─────────────────────────────── */
  const fluidRes = useMemo(() => {
    const w = parseFloat(fw);
    const d = parseFloat(dehyd);
    const h = parseFloat(dur);
    if (!w || w <= 0 || !h || h <= 0) return null;
    const mainRate = SPECIES[species].maintenanceRate;
    const maintVol  = w * mainRate * h;
    const maintRate = w * mainRate;
    const replVol   = w * d * 10;
    const totalVol  = maintVol + replVol;
    const totalRate = totalVol / h;
    const gttsPerMl = setType === 'macro' ? 20 : 60;
    const gttsMin   = (totalRate * gttsPerMl) / 60;
    return {
      maintRate: maintRate.toFixed(1),
      maintVol:  maintVol.toFixed(0),
      replVol:   replVol.toFixed(0),
      totalVol:  totalVol.toFixed(0),
      totalRate: totalRate.toFixed(1),
      gttsMin:   gttsMin.toFixed(1),
    };
  }, [fw, dehyd, dur, species, setType]);

  /* ── Save to history ───────────────────────────────── */
  const saveHistory = () => {
    const vol = parseFloat(volume);
    if (vol <= 0 || !parseFloat(weight)) return;
    setHistory(prev => [{
      id:        Date.now(),
      time:      new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      species,
      drug:      selDrug?.name ?? 'Dosis manual',
      weight, dose, conc, volume,
    }, ...prev].slice(0, 10));
  };

  const clearCalc = () => {
    setWeight(''); setDose(''); setConc('');
    setSelDrug(null); setDrugCat('');
  };

  const TABS = [
    { id: 'calc',    label: 'Calculadora', Icon: Calculator   },
    { id: 'fluidos', label: 'Fluidos IV',  Icon: Droplets     },
    { id: 'conv',    label: 'Conversión',  Icon: ArrowLeftRight },
    { id: 'hist',    label: 'Historial',   Icon: History      },
  ];

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ════ HEADER ════════════════════════════════════ */}
      <header
        className="sticky top-0 z-30 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #002d5e 0%, #0075B4 55%, #008fd4 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-2">
          {/* Logo row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Syringe className="w-5 h-5 text-uct-yellow" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight leading-none">VetiCalc</h1>
                <p className="text-[10px] text-blue-200/60 font-medium mt-0.5">
                  UCTemuco · Medicina Veterinaria
                </p>
              </div>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              aria-label="Cambiar tema"
            >
              {dark
                ? <Sun  className="w-5 h-5 text-uct-yellow" />
                : <Moon className="w-5 h-5 text-white" />
              }
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-black/25 rounded-xl p-1">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  tab === id
                    ? 'bg-white text-uct-blue shadow-md'
                    : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ════ MAIN CONTENT ══════════════════════════════ */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ── TAB: CALCULADORA ── */}
        {tab === 'calc' && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fade-in">

            {/* ── Left column ── */}
            <div className="lg:col-span-5 space-y-5">

              {/* Species + constants */}
              <div className="glass-card p-5">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  Especie del Paciente
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Object.entries(SPECIES).map(([key, s]) => {
                    const Icon = s.Icon;
                    const active = species === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSpecies(key)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                          active
                            ? 'border-uct-blue bg-uct-blue/5 dark:bg-uct-blue/20 scale-105 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-uct-blue/40 bg-white dark:bg-slate-800/40'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${active ? 'text-uct-blue' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span className={`text-xs font-bold ${active ? 'text-uct-blue dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                          {s.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Physiological constants grid */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 grid grid-cols-3 gap-y-3">
                  {[
                    { k: 'fc',       l: 'FC',      Icon: Heart        },
                    { k: 'fr',       l: 'FR',      Icon: Wind         },
                    { k: 'temp',     l: 'T°',      Icon: Thermometer  },
                    { k: 'pa',       l: 'PA',      Icon: Activity     },
                    { k: 'spo2',     l: 'SpO₂',    Icon: CheckCircle  },
                    { k: 'glucemia', l: 'Glucemia', Icon: FlaskConical },
                  ].map(({ k, l, Icon }) => (
                    <div key={k} className="text-center">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wide mb-0.5">{l}</span>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                        {SPECIES[species].constants[k]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drug selector */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-3.5 h-3.5 text-uct-blue dark:text-uct-yellow" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Fármacos
                  </p>
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Object.keys(DRUGS).map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setDrugCat(drugCat === cat ? '' : cat); setSelDrug(null); }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        drugCat === cat
                          ? 'bg-uct-blue text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Drug list */}
                {drugCat ? (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                    {DRUGS[drugCat].map(drug => {
                      const isSel = selDrug?.name === drug.name;
                      const doseVal = drug.doses[species];
                      const avail = doseVal != null;
                      return (
                        <button
                          key={drug.name}
                          onClick={() => avail && setSelDrug(isSel ? null : drug)}
                          disabled={!avail}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            isSel
                              ? 'border-uct-yellow bg-amber-50 dark:bg-uct-yellow/10 shadow-sm'
                              : avail
                              ? 'border-slate-200 dark:border-slate-700 hover:border-uct-blue/40 bg-white dark:bg-slate-800/40'
                              : 'border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <span className={`block text-sm font-bold ${isSel ? 'text-amber-700 dark:text-uct-yellow' : 'text-slate-700 dark:text-slate-100'}`}>
                            {drug.name}
                          </span>
                          <span className="block text-xs text-slate-400 mt-0.5">
                            {avail ? `${doseVal} mg/kg · ${drug.route}` : 'No aplica a esta especie'}
                          </span>
                          {isSel && drug.note && (
                            <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-amber-200 dark:border-uct-yellow/20">
                              <Info className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{drug.note}</p>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-300 dark:text-slate-600">
                    <BookOpen className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">Selecciona una categoría</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="lg:col-span-7 space-y-5">

              {/* Inputs */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5 text-uct-blue dark:text-uct-yellow" />
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Cálculo de Dosis
                    </p>
                  </div>
                  {selDrug && (
                    <span className="text-xs font-bold text-uct-blue dark:text-uct-yellow bg-uct-blue/10 dark:bg-uct-yellow/10 px-2.5 py-1 rounded-lg border border-uct-blue/20 dark:border-uct-yellow/20">
                      {selDrug.name}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Peso del Paciente (kg)
                    </label>
                    <input
                      id="input-weight"
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="Ej. 15.5"
                      className="input-field text-lg font-semibold"
                    />
                  </div>

                  {/* Dose */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                      Dosis (mg/kg)
                    </label>
                    <input
                      id="input-dose"
                      type="number"
                      value={dose}
                      onChange={e => { setDose(e.target.value); setSelDrug(null); }}
                      placeholder="Ej. 5"
                      className="input-field text-lg font-semibold"
                    />
                  </div>

                  {/* Concentration */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Concentración (mg/ml)
                      </label>
                      {/* Quick concentration buttons */}
                      {selDrug?.concs?.length > 0 && (
                        <div className="flex gap-1">
                          {selDrug.concs.map(c => (
                            <button
                              key={c}
                              onClick={() => setConc(String(c))}
                              className={`text-xs px-2 py-0.5 rounded-md font-bold transition-all ${
                                conc === String(c)
                                  ? 'bg-uct-blue text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      id="input-conc"
                      type="number"
                      value={conc}
                      onChange={e => setConc(e.target.value)}
                      placeholder="Ej. 50"
                      className="input-field text-lg font-semibold"
                    />
                  </div>
                </div>

                {/* Formula reference */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-center">
                  <code className="text-xs text-slate-500 dark:text-slate-400">
                    V (ml) = [Peso (kg) × Dosis (mg/kg)] ÷ Concentración (mg/ml)
                  </code>
                </div>
              </div>

              {/* Result card */}
              <div className="glass-card overflow-hidden">
                {/* Result hero */}
                <div
                  className="relative p-6 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #002d5e, #0075B4, #00a0d4)' }}
                >
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-uct-yellow/10 rounded-full pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-blue-200/70 text-sm font-semibold mb-1">Volumen a Administrar</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-7xl font-black text-white tracking-tight tabular-nums">
                        {volume}
                      </span>
                      <span className="text-3xl font-bold text-uct-yellow">ml</span>
                    </div>
                    {weight && dose && conc && (
                      <p className="text-blue-200/50 text-xs mt-2 font-mono">
                        {weight} kg × {dose} mg/kg ÷ {conc} mg/ml
                      </p>
                    )}
                  </div>
                </div>

                {/* Volume gauge */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-400 font-medium">0 ml</span>
                    {volStatus.Icon && (
                      <span className={`flex items-center gap-1.5 font-bold ${volStatus.txtCls}`}>
                        <volStatus.Icon className="w-3.5 h-3.5" />
                        {volStatus.label}
                      </span>
                    )}
                    <span className="text-slate-400 font-medium">30+ ml</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${volStatus.barCls}`}
                      style={{ width: `${Math.min(volStatus.pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-5 flex gap-2">
                  <button
                    id="btn-save-history"
                    onClick={saveHistory}
                    disabled={parseFloat(volume) <= 0}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 bg-uct-blue/10 dark:bg-uct-blue/20 hover:bg-uct-blue/20 dark:hover:bg-uct-blue/30 text-uct-blue dark:text-blue-300 border-uct-blue/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <History className="w-4 h-4" />
                    Guardar en Historial
                  </button>
                  <button
                    id="btn-clear-calc"
                    onClick={clearCalc}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all"
                    title="Limpiar campos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* High volume warning */}
                {parseFloat(volume) > 30 && (
                  <div className="mx-6 mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-700 dark:text-red-300">Volumen inusualmente alto</p>
                      <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
                        Verifica el peso, la dosis y la concentración antes de administrar.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: FLUIDOS IV ── */}
        {tab === 'fluidos' && (
          <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">

            {/* Inputs */}
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-uct-blue dark:text-uct-yellow" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Parámetros de Infusión
                </p>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                  Peso del Paciente (kg)
                </label>
                <input
                  id="fluid-weight"
                  type="number"
                  value={fw}
                  onChange={e => setFw(e.target.value)}
                  placeholder="Ej. 10.0"
                  className="input-field text-lg font-semibold"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Especie:{' '}
                  <span className="font-semibold text-uct-blue dark:text-uct-yellow">{SPECIES[species].name}</span>
                  <span className="mx-1">·</span>
                  Mantenimiento:{' '}
                  <span className="font-semibold">{SPECIES[species].maintenanceRate} ml/kg/h</span>
                </p>
              </div>

              {/* Fluid type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Tipo de Fluido
                </label>
                <div className="space-y-2">
                  {FLUIDS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFluidId(f.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        fluidId === f.id
                          ? 'border-uct-blue bg-uct-blue/5 dark:bg-uct-blue/15 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-uct-blue/30 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-bold ${fluidId === f.id ? 'text-uct-blue dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                          {f.name}
                        </span>
                        <span className="text-xs text-slate-400">Na⁺ {f.na} · {f.osmol} mOsm/L</span>
                      </div>
                      {fluidId === f.id && (
                        <p className="text-xs text-uct-blue/70 dark:text-blue-300/80 mt-1">{f.desc}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dehydration + duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    Deshidratación (%)
                  </label>
                  <div className="flex gap-1">
                    {['0','5','7','10','12'].map(v => (
                      <button
                        key={v}
                        onClick={() => setDehyd(v)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          dehyd === v
                            ? 'bg-uct-blue text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                    Duración (h)
                  </label>
                  <input
                    id="fluid-duration"
                    type="number"
                    value={dur}
                    onChange={e => setDur(e.target.value)}
                    placeholder="24"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Set type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                  Equipo de Venoclisis
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'macro', label: 'Macrogotero', sub: '20 gtt/ml' },
                    { id: 'micro', label: 'Microgotero', sub: '60 gtt/ml' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSetType(s.id)}
                      className={`flex-1 py-3 px-3 rounded-xl border transition-all text-left ${
                        setType === s.id
                          ? 'border-uct-blue bg-uct-blue/5 dark:bg-uct-blue/15'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-uct-blue/30'
                      }`}
                    >
                      <span className={`block text-xs font-bold ${setType === s.id ? 'text-uct-blue dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                        {s.label}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5">{s.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {fluidRes ? (
                <>
                  <div className="glass-card p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3.5 h-3.5 text-uct-blue dark:text-uct-yellow" />
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Resultados
                      </p>
                    </div>

                    {[
                      { label: 'Tasa de Mantenimiento',  value: `${fluidRes.maintRate} ml/h`, sub: `${fluidRes.maintVol} ml en ${dur}h`,            hi: false },
                      { label: 'Volumen de Reposición',  value: `${fluidRes.replVol} ml`,     sub: `Déficit ${dehyd}%`,                             hi: false },
                      { label: 'Volumen Total',           value: `${fluidRes.totalVol} ml`,   sub: 'Mantenimiento + Reposición',                    hi: true  },
                      { label: 'Tasa Total de Infusión', value: `${fluidRes.totalRate} ml/h`, sub: 'Velocidad de bomba IV',                          hi: false },
                      { label: 'Velocidad de Goteo',     value: `${fluidRes.gttsMin} gtt/min`,sub: setType === 'macro' ? 'Macrogotero (20 gtt/ml)' : 'Microgotero (60 gtt/ml)', hi: false },
                    ].map(({ label, value, sub, hi }) => (
                      <div
                        key={label}
                        className={`p-4 rounded-xl ${hi ? '' : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700'}`}
                        style={hi ? { background: 'linear-gradient(135deg, #002d5e, #0075B4)' } : {}}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className={`text-xs font-semibold ${hi ? 'text-blue-200/80' : 'text-slate-500 dark:text-slate-400'}`}>{label}</p>
                            <p className={`text-xs mt-0.5 ${hi ? 'text-blue-200/60' : 'text-slate-400'}`}>{sub}</p>
                          </div>
                          <span className={`text-xl font-black shrink-0 ${hi ? 'text-uct-yellow' : 'text-slate-800 dark:text-white'}`}>
                            {value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Formula note */}
                  <div className="glass-card p-4">
                    <div className="flex gap-2.5 items-start">
                      <Info className="w-4 h-4 text-uct-blue dark:text-uct-yellow shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                        <p><span className="font-bold">Reposición:</span> Peso (kg) × Déficit (%) × 10</p>
                        <p><span className="font-bold">Mantenimiento:</span> Peso × {SPECIES[species].maintenanceRate} ml/kg/h</p>
                        <p className="text-slate-400">Monitorear signos de sobrecarga hídrica (edema, taquipnea).</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass-card p-16 text-center">
                  <Droplets className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-400 text-sm font-medium">Ingresa el peso del paciente</p>
                  <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">para calcular los fluidos IV</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: CONVERSIÓN ── */}
        {tab === 'conv' && (
          <div className="animate-fade-in">
            <ConversionTab />
          </div>
        )}

        {/* ── TAB: HISTORIAL ── */}
        {tab === 'hist' && (
          <div className="animate-fade-in">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-uct-blue dark:text-uct-yellow" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Historial de Cálculos
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar todo
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-16 text-center">
                  <History className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-400 font-medium text-sm">Sin cálculos registrados</p>
                  <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">
                    Usa la calculadora y presiona "Guardar en Historial"
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => {
                    const sp = SPECIES[h.species];
                    const Icon = sp.Icon;
                    return (
                      <div
                        key={h.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-slide-up"
                      >
                        <div className="w-10 h-10 rounded-xl bg-uct-blue/10 dark:bg-uct-blue/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-uct-blue dark:text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{h.drug}</span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{sp.name}</span>
                          </div>
                          <div className="flex gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                            <span>{h.weight} kg</span>
                            <span>·</span>
                            <span>{h.dose} mg/kg</span>
                            <span>·</span>
                            <span>{h.conc} mg/ml</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-baseline gap-0.5 justify-end">
                            <span className="text-xl font-black text-uct-blue dark:text-uct-yellow">{h.volume}</span>
                            <span className="text-xs font-bold text-slate-400 ml-0.5">ml</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-0.5 justify-end">
                            <Clock className="w-3 h-3" />{h.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ════ FOOTER ════════════════════════════════════ */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800/80 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Syringe className="w-4 h-4 text-uct-blue dark:text-uct-yellow" />
            <span className="font-black text-slate-700 dark:text-slate-200">VetiCalc</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">v2.0</span>
          </div>
          <p className="text-xs text-slate-400">
            Universidad Católica de Temuco · Escuela de Medicina Veterinaria
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
            Herramienta educativa de apoyo. Siempre verificar con fuentes clínicas oficiales.
          </p>
        </div>
      </footer>
    </div>
  );
}
