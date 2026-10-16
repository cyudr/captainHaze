import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Phone,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Clock,
  Shield,
  Activity,
  UserCheck,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  SYMPTOM_TRIAGE_DATA,
  AGE_GROUP_GUIDELINES,
  HEALTHCARE_FACILITIES,
} from '../data/hazeData';
import { useLanguage } from '../context/LanguageContext';
import { ClinicOrHospital } from '../types/haze';

export const SymptomAndHelpCenter: React.FC = () => {
  const { t } = useLanguage();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedCohortIndex, setSelectedCohortIndex] = useState<number>(0);
  const [facilityFilter, setFacilityFilter] = useState<string>('All');
  const [activeFacilityModal, setActiveFacilityModal] = useState<ClinicOrHospital | null>(null);
  const [activeCohortModal, setActiveCohortModal] = useState<typeof AGE_GROUP_GUIDELINES[0] | null>(null);

  const symptomChecklist = [
    { id: 'itchy-eyes', label: 'Itchy, stinging or watery eyes', zone: 'Eyes / Face', severity: 'mild' },
    { id: 'throat-tickle', label: 'Scratchy dry throat & tickle cough', zone: 'Throat', severity: 'mild' },
    { id: 'runny-nose', label: 'Clear runny nose or sneezing', zone: 'Nasal', severity: 'mild' },
    { id: 'mild-headache', label: 'Slight headache after walking in haze', zone: 'Head', severity: 'mild' },
    { id: 'persistent-cough', label: 'Persistent dry coughing bouts', zone: 'Throat', severity: 'moderate' },
    { id: 'wheezing', label: 'Audible wheezing or whistling breath', zone: 'Chest', severity: 'moderate' },
    { id: 'chest-tightness', label: 'Chest tightness when walking', zone: 'Chest', severity: 'moderate' },
    { id: 'skin-rash', label: 'Skin irritation or eczema flare-up', zone: 'Skin', severity: 'moderate' },
    { id: 'acute-breathlessness', label: 'Severe shortness of breath at rest', zone: 'Emergency', severity: 'severe' },
    { id: 'cannot-speak', label: 'Unable to speak in full sentences', zone: 'Emergency', severity: 'severe' },
    { id: 'chest-pain', label: 'Crushing chest pressure or pain', zone: 'Emergency', severity: 'severe' },
    { id: 'blue-lips', label: 'Bluish or pale lips / fingernails', zone: 'Emergency', severity: 'severe' },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const getTriageLevel = () => {
    if (selectedSymptoms.some((s) => ['acute-breathlessness', 'cannot-speak', 'chest-pain', 'blue-lips'].includes(s))) {
      return SYMPTOM_TRIAGE_DATA[2]; // Severe
    }
    if (selectedSymptoms.some((s) => ['persistent-cough', 'wheezing', 'chest-tightness', 'skin-rash'].includes(s))) {
      return SYMPTOM_TRIAGE_DATA[1]; // Moderate
    }
    if (selectedSymptoms.length > 0) {
      return SYMPTOM_TRIAGE_DATA[0]; // Mild
    }
    return null;
  };

  const activeTriage = getTriageLevel();

  const filteredFacilities = HEALTHCARE_FACILITIES.filter((f) => {
    if (facilityFilter === 'All') return true;
    if (facilityFilter === 'Emergency') return f.type.includes('Emergency');
    if (facilityFilter === 'Children') return f.type.includes('Children');
    if (facilityFilter === '24h GP') return f.type.includes('GP');
    if (facilityFilter === 'Telehealth') return f.type.includes('Telemedicine');
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Visual SCDF Emergency Header Banner */}
      <section className="bg-rose-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-700/60 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <span>Singapore Emergency Medical Directive</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Emergency Healthcare Assistance in Singapore
            </h1>

            <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
              If experiencing acute breathlessness, chest pain, or an unresponsive asthma attack, do not wait. Dial SCDF emergency ambulance <strong>995</strong> (free from any local or roaming mobile).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="tel:995"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-rose-950 font-black text-sm hover:bg-rose-50 transition-all shadow-md active:scale-98"
            >
              <PhoneCall className="w-5 h-5 text-rose-600" />
              <span>Call 995 (Emergency)</span>
            </a>
            <a
              href="tel:1777"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-rose-900/80 text-white font-bold text-xs sm:text-sm hover:bg-rose-900 transition-all border border-rose-700/80"
            >
              <Phone className="w-4 h-4" />
              <span>Call 1777 (Non-Emergency)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Symptom Checker Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Clinical Self-Triage
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            What are your possible symptoms?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Tap the symptoms you or your family members are currently experiencing:
          </p>
        </div>

        {/* Symptoms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {symptomChecklist.map((symptom) => {
            const isChecked = selectedSymptoms.includes(symptom.id);
            return (
              <button
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`p-4 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 ${
                  isChecked
                    ? symptom.severity === 'severe'
                      ? 'border-rose-600 bg-rose-50/80 font-bold text-rose-950 shadow-sm ring-1 ring-rose-600'
                      : symptom.severity === 'moderate'
                      ? 'border-amber-600 bg-amber-50/80 font-semibold text-amber-950 shadow-sm ring-1 ring-amber-600'
                      : 'border-slate-900 bg-slate-900 text-white font-semibold shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border ${
                    isChecked
                      ? 'bg-white border-white text-slate-950'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="block">{symptom.label}</span>
                  <span
                    className={`text-[10px] block mt-0.5 opacity-75 font-medium ${
                      isChecked ? 'text-inherit' : 'text-slate-400'
                    }`}
                  >
                    {symptom.zone}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Triage Output */}
        {activeTriage ? (
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              activeTriage.level === 'Severe'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : activeTriage.level === 'Moderate'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-current/15">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block">
                  Triage Result: {activeTriage.level} Severity
                </span>
                <h3 className="font-extrabold text-lg mt-0.5">{activeTriage.recommendedAction}</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 border border-current/20 self-start sm:self-auto">
                {activeTriage.urgency}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold block mb-1.5">Recommended Home/Hotel Relief:</span>
                <ul className="space-y-1.5 list-disc pl-4 text-current/90">
                  {activeTriage.homeCare.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-bold block mb-1.5">When to Seek Medical Care:</span>
                <p className="text-current/90 leading-relaxed mb-3">{activeTriage.whenToSeekDoctor}</p>
                {activeTriage.level === 'Severe' && (
                  <a
                    href="tel:995"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-700 text-white rounded-xl text-xs font-black hover:bg-rose-800 shadow-md"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Dial SCDF Ambulance 995 Now</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            Select one or more symptoms above to view instant triage instructions and medical recommendations.
          </div>
        )}
      </section>

      {/* Cohort Measures */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Target Segments & Vulnerable Cohorts
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Measures to Manage Haze for Different Age Groups
          </h2>
        </div>

        {/* Cohort Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 mb-6">
          {AGE_GROUP_GUIDELINES.map((item, idx) => (
            <button
              key={item.group}
              onClick={() => setSelectedCohortIndex(idx)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCohortIndex === idx
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {item.group}
            </button>
          ))}
        </div>

        {/* Selected Cohort Card with 5-7 words and Details Pop-up */}
        {(() => {
          const currentCohort = AGE_GROUP_GUIDELINES[selectedCohortIndex];
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Normal */}
                <div
                  onClick={() => setActiveCohortModal(currentCohort)}
                  className="p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs flex flex-col justify-between space-y-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <div>
                    <span className="font-extrabold text-emerald-900 dark:text-emerald-300 block mb-1">
                      PSI 0 – 100 (Normal)
                    </span>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-slate-700 dark:text-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        {t('summary')}
                      </span>
                      <p className="font-semibold leading-snug">
                        Normal outdoor activities permitted without restrictions.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCohortModal(currentCohort);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('details')}</span>
                  </button>
                </div>

                {/* Unhealthy */}
                <div
                  onClick={() => setActiveCohortModal(currentCohort)}
                  className="p-5 rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-xs flex flex-col justify-between space-y-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <div>
                    <span className="font-extrabold text-amber-900 dark:text-amber-300 block mb-1">
                      PSI 101 – 200 (Unhealthy)
                    </span>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 text-slate-700 dark:text-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        {t('summary')}
                      </span>
                      <p className="font-semibold leading-snug">
                        Reduce prolonged or strenuous outdoor physical exertion.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCohortModal(currentCohort);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('details')}</span>
                  </button>
                </div>

                {/* Hazardous */}
                <div
                  onClick={() => setActiveCohortModal(currentCohort)}
                  className="p-5 rounded-3xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-xs flex flex-col justify-between space-y-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <div>
                    <span className="font-extrabold text-rose-900 dark:text-rose-300 block mb-1">
                      PSI 201+ (Hazardous)
                    </span>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900 text-slate-700 dark:text-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        {t('summary')}
                      </span>
                      <p className="font-semibold leading-snug">
                        Avoid non-essential outdoor activities immediately now.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCohortModal(currentCohort);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('details')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Cohort Details Pop-up Modal */}
        {activeCohortModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setActiveCohortModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
                    Medical & Vulnerability Profile
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeCohortModal.group}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activeCohortModal.subtext}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                      PSI 0 – 100 (Normal):
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeCohortModal.psiUnder100}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
                      PSI 101 – 200 (Unhealthy):
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeCohortModal.psi101To200}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                    <span className="font-bold text-rose-900 dark:text-rose-300 block mb-0.5">
                      PSI 201+ (Hazardous):
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeCohortModal.psi201Plus}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">
                    Key Health Precautions:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {activeCohortModal.keyPrecautions.map((prec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{prec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setActiveCohortModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  <span>{t('close')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Hospital & Telemedicine Directory */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Singapore Hospitals, 24-Hour GP Clinics & Telemedicine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              English-speaking doctors, direct billing for international travel insurance, and hotel room delivery
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['All', 'Emergency', 'Children', '24h GP', 'Telehealth'].map((f) => (
              <button
                key={f}
                onClick={() => setFacilityFilter(f)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  facilityFilter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFacilities.map((fac) => {
            const FACILITY_SUMMARIES: Record<string, string> = {
              'sgh-emergency': 'Premier emergency hospital with 24/7 trauma care.',
              'raffles-hospital-emergency': 'Private international hospital with direct billing.',
              'mount-elizabeth-orchard': 'Central medical center with 24h emergency room.',
              'kkh-children-emergency': 'Specialized children and maternal emergency hospital.',
              'raffles-medical-changi-t3': 'Airport transit clinic open around the clock.',
              'doctor-anywhere-telehealth': 'Virtual consult with hotel medicine delivery.',
              'speedoc-house-call': 'Doctor hotel room house call service.',
            };
            const shortSummary = FACILITY_SUMMARIES[fac.id] || 'Emergency medical care with tourist support.';

            return (
              <div
                key={fac.id}
                onClick={() => setActiveFacilityModal(fac)}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{fac.type}</span>
                    <span>{fac.area}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 leading-snug">
                    {fac.name}
                  </h3>

                  {/* 5-7 Words Information */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      {t('summary')}
                    </span>
                    <p className="font-medium leading-snug">
                      {shortSummary}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFacilityModal(fac);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('details')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pop-up Modal for Facility Details */}
      {activeFacilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveFacilityModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
                  {activeFacilityModal.type} · {activeFacilityModal.area}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {activeFacilityModal.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeFacilityModal.address}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Wait:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeFacilityModal.estimatedWaitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Languages:</span>
                  <span className="font-semibold">{activeFacilityModal.languages.join(', ')}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Insurance Direct Billing: </span>
                  {activeFacilityModal.insuranceAccepted}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`tel:${activeFacilityModal.phone.replace(/\s+/g, '')}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {activeFacilityModal.phone}</span>
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    activeFacilityModal.googleMapsQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
